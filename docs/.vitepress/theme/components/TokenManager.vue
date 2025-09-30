<template>
  <div class="admin-container">
    <div class="admin-header">
      <h1 class="admin-title">令牌管理</h1>
      <button @click="showGenerateModal = true" class="btn btn-primary">
        生成新令牌
      </button>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">注册令牌</h3>
      </div>
      
      <div class="card-body">
        <p style="color: var(--vp-c-text-2); margin-bottom: 20px;">
          生成一次性注册令牌供玩家注册白名单使用。每个令牌只能使用一次，过期后自动失效。
        </p>
        
        <div v-if="generatedTokens.length === 0" style="text-align: center; padding: 40px; color: var(--vp-c-text-2);">
          暂无生成的令牌
        </div>
        
        <div v-else class="tokens-list">
          <div 
            v-for="token in generatedTokens" 
            :key="token.id"
            class="token-item"
            :class="{ expired: token.expired }"
          >
            <div class="token-info">
              <div class="token-value" @click="copyToken(token.token)">
                <code>{{ token.token }}</code>
                <button class="copy-btn" title="复制令牌">📋</button>
              </div>
              <div class="token-meta">
                <span>过期时间：{{ token.expiryTime }}</span>
                <span class="token-status" :class="token.expired ? 'expired' : 'active'">
                  {{ token.expired ? '已过期' : '有效' }}
                </span>
              </div>
            </div>
            <button 
              @click="revokeToken(token.id)" 
              class="btn btn-danger btn-sm"
              :disabled="token.expired"
            >
              撤销
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 生成令牌模态框 -->
    <div v-if="showGenerateModal" class="modal-overlay" @click="closeGenerateModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">生成注册令牌</h3>
          <button @click="closeGenerateModal" class="modal-close">&times;</button>
        </div>
        
        <form @submit.prevent="generateToken">
          <div class="form-group">
            <label class="form-label">管理员密码</label>
            <input
              v-model="adminPassword"
              type="password"
              class="form-input"
              placeholder="输入管理员密码"
              required
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">有效期（小时）</label>
            <select v-model="expiryHours" class="form-input">
              <option value="1">1小时</option>
              <option value="6">6小时</option>
              <option value="24">24小时</option>
              <option value="72">3天</option>
              <option value="168">7天</option>
            </select>
          </div>
          
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
          
          <div v-if="success" class="success-message">
            {{ success }}
          </div>
          
          <div class="modal-footer">
            <button type="button" @click="closeGenerateModal" class="btn btn-secondary">
              取消
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="loading-spinner"></span>
              生成令牌
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 令牌详情模态框 -->
    <div v-if="showTokenDetail && currentToken" class="modal-overlay" @click="closeTokenDetail">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">令牌详情</h3>
          <button @click="closeTokenDetail" class="modal-close">&times;</button>
        </div>
        
        <div class="token-detail">
          <div class="form-group">
            <label class="form-label">令牌值</label>
            <div class="token-display">
              <code>{{ currentToken.token }}</code>
              <button @click="copyToken(currentToken.token)" class="btn btn-secondary btn-sm">
                复制
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">二维码</label>
            <div class="qr-code">
              <!-- 这里可以集成二维码生成库 -->
              <div class="qr-placeholder">
                二维码占位符<br/>
                <small>可集成 qrcode.js 生成二维码</small>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">注册链接</label>
            <div class="token-display">
              <code>{{ getRegisterUrl(currentToken.token) }}</code>
              <button @click="copyToken(getRegisterUrl(currentToken.token))" class="btn btn-secondary btn-sm">
                复制
              </button>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeTokenDetail" class="btn btn-secondary">
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { apiService } from '../services/api'
import { formatDateTime, copyToClipboard } from '../utils/helpers'

interface GeneratedToken {
  id: string
  token: string
  expiryTime: string
  expired: boolean
  createdAt: string
}

let authStore: any = null

const showGenerateModal = ref(false)
const showTokenDetail = ref(false)
const currentToken = ref<GeneratedToken | null>(null)

const adminPassword = ref('')
const expiryHours = ref(24)
const loading = ref(false)
const error = ref('')
const success = ref('')

// 模拟存储的令牌列表（实际应用中应该从API获取）
const generatedTokens = ref<GeneratedToken[]>([])

