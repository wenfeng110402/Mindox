<template>
  <div class="input-panel">
    <div class="panel-header">
      <h2>输入题目</h2>
    </div>
    
    <div class="input-content">
      <textarea 
        v-model="content"
        placeholder="请输入几何题目..."
        class="text-input"
      ></textarea>
      
      <div class="upload-area" @click="triggerUpload" @dragover.prevent @drop.prevent="handleDrop">
        <input 
          ref="fileInput"
          type="file"
          accept="image/*"
          @change="handleFile"
          hidden
        />
        
        <div v-if="!imagePreview" class="upload-placeholder">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21,15 16,10 5,21"/>
          </svg>
          <span>点击或拖拽上传图片</span>
        </div>
        
        <div v-else class="image-preview">
          <img :src="imagePreview" alt="预览" />
          <button class="remove-btn" @click.stop="removeImage">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <div class="panel-footer">
      <button class="parse-btn" @click="handleParse" :disabled="store.isLoading || (!content && !imageData)">
        <svg v-if="store.isLoading" class="spinner" width="18" height="18" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.4 31.4"/>
        </svg>
        <span v-else>开始分析</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAppStore } from '../stores/app'

const emit = defineEmits(['parse'])
const store = useAppStore()

const content = ref('')
const imageData = ref(null)
const imagePreview = ref(null)
const fileInput = ref(null)

function triggerUpload() {
  fileInput.value?.click()
}

function handleFile(e) {
  const file = e.target.files?.[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过5MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      imageData.value = ev.target.result
      imagePreview.value = ev.target.result
    }
    reader.readAsDataURL(file)
  }
}

function handleDrop(e) {
  const file = e.dataTransfer.files?.[0]
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      imageData.value = ev.target.result
      imagePreview.value = ev.target.result
    }
    reader.readAsDataURL(file)
  }
}

function removeImage() {
  imageData.value = null
  imagePreview.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function handleParse() {
  if (content.value || imageData.value) {
    emit('parse', { content: content.value, image: imageData.value })
  }
}
</script>

<style scoped>
.input-panel {
  width: 280px;
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border-right: 1px solid var(--border-color);
  flex-shrink: 0;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.panel-header h2 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.input-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px;
  gap: 12px;
  overflow: hidden;
}

.text-input {
  flex: 1;
  min-height: 120px;
  padding: 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.text-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(16,163,127,0.1);
}

.text-input::placeholder {
  color: var(--text-secondary);
}

.upload-area {
  height: 120px;
  border: 2px dashed var(--border-color);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
}

.upload-area:hover {
  border-color: var(--color-primary);
  background: rgba(16,163,127,0.05);
}

.upload-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-secondary);
}

.upload-placeholder span {
  font-size: 12px;
}

.image-preview {
  position: relative;
  height: 100%;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.6);
  border-radius: 50%;
  color: white;
  transition: background 0.2s ease;
}

.remove-btn:hover {
  background: rgba(220,38,38,0.8);
}

.panel-footer {
  padding: 12px;
  border-top: 1px solid var(--border-color);
}

.parse-btn {
  width: 100%;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--color-primary);
  color: white;
  font-size: 14px;
  font-weight: 500;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.parse-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16,163,127,0.4);
}

.parse-btn:disabled {
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
</style>
