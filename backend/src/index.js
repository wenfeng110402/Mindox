import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import db from './db.js';

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

// 预准备一个 axios 实例
const aiClient = axios.create({
  baseURL: HACKCLUB_API_BASE,
  headers: {
    'Authorization': `Bearer ${HACKCLUB_API_KEY}`,
    'Content-Type': 'application/json'
  }
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
    const models = response.data.data
      .filter(m => allowedModelIds.includes(m.id))
      .map(m => ({
        id: m.id,
        name: m.name || m.id
      }));
      
    res.json({ models });
  } catch (error) {
    console.error('Error fetching models:', error.message);
    // 降级使用静态列表
    res.json({ 
      models: [
        { id: 'x-ai/grok-4.1-fast', name: 'Grok 4.1 Fast' },
        { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash' },
        { id: 'google/gemini-3.1-flash-image-preview', name: 'Gemini 3.1 Image' },
        { id: 'stepfun/step-3.5-flash', name: 'Step 3.5 Flash' }
      ]
    });
  }
});

// 2. 处理几何解题请求
app.post('/api/solve', async (req, res) => {
  const { problem, image, model = 'gpt-4o' } = req.body;

  if (!problem && !image) {
    return res.status(400).json({ error: 'Problem description or image is required' });
  }

  try {
    const systemPrompt = `你是一个严谨的几何数学解题专家。你的任务是分析用户的几何题目，并将其结构化为高度详细和准确的解题步骤。
请严格返回如下格式的纯JSON字符串（禁止任何Markdown包裹符号如\`\`\`json，必须是一个可以直接JSON.parse()的纯文本）：

{
  "originalProblem": "精准复述原题，修正可能的错别字，用规范的数学语言表达",
  "problemType": "核心考点类型（如：三角形全等、圆周角定理、相似三角形等）",
  "difficulty": "难度评估（如：基础、进阶、竞赛）",
  "svgDrawingSpec": {
    "canvas": { "width": 400, "height": 400 },
    "coordinate": { "xAxisY": 200, "yAxisX": 200, "scale": 40, "tickInterval": 1, "show": false },
    "points": [
      { "id": "A", "x": 200, "y": 50, "label": "A", "labelOffset": { "dx": -15, "dy": 0 } }
    ],
    "segments": [
      { "id": "AB", "start": "A", "end": "B", "type": "solid", "color": "currentColor", "thickness": 2 }
    ],
    "curves": [],
    "circles": [],
    "arcs": [],
    "angles": [],
    "annotations": []
  },
  "proofSteps": [
    "第一步：因为 [条件]（根据 [定理名称]），所以 [结论]。",
    "第二步：...",
    "总结：..."
  ],
  "knownConditions": ["整理出的已知条件1", "已知条件2"],
  "derivedConditions": ["基于已知立刻能推导出的直接条件1"],
  "hiddenConditions": ["图形或定义中隐含的条件（如公共边、对顶角等）"],
  "auxLines": ["如果需要辅助线，请详细说明其作法（如：连接AB），没有则传空数组"],
  "fullApproach": [
    "解题总体思路与突破口",
    "核心推理链条",
    "涉及的关键定理"
  ]
}

关于 svgDrawingSpec 字段的详细规范：
- canvas: 画布宽高，推荐 400x400 或 600x500，根据图形复杂度选择。
- coordinate: 坐标系配置。show=false 时不渲染坐标轴，适合纯几何图形（三角形、圆等）；show=true 时渲染带刻度的坐标轴，适合解析几何。xAxisY/yAxisX 是坐标原点的像素坐标，scale 是每单位长度对应的像素数。
- points: 点列表。x/y 是像素坐标（直接对应 SVG 坐标系，y 轴向下为正）。label 为点名称，labelOffset 控制标注文字偏移方向（dx/dy 为像素）。
- segments: 线段列表。start/end 引用 points 中的 id。type 为 "solid" 或 "dashed"。color 使用 "currentColor"（主线），辅助线/动点连线可使用 "#DC2626" (红) 或 "#10A37F" (青色)。
- curves: 二次曲线（抛物线等）。type="quadratic"，coefficients: {a, b, c} 表示 y = a*x² + b*x + c（注意：坐标需转换到像素空间）。
- circles: 圆。center 引用 points 的 id，radius 为像素半径。
- arcs: 圆弧。用于标注角度（如直角标记、角度弧）。
- angles: 角度标注。
- annotations: 额外文字标注，可用于标长度、角度值等。

重要规范要求：
1. **纯JSON格式**：绝对不要在返回结果的前后添加 \`\`\`json 或任何额外说明。
2. **坐标精度**：points 中的 x/y 是 SVG 画布像素坐标，必须根据几何关系精确计算，确保图形比例正确。例如等腰三角形顶点应在底边的垂直平分线上。
3. **数学公式格式**：所有的数学公式和变量必须使用标准LaTeX语法：行内公式使用 \\\\( ... \\\\) 包裹，块级公式使用 $$ ... $$ 包裹。（注意在JSON字符串中正确转义反斜杠）。
4. **严密推理**：推理步骤（proofSteps）必须有严密的逻辑链，不能跳步，说明每个结论的依据。
5. **异常处理**：即使输入模糊，也尽可能提取几何信息；如果完全不是几何题，请在 originalProblem 中说明，其余字段置空，svgDrawingSpec 设为 null。`;

    let userContent = problem || '请解析这张图片中的几何题目。';
    
    // 如果有图片，将 user content 改为多模态格式数组
    if (image) {
      userContent = [
        { type: "text", text: problem || '请解析这张图片中的几何题目。' },
        { type: "image_url", image_url: { url: image } }
      ];
    }

    const response = await aiClient.post('/chat/completions', {
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      temperature: 0.1 // 较低的temperature保证JSON格式的稳定
    });

    const aiContent = response.data.choices[0].message.content;
    
    try {
      // 尝试清理可能存在的 markdown 标记并解析 JSON
      const jsonStr = aiContent.replace(/```json\n?|\n?```/g, '').trim();
      const resultData = JSON.parse(jsonStr);

      // 保存到数据库
      const stmt = db.prepare('INSERT INTO problems (problem_text, image_url, solution_json) VALUES (?, ?, ?)');
      const info = stmt.run(problem || '', image || '', JSON.stringify(resultData));
      
      // 返回带有数据库ID的解决数据
      res.json({ id: info.lastInsertRowid, ...resultData });
    } catch (parseError) {
      console.error('JSON Parse Error. Raw string:', aiContent);
      res.status(500).json({ error: 'AI did not return valid JSON', raw: aiContent });
    }

  } catch (error) {
    console.error('Solve API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to solve problem' });
  }
});

