<template>
  <MobileOnly />

  <div v-if="isMobile" class="portal-container">
    <div class="list-cell">
      <div class="menu-item" v-for="item in store.staticItems" :key="item.text" @click="handleEntry(item)">
        <div class="icon-box" :style="{ backgroundColor: item.color }"></div>
        <span class="app-name">{{ item.text }}</span>
      </div>
    </div>

    <div class="business-list">
      <div v-for="group in store.groupedByCategory" :key="group.name" class="category-section">
        <div class="category-title">{{ group.name }}</div>
        
        <div 
          v-for="app in group.items" 
          :key="app.id" 
          class="list-cell"
          @click="handleEntry(app)"
        >
          <div class="app-icon" v-html="app.svg"></div>
          <div class="app-info">
            <span class="app-name">{{ app.name }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="empty-space"></div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useFunctionStore } from '@/stores/functionStore';
import MobileOnly from '../error/MobileOnly.vue';
import { inject } from 'vue'

const isMobile = inject('isMobile')
const router = useRouter();
const store = useFunctionStore();

const handleEntry = (app) => {
  if (app.routerLink) {
    router.push(app.routerLink);
    return;
  }
  console.warn(`未配置路由: ${app.name || app.text}`);
};
</script>

<style scoped>
.portal-container {
  margin: 0;
  padding: 5px;
  overflow: auto;
  padding-bottom: 60px; /* Ensure space for footer */
}

/* 针对 Category 的样式优化 */
.category-title {
  padding: 12px 14px;
  font-size: 13px;
  color: #999;
  background-color: #f7f7f7; /* 浅灰色间隔栏 */
  text-transform: uppercase;
}

.list-cell {
  background: #fff;
  display: flex;
  align-items: center;
  padding: 12px 15px;
  position: relative;
}

.list-cell:not(:last-child)::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: #f0f0f0;
}

.app-icon {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  margin-right: 12px;
}

.app-name {
  font-size: 16px;
  color: #333;
}

/* 调整 footer 始终停留在顶部 */
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.empty-space {
  height: 40px;
}
</style>