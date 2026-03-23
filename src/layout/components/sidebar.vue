<template>
  <div class="sidebar">
    <div class="logo-section">
      <div class="logo">
        <img src="../../assets/favicon.ico" alt="/1" class="logo-img" />
      </div>
      
      <div class="title">
        <p class="dxgyzt">大峡谷一站通</p>
        <p class="dxgyzt-en">Grand Canyon One-Stop</p>
      </div>
    </div>

    <nav class="menu">
      <div class="menu-item" :class="{ active: isActive('1') }" @click="handleMenuClick('1')">
        <svg class="icon" viewBox="0 -1 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span>首页</span>
      </div>

      <!--
      <div class="menu-item" :class="{ active: isActive('P') }" @click="handleMenuClick('P')">
        <svg class="icon" viewBox="0 -1 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span>个人中心</span>
      </div>
      -->

      <div v-if="isMenuVisible('O-1') || isMenuVisible('O-2')" class="menu-group">
        <div class="menu-item" @click="isOrganizationExpanded = !isOrganizationExpanded">
          <div class="flex-row">
            <svg class="icon" viewBox="0 -1 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="16" y="16" width="6" height="6" rx="1"/>
              <rect x="2" y="16" width="6" height="6" rx="1"/>
              <rect x="9" y="2" width="6" height="6" rx="1"/>
              <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/>
              <path d="M12 12V8"/>
            </svg>
            <span>组织管理</span>
          </div>
          <div class="close-btn" :class="{ 'is-collapsed': !isOrganizationExpanded }"></div>
        </div>

        <div class="submenu-wrapper" :class="{ 'is-open': isOrganizationExpanded }">
          <div class="submenu-content">
            <div class="submenu">
              <div v-if="isMenuVisible('O-1')" class="submenu-item" :class="{ active: isActive('O-1') }" @click.stop="handleMenuClick('O-1')">部门信息维护</div>
              <div v-if="isMenuVisible('O-2')" class="submenu-item" :class="{ active: isActive('O-2') }" @click.stop="handleMenuClick('O-2')">职级信息维护</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="isMenuVisible('H-1') || isMenuVisible('H-2')" class="menu-group">
        <div class="menu-item" @click="isHRExpanded = !isHRExpanded">
          <div class="flex-row">
            <svg class="icon" viewBox="0 -1 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>人事管理</span>
          </div>
          <div class="close-btn" :class="{ 'is-collapsed': !isHRExpanded }"></div>
        </div>

        <div class="submenu-wrapper" :class="{ 'is-open': isHRExpanded }">
          <div class="submenu-content">
            <div class="submenu">
              <div v-if="isMenuVisible('H-1')" class="submenu-item" :class="{ active: isActive('H-1') }" @click.stop="handleMenuClick('H-1')">员工信息维护</div>
              <div v-if="isMenuVisible('H-2')" class="submenu-item" :class="{ active: isActive('H-2') }" @click.stop="handleMenuClick('H-2')">绩效管理</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="isMenuVisible('A-1') || isMenuVisible('A-2')" class="menu-group">
        <div class="menu-item" @click="isAttendanceExpanded = !isAttendanceExpanded">
          <div class="flex-row">
            <svg class="icon" viewBox="0 -1 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 14h1v4"/>
              <path d="M16 2v4"/>
              <path d="M3 10h18"/>
              <path d="M8 2v4"/>
              <rect x="3" y="4" width="18" height="18" rx="2"/>
            </svg>
            <span>考勤管理</span>
          </div>
          <div class="close-btn" :class="{ 'is-collapsed': !isAttendanceExpanded }"></div>
        </div>

        <div class="submenu-wrapper" :class="{ 'is-open': isAttendanceExpanded }">
          <div class="submenu-content">
            <div class="submenu">
              <div v-if="isMenuVisible('A-1')" class="submenu-item" :class="{ active: isActive('A-1') }" @click.stop="handleMenuClick('A-1')">排班</div>
              <div v-if="isMenuVisible('A-2')" class="submenu-item" :class="{ active: isActive('A-2') }" @click.stop="handleMenuClick('A-2')">考勤明细</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="isMenuVisible('M-1') || isMenuVisible('M-2')" class="menu-group">
        <div class="menu-item" @click="isMoneyExpanded = !isMoneyExpanded">
          <div class="flex-row">
            <svg class="icon" viewBox="0 -1 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
            </svg>
            <span>财务管理</span>
          </div>
          <div class="close-btn" :class="{ 'is-collapsed': !isMoneyExpanded }"></div>
        </div>

        <div class="submenu-wrapper" :class="{ 'is-open': isMoneyExpanded }">
          <div class="submenu-content">
            <div class="submenu">
              <div v-if="isMenuVisible('M-1')" class="submenu-item" :class="{ active: isActive('M-1') }" @click.stop="handleMenuClick('M-1')">薪酬核发</div>
              <div v-if="isMenuVisible('M-2')" class="submenu-item" :class="{ active: isActive('M-2') }" @click.stop="handleMenuClick('M-2')">考勤明细</div>
            </div>
          </div>
        </div>
      </div>

      <!--
      <div v-if="isMenuVisible('S-1') || isMenuVisible('S-2') || isMenuVisible('S-3')" class="menu-group">
        <div class="menu-item" @click="isScoreExpanded = !isScoreExpanded">
          <div class="flex-row">
            <svg class="icon" viewBox="0 -1 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 16V9.5a1 1 0 0 1 5 0"/>
              <path d="M8 12h4"/><path d="M8 16h7"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
            <span>积分管理</span>
          </div>
          <div class="close-btn" :class="{ 'is-collapsed': !isScoreExpanded }"></div>
        </div>

        <div class="submenu-wrapper" :class="{ 'is-open': isScoreExpanded }">
          <div class="submenu-content">
            <div class="submenu">
              <div v-if="isMenuVisible('S-1')" class="submenu-item" :class="{ active: isActive('S-1') }" @click.stop="handleMenuClick('S-1')">员工积分明细</div>
              <div v-if="isMenuVisible('S-2')" class="submenu-item" :class="{ active: isActive('S-2') }" @click.stop="handleMenuClick('S-2')">奖品库存维护</div>
              <div v-if="isMenuVisible('S-3')" class="submenu-item" :class="{ active: isActive('S-3') }" @click.stop="handleMenuClick('S-3')">奖品兑换核销</div>
            </div>
          </div>
        </div>
      </div>
      -->

      <!-- 系统设置 
      <div class="menu-item" :class="{ active: isActive('10') }" @click="handleMenuClick('10')">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        <span>系统设置</span>
      </div>-->
    </nav>

    <div class="footer-card">
      <div class="profile-section">
        <el-dropdown @command="handleUserCommand" trigger="click" placement="top-end">
          <div class="more-options">···</div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="changePassword">
                更改密码
              </el-dropdown-item>
              <el-dropdown-item command="logout">
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <div class="avatar-container">
          <img src="https://randomuser.me/api/portraits/men/32.jpg" class="avatar" alt="User Avatar" />
        </div>

        <div class="user-info">
          <h3 class="user-name">{{ username }}</h3>
          <p class="user-position">{{ userdept }}{{ userpos }}</p>
        </div>
      </div>
    </div>

    <!-- 更改密码对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="更改密码"
      width="85%"
      :style="{ maxWidth: '480px' }"
      destroy-on-close
      @close="passwordForm = { oldPassword: '', newPassword: '', confirmPassword: '' }"
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
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../../stores/userStore';
import { ElMessage } from 'element-plus';
import { User, Setting, SwitchButton } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();

