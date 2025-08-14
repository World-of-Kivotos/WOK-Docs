import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'World of Kivotos',
  description: '我的世界 x 蔚蓝档案服务器官方文档',
  base: '/WOK-Docs/',
  lang: 'zh-CN',
  
  // 主题配置
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '服务器介绍', link: '/server/' },
      { text: '使用协议', link: '/eula' },
      { text: '常见问题', link: '/faq' }
    ],

    // 侧边栏
    sidebar: {
      '/': [
        {
          text: '服务器信息',
          items: [
            { text: '服务器介绍', link: '/server/' },
            { text: '游戏玩法', link: '/server/gameplay' },
            { text: '游戏安装指引', link: '/server/installation' },
            { text: '加入指南', link: '/server/join' }
          ]
        },
        {
          text: '千年科技学院',
          items: [
            { text: '新人引导', link: '/millennium/newcomer-guide' }
          ]
        }
      ],
      '/server/': [
        {
          text: '服务器信息',
          items: [
            { text: '服务器介绍', link: '/server/' },
            { text: '游戏玩法', link: '/server/gameplay' },
            { text: '游戏安装指引', link: '/server/installation' },
            { text: '加入指南', link: '/server/join' }
          ]
        },
        {
          text: '千年科技学院',
          items: [
            { text: '新人引导', link: '/millennium/newcomer-guide' }
          ]
        }
      ],
      '/millennium/': [
        {
          text: '服务器信息',
          items: [
            { text: '服务器介绍', link: '/server/' },
            { text: '游戏玩法', link: '/server/gameplay' },
            { text: '游戏安装指引', link: '/server/installation' },
            { text: '加入指南', link: '/server/join' }
          ]
        },
        {
          text: '千年科技学院',
          items: [
            { text: '新人引导', link: '/millennium/newcomer-guide' }
          ]
        }
      ]
    },

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com' }
    ],

    // 页脚
    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2024 WOK Team'
    },

    // 搜索
    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换'
                }
              }
            }
          }
        }
      }
    },

    // 编辑链接
    editLink: {
      pattern: 'https://github.com/your-repo/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页面'
    },

    // 最后更新时间
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    }
  },

  // Markdown 配置
  markdown: {
    lineNumbers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  },

  // 站点地图
  sitemap: {
    hostname: 'https://your-domain.com'
  }
})