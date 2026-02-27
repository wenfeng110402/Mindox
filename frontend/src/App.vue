<template>
  <div class="app-container" :class="theme">
    <!-- Top Navigation Bar -->
    <nav class="top-nav">
      <div class="nav-left">
        <button class="nav-btn icon-btn" @click="startNewProblem" title="探讨新题目">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"></path></svg>
        </button>
      </div>
      <div class="nav-right">
        <button class="nav-btn icon-btn" @click="toggleTheme" :title="theme === 'light' ? '黑夜模式' : '浅色模式'">
          <svg v-if="theme === 'light'" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          <svg v-else viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
        </button>
        <button class="nav-btn icon-btn" @click="toggleHistory" title="历史记录">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </button>
        <button class="nav-btn icon-btn" @click="toggleSettings" title="设置">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        </button>
      </div>
    </nav>

    <!-- Initial View -->
    <main v-if="view === 'initial'" class="initial-view">
      <h1 class="main-title">Mindox • 几何智能解题助手</h1>
      <p class="sub-title">输入几何题目或上传图片，即刻获得专业解析</p>
      
      <div class="input-wrapper">
        <textarea 
          v-model="inputText" 
          class="geometry-input" 
          placeholder="输入几何题目，或粘贴/上传图片"
          @keydown.enter.prevent="submitProblem"
          @paste="handlePaste"
        ></textarea>
        
        <!-- Image Preview Area -->
        <div class="image-preview" v-if="uploadedImage">
          <img :src="uploadedImage" alt="Uploaded geometry problem" />
          <button class="remove-image-btn" @click="removeImage" title="移除图片">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="input-actions">
          <button class="upload-btn" @click="triggerFileInput">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="icon"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            从相册/截图上传
          </button>
          <input 
            type="file" 
            ref="fileInput" 
            accept="image/*" 
            style="display: none" 
            @change="handleFileUpload"
          />
          <button class="send-btn" @click="submitProblem" :disabled="!inputText.trim() && !uploadedImage">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>
      </div>
    </main>

    <!-- Solving View -->
    <main v-else class="solving-view">
      <!-- Loading State -->
      <div v-if="isSolving" class="loading-state">
        <svg class="spinner" viewBox="0 0 50 50">
          <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
        </svg>
        <p>AI 正在努力思考解析中...</p>
      </div>

      <!-- Result State -->
      <div v-else-if="solution" class="result-content">
        
        <!-- Mobile Layout -->
        <div v-if="isMobile" class="mobile-layout">
          <div class="mobile-tabs">
            <button 
              v-for="tab in mobileTabs" 
              :key="tab.id"
              :class="['tab-btn', { active: activeTab === tab.id }]"
              @click="activeTab = tab.id"
            >
              {{ tab.name }}
            </button>
          </div>

          <section class="mobile-panel">
            <!-- 图解 Tab -->
            <div v-show="activeTab === 'diagram'" class="tab-content">
              <div class="svg-graph-container" v-if="solution.svgDrawingSpec">
                <GeometryCanvas :spec="solution.svgDrawingSpec" />
              </div>
            </div>

            <!-- 题目 Tab -->
            <div v-show="activeTab === 'problem'" class="tab-content">
              <div class="panel-section">
                <h3>题目信息</h3>
                <div class="problem-info">
                  <p><strong>原题：</strong><span class="markdown-body" v-html="renderMarkdown(solution.originalProblem)"></span></p>
                  <p><strong>题型：</strong>{{ solution.problemType || '未知' }}</p>
                  <p><strong>难度：</strong>{{ solution.difficulty || '未知' }}</p>
                </div>
              </div>
            </div>

            <!-- 解答 Tab -->
            <div v-show="activeTab === 'solution'" class="tab-content">
              <div class="panel-section">
                <h3>标准证明过程</h3>
                <div class="proof-content">
                  <p v-for="(step, index) in solution.proofSteps" :key="index" class="markdown-body" v-html="renderMarkdown(step)"></p>
                </div>
              </div>
            </div>

            <!-- 条件 Tab -->
            <div v-show="activeTab === 'conditions'" class="tab-content">
              <div class="condition-group" v-if="solution.knownConditions && solution.knownConditions.length">
                <h4>已知条件</h4>
                <div class="condition-item" v-for="(cond, i) in solution.knownConditions" :key="'k'+i" v-html="renderMarkdown(cond)"></div>
              </div>
              <div class="condition-group" v-if="solution.derivedConditions && solution.derivedConditions.length">
                <h4>推导条件</h4>
                <div class="condition-item" v-for="(cond, i) in solution.derivedConditions" :key="'d'+i" v-html="renderMarkdown(cond)"></div>
              </div>
              <div class="condition-group" v-if="solution.hiddenConditions && solution.hiddenConditions.length">
                <h4>隐藏条件</h4>
                <div class="condition-item" v-for="(cond, i) in solution.hiddenConditions" :key="'h'+i" v-html="renderMarkdown(cond)"></div>
              </div>
              <div class="condition-group" v-if="showAuxLines && solution.auxLines && solution.auxLines.length">
                <h4>辅助线</h4>
                <div class="condition-item aux-line" v-for="(line, i) in solution.auxLines" :key="'aux'+i" v-html="renderMarkdown(line)"></div>
              </div>
              <div class="condition-group" v-if="solution.fullApproach && solution.fullApproach.length">
                <h4>解题思路</h4>
                <p class="approach-text" v-for="(line, i) in solution.fullApproach" :key="'a'+i" v-html="renderMarkdown(line)"></p>
              </div>
            </div>

            <!-- 问答 Tab -->
            <div v-show="activeTab === 'chat'" class="tab-content">
              <div class="panel-section" v-if="chatHistory.length > 0">
                <h3>互动问答</h3>
                <div class="chat-history">
                  <div v-for="(msg, index) in chatHistory" :key="index" class="chat-message" :class="msg.role">
                    <div class="msg-avatar">{{ msg.role === 'user' ? 'U' : 'AI' }}</div>
                    <div class="msg-content markdown-body" v-html="renderMarkdown(msg.content)"></div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-chat">
                暂无问答记录
              </div>
            </div>

            <!-- Bottom Input -->
            <div class="bottom-input-wrapper">
              <input type="text" v-model="followUpText" class="followup-input" :placeholder="isChatting ? 'AI正在回复...' : '继续追问...'" :disabled="isChatting" @keydown.enter.prevent="submitFollowUp" />
            </div>
          </section>
        </div>

        <!-- Desktop Layout -->
        <div v-if="!isMobile" class="desktop-layout">
          <!-- Left Panel 60% -->
          <section class="left-panel">
          <div class="left-panel-content">
            <div class="panel-section">
              <h3>题目信息</h3>
              <div class="problem-info">
                <p><strong>原题：</strong><span class="markdown-body" v-html="renderMarkdown(solution.originalProblem)"></span></p>
                <p><strong>题型：</strong>{{ solution.problemType || '未知' }}</p>
                <p><strong>难度：</strong>{{ solution.difficulty || '未知' }}</p>
              </div>
            </div>

            <div class="panel-section">
              <h3>标准证明过程</h3>
              <div class="proof-content">
                <p v-for="(step, index) in solution.proofSteps" :key="index" class="markdown-body" v-html="renderMarkdown(step)"></p>
              </div>
            </div>

            <div class="panel-section" v-if="chatHistory.length > 0">
              <h3>互动问答</h3>
              <div class="chat-history">
                <div 
                  v-for="(msg, index) in chatHistory" 
                  :key="index"
                  class="chat-message"
                  :class="msg.role"
                >
                  <div class="msg-avatar">{{ msg.role === 'user' ? 'U' : 'AI' }}</div>
                  <div class="msg-content markdown-body" v-html="renderMarkdown(msg.content)"></div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Bottom Input in Solving View -->
          <div class="bottom-input-wrapper">
            <input 
              type="text" 
              v-model="followUpText"
              class="followup-input" 
              :placeholder="isChatting ? 'AI正在回复...' : '继续追问...'"
              :disabled="isChatting"
              @keydown.enter.prevent="submitFollowUp"
            />
          </div>
        </section>

        <!-- Right Panel 40% (Desktop only) -->
        <aside class="right-panel">
          <div class="conditions-panel">
            <template v-if="solution.svgDrawingSpec">
              <h3>几何图解 (AI生成)</h3>
              <div class="svg-graph-container">
                <GeometryCanvas :spec="solution.svgDrawingSpec" />
              </div>
            </template>

            <h3>几何条件拆解</h3>
            
            <div class="condition-group" v-if="solution.knownConditions && solution.knownConditions.length">
              <h4>已知条件</h4>
              <div class="condition-item" v-for="(cond, i) in solution.knownConditions" :key="'k'+i" v-html="renderMarkdown(cond)"></div>
            </div>

            <div class="condition-group" v-if="solution.derivedConditions && solution.derivedConditions.length">
              <h4>推导条件</h4>
              <div class="condition-item interactive" v-for="(cond, i) in solution.derivedConditions" :key="'d'+i" v-html="renderMarkdown(cond)">
              </div>
            </div>

            <div class="condition-group" v-if="solution.hiddenConditions && solution.hiddenConditions.length">
              <h4>隐藏条件</h4>
              <div class="condition-item" v-for="(cond, i) in solution.hiddenConditions" :key="'h'+i" v-html="renderMarkdown(cond)"></div>
            </div>

            <!-- 根据设置控制是否显示辅助线信息 -->
            <div class="condition-group" v-if="showAuxLines && solution.auxLines && solution.auxLines.length">
              <h4>💡 辅助线提示</h4>
              <div class="condition-item aux-line" v-for="(line, i) in solution.auxLines" :key="'aux'+i" v-html="renderMarkdown(line)">
              </div>
            </div>
            
            <div class="condition-group" v-if="solution.fullApproach && solution.fullApproach.length">
              <h4>完整解题思路</h4>
              <p class="approach-text markdown-body" v-for="(line, i) in solution.fullApproach" :key="'a'+i" v-html="renderMarkdown(line)"></p>
            </div>
          </div>
        </aside>
        </div>
        </div>
    </main>

    <!-- History Sidebar -->
    <aside class="history-sidebar" :class="{ 'open': showHistory }">
      <div class="sidebar-header">
        <h3>历史记录</h3>
        <button class="nav-btn icon-btn" @click="showHistory = false">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="sidebar-content">
        <div v-if="historyList.length === 0" class="empty-history">
          暂无历史记录
        </div>
        <div 
          v-else
          class="history-item" 
          v-for="item in historyList" 
          :key="item.id"
        >
          <span class="history-item-text" @click="loadHistoryItem(item.id)">{{ item.title }}</span>
          <button class="delete-btn" @click.stop="deleteHistoryItem(item.id)" title="删除">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Settings Modal -->
    <div class="modal-overlay" v-if="showSettings" @click.self="showSettings = false">
      <div class="settings-modal">
        <div class="modal-header">
          <h3>设置</h3>
          <button class="nav-btn icon-btn" @click="showSettings = false">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="modal-content">
          <div class="setting-row">
            <span>AI 模型选择</span>
            <select class="setting-select" v-model="selectedModel">
              <option v-for="model in availableModels" :key="model.id" :value="model.id">
                {{ model.name }}
              </option>
            </select>
          </div>
          <div class="setting-row">
            <span>默认解答模式</span>
            <select class="setting-select">
              <option>详细步骤（推荐）</option>
              <option>仅思路提示</option>
            </select>
          </div>
          <div class="setting-row">
            <span>显示辅助线提示</span>
            <input type="checkbox" v-model="showAuxLines" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import GeometryCanvas from './components/GeometryCanvas.vue'

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api'

