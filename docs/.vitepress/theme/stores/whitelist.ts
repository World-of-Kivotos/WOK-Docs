import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService, type WhitelistEntry, type PaginatedResponse } from '../services/api'

export const useWhitelistStore = defineStore('whitelist', () => {
  const entries = ref<WhitelistEntry[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    size: 20,
    total: 0,
    total_pages: 0
  })

  // 搜索和排序状态
  const searchQuery = ref('')
  const sortField = ref('created_at')
  const sortOrder = ref<'asc' | 'desc'>('desc')

  // 统计信息
  const stats = ref({
    total_entries: 0,
    recent_additions: 0,
    recent_deletions: 0,
    sync_status: 'inactive',
    last_sync: ''
  })

  // 选中的条目
  const selectedEntries = ref(new Set<string>())

  const filteredEntries = computed(() => {
    if (!searchQuery.value) return entries.value
    
    const query = searchQuery.value.toLowerCase()
    return entries.value.filter(entry => 
      entry.name.toLowerCase().includes(query) ||
      entry.uuid.toLowerCase().includes(query) ||
      entry.notes?.toLowerCase().includes(query)
    )
  })

  const selectedCount = computed(() => selectedEntries.value.size)

  const loadWhitelist = async (params?: {
    page?: number
    size?: number
    search?: string
    sort?: string
    order?: 'asc' | 'desc'
  }) => {
    loading.value = true
    error.value = null

    try {
      const response = await apiService.getWhitelist(params)
      if (response.success && response.data) {
        entries.value = response.data.entries
        pagination.value = response.data.pagination
      } else {
        throw new Error('获取白名单失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
    } finally {
      loading.value = false
    }
  }

  const addEntry = async (entry: {
    uuid: string
    name: string
    notes?: string
  }) => {
    loading.value = true
    error.value = null

    try {
      const response = await apiService.addWhitelistEntry(entry)
      if (response.success && response.data) {
        entries.value.unshift(response.data)
        stats.value.total_entries += 1
        return true
      } else {
        throw new Error('添加失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '添加失败'
      return false
    } finally {
      loading.value = false
    }
  }

  const deleteEntry = async (uuid: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await apiService.deleteWhitelistEntry(uuid)
      if (response.success) {
        entries.value = entries.value.filter(entry => entry.uuid !== uuid)
        selectedEntries.value.delete(uuid)
        stats.value.total_entries -= 1
        return true
      } else {
        throw new Error('删除失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除失败'
      return false
    } finally {
      loading.value = false
    }
  }

  const batchAdd = async (entries: Array<{
    uuid: string
    name: string
    notes?: string
  }>) => {
    loading.value = true
    error.value = null

    try {
      const response = await apiService.batchAddWhitelist(entries)
      if (response.success) {
        await loadWhitelist() // 重新加载列表
        return true
      } else {
        throw new Error('批量添加失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '批量添加失败'
      return false
    } finally {
      loading.value = false
    }
  }

  const batchDelete = async (uuids: string[]) => {
    loading.value = true
    error.value = null

    try {
      const promises = uuids.map(uuid => apiService.deleteWhitelistEntry(uuid))
      await Promise.all(promises)
      
      entries.value = entries.value.filter(entry => !uuids.includes(entry.uuid))
      uuids.forEach(uuid => selectedEntries.value.delete(uuid))
      stats.value.total_entries -= uuids.length
      
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '批量删除失败'
      return false
    } finally {
      loading.value = false
    }
  }

  const loadStats = async () => {
    try {
      const response = await apiService.getWhitelistStats()
      if (response.success && response.data) {
        stats.value = response.data
      }
    } catch (err) {
      console.error('加载统计信息失败:', err)
    }
  }

  const sync = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await apiService.syncWhitelist()
      if (response.success) {
        await loadStats() // 重新加载统计信息
        return true
      } else {
        throw new Error('同步失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '同步失败'
      return false
    } finally {
      loading.value = false
    }
  }

  const toggleSelection = (uuid: string) => {
    if (selectedEntries.value.has(uuid)) {
      selectedEntries.value.delete(uuid)
    } else {
      selectedEntries.value.add(uuid)
    }
  }

  const selectAll = () => {
    entries.value.forEach(entry => {
      selectedEntries.value.add(entry.uuid)
    })
  }

  const clearSelection = () => {
    selectedEntries.value.clear()
  }

  const updateSearch = (query: string) => {
    searchQuery.value = query
  }

  const updateSort = (field: string, order: 'asc' | 'desc') => {
    sortField.value = field
    sortOrder.value = order
  }

  return {
    entries,
    loading,
    error,
    pagination,
    searchQuery,
    sortField,
    sortOrder,
    stats,
    selectedEntries,
    filteredEntries,
    selectedCount,
    loadWhitelist,
    addEntry,
    deleteEntry,
    batchAdd,
    batchDelete,
    loadStats,
    sync,
    toggleSelection,
    selectAll,
    clearSelection,
    updateSearch,
    updateSort
  }
})