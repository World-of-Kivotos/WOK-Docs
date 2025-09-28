<template>
  <Layout>
    <!-- 自定义侧边栏底部 -->
    <template #sidebar-nav-after>
      <div class="custom-sidebar-footer">
        <div class="server-status">
          <h4>🟢 服务器状态</h4>
          <p>在线玩家: <span class="player-count">12/100</span></p>
          <p>服务器版本: 1.20.1</p>
        </div>
      </div>
    </template>
  </Layout>
</template>

<script setup>
import DefaultTheme from 'vitepress/theme'

const { Layout } = DefaultTheme
</script>

<style scoped>
.custom-sidebar-footer {
  padding: 1rem;
  border-top: 1px solid var(--vp-c-divider);
  margin-top: 1rem;
}

.server-status h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: var(--vp-c-text-1);
}

.server-status p {
  margin: 0.25rem 0;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

.player-count {
  color: var(--vp-c-brand-1);
  font-weight: bold;
}
</style>