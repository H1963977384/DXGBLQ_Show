<script setup>
import { ref, onMounted, computed, reactive, watch } from 'vue'
import { useEmployeesStore, useDepartmentStore, useSalaryStore } from '@/stores'
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
const salaryStore = useSalaryStore()

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
const insuranceDialogVisible = ref(false)

const insuranceConfig = reactive({})
const taxConfig = reactive({
  threshold: 5000,
  brackets: []
})

const insuranceFields = [
  { key: 'pension', label: '养老保险' },
  { key: 'medical', label: '医疗保险' },
  { key: 'unemployment', label: '失业保险' },
  { key: 'injury', label: '工伤保险' },
  { key: 'maternity', label: '生育保险' },
  { key: 'housingFund', label: '住房公积金' }
]

const insurancePropMap = {
  pension: 'pensionInsurance',
  medical: 'medicalInsurance',
  unemployment: 'unemploymentInsurance',
  injury: 'industrialInjuryInsurance',
  maternity: 'maternityInsurance',
  housingFund: 'housingFund'
}

const editingCellKey = ref('')
const editingCellField = ref('')
const editingCellValue = ref(0)

const isFirstTaxBracket = (index) => index === 0
const isLastTaxBracket = (index) => index === taxConfig.brackets.length - 1

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

const getPositionDisplay = (emp) => {
  if (!emp) {
    return ''
  }

  const deptText = getDepartmentDisplay(emp.staffDept)
  const positionText = emp.staffPos || ''

  if (!deptText) {
    return positionText
  }

  if (!positionText) {
    return deptText
  }

  return `${deptText}-${positionText}`
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
const dateText = computed(() => {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
})

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

const toNumber = (value) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

const round2 = (value) => Math.round((toNumber(value) + Number.EPSILON) * 100) / 100

const getRowEditKey = (row, index = 0) => {
  return row.staffID || `${row.staffName || 'row'}-${row.accountingMonth || 'month'}-${index}`
}

const getCellEditKey = (row, index, field) => {
  return `${getRowEditKey(row, index)}-${field}`
}

const formatAmount = (value) => round2(value).toFixed(2)

const normalizeTaxRangeValue = (value, allowNull = false) => {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return allowNull ? null : 0
  }

  if (allowNull && numericValue === 0) {
    return null
  }

  return numericValue
}

const convertLegacyUpperLimitBrackets = (sourceBrackets = [], threshold = 5000) => {
  let previousUpper = threshold

  return sourceBrackets.map((item, index) => {
    const upper = normalizeTaxRangeValue(item?.upperLimit, true)
    const absoluteUpper = upper == null ? null : threshold + upper
    const current = {
      start: previousUpper,
      end: absoluteUpper,
      rate: toNumber(item?.rate)
    }

    if (index === sourceBrackets.length - 1) {
      current.end = null
    }

    previousUpper = absoluteUpper == null ? previousUpper : absoluteUpper
    return current
  })
}

const normalizeTaxBrackets = (sourceBrackets = taxConfig.brackets, threshold = toNumber(taxConfig.threshold)) => {
  const safeSource = Array.isArray(sourceBrackets) ? sourceBrackets : []
  const hasLegacyUpperLimit = safeSource.some((item) => Object.prototype.hasOwnProperty.call(item || {}, 'upperLimit'))

  const initial = hasLegacyUpperLimit
    ? convertLegacyUpperLimitBrackets(safeSource, threshold)
    : safeSource.map((item) => ({
      start: normalizeTaxRangeValue(item?.start),
      end: normalizeTaxRangeValue(item?.end, true),
      rate: toNumber(item?.rate)
    }))

  const sorted = [...initial].sort((a, b) => a.start - b.start)

  return sorted.map((item, index) => {
    const start = index === 0 ? threshold : normalizeTaxRangeValue(sorted[index - 1].end)
    const isLast = index === sorted.length - 1
    let end = isLast ? null : normalizeTaxRangeValue(item.end)

    if (!isLast && end <= start) {
      end = start + 1000
    }

    return {
      start,
      end,
      rate: toNumber(item.rate)
    }
  })
}

