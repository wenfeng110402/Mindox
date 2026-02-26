<template>
  <Transition name="fade">
    <div class="drawer-overlay" @click.self="$emit('close')">
      <Transition name="slide-right">
        <div class="drawer-container">
          <div class="drawer-header">
            <h2>历史记录</h2>
            <button class="close-btn" @click="$emit('close')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          
          <div class="drawer-body">
            <div v-if="store.history.length === 0" class="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
              <p>暂无历史记录</p>
            </div>
            
            <div v-else class="history-list">
              <div 
                v-for="item in store.history" 
                :key="item.id"
                class="history-item"
              >
                <div class="item-content" @click="$emit('load', item)">
                  <p class="content-text">{{ item.content?.slice(0, 100) || '图片题目' }}{{ item.content?.length > 100 ? '...' : '' }}</p>
                  <span class="item-time">{{ formatTime(item.created_at) }}</span>
                </div>
                <button class="delete-btn" @click.stop="handleDelete(item.id)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3,6 5,6 21,6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { useAppStore } from '../stores/app'

defineEmits(['close', 'load'])

const store = useAppStore()

function formatTime(timeStr) {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return date.toLocaleDateString('zh-CN')
}

function handleDelete(id) {
  if (confirm('确定删除这条记录吗？')) {
    store.deleteHistory(id)
  }
}
</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.drawer-container {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  max-width: 90vw;
  height: 100vh;
  background: var(--bg-card);
  box-shadow: -4px 0 20px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.drawer-header h2 {
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

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 12px;
  color: var(--text-secondary);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  background: var(--bg-primary);
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.history-item:hover {
  transform: translateX(-4px);
}

.item-content {
  flex: 1;
  padding: 14px;
  cursor: pointer;
}

.content-text {
  font-size: 13px;
  color: var(--text-primary);
  line-height: 1.5;
  margin-bottom: 6px;
}

.item-time {
  font-size: 12px;
  color: var(--text-secondary);
}

.delete-btn {
  width: 44px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background: rgba(220,38,38,0.1);
  color: rgb(220,38,38);
}
</style>
