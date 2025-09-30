import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'WOK 服务器管理',
  description: 'Minecraft 服务器白名单管理系统',
  
  head: [
    ['link', { rel: 'icon', href: '/public/World_of_Kivotos.svg' }]
  ],

  themeConfig: {
    logo: '/public/World_of_Kivotos.svg',
    
    nav: [
      { text: '首页', link: '/' },
      { text: '服务器介绍', link: '/server/' },
      { text: '使用协议', link: '/eula' },
      { text: '常见问题', link: '/faq' },
      { text: '白名单管理', link: '/admin/' }
    ],

    sidebar: {
      '/server/': [
        {
          text: '服务器文档',
          items: [
            { text: '服务器介绍', link: '/server/' },
            { text: '安装指南', link: '/server/installation' },
            { text: '游戏玩法', link: '/server/gameplay' },
            { text: '加入服务器', link: '/server/join' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/World-of-Kivotos' }
    ],

    footer: {
      message: 'MIT Licensed',
      copyright: 'Copyright © 2024 World of Kivotos'
    }
  },

  vite: {
    define: {
      __VUE_PROD_DEVTOOLS__: false
    },
    css: {
      postcss: './postcss.config.js',
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:22222',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    }
  }
})