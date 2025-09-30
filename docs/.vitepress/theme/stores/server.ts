import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService, type ServerStatus, type ServerPerformance } from '../services/api'

export const useServerStore = defineStore('server', () => {
  const status = ref<ServerStatus | null>(null)
  const performance = ref<ServerPerformance | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 在线玩家信息
  const onlinePlayersCount = ref(0)
  const playersList = ref<Array<{ name: string; uuid: string }>>([])

  // 系统资源信息
  const systemResources = ref<any>(null)
  const worldsList = ref<Array<{ name: string; players: number }>>([])

  // 健康检查信息
  const healthInfo = ref<any>(null)

  // 自动刷新相关
  const autoRefreshEnabled = ref(false)
  const refreshInterval = ref(5000) // 5秒
  const refreshTimer = ref<ReturnType<typeof setInterval> | null>(null)

  const isOnline = computed(() => status.value?.online || false)
  const sparkAvailable = computed(() => status.value?.spark_available || false)
  
  const currentTPS = computed(() => performance.value?.tps.values.last_1m || 0)
  const currentMSPT = computed(() => performance.value?.mspt.values.last_1m || 0)
  
  const memoryUsage = computed(() => {
    if (!performance.value?.memory) return { used: 0, max: 0, percentage: 0 }
    const { used, max } = performance.value.memory
    return {
      used,
      max,
      percentage: max > 0 ? Math.round((used / max) * 100) : 0
    }
  })

  const cpuUsage = computed(() => ({
    process: performance.value?.cpu.process || 0,
    system: performance.value?.cpu.system || 0
  }))

  const loadServerStatus = async () => {
    try {
      const response = await apiService.getServerStatus()
      if (response.success && response.data) {
        status.value = response.data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取服务器状态失败'
    }
  }

  const loadServerPerformance = async () => {
    try {
      const response = await apiService.getServerPerformance()
      if (response.success && response.data) {
        performance.value = response.data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取性能数据失败'
    }
  }

  const loadOnlinePlayersCount = async () => {
    try {
      const response = await apiService.getOnlinePlayersCount()
      if (response.success && response.data) {
        onlinePlayersCount.value = response.data.count
      }
    } catch (err) {
      console.error('获取在线玩家数量失败:', err)
    }
  }

  const loadPlayersList = async () => {
    try {
      const response = await apiService.getPlayersList()
      if (response.success && response.data) {
        playersList.value = response.data.players
      }
    } catch (err) {
      console.error('获取玩家列表失败:', err)
    }
  }

  const loadWorldsList = async () => {
    try {
      const response = await apiService.getWorldsList()
      if (response.success && response.data) {
        worldsList.value = response.data.worlds
      }
    } catch (err) {
      console.error('获取世界列表失败:', err)
    }
  }

  const loadSystemResources = async () => {
    try {
      const response = await apiService.getSystemResources()
      if (response.success && response.data) {
        systemResources.value = response.data
      }
    } catch (err) {
      console.error('获取系统资源失败:', err)
    }
  }

  const loadHealthInfo = async () => {
    try {
      const response = await apiService.healthCheck()
      if (response.success && response.data) {
        healthInfo.value = response.data
      }
    } catch (err) {
      console.error('健康检查失败:', err)
    }
  }

  const loadAllData = async () => {
    loading.value = true
    error.value = null

    try {
      await Promise.allSettled([
        loadServerStatus(),
        loadServerPerformance(),
        loadOnlinePlayersCount(),
        loadPlayersList(),
        loadWorldsList(),
        loadSystemResources(),
        loadHealthInfo()
      ])
    } finally {
      loading.value = false
    }
  }

  const startAutoRefresh = () => {
    if (refreshTimer.value) return
    
    autoRefreshEnabled.value = true
    refreshTimer.value = setInterval(async () => {
      await loadAllData()
    }, refreshInterval.value)
  }

  const stopAutoRefresh = () => {
    if (refreshTimer.value) {
      clearInterval(refreshTimer.value)
      refreshTimer.value = null
    }
    autoRefreshEnabled.value = false
  }

  const setRefreshInterval = (interval: number) => {
    refreshInterval.value = interval
    if (autoRefreshEnabled.value) {
      stopAutoRefresh()
      startAutoRefresh()
    }
  }

  return {
    status,
    performance,
    loading,
    error,
    onlinePlayersCount,
    playersList,
    systemResources,
    worldsList,
    healthInfo,
    autoRefreshEnabled,
    refreshInterval,
    isOnline,
    sparkAvailable,
    currentTPS,
    currentMSPT,
    memoryUsage,
    cpuUsage,
    loadServerStatus,
    loadServerPerformance,
    loadOnlinePlayersCount,
    loadPlayersList,
    loadWorldsList,
    loadSystemResources,
    loadHealthInfo,
    loadAllData,
    startAutoRefresh,
    stopAutoRefresh,
    setRefreshInterval
  }
})