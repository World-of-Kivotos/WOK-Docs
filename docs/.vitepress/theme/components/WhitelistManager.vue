<template>
  <div class="admin-container">
    <div class="admin-header">
      <h1 class="admin-title">白名单管理</h1>
      <div style="display: flex; gap: 12px; align-items: center;">
        <button @click="handleSync" class="btn btn-secondary" :disabled="loading">
          <span v-if="loading" class="loading-spinner"></span>
          同步白名单
        </button>
        <button @click="logout" class="btn btn-secondary">
          退出登录
        </button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">{{ stats.total_entries }}</div>
        <div class="stat-label">总白名单数量</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ stats.recent_additions }}</div>
        <div class="stat-label">最近添加</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ stats.recent_deletions }}</div>
        <div class="stat-label">最近删除</div>
      </div>
      <div class="stat-card">
        <div class="stat-number" :class="syncStatusClass">
          {{ stats.sync_status }}
        </div>
        <div class="stat-label">同步状态</div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="搜索玩家名称或UUID..."
        @input="handleSearch"
      />
      <button @click="showAddModal = true" class="btn btn-primary">
        添加玩家
      </button>
      <button 
        @click="showBatchModal = true" 
        class="btn btn-secondary"
      >
        批量操作
      </button>
      <button 
        @click="handleBatchDelete" 
        class="btn btn-danger"
        :disabled="selectedCount === 0"
      >
        删除选中 ({{ selectedCount }})
      </button>
      <button @click="clearSelection" class="btn btn-secondary">
        清空选择
      </button>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- AG Grid 表格 -->
    <div class="whitelist-grid ag-theme-alpine">
      <AgGridVue
        :columnDefs="columnDefs"
        :rowData="filteredEntries"
        :defaultColDef="defaultColDef"
        :rowSelection="'multiple'"
        :suppressRowClickSelection="true"
        @grid-ready="onGridReady"
        @selection-changed="onSelectionChanged"
      />
    </div>

    <!-- 添加玩家模态框 -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">添加白名单玩家</h3>
          <button @click="closeModal" class="modal-close">&times;</button>
        </div>
        
        <form @submit.prevent="handleAdd">
          <div class="form-group">
            <label class="form-label">玩家名称</label>
            <input
              v-model="addForm.name"
              type="text"
              class="form-input"
              placeholder="输入玩家名称"
              required
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">玩家UUID</label>
            <input
              v-model="addForm.uuid"
              type="text"
              class="form-input"
              placeholder="输入玩家UUID"
              required
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">备注 (可选)</label>
            <textarea
              v-model="addForm.notes"
              class="form-input form-textarea"
              placeholder="输入备注信息"
            ></textarea>
          </div>
          
          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn btn-secondary">
              取消
            </button>
            <button type="submit" class="btn btn-primary" :disabled="addLoading">
              <span v-if="addLoading" class="loading-spinner"></span>
              添加
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 批量操作模态框 -->
    <div v-if="showBatchModal" class="modal-overlay" @click="closeBatchModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">批量添加白名单</h3>
          <button @click="closeBatchModal" class="modal-close">&times;</button>
        </div>
        
        <form @submit.prevent="handleBatchAdd">
          <div class="form-group">
            <label class="form-label">批量数据</label>
            <textarea
              v-model="batchData"
              class="form-input form-textarea"
              placeholder="每行一个玩家，格式：用户名,UUID,备注&#10;例如：&#10;Player1,550e8400-e29b-41d4-a716-446655440000,VIP玩家&#10;Player2,550e8400-e29b-41d4-a716-446655440001,普通玩家"
              rows="8"
              required
            ></textarea>
            <small style="color: var(--vp-c-text-2); font-size: 12px;">
              支持CSV格式：用户名,UUID,备注（备注可选）
            </small>
          </div>
          
          <div class="modal-footer">
            <button type="button" @click="closeBatchModal" class="btn btn-secondary">
              取消
            </button>
            <button type="submit" class="btn btn-primary" :disabled="batchLoading">
              <span v-if="batchLoading" class="loading-spinner"></span>
              批量添加
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import type { ColDef, GridReadyEvent, SelectionChangedEvent } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

import { formatDateTime, formatRelativeTime, isValidUUID, isValidMinecraftUsername, debounce } from '../utils/helpers'

let whitelistStore: any = null
let authStore: any = null

// 安全访问 store 数据的 computed 属性
const stats = computed(() => ({
  total_entries: whitelistStore?.stats?.total_entries || 0,
  recent_additions: whitelistStore?.stats?.recent_additions || 0,
  recent_deletions: whitelistStore?.stats?.recent_deletions || 0,
  sync_status: whitelistStore?.stats?.sync_status || 'inactive'
}))

const selectedCount = computed(() => whitelistStore?.selectedCount || 0)
const filteredEntries = computed(() => whitelistStore?.filteredEntries || [])

const showAddModal = ref(false)
const showBatchModal = ref(false)
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')

// 添加表单
const addForm = ref({
  name: '',
  uuid: '',
  notes: ''
})
const addLoading = ref(false)

// 批量操作
const batchData = ref('')
const batchLoading = ref(false)

