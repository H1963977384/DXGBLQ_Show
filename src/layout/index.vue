<template>
  <div class="app-container">
    <div class="main-wrapper">

      <!-- Sidebar（仅桌面端显示） -->
      <Sidebar 
        v-if="!isMobile"
        class="app-sidebar"
        :class="{ 'hide-border': isHomePage() }"
      />

      <!-- Main Content -->
      <div class="content-wrapper">
        <Header
          class="app-header" 
        />
        <div class="content-container">
          <router-view :is-mobile="isMobile" />
        </div>
        <Footer 
          v-if="isMobile || !isHomePage()"
          class="app-footer" 
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/sidebar.vue'
import Footer from './components/footer.vue'
import Header from './components/header.vue'

// 从 App.vue 注入移动端状态
const isMobile = inject('isMobile')
const route = useRoute()

// 判断是否为首页
const isHomePage = () => route.path === '/'
</script>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
}
*, *::before, *::after { box-sizing: border-box; }
</style>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

/* 主体区域 */
.main-wrapper {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

/* Sidebar 桌面态 */
.app-sidebar {
  flex-shrink: 0;
  width: 280px;
  height: 100%;
  overflow-y: auto;
  background: #F8F8F8;
  border-right: 1px solid #e9ecef;
  transition: transform 0.3s ease;
}

.app-sidebar.hide-border {
  border-right: none;
}

/* 内容区 */
.content-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.content-container {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

/* Footer */
.app-footer {
  flex-shrink: 0;
  height: 45px;
  width: 100%;
  background: white;
  border-top: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
}

</style>