# Mindox - AI 几何智能解题助手

<p align="center">
  <img src="https://img.shields.io/badge/Vue3-Vite-blue" alt="Vue3+Vite">
  <img src="https://img.shields.io/badge/Express-SQLite-green" alt="Express+SQLite">
  <img src="https://img.shields.io/badge/Hack_Club_AI-Powered-orange" alt="Hack Club AI">
</p>

> 输入几何题目或上传图片 → AI 解析已知条件、推导步骤与隐藏条件 → SVG 动态几何图形渲染 → 苏格拉底式追问导师

## 功能特性

- **AI 智能解题**：自动提取已知条件、推导条件、隐藏条件，给出严密的分步证明
- **SVG 几何可视化**：AI 根据题意生成精确的 SVG 几何图形，无需 GeoGebra 插件
- **多模态输入**：支持纯文字描述或直接粘贴/上传几何题图片（PNG/JPG）
- **流式追问对话**：解题后可与 AI 导师实时对话，引导式启发学习
- **多模型支持**：内置 Grok、Gemini、Step 等多个顶尖 AI 模型可切换
- **深色/浅色主题**：一键切换，适配系统偏好
- **历史记录**：SQLite 本地持久化存储，重启不丢失解题历史与对话
- **响应式设计**：桌面、平板、手机均可使用

## 快速开始

### 1. 克隆项目

```bash
git clone <repo-url>
cd Mindox
```

### 2. 配置环境变量

在 `backend/` 目录下创建 `.env` 文件：

```env
HACKCLUB_API_KEY=你的_Hack_Club_API_Key
PORT=3001
```

> Hack Club AI API Key 可在 [https://ai.hackclub.com](https://ai.hackclub.com) 申请。

### 3. 安装依赖

**后端：**
```bash
cd backend
npm install
```

**前端：**
```bash
cd frontend
npm install
```

### 4. 启动服务

**后端（终端 1）：**
```bash
cd backend
npm start
# 服务运行在 http://localhost:3001
```

**前端（终端 2）：**
```bash
cd frontend
npm run dev
# 服务运行在 http://localhost:5173
```

### 5. 访问应用

打开浏览器访问 [http://localhost:5173](http://localhost:5173)

在设置页面选择所需的 AI 模型，然后输入几何题目或上传图片即可开始解题。

## 可用 AI 模型

| 模型 ID | 名称 | 特点 |
|---|---|---|
| `x-ai/grok-4.1-fast` | Grok 4.1 Fast | 速度快，推理能力强 |
| `google/gemini-3-flash-preview` | Gemini 3 Flash | 谷歌最新轻量模型 |
| `google/gemini-3.1-flash-image-preview` | Gemini 3.1 Image | 支持图片输入的多模态模型 |
| `stepfun/step-3.5-flash` | Step 3.5 Flash | 阶跃星辰轻量推理模型 |

> 推荐使用 `gemini-3.1-flash-image-preview` 处理图片题目。

## 后端 API 接口

| 方法 | 路径 | 描述 |
|---|---|---|
| `GET` | `/api/models` | 获取可用 AI 模型列表 |
| `POST` | `/api/solve` | 提交几何题目进行 AI 解析 |
| `POST` | `/api/chat` | 流式追问对话（SSE） |
| `GET` | `/api/history` | 获取历史记录列表 |
| `GET` | `/api/history/:id` | 获取某条历史记录详情及聊天记录 |
| `POST` | `/api/history/:id/chats` | 同步某条记录的聊天历史 |
| `DELETE` | `/api/history/:id` | 删除某条历史记录 |

## 部署指南

### 生产环境部署（Raspberry Pi / Linux 服务器 + PM2）

项目提供了 `scripts/deploy_pi.sh` 一键部署脚本：

```bash
# 首次部署
chmod +x scripts/deploy_pi.sh
./scripts/deploy_pi.sh main

# 后续更新
./scripts/deploy_pi.sh
```

脚本会自动：
1. 拉取最新代码
2. 构建前端静态文件
3. 安装后端依赖
4. 使用 PM2 启动/重启后端服务（进程名：`mindox`）

生产模式下后端会自动 serve 前端静态文件，只需暴露 `3001` 端口即可。

查看日志：
```bash
pm2 logs mindox
```

### 云平台部署

**前端（Vercel）**

```
Framework Preset: Vite
Build Command:    npm run build
Output Directory: dist
```

**后端（Render / Railway）**

```
Build Command: npm install
Start Command: npm start
环境变量: HACKCLUB_API_KEY=<your_key>
         NODE_ENV=production
```

> 生产环境下设置 `NODE_ENV=production`，后端将自动 serve 前端 `dist/` 目录。

## 项目结构

```
Mindox/
├── frontend/               # Vue 3 前端
│   ├── src/
│   │   ├── components/     # GeometryCanvas 等组件
│   │   ├── index.html
│   │   ├── App.vue         # 主应用（含全部视图逻辑）
│   │   └── main.js
│   └── vite.config.js
│
├── backend/                # Node.js 后端
│   ├── src/
│   │   ├── db.js           # SQLite 数据库初始化
│   │   └── index.js        # Express 主入口 & 全部路由
│   └── package.json
│
├── scripts/
│   └── deploy_pi.sh        # Raspberry Pi / Linux 一键部署脚本
│
├── SPEC.md                 # 产品规格文档
└── README.md               # 本文件
```

## 技术栈

| 层级 | 技术 |
|---|---|
| 前端框架 | Vue 3 + Vite + Pinia |
| HTTP 客户端 | Axios |
| Markdown 渲染 | marked + DOMPurify |
| 后端框架 | Express 4 |
| 数据库 | better-sqlite3（SQLite） |
| AI 接入 | Hack Club AI Proxy（兼容 OpenAI Chat API） |
| 进程管理 | PM2（生产环境） |

## 许可证

MIT License
