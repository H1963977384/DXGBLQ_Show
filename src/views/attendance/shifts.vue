<template>
	<div :class="isMobile ? 'shifts-page-mobile' : 'shifts-page'">
		<div class="bg-bubble bubble-1"></div>
		<div class="bg-bubble bubble-2"></div>
		<img class="corner-image" src="@/assets/bw.png" alt="corner decoration" />

		<div :class="isMobile ? 'schedule-card-mobile' : 'schedule-card'">
			<div class="header">
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

			<!--
			<div class="month-summary">
				<div class="summary-item">
					<div class="summary-label">本月工作天数</div>
					<div class="summary-value">{{ monthSummary.completedWorkDays }}<span class="summary-suffix">/{{ monthSummary.totalWorkDays }}</span></div>
				</div>
				<div class="summary-item">
					<div class="summary-label">本月总工时</div>
					<div class="summary-value">{{ monthSummary.completedHours }}<span class="summary-suffix">h</span></div>
				</div>
			</div>
			-->

			<div class="weekdays">
				<span v-for="d in weekDays" :key="d">{{ d }}</span>
			</div>

			<div class="days">
				<div
					v-for="day in calendarDays"
					:key="day.key"
					class="day-cell"
				>
					<div v-if="day.text !== ''" class="day">
						{{ day.text }}
					</div>
					<div v-if="day.text !== ''" :class="['day-status', `status-${day.statusClass}`]">
						<div class="status-label">{{ day.label }}</div>
						<!--<div class="shift-time">{{ day.shiftTime }}</div>-->
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue'
import { useDepartmentStore } from '@/stores/DepartmentStore'

const isMobile = inject('isMobile', false)
const departmentStore = useDepartmentStore()

onMounted(() => {
	// 初始化加载部门数据
	departmentStore.loadDepartments()
})

const weekDays = ['一', '二', '三', '四', '五', '六', '日']

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

// 假设当前部门 ID，后续从员工信息获取
const currentDeptId = ref(1)

const now = new Date()
const selectedMonth = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)

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

const scheduleList = ref([
	1, 1, 0, 1, 1, 0, 0,
	1, 1, 1, 0, 2, 2, 0,
	1, 1, 3, 0, 1, 0, 0,
	1, 1, 1, 0, 4, 0, 0,
	1, 0, 0
])

// 获取班别和考勤时间信息
const shiftInfo = computed(() => {
	const dept = departmentStore.departments.find(d => d.DeptID === currentDeptId.value)
	if (!dept) return '暂无班别信息'

	// 根据 ShiftType 和考勤规则组织信息
	let shiftName = '常规班'
	let attendanceTime = ''

	if (dept.AttendanceRule1Start) {
		attendanceTime = dept.AttendanceRule1Start
		// 格式化时间：0830 -> 08:30
		attendanceTime = attendanceTime.substring(0, 2) + ':' + attendanceTime.substring(2)
	}

	if (dept.ShiftType === 1) {
		shiftName = '夜班'
	} else if (dept.ShiftType === 2) {
		shiftName = '早班'
	}

	return attendanceTime ? `${shiftName}\n${attendanceTime}` : shiftName
})

const getShiftTime = () => {
	const dept = departmentStore.departments.find(d => d.DeptID === currentDeptId.value)
	if (!dept || !dept.AttendanceRule1Start) return ''

	const time = dept.AttendanceRule1Start
	return time.substring(0, 2) + ':' + time.substring(2)
}

const parseTimeToMinutes = (timeStr) => {
	if (!timeStr || timeStr.length !== 4) return null
	const h = Number(timeStr.substring(0, 2))
	const m = Number(timeStr.substring(2, 4))
	if (Number.isNaN(h) || Number.isNaN(m)) return null
	return h * 60 + m
}

const durationMinutes = (start, end) => {
	const startMin = parseTimeToMinutes(start)
	const endMin = parseTimeToMinutes(end)
	if (startMin === null || endMin === null) return 0
	if (endMin >= startMin) return endMin - startMin
	return 24 * 60 - startMin + endMin
}

const dailyWorkHours = computed(() => {
	const dept = departmentStore.departments.find(d => d.DeptID === currentDeptId.value)
	if (!dept) return 8

	const minutes1 = durationMinutes(dept.AttendanceRule1Start, dept.AttendanceRule1End)
	const minutes2 = durationMinutes(dept.AttendanceRule2Start, dept.AttendanceRule2End)
	const totalMinutes = minutes1 + minutes2
	if (totalMinutes <= 0) return 8
	return totalMinutes / 60
})

const monthSummary = computed(() => {
	const [year, month] = selectedMonth.value.split('-').map(Number)
	const daysInMonth = new Date(year, month, 0).getDate()
	const today = new Date()

	let completedLimit = daysInMonth
	if (year === today.getFullYear() && month === today.getMonth() + 1) {
		completedLimit = today.getDate()
	} else if (new Date(year, month - 1, 1) > new Date(today.getFullYear(), today.getMonth(), 1)) {
		completedLimit = 0
	}

	let totalWorkDays = 0
	let completedWorkDays = 0

	for (let d = 1; d <= daysInMonth; d++) {
		const statusCode = scheduleList.value[d - 1]
		if (statusCode === 1) {
			totalWorkDays += 1
			if (d <= completedLimit) completedWorkDays += 1
		}
	}

	const completedHours = (completedWorkDays * dailyWorkHours.value).toFixed(1)

	return {
		totalWorkDays,
		completedWorkDays,
		completedHours
	}
})

