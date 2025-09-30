import axios, { AxiosInstance, AxiosError } from 'axios'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: number
    message: string
    details?: string
  }
  timestamp: number
}

export interface WhitelistEntry {
  uuid: string
  name: string
  created_at: string
  updated_at: string
  source: string
  notes?: string
}

export interface PaginatedResponse<T> {
  entries: T[]
  pagination: {
    page: number
    size: number
    total: number
    total_pages: number
  }
}

export interface ServerStatus {
  online: boolean
  spark_available: boolean
  plugin_version: string
  timestamp: number
}

export interface ServerPerformance {
  tps: {
    values: {
      last_1m: number
      last_5m: number
      last_15m: number
    }
  }
  mspt: {
    values: {
      last_1m: number
      last_5m: number
      last_15m: number
    }
  }
  memory: {
    used: number
    max: number
    free: number
  }
  cpu: {
    process: number
    system: number
  }
  timestamp: number
}

class ApiService {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.mcwok.cn/api/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        // 添加时间戳防止缓存
        if (config.method === 'get') {
          config.params = {
            ...config.params,
            _t: Date.now()
          }
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError) => {
        const errorData = error.response?.data as any
        const message = errorData?.error?.message || error.message || '网络错误'
        return Promise.reject(new Error(message))
      }
    )
  }

  // 白名单管理API
  async getWhitelist(params?: {
    page?: number
    size?: number
    search?: string
    sort?: string
    order?: 'asc' | 'desc'
  }): Promise<ApiResponse<PaginatedResponse<WhitelistEntry>>> {
    return this.client.get('/whitelist', { params })
  }

  async addWhitelistEntry(entry: {
    uuid: string
    name: string
    notes?: string
  }): Promise<ApiResponse<WhitelistEntry>> {
    return this.client.post('/whitelist', entry)
  }

  async deleteWhitelistEntry(uuid: string): Promise<ApiResponse<{ message: string; uuid: string }>> {
    return this.client.delete(`/whitelist/${uuid}`)
  }

  async batchAddWhitelist(entries: Array<{
    uuid: string
    name: string
    notes?: string
  }>): Promise<ApiResponse<any>> {
    return this.client.post('/whitelist/batch', { entries })
  }

  async getWhitelistStats(): Promise<ApiResponse<{
    total_entries: number
    recent_additions: number
    recent_deletions: number
    sync_status: string
    last_sync: string
  }>> {
    return this.client.get('/whitelist/stats')
  }

  async syncWhitelist(): Promise<ApiResponse<{ message: string }>> {
    return this.client.post('/whitelist/sync')
  }

  async getSyncStatus(): Promise<ApiResponse<{ status: string; last_sync: string }>> {
    return this.client.get('/whitelist/sync/status')
  }

  // 用户注册API
  async register(data: {
    token: string
    playerName: string
    playerUuid: string
  }): Promise<ApiResponse<{ playerName: string; playerUuid: string; message: string }>> {
    return this.client.post('/register', data)
  }

  async generateToken(adminPassword: string, expiryHours: number = 24): Promise<ApiResponse<{
    token: string
    expiryHours: number
  }>> {
    return this.client.post('/admin/generate-token', 
      { expiryHours }, 
      {
        headers: {
          'X-Admin-Password': adminPassword
        }
      }
    )
  }

  // 服务器监控API
  async getServerStatus(): Promise<ApiResponse<ServerStatus>> {
    return this.client.get('/server/status')
  }

  async getServerPerformance(): Promise<ApiResponse<ServerPerformance>> {
    return this.client.get('/server/performance')
  }

  async getServerInfo(): Promise<ApiResponse<any>> {
    return this.client.get('/server/info')
  }

  async getOnlinePlayersCount(): Promise<ApiResponse<{ count: number }>> {
    return this.client.get('/players/online')
  }

  async getPlayersList(): Promise<ApiResponse<{ players: Array<{ name: string; uuid: string }> }>> {
    return this.client.get('/players/list')
  }

  async getWorldsList(): Promise<ApiResponse<{ worlds: Array<{ name: string; players: number }> }>> {
    return this.client.get('/worlds/list')
  }

  async getSystemResources(): Promise<ApiResponse<any>> {
    return this.client.get('/system/resources')
  }

  async healthCheck(): Promise<ApiResponse<{
    status: string
    uptime: number
    version: string
    components: Record<string, string>
    timestamp: number
  }>> {
    return this.client.get('/health')
  }
}

export const apiService = new ApiService()
export default apiService