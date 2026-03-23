<template>
  <div class="employee-detail">
    <div class="bg-bubble bubble-1"></div>
    <div class="bg-bubble bubble-2"></div>
    <img class="corner-image" src="@/assets/bw.png" alt="corner decoration" />

    <main class="detail-body" v-if="employee">
      <div class="profile-card">
        <div class="avatar">{{ employee.staffName?.slice(-1) || '?' }}</div>
        <div class="main-info">
          <div class="name-line">
            <div class="name">{{ employee.staffName }}</div>
            <span v-if="namePinyin" class="name-pinyin">{{ namePinyin }}</span>
          </div>
          <div class="meta">{{ employee.staffPos }}</div>
        </div>
      </div>

      <section class="info-list">
        <div class="row">
          <span class="label">所属部门</span>
          <a class="value">
            {{ employee.staffDept }}
          </a>
        </div>

        <div class="row">
          <span class="label">联系方式</span>
          <a
            v-if="employee.staffPhone"
            class="value value-link"
            :href="getTelHref(employee.staffPhone)"
          >
            {{ employee.staffPhone }}
          </a>
          <span v-else class="value">未设置</span>
        </div>
      </section>

      <section class="qr-card">
        <div class="qrcode-box" v-if="qrcodeUrl">
          <img :src="qrcodeUrl" alt="employee vcard qrcode" />
        </div>
      </section>
    </main>

    <div class="status" v-else-if="loading">加载中...</div>
    <div class="status" v-else>未找到该员工</div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useEmployeesStore } from '@/stores/employeesStore'
import QRCode from 'qrcode'
import { pinyin } from 'pinyin-pro'

const route = useRoute()
const employeesStore = useEmployeesStore()

const employeeId = computed(() => String(route.params.id || ''))
const loading = computed(() => employeesStore.loading)
const employee = computed(() => employeesStore.getEmployeeById(employeeId.value))
const qrcodeUrl = ref('')

const namePinyin = computed(() => {
  const name = employee.value?.staffName || ''
  if (!name || !/[\u4e00-\u9fa5]/.test(name)) return ''

  const list = pinyin(name, {
    toneType: 'none',
    type: 'array'
  })

  return list
    .map(item => item.charAt(0).toUpperCase() + item.slice(1))
    .join(' ')
})

const generateVCard = () => {
  if (!employee.value) return ''

  return `
BEGIN:VCARD
VERSION:3.0
FN:${employee.value.staffName || ''}
ORG:张家界大峡谷旅游开发有限公司
TITLE:${employee.value.staffDept || ''} ${employee.value.staffPos || ''}
TEL:+86 ${employee.value.staffPhone || ''}
EMAIL:${employee.value.staffEmail || ''}
END:VCARD
`.trim()
}

const generateQRCode = async () => {
  const vcardText = generateVCard()
  if (!vcardText) {
    qrcodeUrl.value = ''
    return
  }

  qrcodeUrl.value = await QRCode.toDataURL(vcardText, {
    width: 220,
    margin: 2,
    color: {
      dark: '#1f2a3d',
      light: '#0000'
    }
  })
}

const getTelHref = (phone) => {
  const normalized = String(phone || '').replace(/[\s-]/g, '')
  return `tel:${normalized}`
}

onMounted(() => {
  if (!employeesStore.employees.length) {
    employeesStore.loadEmployees()
  }
})

watch(employee, () => {
  generateQRCode()
}, { immediate: true })
</script>

<style scoped>
.employee-detail {
  position: relative;
  overflow: hidden;
  height: calc(100vh - 120px);
  background: transparent;
  color: #1f2a3d;
}

.detail-body {
  position: relative;
  z-index: 2;
  padding: 14px;
  margin-top: 3%;
  background: transparent;
  background-color: transparent !important;
}

.bg-bubble {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
}

.bubble-1 {
  width: 170px;
  height: 170px;
  top: -45px;
  left: -45px;
  background: rgba(132, 173, 255, 0.26);
}

.bubble-2 {
  width: 120px;
  height: 120px;
  top: 190px;
  right: -35px;
  background: rgba(96, 216, 255, 0.22);
}

.corner-image {
  position: absolute;
  right: -15%;
  bottom: -15%;
  width: 80%;
  opacity: 0.4;
  pointer-events: none;
  z-index: 1;
}

.profile-card {
  background: transparent;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, #5b8cff, #64d4ff);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  font-weight: 600;
  margin-right: 12px;
}

.name {
  font-size: 30px;
  font-weight: 600;
}

.name-line {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.name-pinyin {
  font-size: 16.5px;
  color: #6f7f99;
  letter-spacing: 0.4px;
  margin-bottom: 4px;
}

.meta {
  margin-top: 2%;
  color: #6a778a;
  font-size: 17.5px;
}

.info-list {
  background: transparent;
  border-radius: 12px;
  margin-top: 8%;
  overflow: hidden;
}

.qr-card {
  background: transparent;
  border-radius: 12px;
  padding: 16px;
  margin-top: 5%;
  text-align: center;
}

.qrcode-box {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}

.qrcode-box img {
  width: 70%;
  height: 70%;
}

.row {
  background: transparent;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 13px 14px;
  border-bottom: 1px solid #f0f3f8;
}

.row:last-child {
  border-bottom: none;
}

.label {
  color: #75829a;
  font-size: 19px;
  width: 25%;
}

.value {
  color: #22324a;
  text-align: right;
  word-break: break-all;
  font-size: 19px;
}

.value-link {
  color: #2f6bff;
  text-decoration: none;
}

.status {
  position: relative;
  z-index: 2;
  padding: 40px 0;
  text-align: center;
  color: #7b879c;
}
</style>