const getSortedTaxBrackets = () => {
  return normalizeTaxBrackets(taxConfig.brackets)
}

const calculatePersonalIncomeTax = (taxableIncome) => {
  if (taxableIncome <= toNumber(taxConfig.threshold)) {
    return 0
  }

  const matched = getSortedTaxBrackets().find((item) => {
    const inStart = taxableIncome >= item.start
    const inEnd = item.end == null || taxableIncome < item.end
    return inStart && inEnd
  })
  if (!matched) {
    return 0
  }

  const taxAmount = taxableIncome * matched.rate / 100
  return round2(Math.max(taxAmount, 0))
}

const recalculateSalaryRow = (row) => {
  const baseSalary = round2(row.baseSalary)
  row.baseSalary = baseSalary

  const grossIncome = round2(baseSalary + toNumber(row.performanceSalary) + toNumber(row.otherBonus))

  let insuranceDeductionTotal = 0
  insuranceFields.forEach(({ key }) => {
    const targetProp = insurancePropMap[key]
    if (!targetProp) {
      return
    }

    const personalRate = toNumber(insuranceConfig[key]?.personal)
    const deduction = round2(grossIncome * personalRate / 100)
    row[targetProp] = deduction
    insuranceDeductionTotal += deduction
  })

  const taxableIncome = round2(grossIncome - insuranceDeductionTotal)
  row.personalIncomeTax = calculatePersonalIncomeTax(taxableIncome)

  const extraDeduction = toNumber(row.personalIncomeTax) + toNumber(row.attendanceDeductions) + toNumber(row.otherDeductions)
  row.actualSalary = round2(grossIncome - insuranceDeductionTotal - extraDeduction)
}

const recalculateAllSalaryRows = () => {
  employees.value.forEach((row) => recalculateSalaryRow(row))
}

const startEditAmount = (row, index, field) => {
  editingCellKey.value = getCellEditKey(row, index, field)
  editingCellField.value = field
  editingCellValue.value = round2(row[field])
}

const isEditingAmount = (row, index, field) => {
  return editingCellKey.value === getCellEditKey(row, index, field)
}

const submitAmountEdit = (row, field) => {
  if (editingCellField.value !== field) {
    return
  }

  row[field] = round2(editingCellValue.value)
  recalculateSalaryRow(row)
  editingCellKey.value = ''
  editingCellField.value = ''
}

const cancelAmountEdit = () => {
  editingCellKey.value = ''
  editingCellField.value = ''
}


const syncInsuranceConfigFromStore = (config = {}) => {
  insuranceFields.forEach(({ key }) => {
    const currentItem = config[key] || { personal: 0, company: 0 }

    if (!insuranceConfig[key]) {
      insuranceConfig[key] = { personal: 0, company: 0 }
    }

    insuranceConfig[key].personal = Number(currentItem.personal ?? 0)
    insuranceConfig[key].company = Number(currentItem.company ?? 0)
  })
}

const syncTaxConfigFromStore = (config = {}) => {
  taxConfig.threshold = toNumber(config.threshold ?? 5000)
  const sourceBrackets = Array.isArray(config.brackets) ? config.brackets : []

  taxConfig.brackets = normalizeTaxBrackets(sourceBrackets)

  if (!taxConfig.brackets.length) {
    taxConfig.brackets = [
      { start: 5000, end: 8000, rate: 3 },
      { start: 8000, end: 17000, rate: 10 },
      { start: 17000, end: 30000, rate: 20 },
      { start: 30000, end: 40000, rate: 25 },
      { start: 40000, end: 60000, rate: 30 },
      { start: 60000, end: 85000, rate: 35 },
      { start: 85000, end: null, rate: 45 }
    ]
  }
}

