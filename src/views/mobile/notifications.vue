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
  <div v-if="isMobile" class="message-container">

    <div class="message-list">
      <div 
        v-for="(msg, index) in store.messages" 
        :key="msg.id" 
        class="swipe-item-wrapper"
      >
        <div 
          class="message-item"
        >
          <div class="content-box">
            <div class="content-top">
              <span class="msg-title">
                <span v-if="msg.status === '未读'" class="unread-dot"></span>
                {{ msg.title }}
              </span>
              <span class="msg-time">{{ msg.time }}</span>
            </div>
            <p class="msg-text">{{ msg.content }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, ref, reactive } from 'vue';
import { useMessageStore } from '../../stores/messageStore';

const isMobile = inject('isMobile')
const store = useMessageStore();
</script>

<style scoped>
.mobile-only-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  /* 🔹 在这里替换成你找到的插画背景图片 */
  background-image: url('../../assets/mobile_error.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center top;

  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc; /* 图片加载失败时的兜底背景 */
}

/* 遮罩层，防止图片太亮影响文字阅读 */
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
  padding-bottom: 13%; /* 控制文字整体下移 */
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

.message-container {
  width: 100%;
  max-width: 100vw;
  background-color: #fff;
  overflow-x: hidden;
  position: relative;
  margin-top: 8px;
  margin-bottom: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
}
.read-btn { background-color: #1890ff; }
.unread-btn { background-color: #faad14; }

.message-item {
  position: relative;
  z-index: 2;
  background: white;
  display: flex;
  padding: 12px 15px;
  align-items: center;
  will-change: transform;
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
}

/* 消息列表 */
.message-list {
  background: #fff;
}

.content-box { margin-left: 5px; margin-right: 5px; flex: 1; overflow: hidden; }
.content-top { display: flex; justify-content: space-between; align-items: center; }
.msg-title { font-weight: bold; font-size: 16px; color: #000; display: flex; align-items: center; gap: 6px; }
.unread-dot { width: 8px; height: 8px; background-color: #ff4d4f; border-radius: 50%; flex-shrink: 0; }
.msg-time { font-size: 12px; color: #999; }
.msg-text { color: #999; font-size: 14px; margin-top: 7.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>