// 3. 处理对话追问请求
app.post('/api/chat', async (req, res) => {
  const { messages, model = 'x-ai/grok-4.1-fast' } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  try {
    const systemPrompt = `你是一个苏格拉底式的专业几何解题导师。目前用户正在向你请教或追问一道几何题。
请遵循以下导师准则：
1. **启发式提问**：不要直接抛出完整答案，而是通过友善的反问或提供线索（如定理提示）来引导用户自己思考（除非用户明确要求直接解答）。
2. **专业严谨**：解释定理或推理逻辑时，确保数学严密性。使用通俗易懂的语言，适度鼓励。
3. **完美公式排版**：所有数学公式（包括变量、线段名如AB、角度∠A）**必须且只使用标准LaTeX语法**。
   - 行内公式使用 \`\\\\( ... \\\\)\` 包裹，例如：由于 \\\\( AB = CD \\\\)
   - 独立公式块使用 \`$$\\n...\\n$$\` 包裹
   - 绝对不要使用 \`$...\$\` 或 \`\\[...\\]\`，因为前端可能无法正确渲染。
4. **简洁清晰**：使用适当的Markdown排版（如加粗、列表）来增加可读性，避免长篇大论。`;
    
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
    const problem = db.prepare('SELECT * FROM problems WHERE id = ?').get(id);
    
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const chats = db.prepare('SELECT role, content FROM chats WHERE problem_id = ? ORDER BY id ASC').all();
    
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
    const { chats } = req.body; // array of { role, content }

    if (!chats || !Array.isArray(chats)) {
      return res.status(400).json({ error: 'Chats array is required' });
    }

    // 这里采取简单的全量覆盖：先删除该问题原有的聊天，再重新插入完整的聊天记录
    // 这样在流式结束后，前端只需把当前的 chatHistory 整个发过来即可
    const deleteStmt = db.prepare('DELETE FROM chats WHERE problem_id = ?');
    deleteStmt.run(id);

    const insertStmt = db.prepare('INSERT INTO chats (problem_id, role, content) VALUES (?, ?, ?)');
    const insertMany = db.transaction((chatsToInsert) => {
      for (const chat of chatsToInsert) {
        insertStmt.run(id, chat.role, chat.content);
      }
    });
    insertMany(chats);

    res.json({ success: true });
  } catch (error) {
    console.error('Sync Chats API Error:', error.message);
    res.status(500).json({ error: 'Failed to sync chats' });
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
