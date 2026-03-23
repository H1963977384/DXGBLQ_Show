<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { useEmployeesStore, useDepartmentStore } from '@/stores'
import { exportToXls } from '@/utils/exportXls'
import { 
  Plus, 
  Delete, 
  Edit,
  Minus
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const employeesStore = useEmployeesStore()
const departmentStore = useDepartmentStore()

// 部门列表
const departments = computed(() => departmentStore.departments || [])

// 部门选项（字段兼容）
const departmentOptions = computed(() => {
  return departments.value
    .map((dept) => ({
      id: dept.DeptID ?? dept.departmentID ?? dept.departmentId ?? dept.id,
      name: dept.DeptName ?? dept.departmentName ?? dept.name,
      parentId: dept.SuperiorDept ?? dept.parentId ?? dept.parentID ?? dept.parent
    }))
    .filter(option => option.name)
})

const primaryDepartments = computed(() => {
  return departmentOptions.value.filter(d => d.parentId === -1 || d.parentId === null || d.parentId === undefined)
})

const secondaryDepartments = computed(() => {
  if (!primaryDeptId.value) {
    return []
  }
  return departmentOptions.value.filter(d => d.parentId === primaryDeptId.value)
})

const departmentPathOptions = computed(() => {
  return departmentOptions.value
    .filter(d => d.parentId !== -1 && d.parentId !== null && d.parentId !== undefined)
    .map((dept) => {
      const parent = departmentOptions.value.find(d => d.id === dept.parentId)
      return {
        id: dept.id,
        name: dept.name,
        fullName: parent ? `${parent.name}-${dept.name}` : dept.name
      }
    })
})

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

// 部门筛选
const primaryDeptId = ref('')
const secondaryDeptName = ref('')
const positionFilter = ref('')
const hireDateStart = ref('')
const hireDateEnd = ref('')
const nameFilter = ref('')

const selectedPrimaryDeptName = computed(() => {
  if (!primaryDeptId.value) {
    return ''
  }
  const primary = departmentOptions.value.find(d => d.id === primaryDeptId.value)
  return primary?.name || ''
})

const positionOptions = computed(() => {
  const options = new Set(
    employees.value
      .map(emp => emp.staffPos)
      .filter(Boolean)
  )
  return [...options]
})

const getDepartmentDisplay = (deptName) => {
  if (!deptName) {
    return ''
  }

  if (deptName.includes('-')) {
    return deptName
  }

  const currentDept = departmentOptions.value.find(d => d.name === deptName)
  if (!currentDept) {
    return deptName
  }

  const parentDept = departmentOptions.value.find(d => d.id === currentDept.parentId)
  return parentDept ? `${parentDept.name}-${currentDept.name}` : currentDept.name
}

const parseDepartment = (deptName) => {
  const formatted = getDepartmentDisplay(deptName)
  if (!formatted) {
    return { primary: '', secondary: '' }
  }

  const parts = formatted.split('-')
  return {
    primary: parts[0] || '',
    secondary: parts[1] || ''
  }
}

// 过滤后的员工列表
const filteredEmployees = computed(() => {
  return employees.value.filter((emp) => {
    const { primary, secondary } = parseDepartment(emp.staffDept)

    if (selectedPrimaryDeptName.value && primary !== selectedPrimaryDeptName.value) {
      return false
    }

    if (secondaryDeptName.value && secondary !== secondaryDeptName.value) {
      return false
    }

    if (positionFilter.value && emp.staffPos !== positionFilter.value) {
      return false
    }

    if (nameFilter.value && !String(emp.staffName || '').includes(nameFilter.value.trim())) {
      return false
    }

    if (hireDateStart.value && (!emp.staffHireDate || emp.staffHireDate < hireDateStart.value)) {
      return false
    }

    if (hireDateEnd.value && (!emp.staffHireDate || emp.staffHireDate > hireDateEnd.value)) {
      return false
    }

    return true
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

const handlePrimaryDeptChange = () => {
  secondaryDeptName.value = ''
  pagination.value.currentPage = 1
}

const handleSecondaryDeptChange = () => {
  pagination.value.currentPage = 1
}

const handleFilterChange = () => {
  pagination.value.currentPage = 1
}

const resetFilters = () => {
  primaryDeptId.value = ''
  secondaryDeptName.value = ''
  positionFilter.value = ''
  hireDateStart.value = ''
  hireDateEnd.value = ''
  nameFilter.value = ''
  pagination.value.currentPage = 1
}

const handleExportEmployees = () => {
  if (!filteredEmployees.value.length) {
    ElMessage.warning('暂无可导出的员工数据')
    return
  }

  const today = new Date()
  const dateText = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`

  exportToXls({
    fileName: `张家界大峡谷旅游开发有限公司员工花名册_${dateText}`,
    sheetName: '花名册',
    columns: [
      { label: '工号', value: 'staffID' },
      { label: '姓名', value: 'staffName' },
      { label: '性别', value: 'staffGender' },
      { label: '所属部门', value: (row) => getDepartmentDisplay(row.staffDept) },
      { label: '职级', value: 'staffPos' },
      { label: '手机号码', value: 'staffPhone' },
      { label: '入职日期', value: 'staffHireDate' }
    ],
    data: filteredEmployees.value
  })

  ElMessage.success('员工信息导出成功')
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

const isEditingEmployee = computed(() => {
  return employees.value.some(e => e.staffID === currentEmployee.staffID)
})

// 保存员工
const saveEmployee = () => {
  if (!currentEmployee.staffID || !currentEmployee.staffName) {
    ElMessage.warning('请填写必填字段')
    return
  }
  
  const existingEmployee = employees.value.find(e => e.staffID === currentEmployee.staffID)
  
  if (!existingEmployee) {
    employeesStore.addEmployee(currentEmployee)
  } else {
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
    if (currentEmployee.staffID === emp.staffID) {
      dialogVisible.value = false
    }
  }).catch(() => {
    // 用户取消
  })
}

// 重置密码
const handleResetPassword = (staffID, staffName) => {
  if (!staffID) {
    ElMessage.warning('缺少员工工号，无法重置密码')
    return
  }

  ElMessageBox.confirm(
    `确定要重置员工 "${staffName || staffID}" 的密码吗？`,
    '重置密码确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    employeesStore.resetPassword(staffID)
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
    
    <div class="search-form-container">
      <div class="form-actions">
        <el-button type="primary" @click="openAddDialog" :icon="Plus">入职</el-button>
        <el-button type="primary" @click="openAddDialog" :icon="Minus">离职</el-button>
        <el-button @click="handleExportEmployees">导出</el-button>
      </div>
      <div class="filters-row">
        <div class="filter-col">
          <el-select v-model="primaryDeptId" placeholder="一级部门" class="filter-select" @change="handlePrimaryDeptChange">
            <el-option label="全部部门" value="" />
            <el-option
              v-for="dept in primaryDepartments"
              :key="dept.id"
              :label="dept.name"
              :value="dept.id"
            />
          </el-select>
        </div>
        <div class="filter-col">
          <el-select
            v-model="secondaryDeptName"
            placeholder="二级部门"
            class="filter-select"
            :disabled="!primaryDeptId"
            @change="handleSecondaryDeptChange"
          >
            <el-option label="全部二级部门" value="" />
            <el-option
              v-for="dept in secondaryDepartments"
              :key="dept.id"
              :label="dept.name"
              :value="dept.name"
            />
          </el-select>
        </div>
        <div class="filter-col">
          <el-select
            v-model="positionFilter"
            placeholder="职级"
            class="filter-select"
            clearable
            @change="handleFilterChange"
          >
            <el-option
              v-for="pos in positionOptions"
              :key="pos"
              :label="pos"
              :value="pos"
            />
          </el-select>
        </div>
        <div class="filter-col filter-col-date">
          <el-date-picker
            v-model="hireDateStart"
            type="date"
            placeholder="入职开始日期"
            class="filter-select"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            @change="handleFilterChange"
          />
        </div>
        <div class="filter-col filter-col-date">
          <el-date-picker
            v-model="hireDateEnd"
            type="date"
            placeholder="入职结束日期"
            class="filter-select"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            @change="handleFilterChange"
          />
        </div>
        <div class="filter-col">
          <el-input
            v-model="nameFilter"
            placeholder="按姓名筛选"
            clearable
            @input="handleFilterChange"
          />
        </div>
        <div class="form-actions">
          <el-button @click="resetFilters">重置筛选</el-button>
        </div>
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
      <el-table-column prop="staffID" label="工号" min-width="60" align="center"/>
      <el-table-column prop="staffName" label="姓名" min-width="100" align="center"/>
      <el-table-column prop="staffGender" label="性别" min-width="60" align="center"/>
      <el-table-column label="所属部门" min-width="180" align="center">
        <template #default="scope">
          {{ getDepartmentDisplay(scope.row.staffDept) }}
        </template>
      </el-table-column>
      <el-table-column prop="staffPos" label="职级" min-width="100" align="center"/>
      <el-table-column prop="staffPhone" label="手机号码" min-width="100" align="center"/>
      <el-table-column prop="staffHireDate" label="入职日期" min-width="100" align="center"/>
      
      <el-table-column label="操作" width="120" fixed="right" align="center">
        <template #default="scope">
          <el-button-group>
            <el-button @click="openEditDialog(scope.row)" :icon="Edit">编辑</el-button>
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
                  v-for="dept in departmentPathOptions" 
                  :key="dept.id" 
                  :label="dept.fullName" 
                  :value="dept.fullName" 
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
        <el-button
          v-if="isEditingEmployee"
          type="danger"
          :icon="Delete"
          @click="handleDelete(currentEmployee)"
        >删除</el-button>
        <el-button
          v-if="isEditingEmployee"
          type="warning"
          @click="handleResetPassword(currentEmployee.staffID, currentEmployee.staffName)"
        >重置密码</el-button>
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

.search-form-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: stretch;
  margin-bottom: 20px;
}

.filters-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
}

.filter-col {
  width: 200px;
}

.filter-col-date {
  width: 260px;
}

.filter-select {
  width: 100%;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding: 0 15px 15px;
}

@media (max-width: 768px) {
  .filter-col,
  .filter-col-date {
    width: 100%;
  }
}
</style>
