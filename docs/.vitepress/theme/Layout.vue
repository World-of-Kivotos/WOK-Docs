<template>
  <Layout>
    <!-- 自定义侧边栏底部 -->
    <template #sidebar-nav-after>
      <div class="custom-sidebar-footer">
        <div class="server-status">
          <h4>
            <span :class="statusIcon">{{ statusText }}</span>
            服务器状态
          </h4>
          <p v-if="loading" class="loading">正在获取数据...</p>
          <template v-else-if="!error">
            <p>在线玩家: <span class="player-count">{{ onlineCount }}/{{ maxPlayers }}</span></p>
            <p>服务器版本: {{ serverVersion }}</p>
            <p class="last-update">最后更新: {{ lastUpdateTime }}</p>
          </template>
          <p v-else class="error">{{ error }}</p>
        </div>
      </div>
    </template>
  </Layout>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import DefaultTheme from 'vitepress/theme'

const { Layout } = DefaultTheme

// 响应式数据
const loading = ref(true)
const error = ref('')
const onlineCount = ref(0)
const maxPlayers = ref(100)
const serverVersion = ref('1.20.1')
const isOnline = ref(false)
const lastUpdateTime = ref('')

// 计算属性
const statusIcon = computed(() => ({
  'status-online': isOnline.value,
  'status-offline': !isOnline.value && !loading.value
}))

const statusText = computed(() => {
  if (loading.value) return '⏳'
  return isOnline.value ? '🟢' : '🔴'
})

// API 基础URL - 使用正确的域名
const API_BASE_URL = 'https://wok.xiaoxiao.uno/api/v1'

// 获取服务器状态
async function fetchServerStatus() {
  try {
    loading.value = true
    error.value = ''
    
    // 并行获取服务器状态和玩家信息
    const [statusResponse, playersResponse, infoResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/server/status`).catch(() => null),
      fetch(`${API_BASE_URL}/players/online`).catch(() => null),
      fetch(`${API_BASE_URL}/server/info`).catch(() => null)
    ])

    // 处理服务器状态
    if (statusResponse && statusResponse.ok) {
      const statusData = await statusResponse.json()
      isOnline.value = statusData.success && statusData.data.online
    } else {
      isOnline.value = false
    }

    // 处理玩家信息
    if (playersResponse && playersResponse.ok) {
      const playersData = await playersResponse.json()
      if (playersData.success) {
        onlineCount.value = playersData.data.online_count || 0
        maxPlayers.value = playersData.data.max_players || 100
      }
    }

    // 处理服务器信息
    if (infoResponse && infoResponse.ok) {
      const infoData = await infoResponse.json()
      if (infoData.success && infoData.data.version) {
        serverVersion.value = infoData.data.version
      }
    }

    // 更新最后更新时间
    lastUpdateTime.value = new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })

  } catch (err) {
    console.error('获取服务器状态失败:', err)
    error.value = '无法连接到服务器'
    isOnline.value = false
  } finally {
    loading.value = false
  }
}

// 定时器
let intervalId = null

onMounted(() => {
  // 立即获取一次数据
  fetchServerStatus()
  
  // 每30秒更新一次
  intervalId = setInterval(fetchServerStatus, 30000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<style scoped>
.custom-sidebar-footer {
  padding: 1rem;
  border-top: 1px solid var(--vp-c-divider);
  margin-top: 1rem;
}

.server-status h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: var(--vp-c-text-1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.server-status p {
  margin: 0.25rem 0;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

.player-count {
  color: var(--vp-c-brand-1);
  font-weight: bold;
}

.loading {
  color: var(--vp-c-text-3);
  font-style: italic;
  animation: pulse 1.5s ease-in-out infinite;
}

.error {
  color: var(--vp-c-danger-1);
  font-size: 0.75rem;
}

.last-update {
  color: var(--vp-c-text-3);
  font-size: 0.7rem;
  margin-top: 0.5rem;
}

.status-online {
  color: #10b981;
}

.status-offline {
  color: #ef4444;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .custom-sidebar-footer {
    padding: 0.75rem;
  }
  
  .server-status h4 {
    font-size: 0.85rem;
  }
  
  .server-status p {
    font-size: 0.75rem;
  }
}
</style>