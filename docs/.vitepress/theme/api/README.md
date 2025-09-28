# 服务器状态数据获取指南

本文档说明如何为 ServerStatus 组件集成真实的服务器数据。

## 🔌 API 集成方案

### 1. Minecraft 服务器状态 API

#### 使用 minecraft-server-util (Node.js)

```javascript
// 安装依赖
npm install minecraft-server-util

// 获取服务器状态
import { status } from 'minecraft-server-util';

async function getServerStatus(host, port = 25565) {
  try {
    const response = await status(host, port);
    return {
      online: true,
      players: response.players.online,
      maxPlayers: response.players.max,
      version: response.version.name,
      ping: response.roundTripLatency,
      motd: response.motd.clean
    };
  } catch (error) {
    return {
      online: false,
      players: 0,
      maxPlayers: 0,
      version: 'Unknown',
      ping: 999,
      motd: 'Server Offline'
    };
  }
}
```

#### 使用 mcstatus (Python)

```python
from mcstatus import JavaServer
import json

def get_server_status(host, port=25565):
    try:
        server = JavaServer.lookup(f"{host}:{port}")
        status = server.status()
        
        return {
            "online": True,
            "players": status.players.online,
            "maxPlayers": status.players.max,
            "version": status.version.name,
            "ping": status.latency,
            "motd": status.description
        }
    except Exception as e:
        return {
            "online": False,
            "players": 0,
            "maxPlayers": 0,
            "version": "Unknown",
            "ping": 999,
            "motd": "Server Offline"
        }
```

### 2. 第三方 API 服务

#### MCApi.us

```javascript
async function getServerStatusFromAPI(serverAddress) {
  try {
    const response = await fetch(`https://api.mcstatus.io/v2/status/java/${serverAddress}`);
    const data = await response.json();
    
    if (data.online) {
      return {
        online: true,
        players: data.players.online,
        maxPlayers: data.players.max,
        version: data.version.name_clean,
        ping: data.query?.roundTripLatency || 0,
        motd: data.motd.clean
      };
    }
  } catch (error) {
    console.error('API请求失败:', error);
  }
  
  return {
    online: false,
    players: 0,
    maxPlayers: 0,
    version: 'Unknown',
    ping: 999,
    motd: 'Server Offline'
  };
}
```

#### Minetools API

```javascript
async function getServerStatusMinetools(serverAddress) {
  try {
    const response = await fetch(`https://api.minetools.eu/ping/${serverAddress}`);
    const data = await response.json();
    
    return {
      online: data.error ? false : true,
      players: data.players?.online || 0,
      maxPlayers: data.players?.max || 0,
      version: data.version || 'Unknown',
      ping: data.latency || 999,
      motd: data.description || 'No MOTD'
    };
  } catch (error) {
    console.error('Minetools API请求失败:', error);
    return { online: false, players: 0, maxPlayers: 0, version: 'Unknown', ping: 999 };
  }
}
```

## 🏗️ 后端 API 实现

### Express.js 示例

```javascript
// server.js
const express = require('express');
const { status } = require('minecraft-server-util');
const cors = require('cors');

const app = express();
app.use(cors());

// 服务器节点配置
const serverNodes = [
  { id: 1, name: '主服务器', host: 'main.wok.example.com', port: 25565, region: '华东' },
  { id: 2, name: '备用服务器', host: 'backup.wok.example.com', port: 25565, region: '华南' },
  { id: 3, name: '测试服务器', host: 'test.wok.example.com', port: 25565, region: '华北' },
  { id: 4, name: '国际服务器', host: 'intl.wok.example.com', port: 25565, region: '海外' }
];

// 获取单个服务器状态
async function checkServerStatus(node) {
  try {
    const response = await status(node.host, node.port, { timeout: 5000 });
    
    return {
      ...node,
      status: 'online',
      players: response.players.online,
      maxPlayers: response.players.max,
      ping: response.roundTripLatency,
      load: Math.floor(Math.random() * 80) + 10, // 模拟负载，实际应从系统监控获取
      version: response.version.name,
      motd: response.motd.clean
    };
  } catch (error) {
    return {
      ...node,
      status: 'offline',
      players: 0,
      maxPlayers: 0,
      ping: 999,
      load: 0,
      version: 'Unknown',
      motd: 'Server Offline'
    };
  }
}