const addTaxBracketRow = () => {
  taxConfig.brackets = normalizeTaxBrackets(taxConfig.brackets)

  if (taxConfig.brackets.length < 2) {
    return
  }

  const lastIndex = taxConfig.brackets.length - 1
  const prev = taxConfig.brackets[lastIndex - 1]
  const last = taxConfig.brackets[lastIndex]
  const newStart = toNumber(prev.end)
  const newEnd = last.end == null ? newStart + 1000 : toNumber(last.end)

  taxConfig.brackets.splice(lastIndex, 0, {
    start: newStart,
    end: newEnd,
    rate: toNumber(last.rate)
  })

  taxConfig.brackets = normalizeTaxBrackets(taxConfig.brackets)
}

const removeTaxBracketRow = (index) => {
  const isFirst = index === 0
  const isLast = index === taxConfig.brackets.length - 1

  if (taxConfig.brackets.length <= 1 || isFirst || isLast) {
    return
  }

  taxConfig.brackets.splice(index, 1)
  taxConfig.brackets = normalizeTaxBrackets(taxConfig.brackets)
}

const openInsuranceDialog = () => {
  syncInsuranceConfigFromStore(salaryStore.insuranceConfig)
  syncTaxConfigFromStore(salaryStore.taxConfig)
  insuranceDialogVisible.value = true
}

const saveInsuranceConfig = () => {
  taxConfig.brackets = normalizeTaxBrackets(taxConfig.brackets)

  salaryStore.saveInsuranceConfig(insuranceConfig, {
    threshold: taxConfig.threshold,
    brackets: taxConfig.brackets
  })

  recalculateAllSalaryRows()
  insuranceDialogVisible.value = false
  ElMessage.success('参数已保存')
}

const handleExportSalaries = () => {
  if (!filteredEmployees.value.length) {
    ElMessage.warning('暂无可导出的薪酬数据')
    return
  }

  const rows = [
    ['工号', '姓名', '岗位', '应发工资', '', '', '应扣工资', '', '', '', '', '', '', '', '', '实发工资'],
    ['', '', '', '', '基础工资', '绩效工资', '其他奖金', '养老保险', '医疗保险', '失业保险', '工伤保险', '生育保险', '住房公积金', '个人所得税', '考勤扣款', '其他扣款', '']
  ]

  filteredEmployees.value.forEach((row) => {
    rows.push([
      row.staffID,
      row.staffName,
      getPositionDisplay(row),
      row.accountingMonth,
      row.baseSalary,
      row.performanceSalary,
      row.otherBonus,
      row.pensionInsurance,
      row.medicalInsurance,
      row.unemploymentInsurance,
      row.industrialInjuryInsurance,
      row.maternityInsurance,
      row.housingFund,
      row.personalIncomeTax,
      row.attendanceDeductions,
      row.otherDeductions,
      row.actualSalary
    ])
  })

  const lastRowIndex = rows.length - 1
  const lastColumnIndex = 16
  const borderColor = 'C2CCDA'
  const baseBorderStyle = {
    top: { style: 'thin', color: { rgb: borderColor } },
    bottom: { style: 'thin', color: { rgb: borderColor } },
    left: { style: 'thin', color: { rgb: borderColor } },
    right: { style: 'thin', color: { rgb: borderColor } }
  }
  const centerAlignment = { horizontal: 'center', vertical: 'center', wrapText: true }

  exportToXls({
    fileName: `薪酬发放明细_${dateText.value}`,
    sheetName: '薪酬发放',
    rows,
    merges: [
      { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
      { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },
      { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } },
      { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } },
      { s: { r: 0, c: 4 }, e: { r: 0, c: 6 } },
      { s: { r: 0, c: 7 }, e: { r: 0, c: 15 } },
      { s: { r: 0, c: 16 }, e: { r: 1, c: 16 } }
    ],
    columnWidths: [
      { wch: 10 },
      { wch: 10 },
      { wch: 22 },
      { wch: 12 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
      { wch: 12 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 }
    ],
    rowHeights: [
      { hpt: 24 },
      { hpt: 22 }
    ],
    styleRanges: [
      {
        s: { r: 0, c: 0 },
        e: { r: lastRowIndex, c: lastColumnIndex },
        style: {
          border: baseBorderStyle,
          alignment: centerAlignment,
          font: { name: 'Microsoft YaHei', sz: 10 }
        }
      },
      {
        s: { r: 0, c: 0 },
        e: { r: 0, c: lastColumnIndex },
        style: {
          border: baseBorderStyle,
          alignment: centerAlignment,
          fill: { patternType: 'solid', fgColor: { rgb: 'F5F8FF' } },
          font: { name: 'Microsoft YaHei', sz: 11, bold: true, color: { rgb: '000000' } }
        }
      },
      {
        s: { r: 1, c: 0 },
        e: { r: 1, c: lastColumnIndex },
        style: {
          border: baseBorderStyle,
          alignment: centerAlignment,
          fill: { patternType: 'solid', fgColor: { rgb: 'F5F8FF' } },
          font: { name: 'Microsoft YaHei', sz: 10, color: { rgb: '000000' } }
        }
      }
    ]
  })

  ElMessage.success('薪酬数据导出成功')
}


