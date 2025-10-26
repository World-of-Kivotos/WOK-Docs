# World of Kivotos 官方文档

这是 World of Kivotos 服务器的官方文档存放仓库。

## 关于 World of Kivotos

World of Kivotos 是一个我的世界 x 蔚蓝档案主题服务器，提供 RP/RPG 玩法体验。

- **版本**: Minecraft Java Edition 1.20.1
- **类型**: 公益服务器，无需正版验证
- **移动端**: 支持通过 FCL 游玩

## 文档访问

在线文档地址：[https://world-of-kivotos.github.io/WOK-Docs/](https://world-of-kivotos.github.io/WOK-Docs/)

## 本地开发

### 环境配置

1. **复制环境变量配置文件**
```bash
cp .env.example .env
```

2. **编辑 `.env` 文件，配置 API Token**
```env
# API 基础URL
VITE_API_BASE_URL=https://api.mcwok.cn/api/v1

# API 访问令牌（从服务器控制台获取）
VITE_API_TOKEN=sk-your-api-token-here
```

> **如何获取 API Token:**
> - 启动 Minecraft 服务器，插件会自动生成 API Token
> - 在控制台查看输出：`已自动生成API访问令牌: sk-xxx...`
> - 将该 Token 复制到 `.env` 文件中

### 启动项目

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建文档
npm run build
```

## 部署

### GitHub Pages（自动部署）
推送到 `main` 分支会自动部署到 GitHub Pages。

### 自定义服务器部署
项目支持手动部署到您的Web服务器：

- **服务器部署** (`.github/workflows/deploy-to-server.yml`)
  - 仅支持手动触发部署
  - 包含完整的备份和验证机制
  - 支持文件权限管理
  - 部署状态监控

#### 部署配置

在GitHub仓库设置中配置以下Secrets：
- `SERVER_HOST`: 服务器IP或域名
- `SERVER_USERNAME`: SSH用户名
- `SERVER_SSH_KEY`: SSH私钥内容
- `SERVER_PATH`: 网站部署路径 (如: `/var/www/wok-docs`)
- `SERVER_PORT`: SSH端口 (可选，默认22)

配置完成后，在GitHub Actions页面手动触发部署即可。

详细配置说明请查看 [部署指南](docs/deployment-guide.md)。

## 贡献

欢迎提交 Issue 和 Pull Request 来改进文档内容。