const theme = ref('light')
const view = ref('initial') // 'initial' | 'solving'
const inputText = ref('')
const followUpText = ref('')
const activeCondition = ref(null)
const showHistory = ref(false)
const showSettings = ref(false)
const chatHistory = ref([])
const historyList = ref([])
const currentProblemId = ref(null)

// 状态和数据
const isSolving = ref(false)
const isChatting = ref(false)
const solution = ref(null)
const availableModels = ref([{ id: 'gpt-4o', name: 'GPT-4o (加载中...)' }])
const selectedModel = ref('gpt-4o')
const showAuxLines = ref(true) // 添加辅助线提示的状态

// Mobile detection
const isMobile = ref(window.innerWidth <= 768)
const activeTab = ref('diagram')

const mobileTabs = [
  { id: 'diagram', name: '图解' },
  { id: 'problem', name: '题目' },
  { id: 'solution', name: '解答' },
  { id: 'conditions', name: '条件' },
  { id: 'chat', name: '问答' }
]

window.addEventListener('resize', () => {
  isMobile.value = window.innerWidth <= 768
})
</script>

<style scoped>
/* App Container Base */
.app-container {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  color: var(--text-title);
  background-color: var(--bg-primary);
  transition: background-color 0.2s ease, color 0.2s ease;
}

