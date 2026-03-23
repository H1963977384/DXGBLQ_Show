<template>
  <div class="mobile-page">
    <!-- Header / Cover -->
    <div class="cover">
      <img class="cover-img" src="../assets/profile_background.jpg" />
    </div>

    <div class="cover-actions">
      <button class="action-btn">
        <svg class="icon" viewBox="-0.5 -0.5 26 26" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/>
        </svg>
      </button>
      <button class="action-btn" @click="visible = true">
        <svg class="icon" viewBox="0.5 1 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect width="5" height="5" x="3" y="3" rx="1"/>
          <rect width="5" height="5" x="16" y="3" rx="1"/>
          <rect width="5" height="5" x="3" y="16" rx="1"/>
          <path d="M21 16h-3a2 2 0 0 0-2 2v3"/>
          <path d="M21 21v.01"/>
          <path d="M12 7v3a2 2 0 0 1-2 2H7"/>
          <path d="M3 12h.01"/>
          <path d="M12 3h.01"/>
          <path d="M12 16v.01"/>
          <path d="M16 12h1"/>
          <path d="M21 12v.01"/>
          <path d="M12 21v-1"/>
        </svg>
      </button>
    </div>

    <!-- Profile Card -->
    <div class="profile-card">
      <div class="avatar-wrapper">
        <img
          class="avatar"
          src="https://randomuser.me/api/portraits/men/32.jpg"
        />
      </div>

      <h2 class="name">{{ username }}</h2>
      <p class="username">{{ userdept }}{{ usergroup }} {{ userpos }}</p>

      <!-- Stats -->
      <div class="stats">
        <div class="stat" @click="handleBarClick(0)">
          <strong>208.25h</strong>
          <span>本月工时</span>
        </div>
        <div class="stat" @click="handleBarClick(1)">
          <strong>894</strong>
          <span>积分</span>
        </div>
        <div class="stat" @click="handleBarClick(2)">
          <strong>1.2K</strong>
          <span>Following</span>
        </div>
        <div class="stat" @click="handleBarClick(3)">
          <strong>1.2K</strong>
          <span>Following</span>
        </div>
      </div>
    </div>
    <el-dialog
      v-model="visible"
      width="80%"
      :style="{ maxWidth: '480px' }"
      center
    >
      <div class="card-container">
        <div class="card-name">{{ username }}</div>
        <div class="title">{{ userpos }}</div>
        <div class="company">{{ userdept }}{{ usergroup }}</div>

        <!-- 二维码 -->
        <div class="qrcode-box">
          <img :src="qrcodeUrl" alt="vcard qrcode" />
        </div>

      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { inject, computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import QRCode from 'qrcode'

const router = useRouter()
const route = useRoute()
const isMobile = inject('isMobile')

const userStore = useUserStore();

const username = computed(() => userStore.userInfo?.username || '用户');
const userdept = computed(() => userStore.userInfo.userdept);
const usergroup = computed(() => userStore.userInfo?.usergroup);
const userpos = computed(() => userStore.userInfo?.userpos || '员工');
const usertel = computed(() => userStore.userInfo?.usertel || '0744-3559999');

const visible = ref(false)
const qrcodeUrl = ref('')

/* ===== 在这里填写名片信息 ===== */
const cardInfo = {
  fullName: username.value,
  org: "张家界大峡谷旅游开发有限公司",
  title: userdept.value + usergroup.value + userpos.value,
  phone: usertel.value
}

/* 生成 vCard 字符串 */
function generateVCard() {
  return `
BEGIN:VCARD
VERSION:3.0
FN:${cardInfo.fullName}
ORG:${cardInfo.org}
TITLE:${cardInfo.title}
TEL:${cardInfo.phone}
END:VCARD
`.trim()
}

/* 生成二维码 */
async function generateQRCode() {
  const vcardText = generateVCard()
  qrcodeUrl.value = await QRCode.toDataURL(vcardText, {
    width: 220,
    margin: 2
  })
}

onMounted(() => {
  generateQRCode()
})

const handleBarClick = (index) => {
  switch (index) {
    case 0:
      router.push('/')
      break
    case 1:
      router.push('/scores/myscore')
      break
    case 2:
      router.push('/')
      break
    case 3:
      break
  }
}
</script>

<style scoped>
.mobile-page {
  width: 100%;
  margin: 0 auto;
  background: white;
  min-height: calc(100vh-120px);
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto;
}

.cover {
  height: 140px;
  position: relative;
  overflow: hidden;
  margin: 0 -20px;
  width: calc(100% + 40px);
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin: 10px 0 4px;
  padding: 0 4px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 12px;
  background: white;
  color: gray;
  backdrop-filter: blur(4px);
  cursor: pointer;
  margin-right: 5px;
  margin-left: -8px;
  margin-top: -5px;
}

.action-btn:active {
  transform: scale(0.96);
}

.profile-card {
  background: white;
  margin-top: -40px;
  border-top-left-radius: 28px;
  border-top-right-radius: 28px;
  padding: 60px 20px 90px;
  text-align: center;
}

.avatar-wrapper {
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 6px;
  border-radius: 50%;
}

.avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  object-fit: cover;
}

.name {
  margin-top: -20px;
  font-size: 22px;
  font-weight: 600;
}

.username {
  color: #888;
  margin-top: -14px;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin: 26px 0 16px;
}

.stat strong {
  display: block;
  font-size: 18px;
}

.stat span {
  font-size: 12px;
  color: #999;
}

.tabs {
  display: flex;
  justify-content: space-around;
  border-bottom: 1px solid #eee;
  margin-bottom: 16px;
}

.tab {
  padding: 10px 0;
  font-size: 14px;
  color: #999;
}

.tab.active {
  color: #5f7cff;
  border-bottom: 2px solid #5f7cff;
}

.info {
  text-align: left;
  font-size: 14px;
  color: #555;
  line-height: 1.8;
  margin-bottom: 20px;
}

.nav-item {
  font-size: 20px;
  color: #888;
}

.card-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0 20px;
}

.card-name {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.title {
  margin-top: 4px;
  font-size: 14px;
  color: #666;
}

.company {
  margin-top: 5px;
  font-size: 13px;
  color: #999;
}

.qrcode-box {
  /*margin-right: 7.25%;*/
  display: flex;
  align-items: center;
  margin-top: 22px;
  /*background: #fafafa;*/
  border-radius: 8px;
}

.qrcode-box img {
  width: 110%;
  height: 110%;
}

</style>
