import express from 'express';
import cors from 'cors';
import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = join(__dirname, 'data.db');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

let db;

async function initDb() {
  const SQL = await initSqlJs();
  
  if (existsSync(DB_PATH)) {
    const buffer = readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  
  db.run(`
    CREATE TABLE IF NOT EXISTS config (
      id INTEGER PRIMARY KEY DEFAULT 1,
      api_type TEXT DEFAULT 'openai',
      api_key TEXT DEFAULT '',
      api_endpoint TEXT DEFAULT '',
      model TEXT DEFAULT 'gpt-3.5-turbo',
      theme TEXT DEFAULT 'light',
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      image_data TEXT,
      result TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  const config = db.exec('SELECT * FROM config WHERE id = 1');
  if (config.length === 0) {
    db.run('INSERT INTO config (id) VALUES (1)');
  }
  
  saveDb();
}

function saveDb() {
  const data = db.export();
  const buffer = Buffer.from(data);
  writeFileSync(DB_PATH, buffer);
}

function getConfig() {
  const result = db.exec('SELECT * FROM config WHERE id = 1');
  if (result.length > 0 && result[0].values.length > 0) {
    const row = result[0].values[0];
    return {
      api_type: row[1],
      api_key: row[2],
      api_endpoint: row[3],
      model: row[4],
      theme: row[5]
    };
  }
  return { api_type: 'openai', api_key: '', api_endpoint: '', model: 'gpt-3.5-turbo', theme: 'light' };
}

function saveConfigToDb(data) {
  db.run(`
    UPDATE config SET 
      api_type = ?,
      api_key = ?,
      api_endpoint = ?,
      model = ?,
      theme = ?,
      updated_at = datetime('now')
    WHERE id = 1
  `, [data.api_type, data.api_key, data.api_endpoint, data.model, data.theme]);
  saveDb();
}

app.get('/api/config', (req, res) => {
  const config = getConfig();
  res.json({
    apiType: config.api_type,
    apiKey: config.api_key,
    apiEndpoint: config.api_endpoint,
    model: config.model,
    theme: config.theme
  });
});

app.post('/api/config', (req, res) => {
  const { apiType, apiKey, apiEndpoint, model, theme } = req.body;
  saveConfigToDb({ api_type: apiType, api_key: apiKey, api_endpoint: apiEndpoint, model, theme });
  res.json({ success: true });
});

app.post('/api/models', async (req, res) => {
  const { apiType, apiKey, apiEndpoint } = req.body;
  
  try {
    if (apiType === 'hackclub') {
      return res.json({ models: [
        { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
        { value: 'gpt-4o', label: 'GPT-4o' },
        { value: 'gpt-4o-mini', label: 'GPT-4o Mini' }
      ] });
    }
    
    if (apiType === 'openai') {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      const data = await response.json();
      const models = data.data?.filter(m => m.id.includes('gpt') || m.id.includes('turbo'))
        .slice(0, 10)
        .map(m => ({ value: m.id, label: m.id })) || [];
      return res.json({ models });
    }
    
    if (apiType === 'gemini') {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
      const data = await response.json();
      const models = data.models?.map(m => ({ value: m.name.replace('models/', ''), label: m.name.replace('models/', '') })) || [];
      return res.json({ models });
    }
    
    if (apiType === 'minimax') {
      const endpoint = apiEndpoint || 'https://api.minimax.chat/v1';
      const response = await fetch(`${endpoint}/model_list`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      const data = await response.json();
      const models = data.models?.map(m => ({ value: m, label: m })) || [];
      return res.json({ models });
    }
    
    if (apiType === 'custom' && apiEndpoint) {
      try {
        const response = await fetch(`${apiEndpoint.replace('/chat/completions', '/models')}`, {
          headers: apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}
        });
        const data = await response.json();
        const models = data.data?.map(m => ({ value: m.id, label: m.id })) || [];
        return res.json({ models });
      } catch {
        return res.json({ models: [{ value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }] });
      }
    }
    
    res.json({ models: [] });
  } catch (e) {
    console.error('Failed to fetch models:', e);
    res.json({ models: [] });
  }
});

app.get('/api/history', (req, res) => {
  const result = db.exec('SELECT * FROM history ORDER BY created_at DESC LIMIT 50');
  const history = [];
  if (result.length > 0) {
    const columns = result[0].columns;
    for (const row of result[0].values) {
      const obj = {};
      columns.forEach((col, i) => obj[col] = row[i]);
      history.push(obj);
    }
  }
  res.json(history);
});

app.post('/api/history', (req, res) => {
  const { content, imageData, result } = req.body;
  db.run('INSERT INTO history (content, image_data, result) VALUES (?, ?, ?)', [content, imageData, JSON.stringify(result)]);
  const lastId = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
  saveDb();
  res.json({ id: lastId });
});

app.delete('/api/history/:id', (req, res) => {
  db.run('DELETE FROM history WHERE id = ?', [parseInt(req.params.id)]);
  saveDb();
  res.json({ success: true });
});

app.post('/api/parse', async (req, res) => {
  const { content, image, config: cfg } = req.body;
  const apiConfig = cfg || getConfig();
  
  try {
    let apiResponse;
    let contentStr = '';
    
    const systemPrompt = `你是一个几何数学专家。分析题目，返回JSON格式：
{"knownConditions":[{"id":"k1","text":"条件","ggbCommand":"GGB命令"}],"derivedConditions":[{"id":"d1","text":"推导","ggbCommand":"GGB命令"}],"hiddenConditions":[{"id":"h1","text":"隐藏","ggbCommand":"GGB命令"}],"analysis":"分析"}

GGB命令：Point((x,y),'L'),Segment((x1,y1),(x2,y2)),Line((x1,y1),(x2,y2)),Circle((x,y),r),Angle((x,y),(x1,y1),(x2,y2)),Polygon((x1,y1),(x2,y2),(x3,y3))
无坐标时用合理假设。`;

    if (apiConfig.apiType === 'hackclub') {
      const endpoint = 'https://ai.hackclub.com/proxy/v1/chat/completions';
      const model = apiConfig.model || 'gpt-3.5-turbo';
      
      apiResponse = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: image ? `图片题目：${content}` : content }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      const data = await apiResponse.json();
      contentStr = data.choices?.[0]?.message?.content || '';
      
    } else if (apiConfig.apiType === 'openai' || apiConfig.apiType === 'custom') {
      const endpoint = apiConfig.apiEndpoint || 'https://api.openai.com/v1/chat/completions';
      const model = apiConfig.model || 'gpt-3.5-turbo';
      
      const messages = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: image ? `图片题目：${content}` : content
        }
      ];

      apiResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiConfig.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      const data = await apiResponse.json();
      contentStr = data.choices?.[0]?.message?.content || '';
      
    } else if (apiConfig.apiType === 'gemini') {
      const endpoint = `https://generativelanguage.googleapis.com/v1/models/${apiConfig.model || 'gemini-pro'}:generateContent?key=${apiConfig.apiKey}`;
      
      apiResponse = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: content }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
        })
      });

      const data = await apiResponse.json();
      contentStr = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
    } else if (apiConfig.apiType === 'minimax') {
      const endpoint = apiConfig.apiEndpoint || 'https://api.minimax.chat/v1/text/chatcompletion_v2';
      
      apiResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiConfig.apiKey}`
        },
        body: JSON.stringify({
          model: apiConfig.model,
          messages: [
            { role: 'system', content: systemPrompt.replace('GGB命令', 'GeoGebra命令') },
            { role: 'user', content }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      const data = await apiResponse.json();
      contentStr = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
    } else if (apiConfig.apiType === 'minimax') {
      const endpoint = apiConfig.apiEndpoint || 'https://api.minimax.chat/v1/text/chatcompletion_v2';
      
      apiResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiConfig.apiKey}`
        },
        body: JSON.stringify({
          model: apiConfig.model,
          messages: [
            { role: 'system', content: '你是一个几何数学专家。请分析题目并返回JSON格式的条件分析。' },
            { role: 'user', content }
          ]
        })
      });

      const data = await apiResponse.json();
      contentStr = data.choices?.[0]?.message?.content || '';
    }
    
    try {
      const jsonMatch = contentStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        res.json(result);
      } else {
        throw new Error('No valid JSON found');
      }
    } catch (e) {
      const mockResult = generateMockResult(content);
      res.json(mockResult);
    }
    
  } catch (error) {
    console.error('API Error:', error);
    const mockResult = generateMockResult(content);
    res.json(mockResult);
  }
});

