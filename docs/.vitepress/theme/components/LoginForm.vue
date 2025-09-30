<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
    <!-- 背景装饰元素 -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"></div>
      <div class="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-white/10 to-transparent rounded-full blur-3xl"></div>
    </div>
    
    <!-- 主登录卡片 -->
    <div class="card w-full max-w-md glass glass-shine relative z-10">
      <div class="card-body p-8">
        <!-- Logo 和标题区域 -->
        <div class="text-center mb-8">
          <div class="avatar mb-4">
            <div class="w-16 h-16 rounded-full glass-card p-3">
              <svg viewBox="0 0 24 24" fill="none" class="w-full h-full text-white">
                <path d="M12 2L2 7V10C2 16 6 20.9 12 22C18 20.9 22 16 22 10V7L12 2Z" 
                      stroke="currentColor" stroke-width="2" fill="currentColor" opacity="0.8"/>
              </svg>
            </div>
          </div>
          <h1 class="text-3xl font-bold text-white mb-2 fade-in-up">管理员登录</h1>
          <p class="text-white/80 fade-in-up">请输入管理员密码以访问白名单管理系统</p>
        </div>
        
        <!-- 登录表单 -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div class="form-control fade-in-up">
            <label class="label" for="password">
              <span class="label-text text-white/90 font-medium">管理员密码</span>
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                type="password"
                class="input input-bordered w-full glass-input text-white placeholder:text-white/60"
                placeholder="请输入管理员密码"
                required
                autocomplete="current-password"
              />
              <div class="absolute inset-y-0 right-3 flex items-center">
                <svg class="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          </div>
          
          <!-- 错误提示 -->
          <div v-if="error" class="alert alert-error glass fade-in-up">
            <svg class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-white">{{ error }}</span>
          </div>
          
          <!-- 登录按钮 -->
          <button
            type="submit"
            class="btn btn-primary w-full glass-button glass-shine relative overflow-hidden"
            :class="{ 'loading': loading }"
            :disabled="loading || !password.trim()"
          >
            <span v-if="!loading" class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              登录
            </span>
            <span v-else class="loading loading-spinner loading-sm"></span>
          </button>
        </form>
        
        <!-- 忘记密码提示 -->
        <div class="divider text-white/60">需要帮助？</div>
        <div class="text-center">
          <p class="text-white/70 text-sm">
            忘记密码？请联系
            <span class="text-primary font-medium cursor-pointer hover:underline">服务器管理员</span>
            重置
          </p>
        </div>
      </div>
      
      <!-- 卡片底部装饰 -->
      <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent opacity-60 rounded-b-2xl"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { apiService } from '../services/api'

let authStore: any = null

const password = ref('')
const loading = ref(false)
const error = ref('')

const emit = defineEmits<{
  loginSuccess: []
}>()

const handleLogin = async () => {
  if (!password.value.trim()) return
  
  loading.value = true
  error.value = ''
  
  try {
    // 初始化 authStore（如果还没有）
    if (!authStore) {
      const { useAuthStore } = await import('../stores/auth')
      authStore = useAuthStore()
    }
    
    // 通过尝试生成token来验证密码
    const response = await apiService.generateToken(password.value, 1)
    
    if (response.success) {
      // 登录成功
      authStore.login(password.value)
      emit('loginSuccess')
    } else {
      error.value = '密码错误，请重试'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '登录失败，请检查密码'
  } finally {
    loading.value = false
  }
}
</script>