// API 端点：获取所有服务器状态
app.get('/api/servers/status', async (req, res) => {
  try {
    const statusPromises = serverNodes.map(node => checkServerStatus(node));
    const results = await Promise.all(statusPromises);
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      servers: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API 端点：获取单个服务器状态
app.get('/api/servers/:id/status', async (req, res) => {
  const serverId = parseInt(req.params.id);
  const node = serverNodes.find(n => n.id === serverId);
  
  if (!node) {
    return res.status(404).json({
      success: false,
      error: 'Server not found'
    });
  }
  
  try {
    const result = await checkServerStatus(node);
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      server: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(3000, () => {
  console.log('服务器状态API运行在端口 3000');
});
```

## 🔄 前端集成

### 更新 ServerStatus.vue

```javascript
// 在 ServerStatus.vue 中添加真实数据获取
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  setup() {
    const serverNodes = ref([])
    const isLoading = ref(true)
    const error = ref(null)
    let updateInterval = null

    // 获取服务器状态数据
    const fetchServerStatus = async () => {
      try {
        const response = await fetch('/api/servers/status')
        const data = await response.json()
        
        if (data.success) {
          serverNodes.value = data.servers
          error.value = null
        } else {
          throw new Error(data.error || '获取服务器状态失败')
        }
      } catch (err) {
        console.error('获取服务器状态失败:', err)
        error.value = err.message
        
        // 使用模拟数据作为降级方案
        serverNodes.value = getDefaultServerData()
      } finally {
        isLoading.value = false
      }
    }

    // 默认/模拟数据
    const getDefaultServerData = () => [
      {
        id: 1,
        name: '主服务器',
        status: 'online',
        players: 45,
        maxPlayers: 100,
        ping: 25,
        load: 65,
        region: '华东'
      },
      // ... 其他节点
    ]

    // 刷新状态
    const refreshStatus = async () => {
      if (isRefreshing.value) return
      isRefreshing.value = true
      await fetchServerStatus()
      isRefreshing.value = false
    }

    onMounted(() => {
      // 初始加载
      fetchServerStatus()
      
      // 设置定时更新（每30秒）
      updateInterval = setInterval(fetchServerStatus, 30000)
    })

    onUnmounted(() => {
      if (updateInterval) {
        clearInterval(updateInterval)
      }
    })

    return {
      serverNodes,
      isLoading,
      error,
      refreshStatus,
      // ... 其他返回值
    }
  }
}
```

## 🔧 系统监控集成

### 获取服务器负载数据

```javascript
// 使用 systeminformation 库获取系统信息
const si = require('systeminformation');

async function getSystemLoad() {
  try {
    const [cpu, mem, load] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.osInfo()
    ]);

    return {
      cpuLoad: Math.round(cpu.currentload),
      memoryUsage: Math.round((mem.used / mem.total) * 100),
      uptime: load.uptime
    };
  } catch (error) {
    console.error('获取系统信息失败:', error);
    return {
      cpuLoad: 0,
      memoryUsage: 0,
      uptime: 0
    };
  }
}
```

## 🚀 部署建议

### 1. 使用 Docker 部署监控服务

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 3000

CMD ["node", "server.js"]
```

### 2. 使用 PM2 进程管理

```json
{
  "name": "server-status-api",
  "script": "server.js",
  "instances": 2,
  "exec_mode": "cluster",
  "env": {
    "NODE_ENV": "production",
    "PORT": 3000
  }
}
```

### 3. Nginx 反向代理配置

```nginx
server {
    listen 80;
    server_name api.wok.example.com;

    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 📊 监控和告警

### 使用 Prometheus + Grafana

```javascript
// 添加 Prometheus 指标
const client = require('prom-client');

const serverStatusGauge = new client.Gauge({
  name: 'minecraft_server_online',
  help: 'Minecraft server online status',
  labelNames: ['server_name', 'region']
});

const playerCountGauge = new client.Gauge({
  name: 'minecraft_server_players',
  help: 'Current player count',
  labelNames: ['server_name', 'region']
});

// 在状态检查中更新指标
function updateMetrics(serverData) {
  serverData.forEach(server => {
    serverStatusGauge.set(
      { server_name: server.name, region: server.region },
      server.status === 'online' ? 1 : 0
    );
    
    playerCountGauge.set(
      { server_name: server.name, region: server.region },
      server.players
    );
  });
}
```

## 🔐 安全考虑

1. **API 限流**：使用 express-rate-limit 防止滥用
2. **CORS 配置**：只允许特定域名访问
3. **数据验证**：验证输入参数
4. **错误处理**：不暴露敏感信息
5. **监控日志**：记录 API 访问和错误

通过以上方案，你可以将 ServerStatus 组件从模拟数据升级为真实的服务器状态监控系统。