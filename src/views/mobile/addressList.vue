<template>
  <div class="contact-container">
    <header class="header">
      <div class="search-bar">
        <svg viewBox="0 0 24 24" class="icon"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        <input
          v-model.trim="keyword"
          class="search-input"
          type="text"
          placeholder="搜索姓名/工号/手机号/部门/岗位"
        />
      </div>
      <div class="mode-switch">
        <span :class="{ active: viewMode === 'alpha' }" @click="viewMode = 'alpha'">按姓名</span>
        <span :class="{ active: viewMode === 'dept' }" @click="viewMode = 'dept'">按部门</span>
      </div>
    </header>

    <main class="content">
      <div class="scroll-list">
        <section v-for="group in sortedData" :key="group.title" :id="'group-' + group.title">
          <div class="group-title">{{ group.title }}</div>
          <div class="contact-item" v-for="user in group.items" :key="user.staffID" @click="openEmployee(user)">
            <div class="avatar" :class="{ 'is-placeholder': !user.avatar }">
              <img v-if="user.avatar" :src="user.avatar" class="avatar-image" />
              <span v-else>{{ getNameInitial(user.staffName) }}</span>
            </div>
            <div class="info">
              <div class="name">{{ user.staffName }}</div>
              <div class="phone">{{ user.staffDept }} {{ user.staffPos }}</div>
            </div>
          </div>
        </section>
        <div v-if="!loading && sortedData.length === 0" class="empty-result">未找到匹配员工</div>
      </div>

      <nav class="alphabet-nav" v-if="viewMode === 'alpha' && alphaNavChars.length">
        <span 
          v-for="char in alphaNavChars" 
          :key="char" 
          @click="scrollToGroup(char)"
          :class="{ active: currentActiveChar === char }"
        >
          {{ char }}
        </span>
      </nav>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEmployeesStore } from '@/stores/employeesStore'

const router = useRouter()
const employeesStore = useEmployeesStore()

const viewMode = ref('alpha') // 'alpha' 或 'dept'
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const currentActiveChar = ref('A')
const keyword = ref('')

const loading = computed(() => employeesStore.loading)
const employees = computed(() => employeesStore.employees)

const pinyinCollator = new Intl.Collator('zh-CN-u-co-pinyin')
const pinyinInitialLetters = 'ABCDEFGHJKLMNOPQRSTWXYZ'.split('')
const pinyinInitialBoundaries = '阿八嚓哒妸发旮哈讥喀垃妈拿哦啪期然撒塌穵昔压匝'.split('')

const toPinyinInitial = (text) => {
  if (!text) return '#'
  const first = String(text).trim()[0]
  if (!first) return '#'

  if (/^[\u4e00-\u9fa5]$/.test(first)) {
    for (let i = pinyinInitialBoundaries.length - 1; i >= 0; i--) {
      if (pinyinCollator.compare(first, pinyinInitialBoundaries[i]) >= 0) {
        return pinyinInitialLetters[i]
      }
    }
    return '#'
  }

  const upper = first.toUpperCase()
  if (/[A-Z]/.test(upper)) return upper
  return '#'
}

const sortByPinyin = (a, b) => {
  return pinyinCollator.compare(a?.staffName || '', b?.staffName || '')
}

const filteredEmployees = computed(() => {
  const key = keyword.value.toLowerCase()
  if (!key) return employees.value

  return employees.value.filter(emp => {
    const searchText = [
      emp.staffID,
      emp.staffName,
      emp.staffPhone,
      emp.staffDept,
      emp.staffPos,
      emp.staffEmail
    ]
      .filter(Boolean)
      .join('|')
      .toLowerCase()

    return searchText.includes(key)
  })
})

// 数据分组逻辑
const sortedData = computed(() => {
  if (viewMode.value === 'alpha') {
    const grouped = filteredEmployees.value.reduce((acc, emp) => {
      const key = toPinyinInitial(emp.staffName)
      if (!acc[key]) acc[key] = []
      acc[key].push(emp)
      return acc
    }, {})

    const existing = Object.keys(grouped)
    const alphaOrdered = alphabet.filter(char => existing.includes(char))
    const rest = existing.filter(char => !alphabet.includes(char)).sort()
    const orderedKeys = [...alphaOrdered, ...rest]

    return orderedKeys.map(char => ({
      title: char,
      items: grouped[char].slice().sort(sortByPinyin)
    }))
  } else {
    const depts = [...new Set(filteredEmployees.value.map(u => u.staffDept).filter(Boolean))].sort((a, b) =>
      pinyinCollator.compare(a, b)
    )
    return depts.map(d => ({
      title: d,
      items: filteredEmployees.value.filter(u => u.staffDept === d).slice().sort(sortByPinyin)
    }));
  }
})

const alphaNavChars = computed(() => {
  if (viewMode.value !== 'alpha') return []
  return sortedData.value.map(group => group.title)
})

const getNameInitial = (name) => {
  if (!name) return '?'
  return String(name).trim().slice(-1)
}

const openEmployee = (employee) => {
  router.push({
    path: `/mobile/employee/${employee.staffID}`
  })
}

const scrollToGroup = (char) => {
  currentActiveChar.value = char
  const el = document.getElementById(`group-${char}`)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  if (!employeesStore.employees.length) {
    employeesStore.loadEmployees()
  }
})
</script>

<style scoped>
.contact-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  background: #fff;
  color: #333;
  font-family: -apple-system, sans-serif;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  justify-content: space-between;
}
.search-bar {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border-radius: 14px;
  border: 1px solid #e8ebf0;
  background-color: #f7f9fc;
}

.search-bar .icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  fill: #8c95a6;
}

.search-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #3d4655;
  padding: 10px 0;
}

.search-input::placeholder {
  color: #9aa3b2;
}

.mode-switch {
  display: flex;
  background: #f0f0f0;
  border-radius: 15px;
  padding: 2px;
}
.mode-switch span {
  padding: 4px 12px;
  font-size: 13px;
  cursor: pointer;
  border-radius: 13px;
}
.mode-switch span.active {
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* List Area */
.content {
  flex: 1;
  overflow: hidden;
  display: flex;
  position: relative;
}
.scroll-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px;
}
.group-title {
  font-weight: bold;
  padding: 15px 0 10px;
  font-size: 18px;
}
.contact-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 0.5px solid #f5f5f5;
  cursor: pointer;
}
.avatar {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  background: #eee;
  margin-right: 15px;
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar.is-placeholder {
  background: linear-gradient(135deg, #5b8cff, #64d4ff);
  color: #fff;
  font-weight: 600;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.name { font-weight: 500; font-size: 16px; }
.phone { font-size: 13px; color: #999; margin-top: 4px; }

.empty-result {
  text-align: center;
  color: #8e98a9;
  padding: 24px 0;
}

/* Side Alphabet */
.alphabet-nav {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 4px;
  font-size: 11px;
  color: #666;
  text-align: center;
}
.alphabet-nav span {
  padding: 1px 4px;
  cursor: pointer;
}
.alphabet-nav span.active {
  color: #fff;
  background: #48c9b0;
  border-radius: 2px;
}

</style>