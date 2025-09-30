<template>
  <div class="server-status-widget">
    <div class="status-header">
      <h3>服务器实时监控</h3>
      <span :class="['status-indicator', connectionStatus]">{{ connectionStatusText }}</span>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <span>正在获取服务器数据...</span>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <div class="error-message">
        <h4>连接失败</h4>
        <p>{{ error }}</p>
        <button @click="fetchAllData" class="retry-btn">重新连接</button>
      </div>
    </div>
    
    <!-- 主要数据展示 -->
    <div v-else class="data-container" :key="`data-${lastUpdate}`">
      <!-- 服务器概览 -->
      <div class="section overview-section">
        <h4 class="section-title">服务器概览</h4>
        <div class="overview-grid">
          <div class="overview-card server-status">
            <div class="card-header">
              <span class="card-title">服务器状态</span>
              <div :class="['status-dot', serverData?.online ? 'online' : 'offline']"></div>
            </div>
            <div class="card-content">
              <div class="status-info">
                <div class="status-text">{{ serverData?.online ? '运行中' : '离线' }}</div>
                <div class="uptime">插件版本: {{ serverData?.plugin_version || '未知' }}</div>
              </div>
            </div>
          </div>
          
          <div class="overview-card players-card">
            <div class="card-header">
              <span class="card-title">在线玩家</span>
              <span class="player-count">{{ playersData?.online_count || 0 }}/{{ playersData?.max_players || 0 }}</span>
            </div>
            <div class="card-content">
              <div class="circular-progress">
                <svg class="progress-ring" width="80" height="80">
                  <circle
                    class="progress-ring-circle-bg"
                    stroke="var(--vp-c-divider)"
                    stroke-width="6"
                    fill="transparent"
                    r="34"
                    cx="40"
                    cy="40"
                  />
                  <circle
                    class="progress-ring-circle"
                    stroke="#3b82f6"
                    stroke-width="6"
                    fill="transparent"
                    r="34"
                    cx="40"
                    cy="40"
                    :stroke-dasharray="213.6"
                    :stroke-dashoffset="213.6 - (213.6 * playerPercentage) / 100"
                  />
                </svg>
                <div class="progress-text">{{ playerPercentage }}%</div>
              </div>
            </div>
          </div>
          
          <div class="overview-card version-card">
            <div class="card-header">
              <span class="card-title">服务器版本</span>
            </div>
            <div class="card-content">
              <div class="version-info">
                <div class="version-main">1.20.1</div>
                <div class="version-detail">{{ serverData?.spark_available ? 'Spark可用' : 'Spark不可用' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 性能监控 -->
      <div class="section performance-section" key="performance-section">
        <h4 class="section-title">性能监控</h4>
        <div class="performance-grid">
          <!-- TPS监控 -->
          <div v-if="performanceData?.tps?.available" class="performance-card tps-card" key="tps-card">
            <div class="card-header">
              <span class="card-title">TPS (每秒刻数)</span>
              <span class="help-text">服务器运行流畅度指标，20为满分</span>
            </div>
            <div class="card-content">
              <div class="tps-display">
                <div class="circular-progress large">
                  <svg class="progress-ring" width="120" height="120">
                    <circle
                      class="progress-ring-circle-bg"
                      stroke="var(--vp-c-divider)"
                      stroke-width="8"
                      fill="transparent"
                      r="52"
                      cx="60"
                      cy="60"
                    />
                    <circle
                      class="progress-ring-circle"
                      :stroke="getTpsColor(performanceData.tps.values.last_1m)"
                      stroke-width="8"
                      fill="transparent"
                      r="52"
                      cx="60"
                      cy="60"
                      :stroke-dasharray="326.7"
                      :stroke-dashoffset="326.7 - (326.7 * Math.min(performanceData.tps.values.last_1m, 20)) / 20"
                    />
                  </svg>
                  <div class="progress-text large">
                    <div class="main-value">{{ performanceData.tps.values.last_1m.toFixed(1) }}</div>
                    <div class="sub-value">TPS</div>
                  </div>
                </div>
                <div class="tps-details">
                  <div class="tps-item">
                    <span class="label">10秒平均</span>
                    <span class="value">{{ performanceData.tps.values.last_10s.toFixed(1) }}</span>
                  </div>
                  <div class="tps-item">
                    <span class="label">5分钟平均</span>
                    <span class="value">{{ performanceData.tps.values.last_5m.toFixed(1) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- MSPT监控 -->
          <div v-if="performanceData?.mspt?.available" class="performance-card mspt-card" key="mspt-card">
            <div class="card-header">
              <span class="card-title">MSPT (每刻毫秒数)</span>
              <span class="help-text">处理每个游戏刻所需时间，越低越好</span>
            </div>
            <div class="card-content">
              <div class="mspt-chart">
                <canvas ref="msptChart" width="300" height="150"></canvas>
              </div>
              <div class="mspt-stats">
                <div class="stat-item">
                  <span class="label">平均值</span>
                  <span class="value">{{ performanceData.mspt.values.last_1m.mean.toFixed(1) }}ms</span>
                </div>
                <div class="stat-item">
                  <span class="label">最大值</span>
                  <span class="value">{{ performanceData.mspt.values.last_1m.max.toFixed(1) }}ms</span>
                </div>
              </div>
            </div>
          </div>

          <!-- CPU使用率 -->
          <div v-if="performanceData?.cpu?.available" class="performance-card cpu-card" key="cpu-card">
            <div class="card-header">
              <span class="card-title">CPU使用率</span>
              <span class="help-text">处理器使用情况</span>
            </div>
            <div class="card-content">
              <div class="cpu-meters">
                <div class="cpu-meter">
                  <div class="meter-label">系统总体</div>
                  <div class="progress-bar cpu-system">
                    <div 
                      class="progress-fill" 
                      :style="{ 
                        width: performanceData.cpu.system.last_1m + '%',
                        backgroundColor: getResourceColor(performanceData.cpu.system.last_1m)
                      }"
                    ></div>
                  </div>
                  <div class="meter-value">{{ performanceData.cpu.system.last_1m.toFixed(1) }}%</div>
                </div>
                <div class="cpu-meter">
                  <div class="meter-label">服务器进程</div>
                  <div class="progress-bar cpu-process">
                    <div 
                      class="progress-fill" 
                      :style="{ 
                        width: performanceData.cpu.process.last_1m + '%',
                        backgroundColor: getResourceColor(performanceData.cpu.process.last_1m)
                      }"
                    ></div>
                  </div>
                  <div class="meter-value">{{ performanceData.cpu.process.last_1m.toFixed(1) }}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 内存使用情况 -->
      <div class="section memory-section" key="memory-section">
        <h4 class="section-title">内存使用情况</h4>
        <div class="memory-grid">
          <div v-if="performanceData?.memory?.heap" class="memory-card heap-memory" key="heap-memory">
            <div class="card-header">
              <span class="card-title">堆内存 (游戏数据)</span>
              <span class="help-text">存储游戏世界、玩家数据等</span>
            </div>
            <div class="card-content">
              <div class="memory-visual">
                <div class="circular-progress large">
                  <svg class="progress-ring" width="120" height="120">
                    <circle
                      class="progress-ring-circle-bg"
                      stroke="var(--vp-c-divider)"
                      stroke-width="8"
                      fill="transparent"
                      r="52"
                      cx="60"
                      cy="60"
                    />
                    <circle
                      class="progress-ring-circle"
                      :stroke="getResourceColor(performanceData.memory.heap.usage_percent)"
                      stroke-width="8"
                      fill="transparent"
                      r="52"
                      cx="60"
                      cy="60"
                      :stroke-dasharray="326.7"
                      :stroke-dashoffset="326.7 - (326.7 * performanceData.memory.heap.usage_percent) / 100"
                    />
                  </svg>
                  <div class="progress-text large">
                    <div class="main-value">{{ performanceData.memory.heap.usage_percent.toFixed(1) }}%</div>
                    <div class="sub-value">已使用</div>
                  </div>
                </div>
                <div class="memory-details">
                  <div class="memory-item">
                    <span class="label">已使用</span>
                    <span class="value">{{ formatMemorySize(performanceData.memory.heap.used) }}</span>
                  </div>
                  <div class="memory-item">
                    <span class="label">最大可用</span>
                    <span class="value">{{ formatMemorySize(performanceData.memory.heap.max) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="performanceData?.gc" class="memory-card gc-card" key="gc-card">
            <div class="card-header">
              <span class="card-title">垃圾回收 (GC)</span>
              <span class="help-text">自动清理无用内存的次数</span>
            </div>
            <div class="card-content">
              <div class="gc-stats">
                <div class="gc-item">
                  <div class="gc-label">总回收次数</div>
                  <div class="gc-value">{{ performanceData.gc.total_collections }}</div>
                </div>
                <div class="gc-item">
                  <div class="gc-label">总耗时</div>
                  <div class="gc-value">{{ (performanceData.gc.total_time_ms / 1000).toFixed(1) }}s</div>
                </div>
                <div class="gc-item">
                  <div class="gc-label">平均耗时</div>
                  <div class="gc-value">{{ performanceData.gc.average_time_per_collection.toFixed(1) }}ms</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 世界信息 -->
      <div v-if="filteredWorldsData && filteredWorldsData.length > 0" class="section worlds-section" key="worlds-section">
        <h4 class="section-title">游戏世界</h4>
        <div class="worlds-grid">
          <div 
            v-for="world in filteredWorldsData" 
            :key="world.name"
            class="world-card"
          >
            <div class="world-header">
              <div class="world-info">
                <span class="world-name">{{ world.dimension?.name || getWorldDisplayName(world.name) }}</span>
                <span class="world-dimension">{{ world.dimension?.type || 'unknown' }}</span>
              </div>
              <span class="world-players">{{ world.player_count }} 名玩家</span>
            </div>
            
            <div class="world-stats">
              <div class="world-stat">
                <span class="stat-label">总实体数</span>
                <div class="stat-bar">
                  <div 
                    class="stat-fill entities" 
                    :style="{ width: Math.min(100, (world.entity_count / 1000) * 100) + '%' }"
                  ></div>
                </div>
                <span class="stat-value">{{ world.entity_count }}</span>
              </div>
              
              <div class="world-stat">
                <span class="stat-label">已加载区块</span>
                <div class="stat-bar">
                  <div 
                    class="stat-fill chunks" 
                    :style="{ width: Math.min(100, (world.loaded_chunks / 5000) * 100) + '%' }"
                  ></div>
                </div>
                <span class="stat-value">{{ world.loaded_chunks }}</span>
              </div>
              
              <div class="world-stat">
                <span class="stat-label">游戏难度</span>
                <span class="stat-value difficulty">{{ getDifficultyText(world.difficulty) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 在线玩家 -->
      <div v-if="playersList && playersList.length > 0" class="section players-section" key="players-section">
        <h4 class="section-title">在线玩家 ({{ playersList.length }}人)</h4>
        <div class="players-grid">
          <div 
            v-for="player in playersList.slice(0, 8)" 
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
                    :style="{ width: (player.health / 20) * 100 + '%' }"
                  ></div>
                </div>
                <span class="stat-value">{{ Math.round(player.health) }}/50</span>
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
              
              <div class="player-stat">
                <span class="stat-label">网络延迟</span>
                <span class="stat-value ping" :class="getPingClass(player.ping)">{{ player.ping }}ms</span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="playersList.length > 8" class="more-players">
          还有 {{ playersList.length - 8 }} 名玩家在线...
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
import { ref, computed, onMounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

// 响应式数据
const loading = ref(false)
const error = ref(null)
const lastUpdate = ref('')
const msptChart = ref(null)
let msptChartInstance = null

// API数据
const serverData = ref(null)
const performanceData = ref(null)
const playersData = ref(null)
const playersList = ref([])
const worldsData = ref([])

// API配置
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.mcwok.cn/api/v1'

// 创建请求选项（移除鉴权）
const createRequestOptions = () => ({
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})

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

const filteredWorldsData = computed(() => {
  if (!worldsData.value) return []
  
  // 只显示主世界、下界、末地三个世界
  const targetWorlds = ['world', 'world_nether', 'world_the_end']
  
  return targetWorlds.map(worldName => {
    const world = worldsData.value.find(w => w.name === worldName)
    if (world) {
      return {
        ...world,
        dimension: getDimensionInfo(world.name)
      }
    }
    // 如果没有找到对应世界，返回默认数据
    return {
      name: worldName,
      entity_count: 0,
      loaded_chunks: 0,
      player_count: 0,
      difficulty: 'NORMAL',
      dimension: getDimensionInfo(worldName)
    }
  })
})

// API调用方法
const fetchAllData = async () => {
  loading.value = true
  error.value = null
  
  try {
    const requestOptions = createRequestOptions()
    const [healthRes, statusRes, performanceRes, playersRes, playersListRes, worldsRes, systemRes] = await Promise.allSettled([
      fetch(`${API_BASE}/health`, requestOptions),
      fetch(`${API_BASE}/server/status`, requestOptions),
      fetch(`${API_BASE}/server/performance`, requestOptions),
      fetch(`${API_BASE}/players/online`, requestOptions),
      fetch(`${API_BASE}/players/list`, requestOptions),
      fetch(`${API_BASE}/worlds/list`, requestOptions),
      fetch(`${API_BASE}/system/resources`, requestOptions)
    ])
    
    // 处理健康检查
    if (healthRes.status === 'fulfilled' && healthRes.value.ok) {
      const healthData = await healthRes.value.json()
      console.log('Health check:', healthData)
    }
    
    // 处理服务器状态
    if (statusRes.status === 'fulfilled' && statusRes.value.ok) {
      const statusData = await statusRes.value.json()
      if (statusData.success) {
        serverData.value = statusData.data
      }
    }
    
    // 处理性能数据
    if (performanceRes.status === 'fulfilled' && performanceRes.value.ok) {
      const perfData = await performanceRes.value.json()
      if (perfData.success) {
        performanceData.value = perfData.data
        await nextTick()
        createMsptChart()
      }
    }
    
    // 处理玩家数据
    if (playersRes.status === 'fulfilled' && playersRes.value.ok) {
      const playersData_ = await playersRes.value.json()
      if (playersData_.success) {
        playersData.value = playersData_.data
      }
    }
    
    // 处理玩家列表
    if (playersListRes.status === 'fulfilled' && playersListRes.value.ok) {
      const playersListData = await playersListRes.value.json()
      if (playersListData.success) {
        playersList.value = playersListData.data.players || []
      }
    }
    
    // 处理世界数据
    if (worldsRes.status === 'fulfilled' && worldsRes.value.ok) {
      const worldsData_ = await worldsRes.value.json()
      if (worldsData_.success) {
        worldsData.value = worldsData_.data.worlds || []
      }
    }
    
    // 处理系统资源数据
    if (systemRes.status === 'fulfilled' && systemRes.value.ok) {
      const systemData = await systemRes.value.json()
      if (systemData.success) {
        console.log('System resources:', systemData.data)
      }
    }
    
    lastUpdate.value = new Date().toLocaleString('zh-CN')
  } catch (err) {
    error.value = `无法连接到服务器: ${err.message}`
    console.error('API调用失败:', err)
  } finally {
    loading.value = false
  }
}

// 创建MSPT图表
const createMsptChart = () => {
  if (!msptChart.value || !performanceData.value?.mspt?.available) return
  
  if (msptChartInstance) {
    msptChartInstance.destroy()
  }
  
  const ctx = msptChart.value.getContext('2d')
  const msptData = performanceData.value.mspt.values
  
  msptChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['1分钟', '5分钟'],
      datasets: [{
        label: '平均值',
        data: [msptData.last_1m.mean, msptData.last_5m.mean],
        backgroundColor: '#3b82f6',
        borderRadius: 4
      }, {
        label: '最大值',
        data: [msptData.last_1m.max, msptData.last_5m.max],
        backgroundColor: '#ef4444',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: '毫秒 (ms)'
          }
        }
      }
    }
  })
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

const getTpsColor = (tps) => {
  if (tps >= 19) return '#10b981'
  if (tps >= 15) return '#f59e0b'
  return '#ef4444'
}

const getShortVersion = (version) => {
  if (!version) return '未知'
  return version.split('-')[0] || version
}

const getWorldDisplayName = (name) => {
  const nameMap = {
    'world': '主世界',
    'world_nether': '下界',
    'world_the_end': '末地'
  }
  return nameMap[name] || name
}

const getDifficultyText = (difficulty) => {
  const diffMap = {
    'PEACEFUL': '和平',
    'EASY': '简单',
    'NORMAL': '普通',
    'HARD': '困难'
  }
  return diffMap[difficulty] || difficulty
}

const getDimensionInfo = (worldName) => {
  const name = worldName.toLowerCase()
  if (name === 'world' || name.includes('overworld')) {
    return { name: '主世界', type: 'overworld' }
  } else if (name === 'world_nether' || name.includes('nether') || name.includes('dim-1')) {
    return { name: '下界', type: 'nether' }
  } else if (name === 'world_the_end' || name.includes('end') || name.includes('dim1')) {
    return { name: '末地', type: 'end' }
  }
  return { name: '未知', type: 'unknown' }
}

const getPingClass = (ping) => {
  if (ping < 50) return 'good'
  if (ping < 100) return 'ok'
  return 'bad'
}

// 组件挂载
onMounted(() => {
  fetchAllData()
  
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
  padding: 24px;
  margin: 16px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.status-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.status-indicator {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-indicator.online {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.status-indicator.connecting {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.status-indicator.offline {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

/* 加载和错误状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--vp-c-text-2);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--vp-c-divider);
  border-top: 3px solid var(--vp-c-brand);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  display: flex;
  align-items: center;
  padding: 40px 20px;
  text-align: center;
}

.error-icon {
  font-size: 48px;
  margin-right: 20px;
}

.error-message h4 {
  margin: 0 0 8px 0;
  color: var(--vp-c-text-1);
}

.error-message p {
  margin: 0 0 16px 0;
  color: var(--vp-c-text-2);
}

.retry-btn {
  background: var(--vp-c-brand);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background: var(--vp-c-brand-dark);
}

/* 数据容器 */
.data-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
  transition: opacity 0.3s ease-in-out;
}

/* 通用section样式 */
.section {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider-light);
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease-in-out;
}

/* 数值更新动画 */
.main-value, .value, .gc-value, .stat-value, .meter-value {
  transition: all 0.3s ease-in-out;
}

/* 进度条动画 */
.progress-fill, .stat-fill {
  transition: width 0.5s ease-in-out, background-color 0.3s ease-in-out;
}

/* 圆形进度条动画 */
.progress-ring-circle {
  transition: stroke-dashoffset 0.5s ease-in-out, stroke 0.3s ease-in-out;
  stroke-linecap: round;
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  display: flex;
  align-items: center;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 16px;
  background: var(--vp-c-brand);
  border-radius: 2px;
  margin-right: 12px;
}

/* 概览部分 */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.overview-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider-light);
  border-radius: 8px;
  padding: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  text-align: center;
}

.card-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 服务器状态卡片 */
.server-status .status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-dot.online {
  background: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.status-dot.offline {
  background: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.status-info {
  text-align: center;
  width: 100%;
}

.status-text {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 4px;
}

.uptime {
  font-size: 12px;
  color: var(--vp-c-text-2);
}

/* 玩家卡片 */
.player-count {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-brand);
}

/* 版本卡片 */
.version-info {
  text-align: center;
}

.version-main {
  font-size: 20px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 4px;
}

.version-detail {
  font-size: 12px;
  color: var(--vp-c-text-2);
}

/* 圆形进度条 */
.circular-progress {
  position: relative;
  display: inline-block;
}

.circular-progress.large {
  margin-right: 20px;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.progress-text.large .main-value {
  font-size: 18px;
  line-height: 1;
}

.progress-text.large .sub-value {
  font-size: 10px;
  color: var(--vp-c-text-2);
  margin-top: 2px;
}

/* 性能监控部分 */
.performance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}

.performance-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider-light);
  border-radius: 8px;
  padding: 20px;
}

.help-text {
  font-size: 11px;
  color: var(--vp-c-text-3);
  font-style: italic;
  text-align: center;
}

/* TPS卡片 */
.tps-display {
  display: flex;
  align-items: center;
}

.tps-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tps-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--vp-c-bg);
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider-light);
}

.tps-item .label {
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.tps-item .value {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

/* MSPT卡片 */
.mspt-chart {
  margin-bottom: 16px;
  height: 150px;
}

.mspt-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 12px;
  background: var(--vp-c-bg);
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider-light);
}

.stat-item .label {
  display: block;
  font-size: 11px;
  color: var(--vp-c-text-2);
  margin-bottom: 4px;
}

.stat-item .value {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

/* CPU卡片 */
.cpu-meters {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cpu-meter {
  display: flex;
  align-items: center;
  gap: 12px;
}

.meter-label {
  flex: 0 0 80px;
  font-size: 12px;
  color: var(--vp-c-text-2);
  text-align: center;
}

.meter-value {
  flex: 0 0 50px;
  text-align: right;
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: var(--vp-c-divider-light);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease-in-out;
}

/* 内存部分 */
.memory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.memory-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider-light);
  border-radius: 8px;
  padding: 20px;
}

.memory-visual {
  display: flex;
  align-items: center;
}

.memory-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.memory-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--vp-c-bg);
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider-light);
}