/* Top Nav */
.top-nav {
  position: fixed;
  top: 24px;
  left: 24px;
  right: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
}

.nav-left, .nav-right {
  display: flex;
  gap: 16px;
}

.nav-btn {
  font-family: 'Inter', 'SF Pro Display', sans-serif;
  font-weight: 500;
  font-size: 14px;
  background: transparent;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  color: var(--text-title);
  cursor: pointer;
  transition: background 0.2s ease;
}

.nav-btn.icon-btn {
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.nav-btn.icon-btn:hover {
  background-color: var(--btn-hover-bg);
}

.nav-btn:hover {
  background-color: var(--btn-hover-bg);
}

/* Result Content */
.result-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.mobile-layout {
  display: none;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.desktop-layout {
  display: flex;
  flex: 1;
  height: 100%;
}

/* Mobile Layout Styles */
.mobile-layout .mobile-tabs {
  display: flex;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.mobile-layout .tab-btn {
  flex: 1;
  padding: 14px 8px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-subtitle);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.mobile-layout .tab-btn.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.mobile-layout .mobile-panel {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.mobile-layout .tab-content {
  display: none;
}

.mobile-layout .bottom-input-wrapper {
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-primary);
  flex-shrink: 0;
}

.mobile-layout .followup-input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-title);
  font-size: 15px;
}

/* Initial View */
.initial-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 24px;
}

