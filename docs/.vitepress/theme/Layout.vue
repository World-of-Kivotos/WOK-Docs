<template>
  <Layout>
    <!-- 自定义侧边栏底部 -->
    <template #sidebar-nav-after>
      <div class="custom-sidebar-footer">
        <div class="server-status">
          <h4>{{ serverStatus.online ? '🟢' : '🔴' }} 服务器状态</h4>
          <template v-if="loading">
            <p>加载中...</p>
          </template>
          <template v-else-if="serverStatus.online">
            <p>在线玩家: <span class="player-count">{{ serverStatus.players.online }}/{{ serverStatus.players.max }}</span></p>
            <p>服务器插件版本: {{ serverStatus.version }}</p>
          </template>
          <template v-else>
            <p>服务器离线</p>
          </template>
        </div>
      </div>
    </template>
  </Layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DefaultTheme from 'vitepress/theme'

const { Layout } = DefaultTheme

const serverStatus = ref({
  online: false,
  players: {
    online: 0,
    max: 0
  },
  version: ''
})
const loading = ref(true)

const fetchServerStatus = async () => {
  try {
    // 获取服务器状态
    const statusResponse = await fetch('https://api.mcwok.cn/api/v1/server/status')
    const statusResult = await statusResponse.json()
    
    // 获取玩家数据
    const playersResponse = await fetch('https://api.mcwok.cn/api/v1/players/online')
    const playersResult = await playersResponse.json()
    
    if (statusResult.success && statusResult.data) {
      serverStatus.value = {
        online: statusResult.data.online || false,
        players: {
          online: playersResult.success && playersResult.data ? (playersResult.data.online_count || 0) : 0,
          max: playersResult.success && playersResult.data ? (playersResult.data.max_players || 0) : 0
        },
        version: statusResult.data.plugin_version || '未知'
      }
    } else {
      serverStatus.value.online = false
    }
  } catch (error) {
    console.error('获取服务器状态失败:', error)
    serverStatus.value.online = false
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchServerStatus()
  // 每30秒更新一次
  setInterval(fetchServerStatus, 30000)
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
</style>