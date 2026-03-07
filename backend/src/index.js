import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import db from './db.js';

import fs from 'fs';
const LOG_PATH = '/var/log/mindox/mindox.log';
function writeSummary(entry){
  try{
    fs.appendFileSync(LOG_PATH, entry + "\n");
  }catch(e){console.error('Failed to write mindox log',e.message)}
}


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
// 增加 payload 大小限制，因为前端会发 base64 图片和聊天记录数组
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const HACKCLUB_API_BASE = 'https://ai.hackclub.com/proxy/v1';
const HACKCLUB_API_KEY = process.env.HACKCLUB_API_KEY;

if (!HACKCLUB_API_KEY) {
  console.error('错误: 缺少 HACKCLUB_API_KEY 环境变量');
  process.exit(1);
}

// 预准备一个 axios 实例，增加超时并统一错误处理
const aiClient = axios.create({
  baseURL: HACKCLUB_API_BASE,
  timeout: 60000,
  headers: {
    'Authorization': `Bearer ${HACKCLUB_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// health check
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 1. 获取可用模型列表
app.get('/api/models', async (req, res) => {
  try {
    const response = await aiClient.get('/models');

    const allowedModelIds = [
      'x-ai/grok-4.1-fast',
      'google/gemini-3-flash-preview',
      'google/gemini-3.1-flash-image-preview',
      'stepfun/step-3.5-flash'
    ];

    // 从代理端点提取模型信息并精简，只保留指定的四个模型
    const models = (response.data.data || [])
      .filter(m => allowedModelIds.includes(m.id))
      .map(m => ({
        id: m.id,
        name: m.name || m.id
      }));

    // 如果没有拿到远程列表，降级到静态
    if (!models.length) throw new Error('No remote models');
    res.json({ models });
  } catch (error) {
    console.error('Error fetching models:', error.message || error);
    // 降级使用静态列表
    res.json({ 
      models: [
        { id: 'x-ai/grok-4.1-fast', name: 'xAI: Grok 4.1 Fast' },
        { id: 'google/gemini-3-flash-preview', name: 'Google: Gemini 3 Flash Preview' },
        { id: 'google/gemini-3.1-flash-image-preview', name: 'Google: Gemini 3.1 Image Preview' },
        { id: 'stepfun/step-3.5-flash', name: 'StepFun: Step 3.5 Flash' }
      ]
    });
  }
});

// helper: call AI with one retry and trace id
async function callAiWithRetry(payload, traceId) {
  try {
    return (await aiClient.post('/chat/completions', payload)).data;
  } catch (err) {
    console.warn(`[${traceId}] AI call failed, retrying once:`, err.message || err);
    // one retry
    try { return (await aiClient.post('/chat/completions', payload)).data; } catch (err2) { throw err2 }
  }
}

// 2. 处理几何解题请求
app.post('/api/solve', async (req, res) => {
  const traceId = (globalThis && globalThis.crypto && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString();
  const { problem, image, model = 'gpt-4o' } = req.body;

  if (!problem && !image) {
    return res.status(400).json({ error: 'Problem description or image is required' });
  }

  try {
    const systemPrompt = `你是一个严谨的几何数学解题专家。你的任务是分析用户的几何题目，并将其结构化为高度详细和准确的解题步骤。请严格返回一个可被 JSON.parse 的纯 JSON 字符串，详见后端文档。`;

    let userContent = problem || '请解析这张图片中的几何题目。';
    if (image) {
      userContent = [
        { type: 'text', text: problem || '请解析这张图片中的几何题目。' },
        { type: 'image_url', image_url: { url: image } }
      ];
    }

    const payload = {
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      temperature: 0.1
    };

    console.log(`[${traceId}] Calling AI model ${model}`);
    const responseData = await callAiWithRetry(payload, traceId);

    const aiContent = responseData.choices && responseData.choices[0] && responseData.choices[0].message && responseData.choices[0].message.content;
    if (!aiContent) {
      console.error(`[${traceId}] Empty AI response`, responseData);
      return res.status(502).json({ error: 'Empty AI response', traceId });
    }

    // 尝试清理并解析 JSON
    let jsonStr = aiContent.replace(/```json\n?|\n?```/g, '').trim();
    try {
      const resultData = JSON.parse(jsonStr);
      const stmt = db.prepare('INSERT INTO problems (problem_text, image_url, solution_json) VALUES (?, ?, ?)');
      const info = stmt.run(problem || '', image || '', JSON.stringify(resultData));
      // write summary log
      try{ writeSummary(JSON.stringify({traceId: traceId, id: info.lastInsertRowid, model: model, problem: (problem||'').slice(0,200)})); }catch(e){}
      res.json({ id: info.lastInsertRowid, ...resultData });
    } catch (parseError) {
      console.error(`[${traceId}] JSON Parse Error. Raw string length=${jsonStr.length}`);
      // return raw for debugging but include traceId
      res.status(500).json({ error: 'AI did not return valid JSON', traceId, raw: aiContent.substring(0, 2000) });
      try{ writeSummary(JSON.stringify({traceId: traceId, model: model, status: 'parse_error', snippet: aiContent.substring(0,300)})); }catch(e){}
    }

  } catch (error) {
    console.error(`[${traceId}] Solve API Error:`, error.response?.data || error.message || error);
    res.status(500).json({ error: 'Failed to solve problem', traceId });
  }
});

// 3. 处理对话追问请求
app.post('/api/chat', async (req, res) => {
  const { messages, model = 'x-ai/grok-4.1-fast' } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  try {
    const systemPrompt = `你是一个苏格拉底式的专业几何解题导师。目前用户正在向你请教或追问一道几何题。\n请遵循启发式提问并返回流式 SSE 内容。`;
    
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    // 请求开启流式传输
    const response = await aiClient.post('/chat/completions', {
      model: model,
      messages: apiMessages,
      temperature: 0.6,
      stream: true
    }, {
      responseType: 'stream'
    });

    // 设置SSE（Server-Sent Events）响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 将Hackclub的流直接转发给前端
    response.data.pipe(res);

  } catch (error) {
    console.error('Chat API Error:', error.message);
    res.status(500).json({ error: 'Failed to complete chat' });
  }
});

// 4. 获取历史记录列表
app.get('/api/history', (req, res) => {
  try {
    const stmt = db.prepare('SELECT id, problem_text, created_at FROM problems ORDER BY created_at DESC LIMIT 50');
    const history = stmt.all();
    // 如果没有文本，用 "未知题目" 或第一行代替
    const formattedHistory = history.map(item => ({
      id: item.id,
      title: item.problem_text.substring(0, 20) || '未知题目（图片）',
      createdAt: item.created_at
    }));
    res.json({ history: formattedHistory });
  } catch (error) {
    console.error('History API Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// 5. 获取某条特定的历史记录（原题、解答、聊天历史）
app.get('/api/history/:id', (req, res) => {
  try {
    const { id } = req.params;
    const problemId = parseInt(id, 10);
    const problem = db.prepare('SELECT * FROM problems WHERE id = ?').get(problemId);
    
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const chats = db.prepare('SELECT role, content FROM chats WHERE problem_id = ? ORDER BY id ASC').all(problemId);
    
    res.json({
      problem: {
        id: problem.id,
        problem_text: problem.problem_text,
        image_url: problem.image_url,
        solution: JSON.parse(problem.solution_json)
      },
      chats: chats
    });
  } catch (error) {
    console.error('History Detail API Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch history details' });
  }
});

// 6. 同步聊天记录到历史会话
app.post('/api/history/:id/chats', (req, res) => {
  try {
    const { id } = req.params;
    const problemId = parseInt(id, 10);
    const { chats } = req.body; // array of { role, content }

    if (!chats || !Array.isArray(chats)) {
      return res.status(400).json({ error: 'Chats array is required' });
    }

    // 这里采取简单的全量覆盖：先删除该问题原有的聊天，再重新插入完整的聊天记录
    // 这样在流式结束后，前端只需把当前的 chatHistory 整个发过来即可
    const deleteStmt = db.prepare('DELETE FROM chats WHERE problem_id = ?');
    deleteStmt.run(problemId);

    const insertStmt = db.prepare('INSERT INTO chats (problem_id, role, content) VALUES (?, ?, ?)');
    const insertMany = db.transaction((chatsToInsert) => {
      for (const chat of chatsToInsert) {
        insertStmt.run(problemId, chat.role, chat.content);
      }
    });
    insertMany(chats);

    res.json({ success: true });
  } catch (error) {
    console.error('Sync Chats API Error:', error.message);
    res.status(500).json({ error: 'Failed to sync chats' });
  }
});

// 7. 删除历史记录
app.delete('/api/history/:id', (req, res) => {
  try {
    const { id } = req.params;
    const problemId = parseInt(id, 10);
    
    const deleteChats = db.prepare('DELETE FROM chats WHERE problem_id = ?');
    deleteChats.run(problemId);
    
    const deleteProblem = db.prepare('DELETE FROM problems WHERE id = ?');
    const result = deleteProblem.run(problemId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete History API Error:', error.message);
    res.status(500).json({ error: 'Failed to delete history' });
  }
});

// 生产环境：serve 前端静态文件
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../frontend/dist'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve('../frontend/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Backend API Server running on http://localhost:${PORT}`);
});
