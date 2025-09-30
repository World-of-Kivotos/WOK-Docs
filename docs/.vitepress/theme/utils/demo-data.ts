/**
 * 演示数据生成器
 * 用于测试和开发时生成模拟数据
 */

// 生成随机UUID
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 生成随机玩家名称
export function generatePlayerName(): string {
  const prefixes = ['Test', 'Demo', 'Player', 'User', 'Gamer', 'Pro', 'Epic', 'Super'];
  const suffixes = ['123', '456', '789', 'X', 'Pro', 'Master', 'King', 'Legend'];
  const numbers = Math.floor(Math.random() * 9999) + 1;
  
  const usePrefix = Math.random() > 0.5;
  const useSuffix = Math.random() > 0.3;
  
  let name = '';
  if (usePrefix) {
    name += prefixes[Math.floor(Math.random() * prefixes.length)];
  }
  
  if (useSuffix) {
    name += suffixes[Math.floor(Math.random() * suffixes.length)];
  } else {
    name += numbers;
  }
  
  return name.substring(0, 16); // Minecraft用户名最长16字符
}

// 生成白名单条目
export function generateWhitelistEntry() {
  const sources = ['manual', 'api', 'import', 'register'];
  const notes = ['VIP玩家', '普通玩家', '测试账号', '管理员好友', '活跃用户', ''];
  
  const now = new Date();
  const createdAt = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000); // 最近30天内
  
  return {
    uuid: generateUUID(),
    name: generatePlayerName(),
    created_at: createdAt.toISOString(),
    updated_at: createdAt.toISOString(),
    source: sources[Math.floor(Math.random() * sources.length)],
    notes: notes[Math.floor(Math.random() * notes.length)]
  };
}

// 生成多个白名单条目
export function generateWhitelistEntries(count: number = 50) {
  return Array.from({ length: count }, () => generateWhitelistEntry());
}

// 生成服务器性能数据
export function generateServerPerformance() {
  const baseTps = 20;
  const variation = (Math.random() - 0.5) * 2; // -1到1的变化
  
  const tps1m = Math.max(10, Math.min(20, baseTps + variation));
  const tps5m = Math.max(10, Math.min(20, tps1m + (Math.random() - 0.5) * 0.5));
  const tps15m = Math.max(10, Math.min(20, tps5m + (Math.random() - 0.5) * 0.3));
  
  const mspt1m = (20000 / tps1m) * (0.8 + Math.random() * 0.4); // 添加一些变化
  const mspt5m = (20000 / tps5m) * (0.8 + Math.random() * 0.4);
  const mspt15m = (20000 / tps15m) * (0.8 + Math.random() * 0.4);
  
  const memoryMax = 4096; // 4GB
  const memoryUsed = Math.floor(memoryMax * (0.3 + Math.random() * 0.5)); // 30-80%
  
  return {
    tps: {
      values: {
        last_1m: tps1m,
        last_5m: tps5m,
        last_15m: tps15m
      }
    },
    mspt: {
      values: {
        last_1m: mspt1m,
        last_5m: mspt5m,
        last_15m: mspt15m
      }
    },
    memory: {
      used: memoryUsed,
      max: memoryMax,
      free: memoryMax - memoryUsed
    },
    cpu: {
      process: Math.random() * 60 + 10, // 10-70%
      system: Math.random() * 40 + 20   // 20-60%
    },
    timestamp: Date.now()
  };
}

// 生成在线玩家列表
export function generateOnlinePlayers(count?: number) {
  const actualCount = count ?? Math.floor(Math.random() * 20 + 1); // 1-20个玩家
  return Array.from({ length: actualCount }, () => ({
    name: generatePlayerName(),
    uuid: generateUUID()
  }));
}

// 生成世界信息
export function generateWorldsList() {
  const worldNames = ['world', 'world_nether', 'world_the_end', 'lobby', 'creative', 'survival'];
  return worldNames.map(name => ({
    name,
    players: Math.floor(Math.random() * 10) // 0-9个玩家
  }));
}

// 生成白名单统计数据
export function generateWhitelistStats() {
  const total = Math.floor(Math.random() * 1000 + 100); // 100-1100
  return {
    total_entries: total,
    recent_additions: Math.floor(Math.random() * 20),
    recent_deletions: Math.floor(Math.random() * 5),
    sync_status: Math.random() > 0.2 ? 'active' : (Math.random() > 0.5 ? 'pending' : 'error'),
    last_sync: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString() // 最近1小时内
  };
}

// 生成服务器状态
export function generateServerStatus() {
  const isOnline = Math.random() > 0.1; // 90%的概率在线
  return {
    online: isOnline,
    spark_available: isOnline && Math.random() > 0.3, // 如果在线，70%的概率有Spark
    plugin_version: '0.1.0',
    timestamp: Date.now()
  };
}

// 生成健康检查数据
export function generateHealthInfo() {
  const status = Math.random() > 0.05 ? 'healthy' : 'unhealthy'; // 95%的概率健康
  return {
    status,
    uptime: Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000), // 最多7天的运行时间
    version: '0.1.0',
    components: {
      cache: status === 'healthy' ? 'healthy' : (Math.random() > 0.5 ? 'healthy' : 'unhealthy'),
      data_collector: status === 'healthy' ? 'healthy' : (Math.random() > 0.5 ? 'healthy' : 'unhealthy')
    },
    timestamp: Date.now()
  };
}

// 生成注册令牌
export function generateToken(expiryHours: number = 24) {
  const tokenChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = 'reg_';
  for (let i = 0; i < 24; i++) {
    token += tokenChars.charAt(Math.floor(Math.random() * tokenChars.length));
  }
  
  return {
    token,
    expiryHours
  };
}

// 导出所有生成器
export const DemoDataGenerator = {
  generateUUID,
  generatePlayerName,
  generateWhitelistEntry,
  generateWhitelistEntries,
  generateServerPerformance,
  generateOnlinePlayers,
  generateWorldsList,
  generateWhitelistStats,
  generateServerStatus,
  generateHealthInfo,
  generateToken
};

// 如果在浏览器环境，挂载到window对象用于调试
if (typeof window !== 'undefined') {
  (window as any).DemoData = DemoDataGenerator;
}