.main-title {
  font-family: 'Inter', 'SF Pro Display', sans-serif;
  font-weight: 600;
  font-size: 32px;
  line-height: 1.2;
  margin-bottom: 16px;
  color: var(--text-title);
}

.sub-title {
  font-weight: 400;
  font-size: 16px;
  margin-bottom: 32px;
  color: var(--text-subtitle);
}

/* Input Area */
.input-wrapper {
  width: 100%;
  max-width: 650px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: border-color 0.2s ease;
}

.geometry-input {
  width: 100%;
  min-height: 120px;
  border: none;
  background: transparent;
  padding: 16px;
  font-size: 14px;
  color: var(--text-title);
  resize: none;
  outline: none;
}

.geometry-input::placeholder {
  color: var(--text-placeholder);
}

.image-preview {
  position: relative;
  display: inline-block;
  margin: 0 16px 16px;
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid var(--border-color);
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.remove-image-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: background 0.2s;
}

.remove-image-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--btn-upload-bg);
  color: var(--btn-upload-text);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background-color: var(--color-primary);
  color: #fff;
  cursor: pointer;
  transition: opacity 0.2s;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading State */
.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  color: var(--text-subtitle);
}

.spinner {
  animation: rotate 2s linear infinite;
  width: 40px;
  height: 40px;
}

.spinner .path {
  stroke: var(--color-primary);
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

/* Solving View */
.solving-view {
  flex: 1;
  display: flex;
  width: 100%;
  padding-top: 72px; /* Space for top nav */
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

/* Left Panel */
.left-panel {
  width: 60%;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.left-panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 32px 48px;
}

.panel-section {
  margin-bottom: 40px;
}

.panel-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-title);
  margin-bottom: 16px;
}

.problem-info p, .proof-content p, .diagram-desc p, .diagram-desc li {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-subtitle);
  margin-bottom: 8px;
}

