# Mindox - AI 几何学习工具 MVP 规格说明书

## 1. 项目概述

- **项目名称**：Mindox
- **项目类型**：AI 辅助几何学习 Web 应用
- **核心功能**：输入几何题目/上传图片，AI 解析出已知条件、推导条件、隐藏条件，并支持 GeoGebra 动态演示
- **目标用户**：中学生、几何学习者、数学教师

## 2. UI/UX 规格

### 2.1 布局结构

```
┌─────────────────────────────────────────────────────────────────────┐
│  顶部导航栏 (56px)                                                    │
│  [Logo] [Mindox]              [主题切换] [历史记录] [设置]        │
├──────────────┬──────────────────────────────────────────────────────┤
│              │                                                      │
│  左侧输入区   │              中间 GeoGebra 视图                       │
│  (320px)     │              (flex: 1)                               │
│              │                                                      │
│  - 题目输入   │                                                      │
│  - 图片上传   │                                                      │
│  - AI 解析按钮│                                                      │
│              │                                                      │
├──────────────┤                                                      │
│              │                                                      │
│  右侧条件面板  │                                                      │
│  (三栏 300px) │                                                      │
│              │                                                      │
│  - 已知条件   │                                                      │
│  - 推导条件   │                                                      │
│  - 隐藏条件   │                                                      │
│              │                                                      │
└──────────────┴──────────────────────────────────────────────────────┘
```

### 2.2 响应式断点

- **桌面端**：≥1200px，三栏布局
- **平板端**：768px-1199px，条件面板可折叠
- **移动端**：<768px，单栏布局，tabs 切换

### 2.3 视觉设计

#### 颜色系统

**浅色主题**：
- 背景色：`#F8F9FA`
- 卡片背景：`#FFFFFF`
- 主色调：`#4F46E5` (Indigo-600)
- 辅助色：`#10B981` (Emerald-500)
- 文字主色：`#1F2937`
- 文字次色：`#6B7280`
- 边框色：`#E5E7EB`
- 悬停色：`#EEF2FF`

**深色主题**：
- 背景色：`#0F0F0F`
- 卡片背景：`#1A1A1A`
- 主色调：`#818CF8` (Indigo-400)
- 辅助色：`#34D399` (Emerald-400)
- 文字主色：`#F9FAFB`
- 文字次色：`#9CA3AF`
- 边框色：`#374151`
- 悬停色：`#1E1B4B`

#### 字体

- **主字体**：`"Noto Sans SC", "SF Pro Display", -apple-system, sans-serif`
- **等宽字体**：`"JetBrains Mono", "Fira Code", monospace`
- **标题**：24px/20px/18px (h1/h2/h3)
- **正文**：14px
- **小字**：12px

#### 间距系统

- 基础单位：4px
- 组件间距：8px / 12px / 16px / 24px
- 卡片内边距：16px / 20px / 24px
- 页面边距：24px (桌面) / 16px (平板) / 12px (移动)

#### 视觉效果

- **圆角**：8px (按钮) / 12px (卡片) / 16px (模态框)
- **阴影**：
  - 浅色：`0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)`
  - 深色：`0 4px 6px rgba(0,0,0,0.4)`
- **过渡**：`all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`
- **动画**：
  - 按钮 hover：scale(1.02)
  - 卡片 hover：translateY(-2px)
  - 模态框：fadeIn + slideUp

### 2.4 组件列表

| 组件 | 描述 | 状态 |
|------|------|------|
| NavBar | 顶部导航栏 | default |
| ThemeToggle | 主题切换按钮 | light/dark |
| InputPanel | 左侧输入面板 | empty/filled/loading |
| TextArea | 题目输入框 | default/focus/error |
| ImageUploader | 图片上传区域 | empty/uploading/uploaded |
| ConditionPanel | 右侧条件面板 | collapsed/expanded |
| ConditionCard | 条件卡片 | known/derived/hidden |
| GeoGebraView | GeoGebra 画布 | loading/ready/error |
| ConfigModal | API 配置弹窗 | open/closed |
| HistoryDrawer | 历史记录抽屉 | open/closed |

## 3. 功能规格

### 3.1 核心功能

#### 3.1.1 题目输入与解析

- **文本输入**：支持多行几何题目描述
- **图片上传**：支持 PNG/JPG/GIF，最大 5MB
- **AI 解析**：
  - 提取已知条件（用绿色标记）
  - 提取推导条件（用蓝色标记）
  - 发现隐藏条件（用橙色标记）
  - 返回 GeoGebra 命令用于可视化

