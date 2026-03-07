# Mindox - AI 几何智能解题助手

<p align="center">
  <img src="https://img.shields.io/badge/Vue3-Vite-blue" alt="Vue3+Vite">
  <img src="https://img.shields.io/badge/Express-SQLite-green" alt="Express+SQLite">
  <img src="https://img.shields.io/badge/Hack_Club_AI-Proxy-orange" alt="Hack Club AI">
</p>

> 输入几何题目或上传题目图片 → AI 结构化解析（已知条件、推导条件、隐藏条件、完整证明步骤）→ 自动渲染几何图形 → 苏格拉底式 AI 导师追问辅导

## 功能特性

- **AI 智能解析**：一键解析几何题目，自动提取已知条件、推导条件、隐藏条件，给出完整分步证明
- **自定义 SVG 几何图形渲染**：根据 AI 返回的绘图规格，在浏览器内精确渲染几何图形，无需第三方插件
- **图片识别**：支持上传或粘贴题目截图，AI 自动识别图中几何信息
- **苏格拉底式追问导师**：解析完成后可继续追问，AI 以启发式方式引导思考，支持流式输出
- **多模型切换**：内置多个主流大模型，可在设置中自由切换
- **深色 / 浅色主题**：一键切换，偏好本地持久化
- **历史记录**：所有题目与对话自动保存到本地 SQLite，重启不丢失，随时回溯

## 技术栈

- **前端**：Vue 3 + Vite + Pinia + Axios + marked + DOMPurify
- **后端**：Express + better-sqlite3 + Axios
- **AI 接入**：[Hack Club AI Proxy](https://ai.hackclub.com)（OpenAI 兼容接口）

### 支持的模型

| 模型 ID | 显示名称 |
|---|---|
| `x-ai/grok-4.1-fast` | Grok 4.1 Fast |
| `google/gemini-3-flash-preview` | Gemini 3 Flash |
| `google/gemini-3.1-flash-image-preview` | Gemini 3.1 Flash（支持图片）|
| `stepfun/step-3.5-flash` | Step 3.5 Flash |

## 快速开始

### 前置要求

- Node.js ≥ 18
- 有效的 [Hack Club AI](https://ai.hackclub.com) API Key（`HACKCLUB_API_KEY`）

### 1. 克隆项目

```bash
git clone https://github.com/wenfeng110402/Mindox
cd Mindox
```

### 2. 配置环境变量

在 `backend/` 目录下创建 `.env` 文件：

```env
HACKCLUB_API_KEY=your_hackclub_api_key_here
PORT=3001
```

### 3. 安装依赖

```bash
# 后端
cd backend && npm install

# 前端
cd ../frontend && npm install
```

### 4. 启动开发服务

**后端（终端 1）：**
```bash
cd backend
npm run dev
# 服务运行在 http://localhost:3001
```

**前端（终端 2）：**
```bash
cd frontend
npm run dev
# 服务运行在 http://localhost:5173
```

前端开发服务器已配置代理，`/api` 请求自动转发到后端，无需额外配置跨域。

### 5. 访问应用

打开浏览器访问 [http://localhost:5173](http://localhost:5173)，即可开始使用。

## 项目结构

```
Mindox/
├── frontend/               # Vue 3 前端
│   ├── src/
│   │   ├── components/
│   │   │   └── GeometryCanvas.vue  # SVG 几何图形渲染组件
│   │   ├── App.vue                 # 主应用（含所有页面逻辑）
│   │   └── main.js
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                # Node.js 后端
│   ├── src/
│   │   ├── index.js        # Express 服务主入口
│   │   └── db.js           # SQLite 数据库初始化
│   ├── data.db             # SQLite 数据库文件（自动生成）
│   └── package.json
│
├── scripts/
│   └── deploy_pi.sh        # Raspberry Pi 一键部署脚本
│
├── SPEC.md                 # 规格文档
└── README.md               # 本文件
```

## 后端 API

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/models` | 获取可用模型列表 |
| POST | `/api/solve` | AI 解析几何题目 |
| POST | `/api/chat` | 苏格拉底式追问（SSE 流式输出）|
| GET | `/api/history` | 获取历史题目列表 |
| GET | `/api/history/:id` | 获取某条历史记录（含聊天记录）|
| POST | `/api/history/:id/chats` | 同步聊天记录到历史会话 |
| DELETE | `/api/history/:id` | 删除历史记录 |

## 部署

### 生产构建（本地/服务器）

```bash
# 构建前端静态资源
cd frontend && npm run build

# 启动后端（同时 serve 前端静态文件）
cd ../backend
NODE_ENV=production npm start
# 访问 http://localhost:3001
```

生产模式下，后端会自动将 `frontend/dist` 作为静态资源目录，一个端口提供完整服务。

### Raspberry Pi 部署（PM2）

项目内置了 `scripts/deploy_pi.sh` 一键部署脚本，适合部署到树莓派等 Linux 主机：

```bash
# 确保已安装 pm2：npm install -g pm2
# 确保 backend/.env 已配置好 HACKCLUB_API_KEY
./scripts/deploy_pi.sh main
```

脚本会自动拉取最新代码、构建前端、安装后端依赖，并通过 PM2 以 `mindox` 为进程名重启服务。

查看运行日志：
```bash
pm2 logs mindox
```

## 许可证

MIT License