// 菜单权限列表（顺序需与二进制位一一对应）
const menuPermissions = [
  'O-1', 'O-2',
  'H-1', 'H-2', 'H-3', 'H-4',
  'A-1', 'A-2', 'A-3', 'A-4',
  'M-1', 'M-2',
  'S-1', 'S-2', 'S-3'
];

// 何杰鸣 获取用户信息
const userStore = useUserStore();

const username = computed(() => userStore.userInfo?.username || '用户');
const userdept = computed(() => userStore.userInfo.userdept || '');
const userpos = computed(() => userStore.userInfo?.userpos || '员工');

// 何杰鸣 后续通过userdept查数据库获取supportChannel
const supportChannel = '1111111111111';

// 根据supportChannel二进制字符串获取可访问菜单
const getAccessibleMenus = () => {
  const bits = supportChannel || '';
  const result = [];
  for (let i = 0; i < bits.length && i < menuPermissions.length; i++) {
    if (bits[i] === '1') result.push(menuPermissions[i]);
  }
  return result;
};

// 检查菜单项是否可见
const isMenuVisible = (menuIndex) => {
  return getAccessibleMenus().includes(menuIndex);
};

// 定义菜单路由映射
const menuRoutes = {
  '1': '/',
  'P': '/profile',
  'O-1': '/organization/department',
  'O-2': '/organization/staffPosition',
  'H-1': '/hr/employeesInfo',
  'H-2': '/salaries/salary',
  'H-3': '/hr/performance',
  'H-4': '/hr/scheduling',
  'A-1': '/attendance/settings',
  'A-2': '/attendance/scheduling',
  'A-3': '/attendance/records',
  'A-4': '/attendance/reports',
  'W-1': '/warehouse/assets',
  'V-1': '/vehicle/info',
  'V-2': '/vehicle/schedule',
  'M-1': '/salaries/salaryPayment',
  'D-1': '/dormitory/info',
  'D-2': '/dormitory/allocation',
  'S-1': '/scores/'
};

