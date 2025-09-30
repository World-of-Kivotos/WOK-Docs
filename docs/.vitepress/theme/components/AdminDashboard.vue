<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
    <div v-if="!isAuthenticated">
      <LoginForm @loginSuccess="handleLoginSuccess" />
    </div>
    
    <div v-else class="dashboard p-6 max-w-7xl mx-auto">
      <!-- 顶部导航栏 -->
      <div class="navbar glass-nav rounded-2xl mb-8 p-4">
        <div class="navbar-start">
          <div class="flex items-center space-x-4">
            <div class="avatar">
              <div class="w-10 h-10 rounded-full glass-card p-2">
                <svg viewBox="0 0 24 24" fill="none" class="w-full h-full text-primary">
                  <path d="M12 2L2 7V10C2 16 6 20.9 12 22C18 20.9 22 16 22 10V7L12 2Z" 
                        stroke="currentColor" stroke-width="2" fill="currentColor" opacity="0.8"/>
                </svg>
              </div>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-white">管理面板</h1>
              <p class="text-white/70 text-sm">欢迎回来，管理员</p>
            </div>
          </div>
        </div>
        
        <div class="navbar-end">
          <button @click="logout" class="btn btn-ghost glass-button text-white">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            退出登录
          </button>
        </div>
      </div>

      <!-- 快速统计卡片 -->
      <div class="stats-container mb-8">
        <div class="stats stats-vertical lg:stats-horizontal glass rounded-3xl shadow-xl p-6">
          <div class="stat glass-card rounded-2xl">
            <div class="stat-figure text-primary">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div class="stat-title text-white/80">白名单总数</div>
            <div class="stat-value text-primary">{{ whitelistStats.total_entries }}</div>
            <div class="stat-desc text-white/60">已注册用户</div>
          </div>
          
          <div class="stat glass-card rounded-2xl">
            <div class="stat-figure" :class="serverOnlineClass">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </div>
            <div class="stat-title text-white/80">服务器状态</div>
            <div class="stat-value" :class="serverOnlineClass">
              {{ serverStats.isOnline ? '在线' : '离线' }}
            </div>
            <div class="stat-desc text-white/60">运行状态</div>
          </div>
          
          <div class="stat glass-card rounded-2xl">
            <div class="stat-figure text-secondary">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div class="stat-title text-white/80">在线玩家</div>
            <div class="stat-value text-secondary">{{ serverStats.onlinePlayersCount }}</div>
            <div class="stat-desc text-white/60">当前在线</div>
          </div>
          
          <div class="stat glass-card rounded-2xl">
            <div class="stat-figure" :class="tpsClass">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div class="stat-title text-white/80">服务器TPS</div>
            <div class="stat-value" :class="tpsClass">
              {{ serverStats.currentTPS.toFixed(1) }}
            </div>
            <div class="stat-desc text-white/60">每秒刷新</div>
          </div>
        </div>
      </div>

      <!-- 管理功能区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- 左侧管理功能 -->
        <div class="space-y-6">
          <div class="card glass-card glass-shine">
            <div class="card-body">
              <WhitelistManager />
            </div>
          </div>
          
          <div class="card glass-card glass-shine">
            <div class="card-body">
              <TokenManager />
            </div>
          </div>
        </div>
        
        <!-- 右侧监控信息 -->
        <div class="space-y-6">
          <div class="card glass-card glass-shine">
            <div class="card-body">
              <ServerMonitor />
            </div>
          </div>
        </div>
      </div>

      <!-- 底部信息区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 最近活动 -->
        <div class="card glass-card glass-shine">
          <div class="card-body">
            <h2 class="card-title text-white mb-4 flex items-center">
              <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              最近活动
            </h2>
            
            <div v-if="recentActivities.length === 0" class="flex flex-col items-center py-8">
              <svg class="w-16 h-16 text-white/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p class="text-white/60">暂无最近活动</p>
            </div>
            
            <div v-else class="space-y-3">
              <div 
                v-for="activity in recentActivities" 
                :key="activity.id"
                class="flex items-center space-x-3 p-3 glass rounded-xl hover:bg-white/10 transition-all"
              >
                <div class="avatar placeholder">
                  <div class="bg-primary text-primary-content rounded-full w-10 h-10">
                    <span class="text-sm">{{ getActivityIcon(activity.type) }}</span>
                  </div>
                </div>
                <div class="flex-1">
                  <p class="text-white font-medium text-sm">{{ activity.message }}</p>
                  <p class="text-white/60 text-xs">{{ formatRelativeTime(activity.timestamp) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 系统信息 -->
        <div class="card glass-card glass-shine">
          <div class="card-body">
            <h2 class="card-title text-white mb-4 flex items-center">
              <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              系统信息
            </h2>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="glass rounded-xl p-4">
                <div class="text-white/60 text-xs mb-1">系统版本</div>
                <div class="text-white font-bold">{{ systemInfo.version }}</div>
              </div>
              
              <div class="glass rounded-xl p-4">
                <div class="text-white/60 text-xs mb-1">运行时间</div>
                <div class="text-white font-bold">{{ formatUptime(systemInfo.uptime) }}</div>
              </div>
              
              <div class="glass rounded-xl p-4">
                <div class="text-white/60 text-xs mb-1">最后同步</div>
                <div class="text-white font-bold">{{ formatRelativeTime(whitelistStats.last_sync) }}</div>
              </div>
              
              <div class="glass rounded-xl p-4">
                <div class="text-white/60 text-xs mb-1">健康状态</div>
                <div class="font-bold" :class="systemInfo.status === 'healthy' ? 'text-success' : 'text-error'">
                  {{ systemInfo.status === 'healthy' ? '正常' : '异常' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { formatRelativeTime } from '../utils/helpers'
import LoginForm from './LoginForm.vue'
import RegisterForm from './RegisterForm.vue'
import WhitelistManager from './WhitelistManager.vue'
import TokenManager from './TokenManager.vue'
import ServerMonitor from './ServerMonitor.vue'

interface Activity {
  id: string
  type: 'whitelist_add' | 'whitelist_remove' | 'token_generate' | 'server_start' | 'server_stop'
  message: string
  timestamp: string
}

// 延迟初始化 stores 避免 SSR 问题
let authStore: any = null
let whitelistStore: any = null
let serverStore: any = null

// 响应式认证状态
const isAuthenticated = computed(() => {
  return authStore?.isAuthenticated || false
})

// 在客户端初始化 stores
const initStores = async () => {
  if (typeof window !== 'undefined') {
    const { useAuthStore } = await import('../stores/auth')
    const { useWhitelistStore } = await import('../stores/whitelist')
    const { useServerStore } = await import('../stores/server')
    
    authStore = useAuthStore()
    whitelistStore = useWhitelistStore()
    serverStore = useServerStore()
  }
}



// 模拟最近活动数据
const recentActivities = ref<Activity[]>([
  {
    id: '1',
    type: 'whitelist_add',
    message: '玩家 TestPlayer 已添加到白名单',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    type: 'token_generate',
    message: '生成了新的注册令牌',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    type: 'server_start',
    message: '服务器已启动',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  }
])

// 系统信息
const systemInfo = ref({
  version: '0.1.0',
  status: 'healthy',
  uptime: Date.now() - 24 * 60 * 60 * 1000 // 假设运行了24小时
})

const whitelistStats = computed(() => whitelistStore?.stats || {
  total_entries: 0,
  recent_additions: 0,
  recent_deletions: 0,
  sync_status: 'inactive',
  last_sync: ''
})

const serverStats = computed(() => ({
  isOnline: serverStore?.isOnline || false,
  onlinePlayersCount: serverStore?.onlinePlayersCount || 0,
  currentTPS: serverStore?.currentTPS || 0
}))

const serverOnlineClass = computed(() => {
  return serverStats.value.isOnline ? 'tps-excellent' : 'tps-poor'
})

const tpsClass = computed(() => {
  const tps = serverStats.value.currentTPS
  if (tps >= 19) return 'tps-excellent'
  if (tps >= 15) return 'tps-good'
  return 'tps-poor'
})

const getActivityIcon = (type: string): string => {
  const icons = {
    whitelist_add: '➕',
    whitelist_remove: '➖',
    token_generate: '🎫',
    server_start: '🟢',
    server_stop: '🔴'
  }
  return icons[type as keyof typeof icons] || '📝'
}

const formatUptime = (uptime: number): string => {
  const seconds = Math.floor(uptime / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days}天`
  if (hours > 0) return `${hours}小时`
  if (minutes > 0) return `${minutes}分钟`
  return `${seconds}秒`
}

const handleLoginSuccess = () => {
  // 登录成功后加载数据
  loadDashboardData()
}

const logout = () => {
  if (confirm('确定要退出登录吗？') && authStore) {
    authStore.logout()
  }
}



const loadDashboardData = async () => {
  // 加载白名单统计
  await whitelistStore.loadStats()
  
  // 加载服务器状态
  await serverStore.loadServerStatus()
  await serverStore.loadServerPerformance()
  await serverStore.loadOnlinePlayersCount()
  
  // 加载系统健康信息
  try {
    await serverStore.loadHealthInfo()
    if (serverStore.healthInfo) {
      systemInfo.value = {
        version: serverStore.healthInfo.version || '0.1.0',
        status: serverStore.healthInfo.status || 'healthy',
        uptime: serverStore.healthInfo.uptime || systemInfo.value.uptime
      }
    }
  } catch (err) {
    console.error('加载系统信息失败:', err)
  }
}

onMounted(async () => {
  // 等待客户端渲染完成后再初始化 stores
  await nextTick()
  
  try {
    // 重新获取 stores 确保它们已正确初始化
    const { useAuthStore } = await import('../stores/auth')
    const { useWhitelistStore } = await import('../stores/whitelist')  
    const { useServerStore } = await import('../stores/server')
    
    authStore = useAuthStore()
    whitelistStore = useWhitelistStore()
    serverStore = useServerStore()
    
    if (authStore.isAuthenticated) {
      loadDashboardData()
    }
  } catch (error) {
    console.error('初始化 stores 失败:', error)
  }
})
</script>

<style scoped>
/* 入场动画 */
.dashboard {
  animation: fadeInUp 0.6s ease-out;
}

/* 悬停效果 */
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

/* 状态颜色 */
.tps-excellent {
  @apply text-success;
}

.tps-good {
  @apply text-warning;
}

.tps-poor {
  @apply text-error;
}

/* 统计卡片动画 */
.stats .stat {
  transform: translateY(0);
  transition: all 0.3s ease;
}

.stats .stat:hover {
  transform: translateY(-4px);
}

/* 响应式设计优化 */
@media (max-width: 1024px) {
  .dashboard {
    @apply p-4;
  }
  
  .stats {
    @apply stats-vertical;
  }
  
  .grid {
    @apply grid-cols-1;
  }
}

@media (max-width: 768px) {
  .navbar {
    @apply flex-col space-y-4;
  }
  
  .navbar-start,
  .navbar-end {
    @apply w-full justify-center;
  }
  
  .stats .stat {
    @apply text-center;
  }
}

/* 自定义动画 */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(59, 130, 246, 0.6);
  }
}

.stat-figure.text-success svg {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* 加载状态 */
.loading-shimmer {
  background: linear-gradient(90deg, 
    rgba(255,255,255,0.1) 0%, 
    rgba(255,255,255,0.3) 50%, 
    rgba(255,255,255,0.1) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .glass-nav {
    @apply bg-slate-900/20 border-slate-700/30;
  }
  
  .glass-card {
    @apply bg-slate-800/20 border-slate-600/30;
  }
}

/* 交互反馈 */
.btn:active {
  transform: scale(0.95);
}

.card:active {
  transform: translateY(0) scale(0.98);
}

/* 图标动画 */
.stat-figure svg {
  transition: all 0.3s ease;
}

.stat:hover .stat-figure svg {
  transform: scale(1.1) rotate(5deg);
}
</style>