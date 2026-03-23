<template>
  <div class="login-page" :class="{ 'mobile-mode': isMobile }">
    <div class="full-bg-gray"></div>

    <div v-if="isMobile" class="mobile-static-bubbles">
      <span class="bubble b1"></span>
      <span class="bubble b2"></span>
      <span class="bubble b3"></span>
      <span class="bubble b4"></span>
    </div>

    <div class="login-container">
      <div class="login-panel">
        <div class="login-content">
          <h1 class="title">欢迎回来</h1>
          <p class="subtitle">统一办公与业务管理平台</p>

          <el-form class="login-form" size="large">
            <el-form-item>
              <el-input v-model="username" placeholder="用户名" :prefix-icon="User" />
            </el-form-item>
            <el-form-item>
              <el-input v-model="password" type="password" placeholder="密码" :prefix-icon="Lock" show-password />
            </el-form-item>
            <el-button type="primary" class="login-btn" @click="login" :loading="loading">进入系统</el-button>
            <div class="extra-actions">
              <el-button color="white" link @click="resetPassword">忘记密码？</el-button>
            </div>
          </el-form>
        </div>
      </div>

      <div v-if="!isMobile" class="login-visual">
        <div class="visual-inner">
          <div class="brand-oa">OA OA OA OA OA OA OA OA OA OA OA OA OA OA OA OA OA OA OA OAOA OA OA OA OA OA OA OA OA OA OA OA OA OA OA OA OA OA OA OA</div>
          <div class="visual-text">
            <h2>高效协作</h2>
            <p>数字化工作空间解决方案</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 重置密码对话框 -->
    <el-dialog
      v-model="resetPasswordVisible"
      title="重置密码"
      width="85%"
      :style="{ maxWidth: '480px' }"
      destroy-on-close
      class="reset-password-dialog"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form :model="resetForm" label-width="30%" class="reset-form">
        <el-form-item label="手机号码" required>
          <el-input v-model="resetForm.username" placeholder="请输入手机号码" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resetPasswordVisible = false">取消</el-button>
          <el-button type="primary" @click="submitResetPassword">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { login as loginApi } from '../../api/login'
import { useUserStore } from '../../stores/userStore'

const router = useRouter()
const userStore = useUserStore()

// 判断是否为触摸设备
const isMobile = ref(false)

const checkIsTouchDevice = () => {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  )
}

onMounted(() => {
  isMobile.value = checkIsTouchDevice()
})
const username = ref('')
const password = ref('')
const loading = ref(false)
// 国内手机号码前三位号段池
const allowedUsernamePrefixes = ['130', '131', '132', '133', '134', '135', '136', '137',
                                 '138', '139', '144', '145', '146', '147', '148', '149',
                                 '150', '151', '152', '153', '155', '156', '157', '158',
                                 '159', '166', '167', '171', '172', '173', '174', '175', 
                                 '176', '177', '178', '180', '181', '182', '183', '184', 
                                 '185', '186', '187', '188', '189', '190', '191', '192', 
                                 '193', '195', '196', '197', '198', '199']


// 重置密码相关
const resetPasswordVisible = ref(false)
const resetForm = ref({username: ''})

// 何杰鸣 登录
const login = () => {
  if (!username.value || !password.value) {
    ElMessage.error('请输入用户名和密码')
    return
  }
  loading.value = true
  
  // 模拟登录
  try {
    userStore.setUserInfo({
      username: username.value,
      password: password.value
    })
    
    // 设置 token（模拟）
    localStorage.setItem('token', 'mock-token-' + Date.now())
    
    // 延迟一下确保状态更新
    setTimeout(() => {
      loading.value = false
      ElMessage.success('登录成功')
      router.push('/')
    }, 100)
  } catch (error) {
    loading.value = false
    console.error('登录错误:', error)
    ElMessage.error('登录失败，请重试')
  }
  
  // loginApi(username.value, password.value)
  //   .then(res => {
  //     if (res.data.code==200) {
  //       // localStorage.setItem('token', res.data.token)
  //       localStorage.setItem('user',res.data.data)
  //       // userStore.setUserInfo({
  //       //   id: res.data.userId,
  //       //   name: res.data.username
  //       // })
  //       ElMessage.success('登录成功')
  //       router.push('/')
  //     }
  //     else{
  //       ElMessage.error(res.data.message)
  //     }
  //   })
  //   .catch(error => {
  //     console.log(error)
  //     ElMessage.error(error)
  //   })
}

// 打开重置密码对话框
const resetPassword = () => {
  resetForm.value = {username: ''}
  resetPasswordVisible.value = true
}

// 提交重置密码
const submitResetPassword = () => {
  if (!resetForm.value.username) {
    ElMessage.warning('请输入手机号码')
    return
  }
  
  // 验证1：检查是否为11位数字
  if (!/^\d{11}$/.test(resetForm.value.username)) {
    ElMessage.error('请输入正确的手机号')
    return
  }
  
  // 验证2：检查前3位是否在允许列表中
  const prefix = resetForm.value.username.substring(0, 3)
  if (!allowedUsernamePrefixes.includes(prefix)) {
    ElMessage.error(`请输入正确的手机号`)
    return
  }
  
  // 调用重置密码API
  // 何杰鸣
  // 【预留】若重置密码API返回失败，则提示如下报错
  // ElMessage.error(`未找到该手机号绑定的用户，请检查后重新输入`)
  ElMessage.success('密码重置成功，请重新登录')
  resetPasswordVisible.value = false
  resetForm.value = {
    username: '',
  }
}
</script>

