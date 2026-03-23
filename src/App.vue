
<template>
  <div id="app-root">
    <router-view />
  </div>
</template>

<script setup>
import { ref, onMounted, provide } from 'vue'
import { isMobileDevice } from './utils/deviceDetect'

// 移动端检测
const isMobile = ref(false)

onMounted(() => {
  // 检测设备类型
  isMobile.value = isMobileDevice()
  
  // 手机端设置 viewport 缩放
  if (isMobile.value) {
    const viewport = document.querySelector('meta[name="viewport"]')
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=4.0, user-scalable=yes')
    }
  }
  
  // 打印调试信息
  console.log('设备类型:', isMobile.value ? '移动端' : '桌面端')
  console.log('User Agent:', navigator.userAgent)
  console.log('屏幕宽度:', window.innerWidth)
})

// 提供给子组件使用
provide('isMobile', isMobile)
</script>

<style>
#app-root {
  width: 100%;
  height: 100%;
}
</style>