.memory-item .label {
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.memory-item .value {
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

/* GC卡片 */
.gc-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.gc-item {
  text-align: center;
  padding: 16px 12px;
  background: var(--vp-c-bg);
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider-light);
  min-width: 120px;
}

.gc-label {
  display: block;
  font-size: 11px;
  color: var(--vp-c-text-2);
  margin-bottom: 8px;
}

.gc-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

/* 世界信息 */
.worlds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.world-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider-light);
  border-radius: 8px;
  padding: 16px;
  transition: transform 0.2s;
}

.world-card:hover {
  transform: translateY(-1px);
}

.world-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.world-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.world-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.world-dimension {
  font-size: 11px;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg);
  padding: 2px 6px;
  border-radius: 10px;
  width: fit-content;
}

.world-players {
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.world-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.world-stat {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  flex: 0 0 80px;
  font-size: 11px;
  color: var(--vp-c-text-2);
}

.stat-bar {
  flex: 1;
  height: 6px;
  background: var(--vp-c-divider-light);
  border-radius: 3px;
  overflow: hidden;
}

.stat-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease-in-out;
}

.stat-fill.entities {
  background: #8b5cf6;
}

.stat-fill.chunks {
  background: #06b6d4;
}

.stat-fill.health {
  background: #ef4444;
}

