import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_BASE = '/api'

export const useAppStore = defineStore('app', () => {
  const config = ref({
    apiType: 'openai',
    apiKey: '',
    apiEndpoint: '',
    model: 'gpt-3.5-turbo',
    theme: 'light'
  })
  
  const isConfigured = ref(false)
  const isLoading = ref(false)
  const history = ref([])
  const currentResult = ref(null)
  const selectedCondition = ref(null)
  const showConfigModal = ref(true)

  const theme = computed(() => config.value.theme)

  async function loadConfig() {
    try {
      const res = await axios.get(`${API_BASE}/config`)
      config.value = res.data
      if (config.value.apiKey) {
        isConfigured.value = true
        showConfigModal.value = false
      }
      applyTheme(config.value.theme)
    } catch (e) {
      console.error('Failed to load config:', e)
    }
  }

  async function saveConfig(newConfig) {
    try {
      await axios.post(`${API_BASE}/config`, newConfig)
      config.value = { ...config.value, ...newConfig }
      isConfigured.value = !!newConfig.apiKey
      applyTheme(newConfig.theme || config.value.theme)
    } catch (e) {
      console.error('Failed to save config:', e)
    }
  }

  function applyTheme(themeName) {
    if (themeName === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  async function parseContent(content, imageData) {
    isLoading.value = true
    try {
      const res = await axios.post(`${API_BASE}/parse`, {
        content,
        image: imageData,
        config: config.value
      })
      currentResult.value = res.data
      
      await axios.post(`${API_BASE}/history`, {
        content,
        imageData,
        result: res.data
      })
      await loadHistory()
      
      return res.data
    } catch (e) {
      console.error('Parse error:', e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function loadHistory() {
    try {
      const res = await axios.get(`${API_BASE}/history`)
      history.value = res.data
    } catch (e) {
      console.error('Failed to load history:', e)
    }
  }

  async function deleteHistory(id) {
    try {
      await axios.delete(`${API_BASE}/history/${id}`)
      await loadHistory()
    } catch (e) {
      console.error('Failed to delete history:', e)
    }
  }

  function selectCondition(condition) {
    selectedCondition.value = condition
  }

  function toggleTheme() {
    const newTheme = config.value.theme === 'light' ? 'dark' : 'light'
    saveConfig({ ...config.value, theme: newTheme })
  }

  return {
    config,
    isConfigured,
    isLoading,
    history,
    currentResult,
    selectedCondition,
    showConfigModal,
    theme,
    loadConfig,
    saveConfig,
    parseContent,
    loadHistory,
    deleteHistory,
    selectCondition,
    toggleTheme
  }
})
