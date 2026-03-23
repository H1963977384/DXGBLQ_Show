<template>
  <footer v-if="isMobile" class="app-footer">
    <div 
      class="tab-item"
      :class="{ active: activeIndex === 0 }"
      @click="handleTabClick(0)"
    >
      <div class="icon-wrapper">
        <svg class="icon" viewBox="-9 -9 42 42" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span v-if="false" class="badge"></span>
      </div>
      <span class="tab-label">主页</span>
    </div>
    <div 
      class="tab-item"
      :class="{ active: activeIndex === 1 }"
      @click="handleTabClick(1)"
    >
      <div class="icon-wrapper">
        <svg class="icon" viewBox="-9 -9 42 42" fill="none" stroke="currentColor" stroke-width="2">
          <rect width="18" height="7" x="3" y="3" rx="1"/>
          <rect width="9" height="7" x="3" y="14" rx="1"/>
          <rect width="5" height="7" x="16" y="14" rx="1"/>
        </svg>
        <span v-if="false" class="badge"></span>
      </div>
      <span class="tab-label">功能</span>
    </div>

    <!--
    <div 
      class="tab-item"
      :class="{ active: activeIndex === 3 }"
      @click="handleTabClick(3)"
    >
      <div class="icon-wrapper">
        <svg class="icon" viewBox="-9 -9 42 42" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.268 21a2 2 0 0 0 3.464 0"/>
          <path d="M22 8c0-2.3-.8-4.3-2-6"/>
          <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>
          <path d="M4 2C2.8 3.7 2 5.7 2 8"/>
        </svg>
        <span v-if="true" class="badge"></span>
      </div>
      <span class="tab-label">通知</span>
    </div>
    -->
    <div 
      class="tab-item"
      :class="{ active: activeIndex === 4 }"
      @click="handleTabClick(4)"
    >
      <div class="icon-wrapper">
        <svg class="icon" viewBox="-9 -9 42 42" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span v-if="false" class="badge"></span>
      </div>
      <span class="tab-label">我的</span>
    </div>
  </footer>
  <footer v-if="!isMobile" class="web-footer">
    <div class="footer-text">
      © 2026&ensp;大峡谷一站通.&ensp;All rights reserved.
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: #ffffff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-bottom: env(safe-area-inset-bottom); /* 适配iPhone底部横条 */
  border-top: 1px solid #f0f4f8;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.03);
  z-index: 1000;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* 图标基础样式 - 建议配合Iconfont或SVG使用 */
.icon-wrapper {
  position: relative;
  width: 40px;
  height: 40px;
  margin-bottom: -2px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 模拟图片中的特定图标形态 */
.icon {
  width: 35px;
  height: 35px;
  border-radius: 6px;
  position: relative;
}

/* 激活状态：Home项的蓝色背景块 */
.tab-item.active .icon {
  background: #5c7cfa; /* 图片中的主蓝色 */
  border-color: #5c7cfa;
  border-radius: 50%;
}

.tab-item.active .tab-label {
  color: #5c7cfa;
  font-weight: 600;
}

.tab-item.active .icon {
  color: white
}

/* 文字样式 */
.tab-label {
  font-size: 15px;
  color: #7f8c8d;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica;
}

/* 红点通知 */
.badge {
  position: absolute;
  top: 0px;
  right: 0px;
  width: 12px;
  height: 12px;
  background-color: #ff5252;
  border: 1.5px solid #fff;
  border-radius: 50%;
}

/* 针对 Create(+) 这种特殊图标的微调 */
.icon-create::before, .icon-create::after {
  content: '';
  position: absolute;
  background: #2d3436;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
}
.icon-create::before { width: 12px; height: 2px; }
.icon-create::after { width: 2px; height: 12px; }

/* 针对 More(四个圈) 的微调 */
.icon-more { border: none !important; display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
.icon-more::after { /* 这里可以用伪元素画四个小圆点 */ }

.web-footer {
  border-top: 1px solid #e8e8e8;
  text-align: center;
  color: #999;
  font-size: 12.5px;
  height: 50px;
}

.footer-text {
  line-height: 45px;
}
</style>

<script setup>
import { ref, inject, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router';

const isMobile = inject('isMobile')
const activeIndex = ref(-1); // 默认-1表示不激活任何按钮

const router = useRouter()
const route = useRoute()

// 根据当前路由设置激活的按钮
const updateActiveIndex = () => {
  const path = route.path
  
  if (path === '/' || path === '/dashboard') {
    activeIndex.value = 0
  } else if (path === '/mobile/functions') {
    activeIndex.value = 1
  } else if (path === '/mobile/notifications') {
    activeIndex.value = 3
  } else if (path === '/profile') {
    activeIndex.value = 4
  } else {
    activeIndex.value = -1 // 不在这四个页面，不激活任何按钮
  }
}

// 监听路由变化
watch(() => route.path, () => {
  updateActiveIndex()
})

// 组件挂载时设置初始激活状态
onMounted(() => {
  updateActiveIndex()
})

const handleTabClick = (index) => {
  activeIndex.value = index
  switch (index) {
    case 0:
      router.push('/')
      break
    case 1:
      router.push('/mobile/functions')
      break
    case 3:
      router.push('/mobile/notifications')
      break
    case 4:
      router.push('/profile')
      break
  }
}

</script>