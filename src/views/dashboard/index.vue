<template>
  <div v-if="isMobile" class="index-panel-mobile">
    <div class="greeting-panel">
      <h1 class="text-xl font-semibold mb-2">{{ greeting }}</h1>
      <p class="text-gray-500">千磨万击还坚劲，任尔东西南北风。</p>
    </div>
    <!--
    <div class="schedule-card1">
      <div class="header">
        <span class="title">我的排班</span>

        <select v-model="selectedMonth" class="month-select">
          <option
            v-for="m in monthOptions"
            :key="m.value"
            :value="m.value"
          >
            {{ m.label }}
          </option>
        </select>
      </div>

      <div class="weekdays">
        <span v-for="d in weekDays" :key="d">{{ d }}</span>
      </div>

      <div class="days">
        <span
          v-for="day in calendarDays"
          :key="day.key"
          class="day"
          :class="day.class"
          :title="day.label"
        >
          {{ day.text }}
        </span>
      </div>

      <div class="legend-container">
        <div class="legend-row">
          <span class="legend-item"><i class="dot work"></i> 上班</span>
          <span class="legend-item"><i class="dot off"></i> 休息</span>
          <span class="legend-item"><i class="dot annual"></i> 年假</span>
          <span class="legend-item"><i class="dot sick"></i> 病假</span>
          <span class="legend-item"><i class="dot injury"></i> 工伤</span>
          <span class="legend-item"><i class="dot marriage"></i> 婚假</span>
        </div>
        <div class="legend-row">
          <span class="legend-item"><i class="dot bereavement"></i> 丧假</span>
          <span class="legend-item"><i class="dot maternity"></i> 产假</span>
          <span class="legend-item"><i class="dot paternity"></i> 陪产假</span>
        </div>
      </div>
    </div>
    -->
  </div>
  
  <div v-if="!isMobile" class="index-panel">
    <div class="greeting-panel">
      <h1 class="text-xl font-semibold mb-2">{{ greeting }}</h1>
      <p class="text-gray-500">千磨万击还坚劲，任尔东西南北风。</p>
    </div>

    <div class="dashboard">
      <!--
      <div class="schedule-card">
        <div class="header">
          <span class="title">我的排班</span>

          <select v-model="selectedMonth" class="month-select">
            <option
              v-for="m in monthOptions"
              :key="m.value"
              :value="m.value"
            >
              {{ m.label }}
            </option>
          </select>
        </div>

        <div class="weekdays">
          <span v-for="d in weekDays" :key="d">{{ d }}</span>
        </div>

        <div class="days">
          <span
            v-for="day in calendarDays"
            :key="day.key"
            class="day"
            :class="day.class"
            :title="day.label"
          >
            {{ day.text }}
          </span>
        </div>

        <div class="legend-container">
          <div class="legend-row">
            <span class="legend-item"><i class="dot work"></i> 上班</span>
            <span class="legend-item"><i class="dot off"></i> 休息</span>
            <span class="legend-item"><i class="dot annual"></i> 年假</span>
            <span class="legend-item"><i class="dot sick"></i> 病假</span>
            <span class="legend-item"><i class="dot injury"></i> 工伤</span>
            <span class="legend-item"><i class="dot marriage"></i> 婚假</span>
          </div>
          <div class="legend-row">
            <span class="legend-item"><i class="dot bereavement"></i> 丧假</span>
            <span class="legend-item"><i class="dot maternity"></i> 产假</span>
            <span class="legend-item"><i class="dot paternity"></i> 陪产假</span>
          </div>
        </div>
      </div>
      -->
    </div>    
  </div>

  
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/userStore'

const isMobile = inject('isMobile')
const router = useRouter()

const user = ref({
  username: '',
  userbirthday: ''
})

const goSignin = () => {
  router.push('/mobile/signin')
}

const userStore = useUserStore()
user.value.username = computed(() => userStore.userInfo.username)
user.value.userbirthday = computed(() => userStore.userInfo.userbirthday) 

const isBirthdayToday = () => {
  if (!user.value.userbirthday) return false

  const idCardMonth = user.value.userbirthday.substring(0, 2)
  const idCardDay = user.value.userbirthday.substring(2, 4)
  
  // 获取今天的日期
  const today = new Date()
  const month = (today.getMonth() + 1).toString().padStart(2, '0')
  const day = today.getDate().toString().padStart(2, '0')
  
  // 比较月份和日期是否匹配
  return month === idCardMonth && day === idCardDay
}

// 根据时间段显示不同的问候语
const getGreeting = () => {
  const hour = new Date().getHours()
  
  // 如果是生日，返回生日祝福
  if (isBirthdayToday()) {
    return '🎉 生日快乐，' + user.value.username + '！🎂'
  }
  
  // 根据时间段显示不同的问候语
  if (hour >= 6 && hour < 12) {
    return '早上好，' + user.value.username + '，迎接美好新一天 ☀'
  } else if (hour >= 12 && hour < 14) {
    return '中午好，' + user.value.username + '，补充能量继续加油 🍜'
  } else if (hour >= 14 && hour < 18) {
    return '下午好，' + user.value.username + '，坚持就是胜利 💪'
  } else if (hour >= 18 && hour < 24) {
    return '晚上好，' + user.value.username + '，记得劳逸结合哦~ 🌙'
  } else {
    return user.value.username + '，时间不早了，注意休息哦~ 🌃'
  }
}

