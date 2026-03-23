<!--
  ========================================
  设备适配模板 - 如何针对不同端展示内容
  ========================================
  
  使用方式：
  1. 通过 props 接收 isMobile 参数（layout 会自动传递）
  2. 使用 v-if 或 v-show 控制不同端的显示
  3. 使用动态 class 或 style 实现不同端的样式
-->

<template>
  <div class="page-container">
    
    <!-- 方式1: 完全不同的内容 - 使用 v-if -->
    <div v-if="!isMobile" class="desktop-section">
      <h2>桌面端专属内容</h2>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="age" label="年龄" />
        <el-table-column prop="address" label="地址" />
      </el-table>
    </div>

    <div v-else class="mobile-section">
      <h2>手机端专属内容</h2>
      <!-- 手机端使用卡片式布局 -->
      <div v-for="item in tableData" :key="item.id" class="mobile-card">
        <div class="card-item">
          <span class="label">姓名：</span>
          <span class="value">{{ item.name }}</span>
        </div>
        <div class="card-item">
          <span class="label">年龄：</span>
          <span class="value">{{ item.age }}</span>
        </div>
        <div class="card-item">
          <span class="label">地址：</span>
          <span class="value">{{ item.address }}</span>
        </div>
      </div>
    </div>

    <!-- 方式2: 相同内容不同样式 - 使用动态 class -->
    <div :class="['content-section', isMobile ? 'mobile-layout' : 'desktop-layout']">
      <div class="header-title">通用内容区域</div>
      <div class="content-grid">
        <div v-for="i in 6" :key="i" class="grid-item">
          项目 {{ i }}
        </div>
      </div>
    </div>

    <!-- 方式3: 部分元素隐藏/显示 -->
    <div class="info-section">
      <h3>信息展示</h3>
      <p>这是所有端都显示的内容</p>
      
      <!-- 桌面端显示额外信息 -->
      <div v-if="!isMobile" class="extra-info">
        <p>这是桌面端的额外详细信息</p>
        <p>包含更多数据和图表</p>
      </div>
      
      <!-- 手机端显示简化按钮 -->
      <el-button v-if="isMobile" type="primary" @click="showDetail">
        查看详情
      </el-button>
    </div>

    <!-- 方式4: 动态列数 - 响应式网格 -->
    <el-row :gutter="20">
      <!-- 桌面端3列，手机端1列 -->
      <el-col 
        v-for="item in cardList" 
        :key="item.id"
        :xs="24"    <!-- 手机端：1列 -->
        :sm="24"    <!-- 小屏：1列 -->
        :md="12"    <!-- 中屏：2列 -->
        :lg="8"     <!-- 大屏：3列 -->
        :xl="8"     <!-- 超大屏：3列 -->
      >
        <div class="card-box">
          {{ item.title }}
        </div>
      </el-col>
    </el-row>

    <!-- 方式5: 动态组件样式 -->
    <el-form 
      label-width="120px"
      :label-position="isMobile ? 'top' : 'right'"
    >
      <el-form-item label="用户名">
        <el-input v-model="form.username" />
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model="form.email" />
      </el-form-item>
    </el-form>

    <!-- 方式6: 动态对话框大小 -->
    <el-dialog
      v-model="dialogVisible"
      title="提示"
      :width="isMobile ? '90%' : '500px'"
      :fullscreen="isMobile"
    >
      <p>对话框内容</p>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref } from 'vue'

// 接收从 layout 传递的 isMobile 参数
const props = defineProps({
  isMobile: {
    type: Boolean,
    default: false
  }
})

// 示例数据
const tableData = ref([
  { id: 1, name: '张三', age: 28, address: '北京市朝阳区' },
  { id: 2, name: '李四', age: 32, address: '上海市浦东新区' },
  { id: 3, name: '王五', age: 25, address: '广州市天河区' }
])

const cardList = ref([
  { id: 1, title: '卡片1' },
  { id: 2, title: '卡片2' },
  { id: 3, title: '卡片3' },
  { id: 4, title: '卡片4' },
  { id: 5, title: '卡片5' },
  { id: 6, title: '卡片6' }
])

const form = ref({
  username: '',
  email: ''
})

const dialogVisible = ref(false)

const showDetail = () => {
  dialogVisible.value = true
}
</script>

<style scoped>
.page-container {
  padding: 20px;
}

/* ========== 桌面端样式 ========== */
.desktop-section {
  margin-bottom: 30px;
}

.desktop-layout .content-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

/* ========== 手机端样式 ========== */
.mobile-section {
  margin-bottom: 20px;
}

.mobile-card {
  background: #f5f5f5;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
}

.mobile-card .card-item {
  display: flex;
  margin-bottom: 8px;
}

.mobile-card .label {
  font-weight: bold;
  width: 80px;
}

.mobile-layout .content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

/* ========== 通用样式 ========== */
.content-section {
  margin-bottom: 30px;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
}

.grid-item {
  background: #e0e0e0;
  padding: 20px;
  text-align: center;
  border-radius: 4px;
}

.info-section {
  margin: 30px 0;
}

.extra-info {
  background: #f0f9ff;
  padding: 15px;
  margin-top: 10px;
  border-left: 3px solid #409eff;
}

.card-box {
  background: white;
  border: 1px solid #ddd;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  text-align: center;
}
</style>

<!--
  ========================================
  最佳实践总结
  ========================================
  
  1. 接收 isMobile 参数：
     defineProps({ isMobile: Boolean })
  
  2. 完全不同的内容：
     <div v-if="!isMobile">桌面端内容</div>
     <div v-else>手机端内容</div>
  
  3. 不同样式：
     :class="{ 'mobile-class': isMobile, 'desktop-class': !isMobile }"
  
  4. 动态属性：
     :width="isMobile ? '90%' : '500px'"
  
  5. Element Plus 响应式：
     使用 :xs :sm :md :lg :xl 断点
  
  6. 注意事项：
     - 手机端优先考虑单列布局
     - 减少手机端的复杂交互
     - 适当增大手机端的点击区域
     - 表单标签在手机端建议使用 top 位置
     - 对话框在手机端可以考虑全屏显示
-->