function generateMockResult(content) {
  return {
    knownConditions: [
      { id: 'k1', text: '∠ABC = 90°（直角三角形）', ggbCommand: 'Angle((0,0),(2,0),(2,2))' },
      { id: 'k2', text: 'AB = 3', ggbCommand: 'Segment((0,0),(3,0))' },
      { id: 'k3', text: 'BC = 4', ggbCommand: 'Segment((3,0),(3,4))' }
    ],
    derivedConditions: [
      { id: 'd1', text: 'AC = 5（勾股定理）', ggbCommand: 'Segment((0,0),(3,4))' },
      { id: 'd2', text: '面积 = 6', ggbCommand: 'Polygon((0,0),(3,0),(3,4))' }
    ],
    hiddenConditions: [
      { id: 'h1', text: '∠A = 36.87°', ggbCommand: 'Angle((0,0),(3,4),(0,0))' },
      { id: 'h2', text: '∠C = 53.13°', ggbCommand: 'Angle((3,4),(3,0),(0,0))' }
    ],
    analysis: '根据已知条件，这是一个直角三角形ABC，∠B=90°。根据勾股定理，AC²=AB²+BC²=9+16=25，所以AC=5。'
  };
}

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Mindox 后端服务运行在 http://localhost:${PORT}`);
  });
});
