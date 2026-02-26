<template>
  <div class="geogebra-container">
    <div v-if="!command" class="placeholder">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5"/>
        <line x1="12" y1="22" x2="12" y2="8.5"/>
        <line x1="22" y1="8.5" x2="12" y2="8.5"/>
        <line x1="2" y1="8.5" x2="12" y2="8.5"/>
      </svg>
      <p>点击条件卡片查看几何图形</p>
    </div>
    
    <div v-else class="geogebra-wrapper">
      <div class="ggb-toolbar">
        <span class="ggb-label">GeoGebra 图形</span>
        <a :href="ggbUrl" target="_blank" class="open-btn">在新窗口打开</a>
      </div>
      <iframe 
        :src="ggbUrl"
        width="100%" 
        height="calc(100% - 40px)"
        frameborder="0"
        allowfullscreen
      ></iframe>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  command: String
})

const ggbUrl = computed(() => {
  if (!props.command) return ''
  const encoded = encodeURIComponent(props.command)
  return `https://www.geogebra.org/graphing?command=${encoded}`
})
</script>

<style scoped>
.geogebra-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--text-secondary);
}

.placeholder p {
  font-size: 13px;
}

.geogebra-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.ggb-toolbar {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
}

.ggb-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.open-btn {
  font-size: 12px;
  color: var(--color-primary);
  text-decoration: none;
}

.open-btn:hover {
  text-decoration: underline;
}

iframe {
  border: none;
  flex: 1;
}
</style>