// 计算当前激活的菜单项
const activeIndex = computed(() => {
  const currentPath = route.path;
  
  for (const [index, path] of Object.entries(menuRoutes)) {
    if (path === currentPath || currentPath.startsWith(path + '/')) {
      return index;
    }
  }
  
  return '1';
});

const isInOrganizationMenu = computed(() => {
  return activeIndex.value === 'O-1' || activeIndex.value === 'O-2';
});

const isInHRMenu = computed(() => {
  return activeIndex.value === 'H-1' || activeIndex.value === 'H-2';
});

const isInAttendanceMenu = computed(() => {
  return activeIndex.value === 'A-1' || activeIndex.value === 'A-2';
});

const isInMoneyMenu = computed(() => {
  return activeIndex.value === 'M-1' || activeIndex.value === 'M-2';
});

const isInScoreMenu = computed(() => {
  return activeIndex.value === 'S-1' || activeIndex.value === 'S-2' || activeIndex.value === 'S-3';
});

// 为每个菜单组使用独立的展开状态]
const isOrganizationExpanded = ref(isInOrganizationMenu.value);
const isHRExpanded = ref(isInHRMenu.value);
const isAttendanceExpanded = ref(isInAttendanceMenu.value);
const isMoneyExpanded = ref(isInMoneyMenu.value);
const isScoreExpanded = ref(isInScoreMenu.value);

// 监听路由变化，自动展开/收起对应的子菜单
watch(() => route.path, () => {
  if (isInOrganizationMenu.value) {
    isOrganizationExpanded.value = true;
  }
  if (isInHRMenu.value) {
    isHRExpanded.value = true;
  }
  if (isInAttendanceMenu.value) {
    isAttendanceExpanded.value = true;
  }
  if (isInMoneyMenu.value) {
    isMoneyExpanded.value = true;
  }
  if (isInScoreMenu.value) {
    isScoreExpanded.value = true;
  }
});

// 处理菜单点击跳转
const handleMenuClick = (index) => {
  const targetPath = menuRoutes[index];
  if (targetPath && targetPath !== route.path) {
    router.push(targetPath);
  }
};

// 检查菜单项是否激活
const isActive = (index) => {
  return activeIndex.value === index;
};

// 更改密码相关
const dialogVisible = ref(false);
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const handleUserCommand = (command) => {
  switch (command) {
    case 'changePassword':
      dialogVisible.value = true;
      break;
    case 'logout':
      // 何杰鸣 退出登录 需要清空所有用户信息
      console.log('退出登录')
      router.push('/login')
  }
};

const handleChangePassword = async () => {
  // 验证表单
  if (!passwordForm.value.oldPassword) {
    ElMessage.warning('请输入旧密码');
    return;
  }
  if (!passwordForm.value.newPassword) {
    ElMessage.warning('请输入新密码');
    return;
  }
  if (!passwordForm.value.confirmPassword) {
    ElMessage.warning('请输入确认新密码');
    return;
  }
  
  // ①判断两次输入的新密码是否一致
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    ElMessage.error('两次输入的新密码不一致');
    return;
  }
  
  // ②新密码与旧密码不一致
  if (passwordForm.value.oldPassword === passwordForm.value.newPassword) {
    ElMessage.error('新密码不能与旧密码相同');
    return;
  }
  
  // 何杰鸣 更改密码 后端接口
  try {
    // TODO: 调用后端接口
    // await changePasswordAPI({
    //   oldPassword: passwordForm.value.oldPassword,
    //   newPassword: passwordForm.value.newPassword
    // });
    
    ElMessage.success('密码修改成功，请重新登录');
    dialogVisible.value = false;
    // 清空表单
    passwordForm.value = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    // 跳转到登录页
    setTimeout(() => {
      router.push('/login');
    }, 1000);
  } catch (error) {
    ElMessage.error(error.message || '密码修改失败');
  }
};

</script>

<style scoped>
/* 继承之前的样式 ... */
.sidebar {
  width: 260px;
  height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 45px 0;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #333;
}

.logo-section { display: flex;  gap: 15px;  margin-bottom: 10%;  margin-left: 13.4%; flex-shrink: 0; margin-top: -4.5%;}
.logo { display: flex; align-items: center; gap: 10px; cursor: pointer; transition: opacity 0.3s; }
.logo:hover { opacity: 0.9; }
.logo-img { height: 38px; width: 38px; border-radius: 6px; }
.title { display: flex; flex-direction: column; justify-content: center; }
.dxgyzt { margin: 0; font-size: 19.5px; font-weight: 600; color: black; }
.dxgyzt-en { margin: 0; font-size: 12px; color: rgba(0,0,0,0.65); font-weight: 500; }

