# WOK 官方文档 & 白名单管理系统

World of Kivotos 服务器的官方文档网站，集成了白名单管理功能。

## ✨ 功能特性

- 📖 **服务器文档** - 完整的游戏指南和说明
- 🔐 **白名单管理** - 管理员可在线管理服务器白名单
- 🎫 **玩家注册** - 用户自助注册系统
- 📊 **服务器监控** - 实时性能和状态监控

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
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