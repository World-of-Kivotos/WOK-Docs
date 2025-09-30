<template>
  <div class="whitelist-management min-h-screen bg-base-200">
    <!-- Login Section -->
    <div v-if="!isLoggedIn" class="hero min-h-screen">
      <div class="hero-content flex-col lg:flex-row-reverse">
        <div class="text-center lg:text-left lg:ml-8">
          <h1 class="text-5xl font-bold">白名单管理系统</h1>
          <p class="py-6">
            管理服务器白名单，添加或移除玩家访问权限。<br>
            请使用管理员账号登录以继续。
          </p>
        </div>
        <div class="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <form class="card-body" @submit.prevent="handleLogin">
            <div class="form-control">
              <label class="label">
                <span class="label-text">用户名</span>
              </label>
              <label class="input input-bordered flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 opacity-70">
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
                </svg>
                <input v-model="loginForm.username" type="text" class="grow" placeholder="输入用户名" required />
              </label>
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text">密码</span>
              </label>
              <label class="input input-bordered flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 opacity-70">
                  <path fill-rule="evenodd" d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z" clip-rule="evenodd" />
                </svg>
                <input v-model="loginForm.password" type="password" class="grow" placeholder="输入密码" required />
              </label>
              <label class="label">
                <a href="#" class="label-text-alt link link-hover">忘记密码？</a>
              </label>
            </div>
            <div v-if="loginError" class="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ loginError }}</span>
            </div>
            <div class="form-control mt-6">
              <button type="submit" class="btn btn-primary" :class="{ 'loading': isLoggingIn }">
                <span v-if="!isLoggingIn">登录</span>
                <span v-else class="loading loading-spinner"></span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Dashboard Section -->
    <div v-else class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-4xl font-bold mb-2">白名单管理</h1>
          <p class="text-base-content/70">管理服务器玩家白名单</p>
        </div>
        <button @click="handleLogout" class="btn btn-outline btn-error">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          退出登录
        </button>
      </div>

      <!-- Stats -->
      <div class="stats stats-vertical lg:stats-horizontal shadow w-full mb-8">
        <div class="stat">
          <div class="stat-figure text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <div class="stat-title">白名单玩家</div>
          <div class="stat-value text-primary">{{ whitelistPlayers.length }}</div>
          <div class="stat-desc">当前已添加的玩家数量</div>
        </div>

        <div class="stat">
          <div class="stat-figure text-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <div class="stat-title">在线玩家</div>
          <div class="stat-value text-secondary">{{ onlinePlayers }}</div>
          <div class="stat-desc">当前在线的白名单玩家</div>
        </div>

        <div class="stat">
          <div class="stat-figure text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="stat-title">最近操作</div>
          <div class="stat-value text-accent">{{ recentActions }}</div>
          <div class="stat-desc">过去24小时的操作次数</div>
        </div>
      </div>

      <!-- Add Player Form -->
      <div class="card bg-base-100 shadow-xl mb-8">
        <div class="card-body">
          <h2 class="card-title">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            添加玩家到白名单
          </h2>
          <form @submit.prevent="handleAddPlayer" class="form-control">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">玩家名称</span>
                </label>
                <input v-model="newPlayer.name" type="text" placeholder="输入玩家名称" class="input input-bordered" required />
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text">QQ号（可选）</span>
                </label>
                <input v-model="newPlayer.qq" type="text" placeholder="输入QQ号" class="input input-bordered" />
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text">备注（可选）</span>
                </label>
                <input v-model="newPlayer.note" type="text" placeholder="添加备注" class="input input-bordered" />
              </div>
            </div>
            <div class="card-actions justify-end mt-4">
              <button type="submit" class="btn btn-primary" :class="{ 'loading': isAddingPlayer }">
                <svg v-if="!isAddingPlayer" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span v-if="!isAddingPlayer">添加玩家</span>
                <span v-else class="loading loading-spinner"></span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Players List -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="flex justify-between items-center mb-4">
            <h2 class="card-title">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              白名单列表
            </h2>
            <div class="form-control">
              <input v-model="searchQuery" type="text" placeholder="搜索玩家..." class="input input-bordered input-sm" />
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="table table-zebra">
              <thead>
                <tr>
                  <th>玩家名称</th>
                  <th>QQ号</th>
                  <th>添加时间</th>
                  <th>状态</th>
                  <th>备注</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="player in filteredPlayers" :key="player.id">
                  <td>
                    <div class="flex items-center gap-3">
                      <div class="avatar placeholder">
                        <div class="bg-neutral text-neutral-content rounded-full w-12">
                          <span class="text-xl">{{ player.name.charAt(0).toUpperCase() }}</span>
                        </div>
                      </div>
                      <div>
                        <div class="font-bold">{{ player.name }}</div>
                        <div class="text-sm opacity-50">UUID: {{ player.uuid }}</div>
                      </div>
                    </div>
                  </td>
                  <td>{{ player.qq || 'N/A' }}</td>
                  <td>{{ formatDate(player.addedAt) }}</td>
                  <td>
                    <span v-if="player.online" class="badge badge-success gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-4 h-4 stroke-current">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      在线
                    </span>
                    <span v-else class="badge badge-ghost gap-2">离线</span>
                  </td>
                  <td>{{ player.note || 'N/A' }}</td>
                  <td>
                    <div class="flex gap-2">
                      <button @click="handleEditPlayer(player)" class="btn btn-ghost btn-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button @click="handleRemovePlayer(player)" class="btn btn-ghost btn-xs text-error">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="filteredPlayers.length === 0" class="text-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-base-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p class="text-base-content/50">暂无白名单玩家</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Login state
