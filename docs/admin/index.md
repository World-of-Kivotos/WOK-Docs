---
layout: page
title: 管理面板
---

<script setup>
import { defineClientComponent } from 'vitepress'

const AdminDashboard = defineClientComponent(() => {
  return import('../.vitepress/theme/components/AdminDashboard.vue')
})
</script>

<AdminDashboard />