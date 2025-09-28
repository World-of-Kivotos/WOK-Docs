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

    <!-- 自定义页脚 -->
    <template #layout-bottom>
      <div class="custom-footer">
        <div class="footer-links">
          <a href="#" class="footer-link">QQ群</a>
          <a href="#" class="footer-link">Discord</a>
          <a href="#" class="footer-link">GitHub</a>
        </div>
        <p class="copyright">© 2024 World of Kivotos Team. All rights reserved.</p>
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
  color: #10b981;
  font-weight: bold;
}

.custom-footer {
  background-color: var(--vp-c-bg-soft);
  padding: 2rem 0;
  text-align: center;
  border-top: 1px solid var(--vp-c-divider);
  margin-top: 2rem;
}

.footer-links {
  margin-bottom: 1rem;
}

.footer-link {
  display: inline-block;
  margin: 0 1rem;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-weight: 500;
}

.footer-link:hover {
  text-decoration: underline;
}

.copyright {
  margin: 0;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}
</style>