<template>
  <div class="condition-panel">
    <div class="panel-header">
      <h2>条件分析</h2>
    </div>
    
    <div class="condition-content">
      <div class="condition-section">
        <div class="section-title known">
          <span class="dot"></span>
          已知条件 ({{ result.knownConditions?.length || 0 }})
        </div>
        <div class="condition-list">
          <div 
            v-for="item in result.knownConditions" 
            :key="item.id"
            class="condition-card known"
            :class="{ active: store.selectedCondition?.id === item.id }"
            @click="handleSelect(item)"
          >
            {{ item.text }}
          </div>
        </div>
      </div>
      
      <div class="condition-section">
        <div class="section-title derived">
          <span class="dot"></span>
          推导条件 ({{ result.derivedConditions?.length || 0 }})
        </div>
        <div class="condition-list">
          <div 
            v-for="item in result.derivedConditions" 
            :key="item.id"
            class="condition-card derived"
            :class="{ active: store.selectedCondition?.id === item.id }"
            @click="handleSelect(item)"
          >
            {{ item.text }}
          </div>
        </div>
      </div>
      
      <div class="condition-section">
        <div class="section-title hidden">
          <span class="dot"></span>
          隐藏条件 ({{ result.hiddenConditions?.length || 0 }})
        </div>
        <div class="condition-list">
          <div 
            v-for="item in result.hiddenConditions" 
            :key="item.id"
            class="condition-card hidden"
            :class="{ active: store.selectedCondition?.id === item.id }"
            @click="handleSelect(item)"
          >
            {{ item.text }}
          </div>
        </div>
      </div>
      
      <div v-if="result.analysis" class="analysis-section">
        <div class="section-title">
          <span class="dot"></span>
          解析
        </div>
        <div class="analysis-content">
          {{ result.analysis }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAppStore } from '../stores/app'

defineProps({
  result: Object
})

const store = useAppStore()

function handleSelect(item) {
  store.selectCondition(item)
}
</script>

<style scoped>
.condition-panel {
  width: 360px;
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border-left: 1px solid var(--border-color);
  overflow: hidden;
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

.condition-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.condition-section {
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.section-title.known .dot { background: var(--color-known); }
.section-title.derived .dot { background: var(--color-derived); }
.section-title.hidden .dot { background: var(--color-hidden); }

.condition-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.condition-card {
  padding: 10px 12px;
  background: var(--bg-primary);
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.condition-card:hover {
  transform: translateX(3px);
}

.condition-card.known:hover,
.condition-card.known.active {
  border-color: var(--color-known);
  background: rgba(16,163,127,0.1);
}

.condition-card.derived:hover,
.condition-card.derived.active {
  border-color: var(--color-derived);
  background: rgba(139,92,246,0.1);
}

.condition-card.hidden:hover,
.condition-card.hidden.active {
  border-color: var(--color-hidden);
  background: rgba(245,158,11,0.1);
}

.analysis-section {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.analysis-content {
  padding: 12px;
  background: var(--bg-primary);
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-primary);
}
</style>
