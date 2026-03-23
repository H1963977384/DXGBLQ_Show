<template>
  <header v-if="isMobile" class="app-header">
    <button class="back-btn" @click="goBack">
      <el-icon class="back-icon"><ArrowLeft /></el-icon>
    </button>

    <div class="page-title">{{ pageTitle }}</div>

    <el-dropdown v-if="!isProfilePage" class="right-area" @command="handleUserCommand">
      <div class="user-info">
        <el-icon><ArrowDown /></el-icon>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item>
            {{ username }}
          </el-dropdown-item>
          <el-dropdown-item divided command="changePassword">
            <el-icon><Setting /></el-icon> 更改密码
          </el-dropdown-item>
          <el-dropdown-item divided command="logout">
            <el-icon><SwitchButton /></el-icon> 退出登录
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <el-dialog
      v-model="dialogVisible"
      :title='"更改密码"'
      width="85%"
      :style="{ maxWidth: '480px' }"
      destroy-on-close
      @close="resetPasswordForm"
    >
      <el-form label-width="35%">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <el-form-item label="旧密码" required>
              <el-input 
                v-model="passwordForm.oldPassword" 
                type="password" 
                placeholder="请输入旧密码" 
                show-password
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <el-form-item label="新密码" required>
              <el-input 
                v-model="passwordForm.newPassword" 
                type="password" 
                placeholder="请输入新密码" 
                show-password
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <el-form-item label="确认新密码" required>
              <el-input 
                v-model="passwordForm.confirmPassword" 
                type="password" 
                placeholder="请再次输入新密码" 
                show-password
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleChangePassword">保存</el-button>
      </template>
    </el-dialog>
  </header>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowDown, ArrowLeft, User, Setting, SwitchButton } from '@element-plus/icons-vue'

import { useUserStore } from '../../stores/userStore'

const isMobile = inject('isMobile')
const router = useRouter()
const route = useRoute()

const isProfilePage = computed(() => route.path === '/profile')

const userStore = useUserStore()
const username = computed(() => userStore.userInfo?.username || '用户')

// 页面标题映射
const pageTitleMap = {
  '/': '首页',
  '/organization/department': '部门管理',
  '/organization/staffPosition': '职位管理',
  '/vehicle/info': '车辆信息',
  '/dormitory/info': '宿舍信息',
  '/hr/employeesInfo': '员工信息',
  '/settings': '系统设置',
  '/mobile/signin': '打卡',
  '/mobile/functions': '功能',
  '/mobile/notifications': '通知',
  '/mobile/addressList': '企业通讯录',
  '/scores/lottery': '抽奖',
  '/scores/myscore': '我的积分',
  '/attendance/shifts': '我的排班',
  '/salaries/mysalary': '我的工资'
}

// 根据路由动态获取页面标题
const pageTitle = computed(() => {
  return pageTitleMap[route.path]
})

// 更改密码相关
const dialogVisible = ref(false)
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const resetPasswordForm = () => {
  passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
}

function goBack() {
  // 检查是否有 token，有则返回主页，无则返回登录页
  const token = localStorage.getItem('token')
  if (token) {
    if (window.history.length > 1) {
      router.back()
    } else {
      window.location.href = '/'
    }
  } else {
    window.location.href = '/login'
  }
}

const handleUserCommand = (command) => {
  switch (command) {
    case 'changePassword':
      dialogVisible.value = true
      break
    case 'logout':
      handleLogout()
      break
  }
}

const handleChangePassword = async () => {
  // 验证表单
  if (!passwordForm.value.oldPassword) {
    ElMessage.warning('请输入旧密码')
    return
  }
  if (!passwordForm.value.newPassword) {
    ElMessage.warning('请输入新密码')
    return
  }
  if (!passwordForm.value.confirmPassword) {
    ElMessage.warning('请输入确认新密码')
    return
  }
  
  // ①判断两次输入的新密码是否一致
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    ElMessage.error('两次输入的新密码不一致')
    return
  }
  
  // ②新密码与旧密码不一致
  if (passwordForm.value.oldPassword === passwordForm.value.newPassword) {
    ElMessage.error('新密码不能与旧密码相同')
    return
  }
  
  // 此处可接入后端接口
  ElMessage.success('密码已更新')
  dialogVisible.value = false
  resetPasswordForm()
}

const handleLogout = () => {
  // 何杰鸣 退出后需要清空所有用户信息
  console.log('退出登录')
  router.push('/login')
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 50px;
  padding: 0 12px;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px; /* 增大按钮尺寸 */
  height: 40px;
  border: none;
  border-radius: 12px; /* 更圆润的边角 */
  background-color: #fff;
  color: #000; /* 确保图标颜色为白色 */
  cursor: pointer;
}

.back-btn .back-icon {
  font-size: 24px; /* 增大图标尺寸 */
  font-weight: bold; /* 加粗图标 */
}

.page-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #000;
  margin-bottom: 1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.right-area {
  margin-left: auto;
  margin-right: 13px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
}

.logo-img {
  height: 32px;
  width: 32px;
  border-radius: 50%;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>