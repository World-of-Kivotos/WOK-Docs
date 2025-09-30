import { createPinia } from 'pinia'
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'

// 导入样式
import './styles/tailwind.css'
import './styles/admin.css'

// 导入 AG Grid 设置
import { setupAgGrid } from './utils/ag-grid-setup'

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router, siteData }) {
    // 初始化 AG Grid 模块
    setupAgGrid()
    
    // 安装Pinia状态管理
    const pinia = createPinia()
    app.use(pinia)
  }
} satisfies Theme