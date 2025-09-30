<template>
  <div class="admin-container">
    <div class="admin-header">
      <h1 class="admin-title">服务器监控</h1>
      <div style="display: flex; gap: 12px; align-items: center;">
        <button 
          @click="toggleAutoRefresh" 
          class="btn"
          :class="serverStore.autoRefreshEnabled ? 'btn-success' : 'btn-secondary'"
        >
          {{ serverStore.autoRefreshEnabled ? '暂停监控' : '开始监控' }}
        </button>
        <select 
          v-model="refreshInterval" 
          @change="updateRefreshInterval"
          class="form-input" 
          style="width: auto; min-width: 120px;"
        >
          <option value="1000">1秒</option>
          <option value="5000">5秒</option>
          <option value="10000">10秒</option>
          <option value="30000">30秒</option>
        </select>
        <button @click="serverStore.loadAllData()" class="btn btn-secondary" :disabled="serverStore.loading">
          <span v-if="serverStore.loading" class="loading-spinner"></span>
          刷新数据
        </button>
      </div>
    </div>

    <!-- 服务器状态概览 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number" :class="serverStore.isOnline ? 'tps-excellent' : 'tps-poor'">
          {{ serverStore.isOnline ? '在线' : '离线' }}
        </div>
        <div class="stat-label">服务器状态</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ serverStore.onlinePlayersCount }}</div>
        <div class="stat-label">在线玩家</div>
      </div>
      <div class="stat-card">
        <div class="stat-number" :class="tpsClass">{{ serverStore.currentTPS.toFixed(1) }}</div>
        <div class="stat-label">当前TPS</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ serverStore.currentMSPT.toFixed(1) }}</div>
        <div class="stat-label">MSPT</div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="serverStore.error" class="error-message">
      {{ serverStore.error }}
    </div>

    <!-- 性能监控 -->
    <div class="performance-grid">
      <!-- TPS 监控 -->
      <div class="performance-card">
        <h3 class="performance-title">服务器TPS</h3>
        <div v-if="serverStore.performance">
          <div class="performance-metrics">
            <div class="metric">
              <span class="metric-label">1分钟:</span>
              <span class="metric-value" :class="getTpsClass(serverStore.performance.tps.values.last_1m)">
                {{ serverStore.performance.tps.values.last_1m.toFixed(1) }}
              </span>
            </div>
            <div class="metric">
              <span class="metric-label">5分钟:</span>
              <span class="metric-value" :class="getTpsClass(serverStore.performance.tps.values.last_5m)">
                {{ serverStore.performance.tps.values.last_5m.toFixed(1) }}
              </span>
            </div>
            <div class="metric">
              <span class="metric-label">15分钟:</span>
              <span class="metric-value" :class="getTpsClass(serverStore.performance.tps.values.last_15m)">
                {{ serverStore.performance.tps.values.last_15m.toFixed(1) }}
              </span>
            </div>
          </div>
        </div>
        <div v-else class="loading">
          <span class="loading-spinner"></span>
          加载中...
        </div>
      </div>

      <!-- 内存使用 -->
      <div class="performance-card">
        <h3 class="performance-title">内存使用</h3>
        <div v-if="serverStore.performance">
          <div class="performance-value" :class="getMemoryClass(serverStore.memoryUsage.percentage)">
            {{ serverStore.memoryUsage.percentage }}%
          </div>
          <div class="performance-unit">
            {{ formatMemorySize(serverStore.memoryUsage.used) }} / {{ formatMemorySize(serverStore.memoryUsage.max) }}
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill"
              :class="getProgressClass(serverStore.memoryUsage.percentage)"
              :style="{ width: serverStore.memoryUsage.percentage + '%' }"
            ></div>
          </div>
        </div>
        <div v-else class="loading">
          <span class="loading-spinner"></span>
          加载中...
        </div>
      </div>

      <!-- CPU使用 -->
      <div class="performance-card">
        <h3 class="performance-title">CPU使用</h3>
        <div v-if="serverStore.performance">
          <div class="cpu-metrics">
            <div class="metric">
              <span class="metric-label">进程:</span>
              <span class="metric-value" :class="getCpuClass(serverStore.cpuUsage.process)">
                {{ serverStore.cpuUsage.process.toFixed(1) }}%
              </span>
            </div>
            <div class="metric">
              <span class="metric-label">系统:</span>
              <span class="metric-value" :class="getCpuClass(serverStore.cpuUsage.system)">
                {{ serverStore.cpuUsage.system.toFixed(1) }}%
              </span>
            </div>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill"
              :class="getProgressClass(serverStore.cpuUsage.process)"
              :style="{ width: serverStore.cpuUsage.process + '%' }"
            ></div>
          </div>
        </div>
        <div v-else class="loading">
          <span class="loading-spinner"></span>
          加载中...
        </div>
      </div>

      <!-- Spark 状态 -->
      <div class="performance-card">
        <h3 class="performance-title">监控插件</h3>
        <div class="plugin-status">
          <div class="status-item">
            <span class="status-label">Spark:</span>
            <span 
              class="status-badge" 
              :class="serverStore.sparkAvailable ? 'status-online' : 'status-offline'"
            >
              {{ serverStore.sparkAvailable ? '已安装' : '未安装' }}
            </span>
          </div>
          <div v-if="serverStore.status" class="status-item">
            <span class="status-label">插件版本:</span>
            <span class="status-value">{{ serverStore.status.plugin_version }}</span>
          </div>
          <div v-if="serverStore.healthInfo" class="status-item">
            <span class="status-label">运行时间:</span>
            <span class="status-value">{{ formatUptime(serverStore.healthInfo.uptime) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 玩家列表 -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">在线玩家列表</h3>
        <span class="badge">{{ serverStore.playersList.length }} 人在线</span>
      </div>
      <div class="card-body">
        <div v-if="serverStore.playersList.length === 0" class="empty-state">
          当前没有玩家在线
        </div>
        <div v-else class="players-list">
          <div 
            v-for="player in serverStore.playersList" 
            :key="player.uuid"
            class="player-item"
          >
            <div class="player-info">
              <div class="player-name">{{ player.name }}</div>
              <div class="player-uuid">{{ player.uuid }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 世界信息 -->
    <div v-if="serverStore.worldsList.length > 0" class="card">
      <div class="card-header">
        <h3 class="card-title">世界信息</h3>
      </div>
      <div class="card-body">
        <div class="worlds-list">
          <div 
            v-for="world in serverStore.worldsList" 
            :key="world.name"
            class="world-item"
          >
            <div class="world-name">{{ world.name }}</div>
            <div class="world-players">{{ world.players }} 人</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 系统资源 (如果可用) -->
    <div v-if="serverStore.systemResources" class="card">
      <div class="card-header">
        <h3 class="card-title">系统资源</h3>
      </div>
      <div class="card-body">
        <pre style="background: var(--vp-c-bg-soft); padding: 16px; border-radius: 6px; overflow-x: auto;">{{ JSON.stringify(serverStore.systemResources, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useServerStore } from '../stores/server'
import { formatMemorySize } from '../utils/helpers'

const serverStore = useServerStore()
const refreshInterval = ref(5000)

const tpsClass = computed(() => getTpsClass(serverStore.currentTPS))

const getTpsClass = (tps: number) => {
  if (tps >= 19) return 'tps-excellent'
  if (tps >= 15) return 'tps-good'
  return 'tps-poor'
}

const getMemoryClass = (percentage: number) => {
  if (percentage < 70) return 'tps-excellent'
  if (percentage < 85) return 'tps-good'
  return 'tps-poor'
}

const getCpuClass = (percentage: number) => {
  if (percentage < 50) return 'tps-excellent'
  if (percentage < 80) return 'tps-good'
  return 'tps-poor'
}

const getProgressClass = (percentage: number) => {
  if (percentage < 50) return 'progress-low'
  if (percentage < 80) return 'progress-medium'
  return 'progress-high'
}

const formatUptime = (uptime: number): string => {
  const seconds = Math.floor(uptime / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days}天 ${hours % 24}小时`
  if (hours > 0) return `${hours}小时 ${minutes % 60}分钟`
  if (minutes > 0) return `${minutes}分钟 ${seconds % 60}秒`
  return `${seconds}秒`
}

const toggleAutoRefresh = () => {
  if (serverStore.autoRefreshEnabled) {
    serverStore.stopAutoRefresh()
  } else {
    serverStore.startAutoRefresh()
  }
}

const updateRefreshInterval = () => {
  serverStore.setRefreshInterval(refreshInterval.value)
}

onMounted(async () => {
  await serverStore.loadAllData()
  serverStore.setRefreshInterval(refreshInterval.value)
  serverStore.startAutoRefresh()
})

onUnmounted(() => {
  serverStore.stopAutoRefresh()
})
</script>

<style scoped>
.performance-metrics {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-label {
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.metric-value {
  font-weight: 600;
  font-size: 16px;
}

.cpu-metrics {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.plugin-status {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-label {
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-online {
  background: var(--vp-c-tip-soft);
  color: var(--vp-c-tip-1);
}

.status-offline {
  background: var(--vp-c-danger-soft);
  color: var(--vp-c-danger-1);
}

.status-value {
  font-family: monospace;
  font-size: 12px;
  color: var(--vp-c-text-1);
}

.badge {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--vp-c-text-2);
}

.players-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}

.player-item {
  padding: 12px;
  background: var(--vp-c-bg-soft);
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
}

.player-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.player-uuid {
  font-family: monospace;
  font-size: 11px;
  color: var(--vp-c-text-2);
}

.worlds-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.world-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--vp-c-bg-soft);
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
}

.world-name {
  font-weight: 500;
}

.world-players {
  color: var(--vp-c-text-2);
  font-size: 14px;
}

@media (max-width: 768px) {
  .players-list {
    grid-template-columns: 1fr;
  }
  
  .worlds-list {
    grid-template-columns: 1fr;
  }
}
</style>