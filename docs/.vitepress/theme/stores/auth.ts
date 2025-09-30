import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService, type WhitelistEntry, type ApiResponse } from '../services/api'
import { storage } from '../utils/helpers'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const adminPassword = ref('')
  const loginTime = ref<Date | null>(null)

  // 从本地存储恢复登录状态
  const storedAuth = storage.get<{loginTime: string, password: string}>('auth_session')
  if (storedAuth && storedAuth.loginTime) {
    const loginDate = new Date(storedAuth.loginTime)
    const now = new Date()
    // 检查登录是否在24小时内
    if (now.getTime() - loginDate.getTime() < 24 * 60 * 60 * 1000) {
      isAuthenticated.value = true
      adminPassword.value = storedAuth.password
      loginTime.value = loginDate
    }
  }

  const login = (password: string) => {
    adminPassword.value = password
    isAuthenticated.value = true
    loginTime.value = new Date()
    
    // 保存到本地存储
    storage.set('auth_session', {
      password,
      loginTime: loginTime.value.toISOString()
    })
  }

  const logout = () => {
    adminPassword.value = ''
    isAuthenticated.value = false
    loginTime.value = null
    storage.remove('auth_session')
  }

  const sessionDuration = computed(() => {
    if (!loginTime.value) return 0
    return Date.now() - loginTime.value.getTime()
  })

  const isSessionExpired = computed(() => {
    return sessionDuration.value > 24 * 60 * 60 * 1000 // 24小时
  })

  return {
    isAuthenticated,
    adminPassword,
    loginTime,
    sessionDuration,
    isSessionExpired,
    login,
    logout
  }
})