.proof-content .highlight-text {
  font-weight: 600;
  color: var(--text-title);
  background-color: var(--color-secondary);
  padding: 2px 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.geometry-diagram {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 16px 0;
  padding: 24px;
  background-color: var(--bg-secondary, rgba(0,0,0,0.03));
  border-radius: 12px;
  border: 1px solid var(--border-color);
}
[data-theme='dark'] .geometry-diagram {
  background-color: rgba(255,255,255,0.03);
}

.diagram-desc ul {
  padding-left: 20px;
}

/* Chat History Styles */
.chat-history {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}

.chat-message {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.chat-message.user {
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.chat-message.user .msg-avatar {
  background-color: var(--text-subtitle);
}

.msg-content {
  background-color: var(--bg-secondary, rgba(0,0,0,0.03));
  padding: 12px 16px;
  border-radius: 12px;
  max-width: 80%;
  font-size: 14px;
  line-height: 1.5;
  overflow-x: auto;
}

.markdown-body :deep(p) {
  margin-top: 0;
  margin-bottom: 8px;
}
.markdown-body :deep(p:last-child) {
  margin-bottom: 0;
}
.markdown-body :deep(pre) {
  background-color: rgba(0,0,0,0.05);
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 8px 0;
}
[data-theme='dark'] .markdown-body :deep(pre) {
  background-color: rgba(0,0,0,0.3);
}
.markdown-body :deep(code) {
  font-family: monospace;
  background-color: rgba(0,0,0,0.05);
  padding: 2px 4px;
  border-radius: 4px;
}
[data-theme='dark'] .markdown-body :deep(code) {
  background-color: rgba(0,0,0,0.3);
}
.markdown-body :deep(ul), .markdown-body :deep(ol) {
  padding-left: 20px;
  margin-top: 8px;
  margin-bottom: 8px;
}
.markdown-body :deep(a) {
  color: var(--color-primary);
  text-decoration: none;
}
.markdown-body :deep(a:hover) {
  text-decoration: underline;
}
.markdown-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 10px 0;
}
.markdown-body :deep(th), .markdown-body :deep(td) {
  border: 1px solid var(--border-color);
  padding: 8px;
}

[data-theme='dark'] .msg-content {
  background-color: rgba(255,255,255,0.05);
}

.chat-message.user .msg-content {
  background-color: var(--color-primary);
  color: white;
}

.bottom-input-wrapper {
  padding: 24px 48px;
  background-color: var(--bg-primary);
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}

.followup-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-primary);
  color: var(--text-title);
  outline: none;
}

.followup-input::placeholder {
  color: var(--text-placeholder);
}

/* Right Panel */
.right-panel {
  width: 40%;
  height: 100%;
  padding: 32px 48px;
  overflow-y: auto;
  background-color: var(--bg-primary);
}

.conditions-panel h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-title);
  margin-bottom: 24px;
}

.svg-graph-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-secondary);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  color: var(--text-title);
  overflow: auto;
  max-width: 100%;
}

.svg-graph-container :deep(svg) {
  max-width: 100%;
  max-height: 300px;
  color: var(--text-title);
  width: auto;
  height: auto;
}

.svg-graph-container :deep(svg text) {
  fill: currentColor;
}

.condition-group {
  margin-bottom: 24px;
}

.condition-group h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-title);
  margin-bottom: 12px;
}

.condition-item {
  font-size: 14px;
  color: var(--text-subtitle);
  padding: 10px 12px;
  background-color: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  margin-bottom: 8px;
  transition: background-color 0.2s ease;
}

.condition-item.interactive {
  cursor: pointer;
}

.condition-item.interactive.active {
  background-color: var(--color-secondary);
  color: var(--text-title);
  font-weight: 500;
  border-color: var(--color-primary);
}

.condition-item.aux-line {
  background-color: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
  color: #d97706;
}
[data-theme='dark'] .condition-item.aux-line {
  background-color: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

.approach-text {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-subtitle);
  margin-bottom: 8px;
}

/* Sidebar & Modal Overlays */
.history-sidebar {
  position: fixed;
  top: 0;
  right: -300px;
  width: 300px;
  height: 100vh;
  background-color: var(--bg-primary);
  border-left: 1px solid var(--border-color);
  box-shadow: -4px 0 15px rgba(0,0,0,0.05);
  transition: right 0.3s ease;
  z-index: 200;
  display: flex;
  flex-direction: column;
}

.history-sidebar.open {
  right: 0;
}

.sidebar-header, .modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--border-color);
}

