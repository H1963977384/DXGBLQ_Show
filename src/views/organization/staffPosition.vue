<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { usePositionStore } from '../../stores'
import { 
  Plus, 
  Delete, 
  Edit
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const positionStore = usePositionStore()

// 职级列表
const positions = computed(() => positionStore.position)

// 表格加载状态
const loading = computed(() => positionStore.loading)

// 对话框可见性
const dialogVisible = ref(false)

// 当前编辑的职级
const currentPosition = reactive({
  positionID: '',
  positionName: '',
  updatedTime: ''
})

// 分页相关变量
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 过滤后的职级列表
const filteredPositions = computed(() => {
  return positions.value || []
})

// 分页后的职级列表
const paginatedPositions = computed(() => {
  pagination.value.total = filteredPositions.value.length
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredPositions.value.slice(start, end)
})

// 处理分页变化
const handleCurrentChange = (val) => {
  pagination.value.currentPage = val
}

// 处理每页数量变化
const handleSizeChange = (val) => {
  pagination.value.pageSize = val
  pagination.value.currentPage = 1
}

// 打开新增对话框
const openAddDialog = () => {
  Object.assign(currentPosition, {
    positionID: '',
    positionName: '',
    updatedTime: new Date().toISOString().replace('T', ' ').substr(0, 19)
  })
  dialogVisible.value = true
}

// 打开编辑对话框
const openEditDialog = (pos) => {
  const posCopy = JSON.parse(JSON.stringify(pos))
  Object.assign(currentPosition, posCopy)
  dialogVisible.value = true
}

// 保存职级
const savePosition = () => {
  if (!currentPosition.positionName) {
    ElMessage.warning('请填写必填字段')
    return
  }

  if (currentPosition.positionID) {
    // 更新职级
    positionStore.updatePosition(currentPosition.positionID, currentPosition)
  } else {
    // 添加新职级
    positionStore.addPosition(currentPosition)
  }
  
  dialogVisible.value = false
}

// 删除职级
const handleDelete = (pos) => {
  ElMessageBox.confirm(
    `确定要删除职级 ${pos.positionName} 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    positionStore.deletePosition(pos.positionID)
  }).catch(() => {
    // 用户取消
  })
}

// 加载数据
const loadData = () => {
  positionStore.loadPositions()
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="template-container">
    <div class="template-header">
      <div class="page-title">职级信息维护</div>
    </div>
    
    <div class="template-list-card">
      <div class="search-form-container">
        <div class="form-actions">
          <el-button type="primary" @click="openAddDialog" :icon="Plus">新增职级</el-button>
        </div>
      </div>
      
      <el-table
        :data="paginatedPositions"
        style="width: 100%"
        v-loading="loading"
        border
        stripe
        highlight-current-row
      >
        <el-table-column prop="positionID" label="职级编号" min-width="80" align="center"/>
        <el-table-column prop="positionName" label="职级名称" min-width="100" align="center"/>
        <el-table-column label="更新时间" min-width="140" align="center">
          <template #default="scope">
            {{ scope.row.updatedTime }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right"  align="center">
          <template #default="scope">
            <el-button-group>
              <el-button @click="openEditDialog(scope.row)" :icon="Edit">编辑</el-button>
              <el-button type="danger" @click="handleDelete(scope.row)" :icon="Delete">删除</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 职级编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="currentPosition.positionID ? '编辑职级信息' : '新增职级信息'"
      width="600px"
      destroy-on-close
    >
      <el-form label-width="120px">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <el-form-item label="职级名称" required>
              <el-input v-model="currentPosition.positionName" placeholder="请输入职级名称" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="savePosition">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page-title {
  font-family: 'YuanTi', sans-serif;
  font-size: 28px;
}

.template-container {
  padding: 30px;
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 50px;
}

.template-list-card {
  height: calc(100vh - 175px);
  display: flex;
  flex-direction: column;
  margin-bottom: -30px;
}

.template-list-card :deep(.el-table) {
  flex: 1;
  overflow: auto;
}

.search-form-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-left: 10px;
}

.menu-actions {
  margin-bottom: 10px;
  display: flex;
  gap: 10px;
}

.checkbox-group-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 5px 30px;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.format-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  line-height: 1.4;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding: 0 15px 15px;
}
</style> 