const isLoggedIn = ref(false)
const isLoggingIn = ref(false)
const loginError = ref('')
const loginForm = ref({
  username: '',
  password: ''
})

// Dashboard state
const whitelistPlayers = ref([
  {
    id: 1,
    name: 'Steve',
    uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    qq: '123456789',
    addedAt: new Date(Date.now() - 86400000 * 5),
    online: true,
    note: '服主'
  },
  {
    id: 2,
    name: 'Alex',
    uuid: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    qq: '987654321',
    addedAt: new Date(Date.now() - 86400000 * 3),
    online: false,
    note: '管理员'
  },
  {
    id: 3,
    name: 'Herobrine',
    uuid: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    qq: '',
    addedAt: new Date(Date.now() - 86400000 * 1),
    online: true,
    note: ''
  }
])

const newPlayer = ref({
  name: '',
  qq: '',
  note: ''
})

const searchQuery = ref('')
const isAddingPlayer = ref(false)

// Computed
const onlinePlayers = computed(() => {
  return whitelistPlayers.value.filter(p => p.online).length
})

const recentActions = computed(() => {
  return Math.floor(Math.random() * 20) + 5
})

const filteredPlayers = computed(() => {
  if (!searchQuery.value) return whitelistPlayers.value
  
  const query = searchQuery.value.toLowerCase()
  return whitelistPlayers.value.filter(player => 
    player.name.toLowerCase().includes(query) ||
    player.qq?.includes(query) ||
    player.note?.toLowerCase().includes(query)
  )
})

// Methods
const handleLogin = async () => {
  isLoggingIn.value = true
  loginError.value = ''
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // For demo purposes, accept any credentials
  if (loginForm.value.username && loginForm.value.password) {
    isLoggedIn.value = true
  } else {
    loginError.value = '用户名或密码不能为空'
  }
  
  isLoggingIn.value = false
}

const handleLogout = () => {
  isLoggedIn.value = false
  loginForm.value = { username: '', password: '' }
}

const handleAddPlayer = async () => {
  if (!newPlayer.value.name) return
  
  isAddingPlayer.value = true
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const player = {
    id: whitelistPlayers.value.length + 1,
    name: newPlayer.value.name,
    uuid: generateUUID(),
    qq: newPlayer.value.qq,
    addedAt: new Date(),
    online: false,
    note: newPlayer.value.note
  }
  
  whitelistPlayers.value.unshift(player)
  
  // Reset form
  newPlayer.value = { name: '', qq: '', note: '' }
  
  isAddingPlayer.value = false
}

const handleEditPlayer = (player) => {
  // In a real app, this would open a modal or navigate to edit page
  alert(`编辑玩家: ${player.name}`)
}

const handleRemovePlayer = (player) => {
  if (confirm(`确定要从白名单中移除 ${player.name} 吗？`)) {
    const index = whitelistPlayers.value.findIndex(p => p.id === player.id)
    if (index > -1) {
      whitelistPlayers.value.splice(index, 1)
    }
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Check if user is already logged in (from localStorage)
onMounted(() => {
  // In a real app, check for auth token
  // isLoggedIn.value = !!localStorage.getItem('authToken')
})
</script>

<style scoped>
.whitelist-management {
  font-family: inherit;
}
</style>