.sidebar-header h3, .modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.sidebar-content {
  padding: 16px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 8px;
  background-color: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.history-item:hover {
  background-color: var(--btn-hover-bg);
}

.history-item-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delete-btn {
  padding: 4px;
  background: transparent;
  border: none;
  color: var(--text-subtitle);
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s, color 0.2s;
}

.history-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: #DC2626;
  background-color: rgba(220, 38, 38, 0.1);
}

.empty-history {
  padding: 16px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0,0,0,0.4);
  z-index: 300;
  display: flex;
  justify-content: center;
  align-items: center;
}

.settings-modal {
  width: 400px;
  background-color: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  overflow: hidden;
}

.modal-content {
  padding: 24px;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 14px;
}

.setting-select {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background-color: transparent;
  color: var(--text-title);
  font-family: inherit;
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  /* Result Content */
  .result-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }
  
  .mobile-layout {
    display: flex;
    flex: 1;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }
  
  .desktop-layout {
    display: none;
  }
  
  /* Initial View */
  .main-title {
    font-size: 24px;
  }
  
  .sub-title {
    font-size: 14px;
    padding: 0 16px;
  }
  
  .input-wrapper {
    margin: 0 16px;
  }
  
  /* Solving View - Single column */
  .solving-view {
    flex-direction: column;
    padding-top: 60px;
  }
  
  .left-panel {
    width: 100%;
    height: 50%;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }
  
  .left-panel-content {
    padding: 16px;
  }
  
  .right-panel {
    width: 100%;
    height: 50%;
    padding: 16px;
    overflow-y: auto;
  }
  
  /* Panel sections */
  .panel-section {
    margin-bottom: 24px;
  }
  
  .panel-section h3 {
    font-size: 15px;
  }
  
  .problem-info p, .proof-content p, .approach-text {
    font-size: 14px;
  }
  
  /* Chat */
  .msg-content {
    max-width: 85%;
    font-size: 13px;
    padding: 10px 12px;
  }
  
  .msg-avatar {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
  
  /* Bottom input */
  .bottom-input-wrapper {
    padding: 12px 16px;
  }
  
  .followup-input {
    padding: 12px 14px;
    font-size: 15px;
  }
  
  /* History sidebar */
  .history-sidebar {
    width: 100%;
    right: -100%;
  }
  
  /* SVG container */
  .svg-graph-container {
    padding: 8px;
    margin-bottom: 16px;
  }
  
  /* Condition items */
  .condition-group {
    margin-bottom: 16px;
  }
  
  .condition-group h4 {
    font-size: 13px;
  }
  
  .condition-item {
    font-size: 13px;
    padding: 8px 10px;
  }
  
  /* Settings modal */
  .settings-modal {
    width: 90%;
    max-width: 360px;
    margin: 0 16px;
  }
  
  .modal-content {
    padding: 16px;
  }
  
  .setting-row {
    font-size: 13px;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .setting-select {
    width: 100%;
    padding: 8px;
  }
  
  /* Top nav */
  .top-nav {
    top: 12px;
    left: 12px;
    right: 12px;
  }
  
  /* Initial view buttons */
  .input-actions {
    padding: 10px 12px;
  }
  
  .upload-btn {
    padding: 8px 10px;
    font-size: 13px;
  }
  
  .send-btn {
    width: 36px;
    height: 36px;
  }
  
  /* History item */
  .history-item {
    padding: 10px 12px;
    font-size: 13px;
  }
  
  .delete-btn {
    opacity: 1;
    padding: 6px;
  }
}

/* Small mobile */
@media (max-width: 400px) {
  .main-title {
    font-size: 20px;
  }
  
  .left-panel-content {
    padding: 12px;
  }
  
  .right-panel {
    padding: 12px;
  }
  
  .bottom-input-wrapper {
    padding: 10px 12px;
  }
}

/* Mobile Tabs - default hidden, shown via JS */
.mobile-tabs {
  display: none;
}

.mobile-panel {
  display: none;
}

@media (min-width: 769px) {
  .mobile-tabs, .mobile-panel {
    display: none !important;
  }
}

@media (max-width: 768px) {
  .mobile-tabs {
    display: flex;
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border-color);
    z-index: 50;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .mobile-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding-top: 100px;
  }

  .desktop-layout {
    display: none;
  }
}
</style>