#### 3.1.2 多平台 AI API 配置

支持配置以下 API：
- OpenAI API (GPT-4/GPT-3.5)
- Google Gemini API
- 字节豆包 API
- 自定义 API 端点（兼容 OpenAI 格式）

配置字段：
- API 类型选择
- API Key
- API Endpoint（自定义）
- 模型名称

#### 3.1.3 GeoGebra 集成

- 嵌入 GeoGebra Classic 6
- 支持通过 GGB 命令绘制几何图形
- 点击条件卡片时，高亮对应图形元素
- 支持拖拽、缩放等交互

#### 3.1.4 数据持久化

- SQLite 数据库存储
- 保存配置历史
- 保存题目解析历史
- 支持导出/导入配置

#### 3.1.5 主题切换

- 深色/浅色双主题
- 主题偏好本地存储
- 支持系统主题跟随

### 3.2 用户交互流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  首次进入   │ ──→ │ API 配置页  │ ──→ │   主界面    │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                   │
                           │ 配置后             │
                           ↓                   ↓
                    ┌─────────────┐     ┌─────────────┐
                    │  持久化配置  │     │  输入题目   │
                    └─────────────┘     └─────────────┘
                                                  │
                                                  ↓
                                           ┌─────────────┐
                                           │  AI 解析中  │
                                           └─────────────┘
                                                  │
                                                  ↓
                                           ┌─────────────┐
                                           │  显示条件   │
                                           └─────────────┘
                                                  │
                                                  ↓
                                           ┌─────────────┐
                                           │  点击条件   │
                                           │ → GeoGebra  │
                                           └─────────────┘
```

### 3.3 API 设计

#### 后端接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/parse` | AI 解析题目 |
| GET | `/api/config` | 获取配置 |
| POST | `/api/config` | 保存配置 |
| GET | `/api/history` | 获取历史记录 |
| POST | `/api/history` | 保存历史 |
| DELETE | `/api/history/:id` | 删除历史 |

#### AI 解析响应格式

```json
{
  "knownConditions": [
    { "id": "k1", "text": "∠ABC = 90°", "ggbCommand": "Point((2,0),'B')" }
  ],
  "derivedConditions": [
    { "id": "d1", "text": "AB = BC", "ggbCommand": "Segment((0,0),(2,0))" }
  ],
  "hiddenConditions": [
    { "id": "h1", "text": "Rt△ABC", "ggbCommand": "Angle((0,0),(2,0),(2,2))" }
  ],
  "analysis": "解题思路分析..."
}
```

## 4. 技术架构

### 4.1 项目结构

```
qianwen-class/
├── frontend/               # Vue3 前端
│   ├── src/
│   │   ├── components/     # 组件
│   │   ├── composables/    # 组合式 API
│   │   ├── stores/         # Pinia 状态管理
│   │   ├── views/          # 页面视图
│   │   ├── styles/         # 全局样式
│   │   ├── utils/          # 工具函数
│   │   ├── App.vue
│   │   └── main.ts
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── backend/                # Node.js 后端
│   ├── src/
│   │   ├── routes/         # 路由
│   │   ├── services/       # 业务逻辑
│   │   ├── db/             # 数据库
│   │   └── index.ts
│   └── package.json
│
└── README.md
```

### 4.2 依赖清单

**前端**：
- vue@3.4
- vite@5.0
- pinia@2.1
- @vueuse/core@10.7
- axios@1.6

**后端**：
- express@4.18
- better-sqlite3@9.2
- cors@2.8
- dotenv@16.3

## 5. 验收标准

### 5.1 功能验收

- [ ] 首次进入强制显示 API 配置页
- [ ] 配置可保存到 SQLite，重启不丢失
- [ ] 可切换不同 AI API
- [ ] 文本输入题目后，AI 返回三类条件
- [ ] 点击条件卡片，GeoGebra 画布显示对应图形
- [ ] 深色/浅色主题切换正常
- [ ] 历史记录可查看和删除

### 5.2 UI 验收

- [ ] 布局为左侧输入+中间画布+右侧条件
- [ ] 风格简约、低饱和度、圆角设计
- [ ] 主题切换有过渡动画
- [ ] 响应式适配正常

### 5.3 部署验收

- [ ] 前端可部署到 Vercel
- [ ] 后端可部署到 Render
- [ ] 提供完整运行说明