.stat-fill.food {
  background: #f59e0b;
}

.stat-value {
  flex: 0 0 auto;
  font-size: 11px;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.stat-value.difficulty {
  font-size: 12px;
  padding: 2px 8px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand);
  border-radius: 12px;
}

/* 玩家列表 */
.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.player-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider-light);
  border-radius: 8px;
  padding: 16px;
  transition: transform 0.2s;
}

.player-card:hover {
  transform: translateY(-1px);
}

.player-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.player-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.player-level {
  font-size: 11px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  padding: 2px 6px;
  border-radius: 10px;
}

.player-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.player-stat {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-value.ping {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
}

.stat-value.ping.good {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.stat-value.ping.ok {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.stat-value.ping.bad {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.more-players {
  text-align: center;
  margin-top: 16px;
  padding: 12px;
  background: var(--vp-c-bg-soft);
  border-radius: 6px;
  font-size: 12px;
  color: var(--vp-c-text-2);
}

/* 最后更新时间 */
.last-update {
  text-align: center;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 12px;
  color: var(--vp-c-text-3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .server-status-widget {
    padding: 16px;
    margin: 12px 0;
  }
  
  .overview-grid,
  .performance-grid,
  .memory-grid {
    grid-template-columns: 1fr;
  }
  
  .worlds-grid,
  .players-grid {
    grid-template-columns: 1fr;
  }
  
  .tps-display,
  .memory-visual {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .circular-progress.large {
    margin-right: 0;
    margin-bottom: 16px;
  }
  
  .cpu-meter {
    flex-direction: column;
    gap: 8px;
  }
  
  .meter-label,
  .meter-value {
    flex: none;
  }
  
  .mspt-stats {
    flex-direction: column;
  }
  
  .gc-stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .status-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .error-container {
    flex-direction: column;
    text-align: center;
  }
  
  .error-icon {
    margin-right: 0;
    margin-bottom: 16px;
  }
}
</style>