.menu { 
  flex: 1; 
  overflow-y: auto;
  padding: 0 27px;
  min-height: 0;
}

/* 隐藏滚动条但保持功能 */
.menu::-webkit-scrollbar {
  width: 6px;
}

.menu::-webkit-scrollbar-track {
  background: transparent;
}

.menu::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 3px;
}

.menu::-webkit-scrollbar-thumb:hover {
  background: #c0c0c0;
}
.menu-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px 16px;
  border-radius: 14px;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
  margin-bottom: 10px;
}
.menu-item:hover { background-color: #f9f9f9; }
.menu-item.active { 
  background-color: #f0f0f0; 
  font-weight: 500;
  border-left: 3px solid #409eff;
  padding-left: 13px;
}
.flex-row { display: flex; align-items: center; gap: 15px; flex: 1;}
.icon { width: 22px; height: 22px; color: #666; }

/* --- 核心动画部分 --- */

/* X 按钮旋转动画 */
.close-btn {
  width: 18px;
  height: 18px;
  margin-right: 7px;
  border: 1px solid #ddd;
  border-radius: 50%;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

/* 绘制 X 的两条线 */
.close-btn::before,
.close-btn::after {
  content: '';
  position: absolute;
  top: 50.5%;
  left: 50.5%;
  width: 10px; /* 线条长度 */
  height: 1px; /* 线条粗细 */
  background-color: #666;
  border-radius: 1px;
}

/* 初始状态成 X 形状 */
.close-btn::before {
  transform: translate(-50%, -50%) rotate(45deg);
}
.close-btn::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}

/* 展开/收起时的状态切换 */
.close-btn.is-collapsed {
  background-color: #f0f0f0;
  transform: rotate(180deg); /* 旋转整个容器 */
}

/* 收起时让两条线垂直/水平，变成 + 号 */
.close-btn.is-collapsed::before {
  transform: translate(-50%, -50%) rotate(90deg);
}
.close-btn.is-collapsed::after {
  transform: translate(-50%, -50%) rotate(0deg);
}

/* 子菜单展开动画容器 */
.submenu-wrapper {
  display: grid;
  grid-template-rows: 0fr; /* 初始高度为 0 */
  transition: grid-template-rows 0.3s ease-out;
  overflow: hidden;
}

.submenu-wrapper.is-open {
  grid-template-rows: 1fr; /* 展开为实际内容高度 */
}

.submenu-content {
  min-height: 0; /* 配合 grid 动画必须设置 */
}

/* 树状连接线 (保持之前的逻辑) */
.submenu {
  margin-left: 25px;
  position: relative;
  padding-top: 0px;
  padding-bottom: 3px;
}

/* 左侧竖线 */
.submenu::before {
  content: "";
  position: absolute;
  left: 0;
  top: 4px;
  height: calc(100% - 4px - 8px - 15px); /* 总高度减去上下padding和最后一个子选项的一半高度 */
  width: 1.5px;
  background-color: #707070;
}

.submenu-item {
  position: relative;
  padding: 11px 8px 12px 12px;
  margin-left: 13px;
  font-size: 14px;
  color: #666;
  transition: all 0.2s;
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  align-items: center;
}
.submenu-item:hover { 
  color: #000;
  background-color: #f9f9f9;
}
.submenu-item.active {
  color: #409eff;
  font-weight: 500;
  background-color: #ecf5ff;
}

/* 每个子选项的横线 */
.submenu-item::before {
  content: "";
  position: absolute;
  left: -13px; /* 向左偏移，对齐到竖线位置 */
  top: 50%;
  width: 12px;
  height: 1px;
  background-color: #707070;
  height: 1.2px;
}

/* 底部样式保持不变... */
.footer-card {
  background: #f8f7f5; /* 参考图中的浅米灰底色 */
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  transition: all 0.3s ease;
}

/* 顶部个人信息区域 */
.profile-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  margin-bottom: -15px;
  margin-top: 25px;
}

/* 三个点：绝对定位到右上角 */
.more-options {
  position: absolute;
  top: -15px;
  right: -115px;
  font-size: 21px;
  color: #949393;
  cursor: pointer;
  padding: 8px;
  line-height: 1;
  transition: color 0.2s;
}
.more-options:hover { color: #333; }

/* 头像：增加细腻的阴影 */
.avatar-container {
  margin-bottom: 16px;
}
.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08); /* 柔和阴影 */
}

/* 文字排版 */
.user-info {
  text-align: center;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-top: 3px;
  margin-bottom: 10px;
  letter-spacing: -0.5px;

}
.user-position {
  font-size: 13.5px;
  color: #8c8c8c;
  margin: 0;
}
</style>