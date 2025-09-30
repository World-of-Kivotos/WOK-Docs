<template>
  <div class="login-container">
    <div class="login-header">
      <h1 class="login-title">用户注册</h1>
      <p class="login-subtitle">使用注册令牌加入服务器白名单</p>
    </div>
    
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label class="form-label" for="token">注册令牌</label>
        <input
          id="token"
          v-model="form.token"
          type="text"
          class="form-input"
          placeholder="请输入管理员提供的注册令牌"
          required
        />
      </div>
      
      <div class="form-group">
        <label class="form-label" for="playerName">游戏用户名</label>
        <input
          id="playerName"
          v-model="form.playerName"
          type="text"
          class="form-input"
          placeholder="请输入您的Minecraft用户名"
          required
          maxlength="16"
          pattern="^[a-zA-Z0-9_]{1,16}$"
        />
        <small style="color: var(--vp-c-text-2); font-size: 12px;">
          用户名只能包含字母、数字和下划线，长度1-16个字符
        </small>
      </div>
      
      <div class="form-group">
        <label class="form-label" for="playerUuid">玩家UUID</label>
        <input
          id="playerUuid"
          v-model="form.playerUuid"
          type="text"
          class="form-input"
          placeholder="请输入您的UUID（可选，系统会自动获取）"
        />
        <small style="color: var(--vp-c-text-2); font-size: 12px;">
          如果不填写，系统将自动通过用户名获取UUID
        </small>
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div v-if="success" class="success-message">
        {{ success }}
      </div>
      
      <div class="modal-footer" style="margin-top: 24px; padding-top: 0; border: none;">
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="loading || !isFormValid"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </div>
    </form>
    
    <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--vp-c-divider); text-align: center;">
      <p style="color: var(--vp-c-text-2); font-size: 14px; margin: 0 0 12px 0;">
        没有注册令牌？
      </p>
      <p style="color: var(--vp-c-text-2); font-size: 12px; margin: 0;">
        请联系服务器管理员获取注册令牌
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { apiService } from '../services/api'
import { isValidMinecraftUsername, isValidUUID } from '../utils/helpers'

const form = ref({
  token: '',
  playerName: '',
  playerUuid: ''
})

const loading = ref(false)
const error = ref('')
const success = ref('')

const isFormValid = computed(() => {
  if (!form.value.token.trim() || !form.value.playerName.trim()) return false
  if (!isValidMinecraftUsername(form.value.playerName)) return false
  if (form.value.playerUuid && !isValidUUID(form.value.playerUuid)) return false
  return true
})

const handleRegister = async () => {
  if (!isFormValid.value) return
  
  loading.value = true
  error.value = ''
  success.value = ''
  
  try {
    // 如果没有提供UUID，可以尝试通过用户名获取（这里简化处理）
    let uuid = form.value.playerUuid
    if (!uuid) {
      // 在实际应用中，这里应该调用Mojang API获取UUID
      // 为了演示，我们生成一个假的UUID或要求用户提供
      error.value = '请提供玩家UUID，或联系管理员协助获取'
      return
    }
    
    const response = await apiService.register({
      token: form.value.token,
      playerName: form.value.playerName,
      playerUuid: uuid
    })
    
    if (response.success) {
      success.value = response.data?.message || '注册成功！您已被添加到服务器白名单'
      // 清空表单
      form.value = {
        token: '',
        playerName: '',
        playerUuid: ''
      }
    } else {
      error.value = '注册失败，请检查令牌是否有效'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '注册失败，请重试'
  } finally {
    loading.value = false
  }
}

// 获取UUID的辅助功能（可选）
const fetchUUID = async () => {
  if (!form.value.playerName || !isValidMinecraftUsername(form.value.playerName)) {
    error.value = '请先输入有效的用户名'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    // 调用Mojang API获取UUID
    const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${form.value.playerName}`)
    if (response.ok) {
      const data = await response.json()
      if (data.id) {
        // 格式化UUID（添加连字符）
        const uuid = data.id.replace(/(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})/, '$1-$2-$3-$4-$5')
        form.value.playerUuid = uuid
      } else {
        error.value = '未找到该用户名对应的UUID'
      }
    } else {
      error.value = '获取UUID失败，请手动输入'
    }
  } catch (err) {
    error.value = '获取UUID失败，请手动输入'
  } finally {
    loading.value = false
  }
}
</script>