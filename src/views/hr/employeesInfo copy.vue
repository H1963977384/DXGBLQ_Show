<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { useEmployeesStore, useDepartmentStore } from '../../stores'
import { 
  Plus, 
  Delete, 
  Edit,
  RefreshRight
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const employeesStore = useEmployeesStore()
const departmentStore = useDepartmentStore()

// 部门列表
const departments = computed(() => departmentStore.departments)

// 员工列表
const employees = computed(() => employeesStore.employees)

// 表格加载状态
const loading = computed(() => employeesStore.loading)

// 对话框可见性
const dialogVisible = ref(false)

// 当前编辑的员工
const currentEmployee = reactive({
  staffID: '',
  staffName: '',
  staffGender: '',
  staffDept: '',
  staffPos: '',
  staffPhone: '',
  staffHireDate: '',
  staffBirthday: '',
  staffStatus: 'active'
})

// 分页相关变量
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 搜索表单
const searchForm = ref({
  name: '',
  staffID: '',
  dept: ''
})

// 过滤后的员工列表
const filteredEmployees = computed(() => {
  return employees.value.filter(emp => {
    const nameMatch = !searchForm.value.name || 
      emp.staffName.toLowerCase().includes(searchForm.value.name.toLowerCase())
    
    const idMatch = !searchForm.value.staffID || 
      emp.staffID.toString().includes(searchForm.value.staffID)
    
    const deptMatch = !searchForm.value.dept || 
      emp.staffDept.includes(searchForm.value.dept)
    
    return nameMatch && idMatch && deptMatch
  })
})

// 分页后的员工列表
const paginatedEmployees = computed(() => {
  pagination.value.total = filteredEmployees.value.length
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredEmployees.value.slice(start, end)
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
  Object.assign(currentEmployee, {
    staffID: '',
    staffName: '',
    staffGender: '',
    staffDept: '',
    staffPos: '',
    staffPhone: '',
    staffHireDate: '',
    staffBirthday: '',
    staffStatus: 'active'
  })
  dialogVisible.value = true
}

// 打开编辑对话框
const openEditDialog = (emp) => {
  Object.assign(currentEmployee, JSON.parse(JSON.stringify(emp)))
  dialogVisible.value = true
}

// 保存员工
const saveEmployee = () => {
  if (!currentEmployee.staffID || !currentEmployee.staffName) {
    ElMessage.warning('请填写必填字段')
    return
  }
  
  // 检查是否有原始ID（用于判断是编辑还是新增）
  const existingEmployee = employees.value.find(e => e.staffID === currentEmployee.staffID)
  
  if (existingEmployee && existingEmployee.staffID !== currentEmployee.staffID) {
    // 更新员工
    employeesStore.updateEmployee(currentEmployee.staffID, currentEmployee)
  } else if (!existingEmployee) {
    // 添加新员工
    employeesStore.addEmployee(currentEmployee)
  } else {
    // 编辑现有员工
    employeesStore.updateEmployee(currentEmployee.staffID, currentEmployee)
  }
  
  dialogVisible.value = false
}

// 删除员工
const handleDelete = (emp) => {
  ElMessageBox.confirm(
    `确定要删除员工 "${emp.staffName}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    employeesStore.deleteEmployee(emp.staffID)
  }).catch(() => {
    // 用户取消
  })
}

// 重置密码
const handleResetPassword = (emp) => {
  ElMessageBox.confirm(
    `确定要重置员工 "${emp.staffName}" 的密码吗？`,
    '重置密码确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    employeesStore.resetPassword(emp.staffID)
  }).catch(() => {
    // 用户取消
  })
}

// 加载数据
const loadData = () => {
  employeesStore.loadEmployees()
  departmentStore.loadDepartments()
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="template-container">
    <div class="template-header">
      <div class="page-title">员工信息维护</div>
    </div>
    
    <el-card shadow="never" class="template-list-card">
      <div class="search-form-container">
        <div class="form-actions">
          <el-button type="primary" @click="openAddDialog" :icon="Plus">新增员工</el-button>
        </div>
      </div>
      
      <el-table
        :data="paginatedEmployees"
        style="width: 100%"
        v-loading="loading"
        border
        stripe
        highlight-current-row
      >
        <el-table-column prop="staffID" label="工号" min-width="80" align="center"/>
        <el-table-column prop="staffName" label="姓名" min-width="100" align="center"/>
        <el-table-column prop="staffGender" label="性别" min-width="100" align="center"/>
        <el-table-column prop="staffDept" label="所属部门" min-width="100" align="center"/>
        <el-table-column prop="staffPos" label="职级" min-width="100" align="center"/>
        <el-table-column prop="staffPhone" label="手机号码" min-width="100" align="center"/>
        <el-table-column prop="staffHireDate" label="入职日期" min-width="100" align="center"/>
        
        <el-table-column label="操作" width="300" fixed="right"  align="center">
          <template #default="scope">
            <el-button-group>
              <el-button @click="openEditDialog(scope.row)" :icon="Edit">编辑</el-button>
              <el-button @click="handleResetPassword(scope.row)" :icon="RefreshRight">重置密码</el-button>
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
    </el-card>
    
    <!-- 员工编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="currentEmployee.staffID && employees.find(e => e.staffID === currentEmployee.staffID) ? '编辑员工信息' : '新增员工信息'"
      width="700px"
      destroy-on-close
    >
      <el-form label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="工号" required>
              <el-input v-model="currentEmployee.staffID" placeholder="请输入工号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" required>
              <el-input v-model="currentEmployee.staffName" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="性别" required>
              <el-select v-model="currentEmployee.staffGender" placeholder="请选择性别" style="width: 100%">
                <el-option label="男" value="男" />
                <el-option label="女" value="女" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号码" required>
              <el-input v-model="currentEmployee.staffPhone" placeholder="请输入手机号码" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属部门" required>
              <el-select v-model="currentEmployee.staffDept" placeholder="请选择部门" style="width: 100%">
                <el-option 
                  v-for="dept in departments" 
                  :key="dept.departmentID" 
                  :label="dept.departmentName" 
                  :value="dept.departmentName" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职级">
              <el-input v-model="currentEmployee.staffPos" placeholder="请输入职级" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="入职日期">
              <el-date-picker
                v-model="currentEmployee.staffHireDate"
                type="date"
                placeholder="选择入职日期"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出生日期">
              <el-date-picker
                v-model="currentEmployee.staffBirthday"
                type="date"
                placeholder="选择出生日期"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEmployee">保存</el-button>
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

.template-list-card :deep(.el-table__body-wrapper) {
  max-height: calc(100vh - 280px);
  overflow-y: auto;
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

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding: 0 15px 15px;
}
</style>