const generateToken = async () => {
  if (!adminPassword.value) return
  
  loading.value = true
  error.value = ''
  success.value = ''
  
  try {
    const response = await apiService.generateToken(adminPassword.value, expiryHours.value)
    
    if (response.success && response.data) {
      const expiryTime = new Date(Date.now() + expiryHours.value * 60 * 60 * 1000)
      
      const newToken: GeneratedToken = {
        id: Date.now().toString(),
        token: response.data.token,
        expiryTime: formatDateTime(expiryTime.toISOString()),
        expired: false,
        createdAt: formatDateTime(new Date().toISOString())
      }
      
      generatedTokens.value.unshift(newToken)
      success.value = '令牌生成成功！'
      
      // 保存到本地存储
      saveTokensToStorage()
      
      // 3秒后关闭模态框
      setTimeout(() => {
        closeGenerateModal()
      }, 2000)
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '生成令牌失败'
  } finally {
    loading.value = false
  }
}

const copyToken = async (text: string) => {
  const success = await copyToClipboard(text)
  if (success) {
    // 可以添加一个临时提示
    console.log('已复制到剪贴板')
  }
}

const revokeToken = (tokenId: string) => {
  if (confirm('确定要撤销这个令牌吗？')) {
    const index = generatedTokens.value.findIndex(t => t.id === tokenId)
    if (index > -1) {
      generatedTokens.value[index].expired = true
      saveTokensToStorage()
    }
  }
}

const showTokenDetails = (token: GeneratedToken) => {
  currentToken.value = token
  showTokenDetail.value = true
}

const getRegisterUrl = (token: string): string => {
  const baseUrl = window.location.origin + window.location.pathname
  return `${baseUrl}#/register?token=${encodeURIComponent(token)}`
}

const closeGenerateModal = () => {
  showGenerateModal.value = false
  adminPassword.value = ''
  error.value = ''
  success.value = ''
}

const closeTokenDetail = () => {
  showTokenDetail.value = false
  currentToken.value = null
}

const saveTokensToStorage = () => {
  try {
    localStorage.setItem('admin_tokens', JSON.stringify(generatedTokens.value))
  } catch (err) {
    console.error('保存令牌到本地存储失败:', err)
  }
}

const loadTokensFromStorage = () => {
  try {
    const stored = localStorage.getItem('admin_tokens')
    if (stored) {
      const tokens = JSON.parse(stored)
      // 检查过期状态
      const now = Date.now()
      tokens.forEach((token: GeneratedToken) => {
        const expiryTime = new Date(token.expiryTime).getTime()
        if (expiryTime < now) {
          token.expired = true
        }
      })
      generatedTokens.value = tokens
    }
  } catch (err) {
    console.error('从本地存储加载令牌失败:', err)
  }
}

onMounted(async () => {
  loadTokensFromStorage()
  
  try {
    // 初始化 authStore
    const { useAuthStore } = await import('../stores/auth')
    authStore = useAuthStore()
    
    // 如果已登录，使用存储的密码
    if (authStore?.isAuthenticated) {
      adminPassword.value = authStore.adminPassword
    }
  } catch (error) {
    console.error('初始化 TokenManager 失败:', error)
  }
})
</script>

<style scoped>
.tokens-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.token-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  transition: opacity 0.2s;
}

.token-item.expired {
  opacity: 0.6;
}

.token-info {
  flex: 1;
}

.token-value {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  cursor: pointer;
}

.token-value code {
  background: var(--vp-c-bg);
  padding: 4px 8px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  border: 1px solid var(--vp-c-divider);
}

.copy-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.copy-btn:hover {
  opacity: 1;
  background: var(--vp-c-bg);
}

.token-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.token-status.active {
  color: var(--vp-c-tip-1);
  font-weight: 500;
}

.token-status.expired {
  color: var(--vp-c-danger-1);
  font-weight: 500;
}

.token-display {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: var(--vp-c-bg-soft);
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
}

.token-display code {
  flex: 1;
  background: none;
  border: none;
  padding: 0;
  font-family: monospace;
  word-break: break-all;
}

.qr-code {
  text-align: center;
}

.qr-placeholder {
  display: inline-block;
  width: 200px;
  height: 200px;
  background: var(--vp-c-bg-soft);
  border: 2px dashed var(--vp-c-divider);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: var(--vp-c-text-2);
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}
</style>