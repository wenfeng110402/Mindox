<template>
  <Transition name="fade">
    <div class="modal-overlay" @click.self="$emit('close')">
      <Transition name="slide-up">
        <div class="modal-container">
          <div class="modal-header">
            <h2>API 配置</h2>
            <button class="close-btn" @click="$emit('close')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="form-group">
              <label>API 类型</label>
              <div class="api-type-selector">
                <button 
                  v-for="type in apiTypes" 
                  :key="type.value"
                  class="type-btn"
                  :class="{ active: localConfig.apiType === type.value }"
                  @click="changeApiType(type.value)"
                >
                  {{ type.label }}
                </button>
              </div>
            </div>
            
            <div class="form-group" v-if="localConfig.apiType !== 'hackclub'">
              <label>API Key</label>
              <input 
                v-model="localConfig.apiKey"
                type="password"
                placeholder="请输入 API Key"
                @blur="fetchModels"
              />
            </div>
            
            <div class="form-group" v-if="localConfig.apiType === 'custom'">
              <label>API Endpoint</label>
              <input 
                v-model="localConfig.apiEndpoint"
                type="text"
                placeholder="https://your-api.com/v1/chat/completions"
                @blur="fetchModels"
              />
            </div>
            
            <div class="form-group">
              <div class="model-label-row">
                <label>模型名称</label>
                <button class="refresh-btn" @click="fetchModels" :disabled="loadingModels">
                  <svg :class="{ spinning: loadingModels }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 4v6h-6M1 20v-6h6"/>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                  </svg>
                  刷新
                </button>
              </div>
              <select v-model="localConfig.model" :disabled="loadingModels">
                <option v-if="loadingModels" value="">加载中...</option>
                <option v-else-if="modelOptions.length === 0" value="">请选择 API 类型</option>
                <option v-else v-for="model in modelOptions" :key="model.value" :value="model.value">
                  {{ model.label }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>主题</label>
              <div class="theme-selector">
                <button 
                  class="theme-btn"
                  :class="{ active: localConfig.theme === 'light' }"
                  @click="localConfig.theme = 'light'"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="5"/>
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                  </svg>
                  浅色
                </button>
                <button 
                  class="theme-btn"
                  :class="{ active: localConfig.theme === 'dark' }"
                  @click="localConfig.theme = 'dark'"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                  深色
                </button>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="cancel-btn" @click="$emit('close')">取消</button>
            <button class="save-btn" @click="handleSave">保存配置</button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAppStore } from '../stores/app'
import axios from 'axios'

defineEmits(['close'])

const store = useAppStore()

const localConfig = reactive({
  apiType: store.config.apiType || 'hackclub',
  apiKey: store.config.apiKey || '',
  apiEndpoint: store.config.apiEndpoint || '',
  model: store.config.model || '',
  theme: store.config.theme || 'light'
})

const apiTypes = [
  { value: 'hackclub', label: 'HackClub' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'minimax', label: 'Minimax' },
  { value: 'custom', label: '自定义' }
]

const modelOptions = ref([])
const loadingModels = ref(false)

const defaultModels = {
  hackclub: [
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' }
  ],
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
  ],
  gemini: [
    { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' }
  ],
  minimax: [
    { value: 'MiniMax-M4', label: 'MiniMax M4' },
    { value: 'abab6.5s-chat', label: 'abab6.5s-chat' }
  ],
  custom: [
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
  ]
}

function changeApiType(type) {
  localConfig.apiType = type
  localConfig.model = ''
  fetchModels()
}

async function fetchModels() {
  loadingModels.value = true
  
  try {
    const res = await axios.post('/api/models', {
      apiType: localConfig.apiType,
      apiKey: localConfig.apiKey,
      apiEndpoint: localConfig.apiEndpoint
    })
    
    if (res.data.models && res.data.models.length > 0) {
      modelOptions.value = res.data.models
    } else {
      modelOptions.value = defaultModels[localConfig.apiType] || []
    }
  } catch (e) {
    console.error('Failed to fetch models:', e)
    modelOptions.value = defaultModels[localConfig.apiType] || []
  } finally {
    loadingModels.value = false
  }
}

onMounted(() => {
  fetchModels()
})

async function handleSave() {
  await store.saveConfig({ ...localConfig })
  store.showConfigModal = false
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-container {
  width: 480px;
  max-width: 90vw;
  background: var(--bg-card);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.model-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.model-label-row label {
  margin-bottom: 0;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 12px;
  transition: all 0.2s ease;
}

.refresh-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-btn svg.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.form-group input,
.form-group select {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
  border-color: var(--color-primary);
}

.form-group select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.api-type-selector {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.type-btn {
  flex: 1;
  min-width: 70px;
  height: 40px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 13px;
  transition: all 0.2s ease;
}

.type-btn:hover {
  border-color: var(--color-primary);
}

.type-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.theme-selector {
  display: flex;
  gap: 12px;
}

.theme-btn {
  flex: 1;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-secondary);
  font-size: 14px;
  transition: all 0.2s ease;
}

.theme-btn:hover {
  border-color: var(--color-primary);
}

.theme-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
}

.cancel-btn,
.save-btn {
  flex: 1;
  height: 44px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: var(--bg-primary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.cancel-btn:hover {
  background: var(--hover-bg);
}

.save-btn {
  background: var(--color-primary);
  color: white;
}

.save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16,163,127,0.3);
}
</style>
