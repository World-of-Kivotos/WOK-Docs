<template>
  <div class="server-status-widget">
    <div class="status-header">
      <h3>服务器状态</h3>
      <span :class="['status-indicator', connectionStatus]">{{ connectionStatusText }}</span>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <span>正在获取数据...</span>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <div class="error-message">
        <h4>连接失败</h4>
        <p>{{ error }}</p>
        <button @click="fetchAllData" class="retry-btn">重试</button>
      </div>
    </div>
    
    <!-- 主要数据展示 -->
    <div v-else class="data-container">
      <!-- 服务器基本信息 -->
      <div class="section server-info-section">
        <h4 class="section-title">服务器信息</h4>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">服务器状态</span>
            <div class="value-with-indicator">
              <span class="value">{{ serverData?.online ? '在线' : '离线' }}</span>
              <div :class="['status-dot', serverData?.online ? 'online' : 'offline']"></div>
            </div>
          </div>
          
          <div class="info-item">
            <span class="label">在线玩家</span>
            <div class="value-with-progress">
              <span class="value">{{ playersData?.online_count || 0 }} / {{ playersData?.max_players || 0 }}</span>
              <div class="progress-bar">
                <div 
                  class="progress-fill players" 
                  :style="{ width: playerPercentage + '%' }"
                ></div>
              </div>
            </div>
          </div>
          
          <div class="info-item">
            <span class="label">服务器版本</span>
            <span class="value">{{ serverData?.version || '未知' }}</span>
          </div>
          
          <div class="info-item">
            <span class="label">运行时间</span>
            <span class="value">{{ serverData?.uptime_formatted || '未知' }}</span>
          </div>
        </div>
      </div>
      
      <!-- 系统资源 -->
      <div class="section system-section">
        <h4 class="section-title">系统资源</h4>
        <div class="resource-grid">
          <div class="resource-item">
            <div class="resource-header">
              <span class="resource-label">内存使用</span>
              <span class="resource-value">
                {{ formatMemorySize(systemData?.memory?.used) }} / {{ formatMemorySize(systemData?.memory?.total) }}
              </span>
            </div>
            <div class="progress-bar large">
              <div 
                class="progress-fill memory" 
                :style="{ 
                  width: (systemData?.memory?.usage_percent || 0) + '%',
                  backgroundColor: getResourceColor(systemData?.memory?.usage_percent || 0)
                }"
              ></div>
            </div>
            <div class="resource-percentage">{{ (systemData?.memory?.usage_percent || 0).toFixed(1) }}%</div>
          </div>
          
          <div v-if="performanceData?.memory" class="resource-item">
            <div class="resource-header">
              <span class="resource-label">JVM内存</span>
              <span class="resource-value">
                {{ formatMemorySize(performanceData.memory.used_memory) }} / {{ formatMemorySize(performanceData.memory.max_memory) }}
              </span>
            </div>
            <div class="progress-bar large">
              <div 
                class="progress-fill jvm-memory" 
                :style="{ 
                  width: (performanceData.memory.usage_percent || 0) + '%',
                  backgroundColor: getResourceColor(performanceData.memory.usage_percent || 0)
                }"
              ></div>
            </div>
            <div class="resource-percentage">{{ (performanceData.memory.usage_percent || 0).toFixed(1) }}%</div>
          </div>
          
          <div v-if="performanceData?.threads" class="resource-item">
            <div class="resource-header">
              <span class="resource-label">活跃线程</span>
              <span class="resource-value">{{ performanceData.threads.active_count }} / {{ performanceData.threads.daemon_count }}</span>
            </div>
            <div class="progress-bar large">
              <div 
                class="progress-fill threads" 
                :style="{ 
                  width: Math.min(100, (performanceData.threads.active_count / performanceData.threads.daemon_count) * 100) + '%',
                  backgroundColor: getResourceColor(Math.min(100, (performanceData.threads.active_count / performanceData.threads.daemon_count) * 100))
                }"
              ></div>
            </div>
            <div class="resource-percentage">{{ Math.min(100, (performanceData.threads.active_count / performanceData.threads.daemon_count) * 100).toFixed(1) }}%</div>
          </div>
        </div>
      </div>
      
      <!-- 世界信息 -->
      <div v-if="filteredWorldsData && filteredWorldsData.length > 0" class="section worlds-section">
        <h4 class="section-title">世界信息</h4>
        <div class="worlds-grid">
          <div 
            v-for="world in filteredWorldsData" 
            :key="world.name"
            class="world-card"
          >
            <div class="world-header">
              <span class="world-name">{{ world.name }}</span>
              <span class="world-players">{{ world.player_count }} 玩家</span>
            </div>
            
            <div class="world-stats">
              <div class="world-stat">
                <span class="stat-label">实体数量</span>
                <div class="stat-bar">
                  <div 
                    class="stat-fill entities" 
                    :style="{ width: Math.min(100, (world.entity_count / 5000) * 100) + '%' }"
                  ></div>
                </div>
                <span class="stat-value">{{ world.entity_count }}</span>
              </div>
              
              <div class="world-stat">
                <span class="stat-label">已加载区块</span>
                <div class="stat-bar">
                  <div 
                    class="stat-fill chunks" 
                    :style="{ width: Math.min(100, (world.loaded_chunks / 10000) * 100) + '%' }"
                  ></div>
                </div>
                <span class="stat-value">{{ world.loaded_chunks }}</span>
              </div>
              
              <div class="world-stat">
                <span class="stat-label">难度</span>
                <span class="stat-value difficulty">{{ world.difficulty }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 玩家列表 -->
      <div v-if="playersList && playersList.length > 0" class="section players-section">
        <h4 class="section-title">在线玩家 ({{ playersList.length }})</h4>
        <div class="players-grid">
          <div 
            v-for="player in playersList.slice(0, 12)" 
            :key="player.uuid"
            class="player-card"
          >
            <div class="player-info">
              <span class="player-name">{{ player.name }}</span>
              <span class="player-level">等级 {{ player.level }}</span>
            </div>
            
            <div class="player-stats">
              <div class="player-stat">
                <span class="stat-label">生命值</span>
                <div class="stat-bar">
                  <div 
                    class="stat-fill health" 
                    :style="{ width: Math.min(100, (player.health / 100) * 100) + '%' }"
                  ></div>
                </div>
                <span class="stat-value">{{ Math.round(player.health) }}/100</span>
              </div>
              
              <div class="player-stat">
                <span class="stat-label">饥饿值</span>
                <div class="stat-bar">
                  <div 
                    class="stat-fill food" 
                    :style="{ width: (player.food_level / 20) * 100 + '%' }"
                  ></div>
                </div>
                <span class="stat-value">{{ player.food_level }}/20</span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="playersList.length > 12" class="more-players">
          还有 {{ playersList.length - 12 }} 名玩家在线...
        </div>
      </div>
    </div>
    
    <!-- 最后更新时间 -->
    <div class="last-update">
      最后更新: {{ lastUpdate }} (每30秒自动刷新)
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 响应式数据
const loading = ref(false)
const error = ref(null)
const lastUpdate = ref('')

// API数据
const serverData = ref(null)
const performanceData = ref(null)
const playersData = ref(null)
const playersList = ref([])
const worldsData = ref([])
const systemData = ref(null)

// API配置
const API_BASE = '/api/v1'

// 连接状态
const connectionStatus = computed(() => {
  if (loading.value) return 'connecting'
  if (error.value) return 'offline'
  return 'online'
})

const connectionStatusText = computed(() => {
  switch (connectionStatus.value) {
    case 'connecting': return '连接中'
    case 'online': return '已连接'
    case 'offline': return '连接失败'
    default: return '未知'
  }
})

// 计算属性
const playerPercentage = computed(() => {
  if (!playersData.value) return 0
  const current = playersData.value.online_count || 0
  const max = playersData.value.max_players || 1
  return Math.round((current / max) * 100)
})

// 过滤世界数据，排除DIM-1和twilight_forest
const filteredWorldsData = computed(() => {
  if (!worldsData.value) return []
  return worldsData.value.filter(world => {
    const name = world.name.toLowerCase()
    return !name.includes('dim-1') && !name.includes('twilight_forest')
  })
})

// API调用方法
const fetchServerInfo = async () => {
  const response = await fetch(`${API_BASE}/server/info`)
  const result = await response.json()
  return result.success ? result.data : null
}

const fetchServerStatus = async () => {
  const response = await fetch(`${API_BASE}/server/status`)
  const result = await response.json()
  return result.success ? result.data : null
}

const fetchServerPerformance = async () => {
  const response = await fetch(`${API_BASE}/server/performance`)
  const result = await response.json()
  return result.success ? result.data : null
}

const fetchPlayersOnline = async () => {
  const response = await fetch(`${API_BASE}/players/online`)
  const result = await response.json()
  return result.success ? result.data : null
}

const fetchPlayersList = async () => {
  const response = await fetch(`${API_BASE}/players/list`)
  const result = await response.json()
  return result.success ? result.data : null
}

const fetchWorldsList = async () => {
  const response = await fetch(`${API_BASE}/worlds/list`)
  const result = await response.json()
  return result.success ? result.data : null
}

const fetchSystemResources = async () => {
  const response = await fetch(`${API_BASE}/system/resources`)
  const result = await response.json()
  return result.success ? result.data : null
}

// 获取所有数据
const fetchAllData = async () => {
  loading.value = true
  error.value = null
  
  try {
    const [serverInfo, serverStatus, serverPerformance, playersOnline, playersList, worldsList, systemResources] = await Promise.allSettled([
      fetchServerInfo(),
      fetchServerStatus(),
      fetchServerPerformance(),
      fetchPlayersOnline(),
      fetchPlayersList(),
      fetchWorldsList(),
      fetchSystemResources()
    ])
    
    if (serverInfo.status === 'fulfilled' && serverInfo.value) {
      serverData.value = serverInfo.value
    }
    if (serverStatus.status === 'fulfilled' && serverStatus.value) {
      serverData.value = { ...serverData.value, ...serverStatus.value }
    }
    if (serverPerformance.status === 'fulfilled' && serverPerformance.value) {
      performanceData.value = serverPerformance.value
    }
    if (playersOnline.status === 'fulfilled' && playersOnline.value) {
      playersData.value = playersOnline.value
    }
    if (playersList.status === 'fulfilled' && playersList.value) {
      playersList.value = playersList.value.players || []
    }
    if (worldsList.status === 'fulfilled' && worldsList.value) {
      worldsData.value = worldsList.value.worlds || []
    }
    if (systemResources.status === 'fulfilled' && systemResources.value) {
      systemData.value = systemResources.value
    }
    
    lastUpdate.value = new Date().toLocaleString('zh-CN')
  } catch (err) {
    error.value = `无法连接到服务器: ${err.message}`
    console.error('API调用失败:', err)
  } finally {
    loading.value = false
  }
}

// 工具方法
const formatMemorySize = (bytes) => {
  if (!bytes) return '0 B'
  if (bytes > 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }
  if (bytes > 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }
  if (bytes > 1024) {
    return (bytes / 1024).toFixed(2) + ' KB'
  }
  return bytes + ' B'
}

const getResourceColor = (percentage) => {
  if (percentage < 50) return '#10b981'
  if (percentage < 75) return '#f59e0b'
  return '#ef4444'
}

// 重命名原来的fetchData方法
const fetchData = fetchAllData

// 组件挂载时获取数据
onMounted(() => {
  fetchAllData()
  
  // 每30秒自动刷新数据
  setInterval(() => {
    if (!loading.value) {
      fetchAllData()
    }
  }, 30000)
})
</script>

<style scoped>
.server-status-widget {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.status-header h3 {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 1.2rem;
}

.status-indicator {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-indicator.online {
  background: #10b981;
  color: white;
}

.status-indicator.connecting {
  background: #f59e0b;
  color: white;
}

.status-indicator.offline {
  background: #ef4444;
  color: white;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;
  color: var(--vp-c-text-2);
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--vp-c-divider);
  border-top: 2px solid var(--vp-c-brand-1);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  gap: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
}

.error-icon {
  font-size: 2rem;
}

.error-message h4 {
  margin: 0 0 0.5rem 0;
  color: #ef4444;
}

.error-message p {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.retry-btn {
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s ease;
}

.retry-btn:hover {
  background: #dc2626;
}

.section {
  margin-bottom: 2rem;
}

.section-title {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-1);
  font-size: 1rem;
  font-weight: 600;
  border-bottom: 2px solid var(--vp-c-brand-1);
  padding-bottom: 0.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}

.label {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  font-weight: 500;
}

.value {
  color: var(--vp-c-text-1);
  font-weight: 600;
  font-size: 0.9rem;
}

.value-with-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.online {
  background: #10b981;
}

.status-dot.offline {
  background: #ef4444;
}

.value-with-progress {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.progress-bar {
  width: 80px;
  height: 4px;
  background: var(--vp-c-divider);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar.large {
  width: 100%;
  height: 8px;
  border-radius: 4px;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-fill.players {
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
}

.progress-fill.memory {
  background: #3b82f6;
}

.progress-fill.jvm-memory {
  background: #8b5cf6;
}

.progress-fill.threads {
  background: #06b6d4;
}

.resource-grid {
  display: grid;
  gap: 1.5rem;
}

.resource-item {
  padding: 1.5rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}

.resource-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.resource-label {
  color: var(--vp-c-text-1);
  font-weight: 600;
}

.resource-value {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.resource-percentage {
  text-align: center;
  margin-top: 0.5rem;
  color: var(--vp-c-text-1);
  font-weight: 600;
  font-size: 0.9rem;
}

.worlds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.world-card {
  padding: 1.5rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.world-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.world-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.world-name {
  color: var(--vp-c-text-1);
  font-weight: 600;
}

.world-players {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.world-stats {
  display: grid;
  gap: 0.75rem;
}

.world-stat {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  align-items: center;
  gap: 0.5rem;
}

.stat-label {
  color: var(--vp-c-text-2);
  font-size: 0.8rem;
}

.stat-bar {
  height: 6px;
  background: var(--vp-c-divider);
  border-radius: 3px;
  overflow: hidden;
}

.stat-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.stat-fill.entities {
  background: #f59e0b;
}

.stat-fill.chunks {
  background: #10b981;
}

.stat-value {
  color: var(--vp-c-text-1);
  font-size: 0.8rem;
  font-weight: 500;
  text-align: right;
}

.stat-value.difficulty {
  text-align: center;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  text-transform: uppercase;
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.player-card {
  padding: 1rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.player-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.player-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.player-name {
  color: var(--vp-c-text-1);
  font-weight: 600;
}

.player-level {
  color: var(--vp-c-text-2);
  font-size: 0.8rem;
}

.player-stats {
  display: grid;
  gap: 0.5rem;
}

.player-stat {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  align-items: center;
  gap: 0.5rem;
}

.stat-fill.health {
  background: #ef4444;
}

.stat-fill.food {
  background: #f59e0b;
}

.more-players {
  text-align: center;
  color: var(--vp-c-text-2);
  font-style: italic;
  margin-top: 1rem;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
}

.last-update {
  text-align: center;
  color: var(--vp-c-text-2);
  font-size: 0.8rem;
  padding-top: 1rem;
  border-top: 1px solid var(--vp-c-divider);
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .worlds-grid {
    grid-template-columns: 1fr;
  }
  
  .players-grid {
    grid-template-columns: 1fr;
  }
  
  .world-stat, .player-stat {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
  
  .stat-value {
    text-align: left;
  }
  
  .server-status-widget {
    padding: 1rem;
  }
}
</style>