const greeting = getGreeting()

const year = 2026
const month = 2 // 1-12

const weekDays = ['一', '二', '三', '四', '五', '六', '日']

/* ================= 状态映射 ================= */
const STATUS_MAP = {
  0: { label: '休息', class: 'off' },
  1: { label: '上班', class: 'work' },
  2: { label: '年假', class: 'annual' },
  3: { label: '病假', class: 'sick' },
  4: { label: '工伤', class: 'injury' },
  5: { label: '婚假', class: 'marriage' },
  6: { label: '丧假', class: 'bereavement' },
  7: { label: '产假', class: 'maternity' },
  8: { label: '陪产假', class: 'paternity' }
}

/* =============== 年月选择 =============== */
const now = new Date()
const selectedYear = ref(now.getFullYear())
const selectedMonth = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)

/* 下拉：最近 n 个月 */
const monthOptions = computed(() => {
  const options = []
  for (let i = -2; i <= 1; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    options.push({
      value,
      label: d.toLocaleString('zh-CN', { month: 'short', year: 'numeric' })
    })
  }
  return options
})

/* =============== 何杰鸣 接口返回的排班数据 =============== */
const scheduleList = ref([
  1, 1, 0, 1, 1, 0, 0,
  1, 1, 1, 0, 2, 2, 0,
  1, 1, 3, 0, 1, 0, 0,
  1, 1, 1, 0, 4, 0, 0,
  1, 0, 0
])

/* =============== 日历生成 =============== */
const calendarDays = computed(() => {
  const [year, month] = selectedMonth.value.split('-').map(Number)
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const offset = (firstDay.getDay() + 6) % 7

  const days = []

  for (let i = 0; i < offset; i++) {
    days.push({ key: `e-${i}`, text: '', class: 'empty' })
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const statusCode = scheduleList.value[d - 1]
    const status = STATUS_MAP[statusCode] || {}

    days.push({
      key: d,
      text: d,
      class: status.class,
      label: status.label
    })
  }

  return days
})
</script>

<style scoped>
.index-panel-mobile {
  height: calc(100vh - 120px);
  display: flex;
  padding: 8px 15px;
  background-color: #F8F8F8;
  flex-wrap: wrap;
  justify-content: space-between;
  overflow: auto;
}

.index-panel {
  height: 100vh;
  display: flex;
  padding: 8px 15px;
  overflow: hidden;
  background-color: #F8F8F8;
  flex-wrap: wrap;
  justify-content: space-between;
}

.greeting-panel {
  width: 100vw;
  padding: 0px 15px;
  border-radius: 8px;
}

.dashboard{
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: -150px;
}

.schedule-card {
  width: 350px;
  height: 465px;
  padding: 16px;
  border-radius: 18px;
  background: #1f242b;
  color: #fff;
  position: relative;
}

.schedule-card1 {
  width: 100vw;
  height: 465px;
  padding: 16px;
  border-radius: 18px;
  background: #1f242b;
  color: #fff;
  position: relative;
}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 18px;
  margin-top: 4px;
}

.title {
  font-size: 14.5px;
  margin-left: 8px;
}

.month-select {
  background: transparent;
  color: #fff;
  background-color: #1f242b;
  border: none;
  font-size: 13.5px;
  cursor: pointer;
}

.weekdays,
.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-top: 15px;
  text-align: center;
}

.weekdays span {
  font-size: 13px;
  opacity: 0.6;
}

.day {
  width: 35px;
  height: 35px;
  line-height: 35px;
  margin: 6.5px auto;
  border-radius: 50%;
  font-size: 14px;
}

/* ===== 状态颜色 ===== */
.work { background: #4caf50; }
.off { background: #555; }
.annual { background: #f5c842; color: #000; }
.sick { background: #e53935; }
.injury { background: #ff7043; }
.marriage { background: #ec407a; }
.bereavement { background: #8d6e63; }
.maternity { background: #ab47bc; }
.paternity { background: #42a5f5; }

.empty {
  pointer-events: none;
}

.legend-container {
  position: absolute;
  bottom: 17px;
  left: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 13px;
  opacity: 0.9;
  white-space: nowrap;
}

.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 5px;
  flex-shrink: 0;
}

.dot.work { background: #4caf50; }
.dot.off { background: #555; }
.dot.annual { background: #f5c842; }
.dot.sick { background: #e53935; }
.dot.injury { background: #ff7043; }
.dot.marriage { background: #ec407a; }
.dot.bereavement { background: #8d6e63; }
.dot.maternity { background: #ab47bc; }
.dot.paternity { background: #42a5f5; }

</style>