# VitePress 主题自定义指南

本文档介绍如何自定义 VitePress 主题，让你的文档站点更加个性化。

## 📁 文件结构

```
docs/.vitepress/theme/
├── index.js          # 主题入口文件
├── Layout.vue        # 自定义布局组件
├── custom.css        # 自定义样式
├── components/       # 自定义组件目录
│   └── ServerStatus.vue
└── README.md         # 本说明文档
```

## 🎨 主题自定义方法

### 1. 扩展默认主题

VitePress 允许你在默认主题基础上进行扩展，而不是完全重写：

```js
// theme/index.js
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import Layout from './Layout.vue'

export default {
  extends: DefaultTheme,  // 扩展默认主题
  Layout,                 // 使用自定义布局
  enhanceApp({ app }) {   // 增强应用
    // 注册全局组件
  }
}
```

### 2. 自定义布局

通过 `Layout.vue` 可以在默认布局基础上添加自定义内容：

```vue
<template>
  <Layout>
    <!-- 在页面顶部添加横幅 -->
    <template #layout-top>
      <div class="custom-banner">...</div>
    </template>
    
    <!-- 在侧边栏底部添加内容 -->
    <template #sidebar-nav-after>
      <div class="custom-sidebar">...</div>
    </template>
    
    <!-- 在页面底部添加内容 -->
    <template #layout-bottom>
      <div class="custom-footer">...</div>
    </template>
  </Layout>
</template>
```

### 3. 自定义样式

通过 CSS 变量可以轻松修改主题颜色：

```css
:root {
  /* 主色调 */
  --vp-c-brand-1: #4A90E2;
  --vp-c-brand-2: #357ABD;
  --vp-c-brand-3: #2E6BA8;
  
  /* 背景色 */
  --vp-c-bg: #ffffff;
  --vp-c-bg-soft: #f1f5f9;
  
  /* 文字颜色 */
  --vp-c-text-1: #2c3e50;
  --vp-c-text-2: #5a6c7d;
}
```

### 4. 创建自定义组件

可以创建 Vue 组件并全局注册：

```js
// theme/index.js
import ServerStatus from './components/ServerStatus.vue'

export default {
  enhanceApp({ app }) {
    app.component('ServerStatus', ServerStatus)
  }
}
```

然后在 Markdown 中使用：

```md
<ServerStatus />
```

## 🎯 可用的布局插槽

VitePress 提供了多个插槽位置供自定义：

- `layout-top` - 页面顶部
- `layout-bottom` - 页面底部
- `nav-bar-title-before` - 导航栏标题前
- `nav-bar-title-after` - 导航栏标题后
- `nav-bar-content-before` - 导航栏内容前
- `nav-bar-content-after` - 导航栏内容后
- `sidebar-nav-before` - 侧边栏导航前
- `sidebar-nav-after` - 侧边栏导航后
- `page-top` - 页面内容顶部
- `page-bottom` - 页面内容底部
- `doc-footer-before` - 文档页脚前
- `doc-before` - 文档内容前
- `doc-after` - 文档内容后

## 🎨 CSS 变量参考

### 颜色变量

```css
/* 品牌色 */
--vp-c-brand-1, --vp-c-brand-2, --vp-c-brand-3
--vp-c-brand-soft

/* 背景色 */
--vp-c-bg, --vp-c-bg-alt, --vp-c-bg-soft

/* 文字色 */
--vp-c-text-1, --vp-c-text-2, --vp-c-text-3

/* 边框色 */
--vp-c-divider, --vp-c-border

/* 状态色 */
--vp-c-success, --vp-c-warning, --vp-c-danger
```

### 尺寸变量

```css
/* 导航栏 */
--vp-nav-height: 64px

/* 侧边栏 */
--vp-sidebar-width: 272px

/* 内容区域 */
--vp-layout-max-width: 1440px
```

## 💡 最佳实践

1. **渐进式自定义**：从小的样式调整开始，逐步添加更复杂的功能
2. **保持响应式**：确保自定义内容在移动设备上也能正常显示
3. **使用 CSS 变量**：优先使用 VitePress 提供的 CSS 变量，便于维护
4. **组件化思维**：将复杂的自定义内容拆分为独立的 Vue 组件
5. **性能考虑**：避免添加过重的依赖或复杂的动画效果

## 🔧 调试技巧

1. 使用浏览器开发者工具查看 CSS 变量
2. 在 `enhanceApp` 中添加 `console.log` 调试
3. 使用 Vue DevTools 检查组件状态
4. 检查 VitePress 官方文档获取最新的插槽和变量信息

## 📚 参考资源

- [VitePress 官方文档 - 主题自定义](https://vitepress.dev/guide/custom-theme)
- [VitePress 默认主题源码](https://github.com/vuejs/vitepress/tree/main/src/client/theme-default)
- [Vue 3 组件开发指南](https://vuejs.org/guide/components/)