<template>
  <div v-if="!isMobile" class="mobile-only-page">
    <!-- 半透明遮罩，保证文字清晰 -->
    <div class="mask">
      <!-- 主体内容 -->
      <div class="content">
        <h1 class="title">当前页面仅支持移动端访问</h1>
        <p class="main-text">请使用 <span>手机或平板设备</span> 打开此页面</p>
        <p class="main-text1">如果你是错误地进入该页，请点击左上角返回首页</p>
        <p class="sub-text">This page is only available on mobile devices.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'

const isMobile = inject('isMobile')
</script>

<style scoped>
.mobile-only-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  background-image: url('../../assets/mobile_error.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center top;

  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
}

.mask {
  width: 100%;
  height: 100%;
  background: linear-gradient(
  to bottom,
  rgba(255, 255, 255, 0.75),
  rgba(255, 255, 255, 0.95)
  );

  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 13%;
}

.content {
  text-align: center;
  max-width: 480px;
  padding: 0 24px;
}

.title {
  font-size: 22px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20px;
}

.main-text {
  font-size: 16px;
  color: #374151;
  margin-bottom: 8px;
}

.main-text1 {
  font-size: 16px;
  color: #374151;
  margin-bottom: 25px;
  margin-top: 8px;
}

.main-text span {
  color: #2563eb;
  font-weight: 600;
}

.sub-text {
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 28px;
}
</style>