// 加载数据
const loadData = () => {
  employeesStore.loadEmployees()
  departmentStore.loadDepartments()
}

onMounted(() => {
  loadData()
  salaryStore.loadInsuranceConfig()
  syncInsuranceConfigFromStore(salaryStore.insuranceConfig)
  syncTaxConfigFromStore(salaryStore.taxConfig)
  recalculateAllSalaryRows()
})

watch(employees, () => {
  recalculateAllSalaryRows()
})
</script>

<template>
  <div class="template-container">
    <div class="template-header">
      <div class="page-title">薪酬核发</div>
    </div>
    
    <div class="search-form-container">
      <div class="form-actions">
        <el-button type="primary" @click="openAddDialog">薪资核发</el-button>
        <el-button class="parameter-button" @click="openInsuranceDialog">参数维护</el-button>
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
      
      <div class="form-actions">
        <el-button type="primary">保存</el-button>
        <el-button>发布工资条</el-button>
        <el-button @click="handleExportSalaries">导出</el-button>
      </div>
    </div>
    
    <div class="subtitle">当前核发 {{ dateText }} 月份的薪酬</div>

    <el-table
      :data="paginatedEmployees"
      class="salary-table"
      style="width: 100%"
      v-loading="loading"
      border
      stripe
      highlight-current-row
    >
      <el-table-column type="selection" width="40" align="center" />
      <el-table-column prop="staffID" label="工号" min-width="50" align="center"/>
      <el-table-column prop="staffName" label="姓名" min-width="70" align="center"/>
      <el-table-column label="岗位" min-width="170" align="center">
        <template #default="scope">
          {{ getPositionDisplay(scope.row) }}
        </template>
      </el-table-column>
      <el-table-column label="应发工资" align="center">
        <el-table-column label="基础工资" min-width="80" align="center">
          <template #default="scope">
            <el-input-number
              v-if="isEditingAmount(scope.row, scope.$index, 'baseSalary')"
              v-model="editingCellValue"
              :min="0"
              :precision="2"
              :step="100"
              :controls="false"
              class="inline-salary-input"
              @blur="submitAmountEdit(scope.row, 'baseSalary')"
              @keyup.enter="submitAmountEdit(scope.row, 'baseSalary')"
              @keyup.esc="cancelAmountEdit"
            />
            <div
              v-else
              class="editable-salary-cell"
              @dblclick="startEditAmount(scope.row, scope.$index, 'baseSalary')"
            >
              {{ formatAmount(scope.row.baseSalary) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="绩效工资" min-width="80" align="center">
          <template #default="scope">
            <el-input-number
              v-if="isEditingAmount(scope.row, scope.$index, 'performanceSalary')"
              v-model="editingCellValue"
              :min="0"
              :precision="2"
              :step="100"
              :controls="false"
              class="inline-salary-input"
              @blur="submitAmountEdit(scope.row, 'performanceSalary')"
              @keyup.enter="submitAmountEdit(scope.row, 'performanceSalary')"
              @keyup.esc="cancelAmountEdit"
            />
            <div
              v-else
              class="editable-salary-cell"
              @dblclick="startEditAmount(scope.row, scope.$index, 'performanceSalary')"
            >
              {{ formatAmount(scope.row.performanceSalary) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="其他奖金" min-width="80" align="center">
          <template #default="scope">
            <el-input-number
              v-if="isEditingAmount(scope.row, scope.$index, 'otherBonus')"
              v-model="editingCellValue"
              :min="0"
              :precision="2"
              :step="100"
              :controls="false"
              class="inline-salary-input"
              @blur="submitAmountEdit(scope.row, 'otherBonus')"
              @keyup.enter="submitAmountEdit(scope.row, 'otherBonus')"
              @keyup.esc="cancelAmountEdit"
            />
            <div
              v-else
              class="editable-salary-cell"
              @dblclick="startEditAmount(scope.row, scope.$index, 'otherBonus')"
            >
              {{ formatAmount(scope.row.otherBonus) }}
            </div>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="应扣工资" align="center">
        <el-table-column prop="pensionInsurance" label="养老保险" min-width="50" align="center"/>
        <el-table-column prop="medicalInsurance" label="医疗保险" min-width="50" align="center"/>
        <el-table-column prop="unemploymentInsurance" label="失业保险" min-width="50" align="center"/>
        <el-table-column prop="industrialInjuryInsurance" label="工伤保险" min-width="50" align="center"/>
        <el-table-column prop="maternityInsurance" label="生育保险" min-width="50" align="center"/>
        <el-table-column prop="housingFund" label="住房公积金" min-width="60" align="center"/>
        <el-table-column prop="personalIncomeTax" label="个人所得税" min-width="60" align="center"/>
        <el-table-column prop="attendanceDeductions" label="考勤扣款" min-width="50" align="center"/>
        <el-table-column label="其他扣款" min-width="80" align="center">
          <template #default="scope">
            <el-input-number
              v-if="isEditingAmount(scope.row, scope.$index, 'otherDeductions')"
              v-model="editingCellValue"
              :min="0"
              :precision="2"
              :step="100"
              :controls="false"
              class="inline-salary-input"
              @blur="submitAmountEdit(scope.row, 'otherDeductions')"
              @keyup.enter="submitAmountEdit(scope.row, 'otherDeductions')"
              @keyup.esc="cancelAmountEdit"
            />
            <div
              v-else
              class="editable-salary-cell"
              @dblclick="startEditAmount(scope.row, scope.$index, 'otherDeductions')"
            >
              {{ formatAmount(scope.row.otherDeductions) }}
            </div>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column prop="actualSalary" label="实发工资" min-width="60" align="center"/>
      <el-table-column prop="issueStatus" label="签发状态" min-width="60" align="center"/>
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

    <el-dialog
      v-model="insuranceDialogVisible"
      class="insurance-dialog"
      title="参数维护"
      width="760px"
      destroy-on-close
    >
      <div class="insurance-dialog-content">
        <el-table :data="insuranceFields" border>
        <el-table-column prop="label" label="项目" min-width="180" align="center" />
        <el-table-column label="个人比例(%)" min-width="220" align="center">
          <template #default="scope">
            <el-input-number
              v-model="insuranceConfig[scope.row.key].personal"
              :min="0"
              :max="100"
              :precision="2"
              :step="0.1"
              controls-position="right"
            />
          </template>
        </el-table-column>
        <el-table-column label="公司比例(%)" min-width="220" align="center">
          <template #default="scope">
            <el-input-number
              v-model="insuranceConfig[scope.row.key].company"
              :min="0"
              :max="100"
              :precision="2"
              :step="0.1"
              controls-position="right"
            />
          </template>
        </el-table-column>
        </el-table>

        <div class="tax-threshold-row">
          <span class="tax-threshold-label">个税起征点(元)</span>
          <el-input-number
            v-model="taxConfig.threshold"
            :min="0"
            :precision="2"
            :step="100"
            controls-position="right"
            @change="taxConfig.brackets = normalizeTaxBrackets(taxConfig.brackets)"
          />
        </div>

        <el-table :data="taxConfig.brackets" border>
        <el-table-column label="区间起点(元)" min-width="180" align="center">
          <template #default="scope">
            <el-input-number
              v-model="scope.row.start"
              :min="0"
              :precision="2"
              :step="100"
              controls-position="right"
              :disabled="isFirstTaxBracket(scope.$index)"
            />
          </template>
        </el-table-column>
        <el-table-column label="区间终点(元)" min-width="180" align="center">
          <template #default="scope">
            <el-input
              v-if="isLastTaxBracket(scope.$index)"
              class="tax-end-input"
              model-value="无上限"
              disabled
            />
            <el-input-number
              v-else
              class="tax-end-input"
              v-model="scope.row.end"
              :min="0"
              :precision="2"
              :step="100"
              controls-position="right"
            />
          </template>
        </el-table-column>
        <el-table-column label="税率(%)" min-width="140" align="center">
          <template #default="scope">
            <el-input-number
              v-model="scope.row.rate"
              :min="0"
              :max="100"
              :precision="2"
              :step="0.1"
              controls-position="right"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="80" align="center">
          <template #default="scope">
            <el-button
              
              type="danger"
              plain
              :disabled="taxConfig.brackets.length <= 1 || isFirstTaxBracket(scope.$index) || isLastTaxBracket(scope.$index)"
              @click="removeTaxBracketRow(scope.$index)"
            >删除</el-button>
          </template>
        </el-table-column>
        </el-table>

        <div class="tax-actions-row">
          <el-button type="primary" plain :icon="Plus" @click="addTaxBracketRow">新增</el-button>
        </div>
      </div>

      <template #footer>
        <el-button @click="insuranceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveInsuranceConfig">保存</el-button>
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

.parameter-button {
  margin-left: auto;
  width: 100px
}

.filter-col {
  width: 110px;
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

.insurance-alert {
  margin-bottom: 16px;
}

.insurance-dialog-content {
  padding: 14px 18px 18px;
}

.insurance-dialog :deep(.el-dialog__body) {
  gap: 10px;
}

.insurance-dialog :deep(.el-table) {
  margin: 10px 10px 10px 10px;
}

.tax-threshold-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 14px 0;
}

.tax-threshold-label {
  min-width: 120px;
  color: #2f3a4a;
}

.tax-end-input {
  width: 100%;
}

.tax-actions-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.subtitle {
  margin-bottom: 10px;
  color: #666;
}

.salary-table {
  --salary-header-top-bg: #f5f8ff;
  --salary-header-top-color: black;
  --salary-header-sub-bg: #f5f8ff;
  --salary-header-sub-color: black;
  --salary-grid-color: #c2ccda;
  --el-table-border-color: var(--salary-grid-color);
  --el-table-border: 1px solid var(--salary-grid-color);
}

.salary-table :deep(.el-table__header-wrapper thead tr:first-child th) {
  background: var(--salary-header-top-bg);
  color: var(--salary-header-top-color);
  font-weight: 700;
}

.salary-table :deep(.el-table__header-wrapper thead tr:nth-child(2) th) {
  background: var(--salary-header-sub-bg);
  color: var(--salary-header-sub-color);
  font-weight: 400;
}

.salary-table :deep(.el-table__cell) {
  border-right: 1px solid var(--salary-grid-color);
}

.salary-table :deep(.el-table tr td) {
  border-bottom: 1px solid var(--salary-grid-color);
}

.editable-salary-cell {
  width: 100%;
  min-height: 28px;
  line-height: 28px;
  cursor: cell;
  user-select: none;
}

.editable-salary-cell:hover {
  color: #2b69c9;
  font-weight: 600;
}

.inline-salary-input {
  width: 100%;
}

@media (max-width: 768px) {
  .form-actions {
    width: 100%;
  }

  .parameter-button {
    margin-left: 0;
  }

  .filter-col,
  .filter-col-date {
    width: 100%;
  }
}
</style>
