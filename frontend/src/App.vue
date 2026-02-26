<template>
  <div class="app-container">
    <NavBar @toggle-theme="store.toggleTheme()" @open-config="store.showConfigModal = true" @open-history="showHistory = true" />
    
    <main class="main-content">
      <!-- 初始状态：ChatGPT 风格圆角输入框 -->
      <div v-if="!store.currentResult" class="welcome-view">
        <div class="welcome-content">
          <h1 class="welcome-title">我是 Mindox，你的几何学习助手</h1>
          <p class="welcome-subtitle">输入几何题目或上传图片，我来帮你分析</p>
          
          <div class="chat-input-container">
            <textarea 
              v-model="inputContent"
              placeholder="描述你的几何题目..."
              class="chat-input"
              @keydown.enter.exact.prevent="handleSubmit"
              rows="1"
            ></textarea>
            <button class="send-btn" @click="handleSubmit" :disabled="!inputContent.trim() || store.isLoading">
              <svg v-if="store.isLoading" class="spinner" width="18" height="18" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.4 31.4"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22,2 15,22 11,13 2,9"/>
              </svg>
            </button>
          </div>
          
          <div class="upload-mini" @click="triggerUpload">
            <input ref="fileInput" type="file" accept="image/*" @change="handleFile" hidden />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21,15 16,10 5,21"/>
            </svg>
            <span>上传图片</span>
          </div>
        </div>
      </div>
      
      <!-- 解析后：三栏布局 -->
      <template v-else>
        <InputPanel @parse="handleParse" />
        
        <ConditionPanel 
          :result="store.currentResult"
          @select="store.selectCondition"
        />
        
        <div class="geogebra-area">
          <GeoGebraView :command="store.selectedCondition?.ggbCommand" />
        </div>
      </template>
    </main>

    <ConfigModal v-if="store.showConfigModal" @close="store.showConfigModal = false" />
    <HistoryDrawer v-if="showHistory" @close="showHistory = false" @load="loadFromHistory" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAppStore } from './stores/app'
import NavBar from './components/NavBar.vue'
import InputPanel from './components/InputPanel.vue'
import GeoGebraView from './components/GeoGebraView.vue'
import ConditionPanel from './components/ConditionPanel.vue'
import ConfigModal from './components/ConfigModal.vue'
import HistoryDrawer from './components/HistoryDrawer.vue'

const store = useAppStore()
const showHistory = ref(false)
const inputContent = ref('')
const fileInput = ref(null)

onMounted(async () => {
  await store.loadConfig()
  await store.loadHistory()
})

function handleSubmit() {
  if (inputContent.value.trim() && !store.isLoading) {
    handleParse({ content: inputContent.value, image: null })
  }
}

async function handleParse({ content, image }) {
  await store.parseContent(content, image)
}

function triggerUpload() {
  fileInput.value?.click()
}

function handleFile(e) {
  const file = e.target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      handleParse({ content: '请分析这张图片中的几何题目', image: ev.target.result })
    }
    reader.readAsDataURL(file)
  }
}

function loadFromHistory(item) {
  store.currentResult = JSON.parse(item.result)
  showHistory.value = false
}
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-primary);
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.welcome-view {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.welcome-content {
  width: 100%;
  max-width: 600px;
  text-align: center;
}

.welcome-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.welcome-subtitle {
  font-size: 15px;
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.chat-input-container {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: var(--shadow);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.chat-input-container:focus-within {
  border-color: var(--border-focus);
  box-shadow: var(--shadow-lg);
}

.chat-input {
  flex: 1;
  min-height: 24px;
  max-height: 120px;
  padding: 4px 0;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 15px;
  line-height: 1.5;
  resize: none;
}

.chat-input::placeholder {
  color: var(--text-secondary);
}

.send-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  border-radius: 10px;
  color: white;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.upload-mini {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  padding: 10px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-mini:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.geogebra-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  margin: 12px;
  border-radius: 16px;
  box-shadow: var(--shadow);
  overflow: hidden;
  min-width: 300px;
}
</style>
