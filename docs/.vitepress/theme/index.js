// 自定义主题入口文件
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import Layout from './Layout.vue'
import ServerStatus from './components/ServerStatus.vue'
import WhitelistManagement from './components/WhitelistManagement.vue'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app, router, siteData }) {
    // 注册全局组件
    app.component('ServerStatus', ServerStatus)
    app.component('WhitelistManagement', WhitelistManagement)
    
    // 可以在这里添加其他全局功能
    // 例如：全局属性、插件等
  }
}