const calendarDays = computed(() => {
	const [year, month] = selectedMonth.value.split('-').map(Number)
	const firstDay = new Date(year, month - 1, 1)
	const lastDay = new Date(year, month, 0)
	const offset = (firstDay.getDay() + 6) % 7
	const shiftTime = getShiftTime()

	const days = []

	for (let i = 0; i < offset; i++) {
		days.push({ key: `e-${i}`, text: '', label: '', statusClass: '', shiftTime: '' })
	}

	for (let d = 1; d <= lastDay.getDate(); d++) {
		const statusCode = scheduleList.value[d - 1]
		const status = STATUS_MAP[statusCode] || { label: '', class: '' }

		days.push({
			key: d,
			text: d,
			label: status.label,
			statusClass: status.class,
			shiftTime: shiftTime
		})
	}

	return days
})
</script>

<style scoped>
.shifts-page-mobile {
	position: relative;
	overflow-x: hidden;
	overflow-y: auto;
	min-height: calc(100vh - 120px);
	display: flex;
	padding: 10px;
	justify-content: center;
	align-items: flex-start;
	background: transparent;
}

.shifts-page {
	position: relative;
	overflow-x: hidden;
	overflow-y: auto;
	min-height: calc(100vh - 72px);
	display: flex;
	padding: 12px;
	justify-content: center;
	align-items: flex-start;
	background: transparent;
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
	opacity: 0.35;
	pointer-events: none;
	z-index: 1;
}

.schedule-card {
	width: min(100%, 520px);
	padding: 14px;
	border-radius: 12px;
	color: #000;
	position: relative;
	z-index: 2;
	backdrop-filter: blur(2px);
}

.schedule-card-mobile {
	width: 100%;
	padding: 14px;
	border-radius: 12px;
	color: #000;
	position: relative;
	z-index: 2;
	backdrop-filter: blur(2px);
}

.header {
	display: flex;
	justify-content: space-between;
	margin-bottom: 12px;
	margin-top: 2px;
}

.title {
	font-size: 14.5px;
	margin-left: 8px;
	color: #000;
}

.month-select {
	background-color: rgba(255, 255, 255, 0.9);
	color: #000;
	border: 1px solid #dde4ef;
	font-size: 16px;
	font-weight: 600;
	cursor: pointer;
	padding: 7px 12px;
	border-radius: 8px;
}

.month-select:hover {
	border-color: #b7c6df;
}

.month-summary {
	display: flex;
	justify-content: space-between;
	gap: 10px;
	margin-top: 6px;
	margin-bottom: 14px;
}

.summary-item {
	flex: 1;
	background-color: rgba(255, 255, 255, 0.88);
	border: 1px solid #e6edf8;
	border-radius: 10px;
	padding: 10px 12px;
	color: #2b3954;
}

.summary-label {
	font-size: 12px;
	font-weight: 600;
	color: #64748b;
	line-height: 1.2;
}

.summary-value {
	margin-top: 6px;
	font-size: 24px;
	font-weight: 700;
	line-height: 1;
}

.summary-suffix {
	font-size: 14px;
	font-weight: 600;
	color: #6b7a92;
	margin-left: 2px;
}


.weekdays,
.days {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	margin-top: 10px;
	gap: 6px;
}

.weekdays {
	margin-bottom: 6px;
}

.weekdays span {
	font-size: 14.5px;
	color: #4f617f;
	text-align: center;
	font-weight: 550;
	padding: 4px 0;
}

.day-cell {
	display: flex;
	flex-direction: column;
	text-align: center;
	width: 47px;
	min-height: 72px;
	padding: 6px 4px;
	border-radius: 8px;
	background: rgba(255, 255, 255, 0.82);
	border: 1px solid #edf2fb;
}

@media (max-width: 480px) {
	.month-summary {
		gap: 8px;
	}

	.summary-item {
		padding: 8px 10px;
	}

	.summary-value {
		font-size: 20px;
	}

	.weekdays,
	.days {
		gap: 4px;
	}

	.day {
		font-size: 16px;
	}

	.day-status {
		padding: 4px 5px;
	}
}

.day {
	font-size: 18px;
	font-weight: 700;
	color: #000;
	padding: 3px 0;
	line-height: 1.1;
}

.day-status {
	font-size: 13px;
	color: #000;
	padding: 5px 6px;
	margin-top: 2px;
	border-radius: 6px;
	display: flex;
	flex-direction: column;
	gap: 2px;
	margin-top: auto;
}

.status-label {
	font-weight: 600;
	font-size: 12px;
	line-height: 1.1;
}

.shift-time {
	font-size: 11px;
	opacity: 0.85;
}

.status-work {
	background-color: #c8e6c9;
	color: #1b5e20;
}

.status-off {
	background-color: #e0e0e0;
	color: #424242;
}

.status-annual {
	background-color: #fff9c4;
	color: #f57f17;
}

.status-sick {
	background-color: #ffccbc;
	color: #d84315;
}

.status-injury {
	background-color: #ffe0b2;
	color: #e65100;
}

.status-marriage {
	background-color: #f8bbd0;
	color: #c2185b;
}

.status-bereavement {
	background-color: #d7ccc8;
	color: #3e2723;
}

.status-maternity {
	background-color: #e1bee7;
	color: #6a1b9a;
}

.status-paternity {
	background-color: #bbdefb;
	color: #0d47a1;
}
</style>