<style scoped>
.full-bg-gray {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  background: radial-gradient(circle at 20% 20%, #f7f8fa 0%, #ebedf0 100%);
}

.login-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  overflow: hidden;
  position: relative;
}

.login-container {
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 10;
}

.login-panel {
  flex: 0 0 550px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  transition: all 0.5s cubic-bezier(0.6, 0.05, 0.01, 0.99);
}

.login-content {
  width: 100%;
  max-width: 360px;
}

.title {
  font-size: 32px;
  font-weight: 700;
  color: #1d2129;
  margin-bottom: 8px;
}

.subtitle {
  color: #3c3e41;
  margin-bottom: 48px;
  font-size: 15px;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.login-btn {
  width: 100%;
  height: 48px;
  border-radius: 8px;
  background: #4c6ef5;
  border: none;
  font-size: 16px;
  margin-top: 10px;
}

.login-visual {
  flex: 1;
  position: relative;
  background: linear-gradient(135deg, #4c6ef5 0%, #3451b2 100%);
  display: flex;
  align-items: center;
  padding-left: 120px;
  border-top-left-radius: 200px 50%;
  border-bottom-left-radius: 200px 50%;
  box-shadow: -15px 0 30px rgba(0, 0, 0, 0.05);
  transition: all 0.7s cubic-bezier(0.6, 0.05, 0.01, 0.99);
  overflow: hidden;
}

.visual-inner {
  color: white;
}

.brand-oa {
  font-size: 140px;
  font-weight: 900;
  opacity: 0.06;
  position: absolute;
  left: -30px;
  top: -110px;
}

.visual-text h2 {
  font-size: 42px;
  margin-bottom: 12px;
}

.visual-text p {
  font-size: 18px;
  opacity: 0.8;
}

.extra-actions {
  margin-top: 16px;
  color: white;
}

/* 重置密码对话框样式 */
:deep(.reset-password-dialog .el-dialog) {
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
}

:deep(.reset-password-dialog .el-dialog__header) {
  border-bottom: 1px solid #ebeef5;
  padding: 24px 24px 16px;
}

:deep(.reset-password-dialog .el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

:deep(.reset-password-dialog .el-dialog__body) {
  padding: 24px;
}

:deep(.reset-password-dialog .el-form-item__label) {
  font-weight: 500;
}

:deep(.reset-password-dialog .el-input__wrapper) {
  border-radius: 6px;
  background: #f5f7fa;
}

:deep(.reset-password-dialog .dialog-footer) {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #ebeef5;
  background: #fafafa;
}

:deep(.reset-password-dialog .el-button) {
  border-radius: 6px;
  padding: 8px 20px;
}

/* 手机端样式（基于触摸设备） */
.mobile-static-bubbles {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 35%;
  z-index: 2;
  pointer-events: none;
  overflow: hidden;
}

/* 基础气泡样式 */
.mobile-static-bubbles .bubble {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(
    circle at 30% 30%,
    rgba(255, 255, 255, 0.35),
    rgba(76, 110, 245, 0.25),
    rgba(76, 110, 245, 0.35)
  );
  box-shadow: 0 20px 40px rgba(76, 110, 245, 0.25);
}

/* 左侧大气泡 */
.mobile-static-bubbles .b1 {
  width: 260px;
  height: 260px;
  left: -120px;
  bottom: -120px;
  opacity: 0.5;
}

/* 中偏左气泡 */
.mobile-static-bubbles .b2 {
  width: 180px;
  height: 180px;
  left: 20%;
  bottom: -90px;
  opacity: 0.45;
}

/* 中偏右气泡 */
.mobile-static-bubbles .b3 {
  width: 220px;
  height: 220px;
  right: -80px;
  bottom: -110px;
  opacity: 0.5;
}

/* 小一点的辅助气泡 */
.mobile-static-bubbles .b4 {
  width: 120px;
  height: 120px;
  right: 25%;
  bottom: -60px;
  opacity: 0.35;
}

.mobile-mode .full-bg-gray {
  background: radial-gradient(circle at 20% 20%, #f7f8fa 0%, #ebedf0 100%);
}

.mobile-mode .login-panel {
  flex: 1 0 100%;
}

.mobile-mode .login-visual {
  flex: 0;
  opacity: 0;
  transform: translateX(100%);
  padding: 0;
  border-radius: 0;
}

.mobile-mode .login-content {
  max-width: 420px;
  padding: 0 24px;
}

.mobile-mode .title {
  font-size: 38px;
}

.mobile-mode .subtitle {
  font-size: 17px;
  margin-bottom: 40px;
}

.mobile-mode .login-btn {
  height: 52px;
  font-size: 18px;
}

.mobile-mode :deep(.el-form-item__content) {
  font-size: 16px;
}

.mobile-mode :deep(.el-input__inner) {
  font-size: 16px;
  height: 50px;
}

/* 电脑端窄屏样式（保留原有的宽度判断） */
@media (max-width: 1024px) {
  .full-bg-gray {
    background: 
      linear-gradient(rgba(255, 255, 255, 0.75), rgba(77, 77, 77, 0.637)),
      url('../../assets/background.jpg') center/cover no-repeat;
  }

  .login-panel {
    flex: 1 0 100%; 
  }

  .login-visual {
    flex: 0;
    opacity: 0;
    transform: translateX(100%);
    padding: 0;
    border-radius: 0;
  }

  .login-content {
    max-width: 400px;
    padding: 0 20px;
  }
}

/* 电脑端宽屏样式 */
@media (min-width: 1600px) {
  .login-panel {
    flex-basis: 650px;
  }
}
</style>