// AG Grid 配置
const columnDefs: ColDef[] = [
  {
    headerName: '',
    checkboxSelection: true,
    headerCheckboxSelection: true,
    width: 50,
    pinned: 'left'
  },
  {
    headerName: '玩家名称',
    field: 'name',
    sortable: true,
    filter: true,
    width: 150
  },
  {
    headerName: 'UUID',
    field: 'uuid',
    sortable: true,
    filter: true,
    width: 280,
    cellStyle: { 'font-family': 'monospace', 'font-size': '12px' }
  },
  {
    headerName: '添加时间',
    field: 'created_at',
    sortable: true,
    width: 160,
    valueFormatter: (params) => formatDateTime(params.value)
  },
  {
    headerName: '来源',
    field: 'source',
    sortable: true,
    filter: true,
    width: 100
  },
  {
    headerName: '备注',
    field: 'notes',
    sortable: false,
    filter: true,
    flex: 1,
    minWidth: 200
  },
  {
    headerName: '操作',
    width: 100,
    cellRenderer: (params: any) => {
      return `
        <button 
          class="btn btn-danger" 
          style="padding: 4px 8px; font-size: 12px;"
          onclick="window.deleteEntry('${params.data.uuid}')"
        >
          删除
        </button>
      `
    }
  }
]

const defaultColDef: ColDef = {
  resizable: true,
  sortable: true,
  filter: false
}

let gridApi: any = null

const syncStatusClass = computed(() => {
  const status = stats.value.sync_status
  return {
    'tps-excellent': status === 'active',
    'tps-poor': status === 'error',
    'tps-good': status === 'pending'
  }
})

// 挂载到全局以供cell renderer使用
if (typeof window !== 'undefined') {
  (window as any).deleteEntry = async (uuid: string) => {
    if (whitelistStore && confirm('确定要删除这个白名单条目吗？')) {
      const success = await whitelistStore.deleteEntry(uuid)
      if (success) {
        await whitelistStore.loadStats()
      }
    }
  }
}

const onGridReady = (params: GridReadyEvent) => {
  gridApi = params.api
}

const onSelectionChanged = (event: SelectionChangedEvent) => {
  const selectedRows = event.api.getSelectedRows()
  whitelistStore?.clearSelection()
  selectedRows.forEach(row => {
    whitelistStore?.toggleSelection(row.uuid)
  })
}

const clearSelection = () => {
  whitelistStore?.clearSelection()
}

const handleSearch = debounce(() => {
  whitelistStore?.updateSearch(searchQuery.value)
}, 300)

const handleAdd = async () => {
  if (!addForm.value.name || !addForm.value.uuid) return
  
  if (!isValidMinecraftUsername(addForm.value.name)) {
    error.value = '玩家名称格式不正确'
    return
  }
  
  if (!isValidUUID(addForm.value.uuid)) {
    error.value = 'UUID格式不正确'
    return
  }
  
  addLoading.value = true
  
  if (whitelistStore) {
    const success = await whitelistStore.addEntry({
      name: addForm.value.name,
      uuid: addForm.value.uuid,
      notes: addForm.value.notes || undefined
    })
    
    if (success) {
      closeModal()
      await whitelistStore.loadStats()
    }
  }
  
  addLoading.value = false
}

const handleBatchAdd = async () => {
  if (!batchData.value.trim()) return
  
  const lines = batchData.value.trim().split('\n')
  const entries = []
  
  for (const line of lines) {
    const parts = line.split(',').map(p => p.trim())
    if (parts.length < 2) continue
    
    const [name, uuid, notes] = parts
    if (!isValidMinecraftUsername(name) || !isValidUUID(uuid)) {
      error.value = `格式错误：${line}`
      return
    }
    
    entries.push({ name, uuid, notes: notes || undefined })
  }
  
  if (entries.length === 0) {
    error.value = '没有有效的数据'
    return
  }
  
  batchLoading.value = true
  
  if (whitelistStore) {
    const success = await whitelistStore.batchAdd(entries)
    if (success) {
      closeBatchModal()
      await whitelistStore.loadStats()
    }
  }
  
  batchLoading.value = false
}

const handleBatchDelete = async () => {
  if (!whitelistStore) return
  
  const selected = Array.from(whitelistStore.selectedEntries)
  if (selected.length === 0) return
  
  if (confirm(`确定要删除选中的 ${selected.length} 个白名单条目吗？`)) {
    const success = await whitelistStore.batchDelete(selected)
    if (success) {
      await whitelistStore.loadStats()
    }
  }
}

const handleSync = async () => {
  loading.value = true
  const success = await whitelistStore.sync()
  if (success) {
    await whitelistStore.loadStats()
  }
  loading.value = false
}

const closeModal = () => {
  showAddModal.value = false
  addForm.value = { name: '', uuid: '', notes: '' }
  error.value = ''
}

const closeBatchModal = () => {
  showBatchModal.value = false
  batchData.value = ''
  error.value = ''
}

const logout = () => {
  if (confirm('确定要退出登录吗？')) {
    authStore.logout()
    window.location.reload()
  }
}

onMounted(async () => {
  try {
    // 初始化 stores
    const { useWhitelistStore } = await import('../stores/whitelist')
    const { useAuthStore } = await import('../stores/auth')
    
    whitelistStore = useWhitelistStore()
    authStore = useAuthStore()
    
    await whitelistStore.loadWhitelist()
    await whitelistStore.loadStats()
  } catch (error) {
    console.error('初始化 WhitelistManager 失败:', error)
  }
})
</script>