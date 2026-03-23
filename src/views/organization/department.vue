<script setup>
import { ref, onMounted, onBeforeUnmount, computed, reactive, nextTick } from 'vue'
import { useDepartmentStore } from '../../stores'
import { 
  Plus, 
  Delete, 
  Edit
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const departmentStore = useDepartmentStore()

// 展开的部门列表
const expandedDepts = ref([])

// 菜单权限列表
const menuPermissions = ref([
  { id: 'O-1', name: '组织管理-部门信息维护' },
  { id: 'O-2', name: '组织管理-职级信息维护' },
  { id: 'H-1', name: '人事管理-员工信息维护' },
  { id: 'H-2', name: '人事管理-电子合同管理' },
  { id: 'H-3', name: '人事管理-绩效管理' },
  { id: 'H-4', name: '人事管理-排班管理' },
])

// 排班模式选项
const shiftTypeOptions = [
  { label: '请选择', value: -1 },
  { label: '固定班制', value: 0 },
  { label: '自由工时', value: 1 },
  { label: '排班制', value: 2 }
]

// 工作日选项
const weekDayOptions = [
  { label: '周一', value: '1' },
  { label: '周二', value: '2' },
  { label: '周三', value: '3' },
  { label: '周四', value: '4' },
  { label: '周五', value: '5' },
  { label: '周六', value: '6' },
  { label: '周日', value: '7' }
]

// 部门列表
const departments = computed(() => departmentStore.departments)

// 表格加载状态
const loading = computed(() => departmentStore.loading)

// 对话框可见性
const addLevel1DialogVisible = ref(false)
const addLevel2DialogVisible = ref(false)
const editDialogVisible = ref(false)
const attendanceLocationDialogVisible = ref(false)

// 当前编辑的部门
const currentDepartment = reactive({
  DeptID: '',
  DeptName: '',
  supportChannels: '',
  AttendanceDay: '',
  SuperiorDept: -1,
  ShiftType: -1,
  AttendanceRule1Start: '',
  AttendanceRule1End: '',
  AttendanceRule2Start: '',
  AttendanceRule2End: '',
  ForceEndTime: '',
  attendanceLocation: [] // 新增：考勤定位坐标数组
})

// 分页相关变量
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 地图相关变量
const attendanceMap = ref(null)
const attendanceMarkers = ref([])
const attendancePolygon = ref(null)

const normalizeMapPosition = (point) => {
  if (!point) return null
  if (Array.isArray(point)) return point
  if (typeof point.lng === 'number' && typeof point.lat === 'number') {
    return [point.lng, point.lat]
  }
  return null
}

const clearAttendanceOverlays = () => {
  attendanceMarkers.value.forEach(marker => marker.setMap(null))
  attendanceMarkers.value = []

  if (attendancePolygon.value) {
    attendancePolygon.value.setMap(null)
    attendancePolygon.value = null
  }
}

const destroyAttendanceMap = () => {
  clearAttendanceOverlays()

  if (attendanceMap.value) {
    attendanceMap.value.off('click')
    attendanceMap.value.destroy()
    attendanceMap.value = null
  }
}

const updateAttendancePolygonFromMarkers = () => {
  if (attendanceMarkers.value.length === 4) {
    drawPolygon(attendanceMarkers.value.map(marker => marker.getPosition()))
  } else if (attendancePolygon.value) {
    attendancePolygon.value.setMap(null)
    attendancePolygon.value = null
  }
}

const bindMarkerDragEvents = (marker) => {
  marker.on('dragging', updateAttendancePolygonFromMarkers)
  marker.on('dragend', () => {
    updateAttendancePolygonFromMarkers()
    attendanceMap.value?.setFitView([...attendanceMarkers.value, ...(attendancePolygon.value ? [attendancePolygon.value] : [])])
  })
}

const renderAttendanceMarkers = (locations) => {
  const positions = (locations || [])
    .map(normalizeMapPosition)
    .filter(Boolean)

  positions.forEach(position => {
    const marker = new AMap.Marker({
      position,
      map: attendanceMap.value,
      draggable: true,
      cursor: 'move'
    })
    bindMarkerDragEvents(marker)
    attendanceMarkers.value.push(marker)
  })

  if (positions.length === 4) {
    updateAttendancePolygonFromMarkers()
    attendanceMap.value.setFitView([...attendanceMarkers.value, attendancePolygon.value])
  } else if (positions.length > 0) {
    attendanceMap.value.setFitView(attendanceMarkers.value)
  }
}

// 过滤后的部门列表（只显示一级部门）
const filteredDepartments = computed(() => {
  return departments.value.filter(dept => {
    // 只显示一级部门（SuperiorDept为-1或null或undefined）
    return dept.SuperiorDept === -1 || dept.SuperiorDept == null
  })
})

// 分页后的部门列表
const paginatedDepartments = computed(() => {
  pagination.value.total = filteredDepartments.value.length
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredDepartments.value.slice(start, end)
})

// 表格显示数据（包含展开的子部门）
const tableData = computed(() => {
  const result = []
  
  paginatedDepartments.value.forEach(dept => {
    // 添加一级部门
    result.push(dept)
    
    // 如果该部门已展开，添加其子部门
    if (isDepartmentExpanded(dept.DeptID)) {
      const subDepts = getSubDepartments(dept.DeptID)
      subDepts.forEach(subDept => {
        result.push({
          ...subDept,
          isSubDept: true // 标记为子部门
        })
      })
    }
  })
  
  return result
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

// 切换部门展开状态
const toggleDepartment = (deptId) => {
  const index = expandedDepts.value.indexOf(deptId)
  if (index > -1) {
    expandedDepts.value.splice(index, 1)
  } else {
    expandedDepts.value.push(deptId)
  }
}

// 检查部门是否展开
const isDepartmentExpanded = (deptId) => {
  return expandedDepts.value.includes(deptId)
}

// 获取某个部门的子部门
const getSubDepartments = (parentId) => {
  return departments.value.filter(dept => dept.SuperiorDept === parentId)
}

// 打开新增一级部门对话框
const openAddLevel1Dialog = () => {
  Object.assign(currentDepartment, {
    DeptID: '',
    DeptName: '',
    SuperiorDept: -1,
    ShiftType: -1,
    ForceEndTime: '0000',
    supportChannels: '0'.repeat(menuPermissions.value.length),
    attendanceLocation: []
  })
  addLevel1DialogVisible.value = true
}

// 打开新增二级部门对话框
const openAddLevel2Dialog = () => {
  Object.assign(currentDepartment, {
    DeptID: '',
    DeptName: '',
    SuperiorDept: null,
    ShiftType: -1,
    ForceEndTime: '0000',
    supportChannels: '0'.repeat(menuPermissions.value.length),
    attendanceLocation: []
  })
  addLevel2DialogVisible.value = true
}

// 打开编辑对话框
const openEditDialog = (dept) => {
  const deptCopy = JSON.parse(JSON.stringify(dept))
  // 确保 supportChannels 是字符串
  if (typeof deptCopy.supportChannels !== 'string') {
    deptCopy.supportChannels = '0'.repeat(menuPermissions.value.length)
  }
  // 确保 attendanceLocation 是数组
  if (!deptCopy.attendanceLocation) {
    deptCopy.attendanceLocation = []
  }
  if (!deptCopy.ForceEndTime) {
    deptCopy.ForceEndTime = ''
  }
  Object.assign(currentDepartment, deptCopy)
  editDialogVisible.value = true
}

// 打开考勤定位对话框
const openAttendanceLocationDialog = () => {
  attendanceLocationDialogVisible.value = true
  nextTick(() => {
    destroyAttendanceMap()

    attendanceMap.value = new AMap.Map('attendanceMap', {
      center: [110.697564, 29.395224],
      zoom: 15,
      dragEnable: true,
      scrollWheel: true,
      doubleClickZoom: true,
      jogEnable: true
    })

    attendanceMap.value.resize()

    if (currentDepartment.attendanceLocation && currentDepartment.attendanceLocation.length > 0) {
      renderAttendanceMarkers(currentDepartment.attendanceLocation)
    }

    attendanceMap.value.on('click', (e) => {
      if (attendanceMarkers.value.length < 4) {
        const marker = new AMap.Marker({
          position: [e.lnglat.lng, e.lnglat.lat],
          map: attendanceMap.value,
          draggable: true,
          cursor: 'move'
        })
        bindMarkerDragEvents(marker)
        attendanceMarkers.value.push(marker)
        if (attendanceMarkers.value.length === 4) {
          updateAttendancePolygonFromMarkers()
          attendanceMap.value.setFitView([...attendanceMarkers.value, attendancePolygon.value])
        }
      }
    })
  })
}

const closeAttendanceLocationDialog = () => {
  attendanceLocationDialogVisible.value = false
  destroyAttendanceMap()
}

const resetAttendanceLocationDraft = () => {
  clearAttendanceOverlays()
}

// 保存部门
const saveDepartment = () => {
  if (!currentDepartment.DeptName) {
    ElMessage.warning('请填写必填字段')
    return
  }
  
  if (currentDepartment.DeptID) {
    // 更新部门
    departmentStore.updateDepartment(currentDepartment.DeptID, currentDepartment)
  } else {
    // 添加新部门
    departmentStore.addDepartment(currentDepartment)
  }
  
  addLevel1DialogVisible.value = false
  addLevel2DialogVisible.value = false
  editDialogVisible.value = false
}

// 删除部门
const handleDelete = (dept) => {
  // 一级部门下有二级部门时不允许删除
  const isLevel1 = dept.SuperiorDept === -1 || dept.SuperiorDept == null
  if (isLevel1) {
    const subDepts = getSubDepartments(dept.DeptID)
    if (subDepts.length > 0) {
      ElMessage.warning(`部门 "${dept.DeptName}" 下存在 ${subDepts.length} 个二级部门，请先删除子部门后再删除该部门`)
      return
    }
  }
  ElMessageBox.confirm(
    `确定要删除 ${dept.DeptName} 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    departmentStore.deleteDepartment(dept.DeptID)
  }).catch(() => {
    // 用户取消
  })
}

// 将二进制字符串转换为选中的菜单数组
const getBitsFromString = (str) => {
  const bits = []
  if (!str || typeof str !== 'string') return bits
  
  for (let i = 0; i < str.length && i < menuPermissions.value.length; i++) {
    if (str[i] === '1') {
      bits.push(menuPermissions.value[i].id)
    }
  }
  return bits
}

// 将选中的菜单数组转换为二进制字符串
const getStringFromBits = (bits) => {
  let str = ''
  if (!Array.isArray(bits)) bits = []
  
  for (let i = 0; i < menuPermissions.value.length; i++) {
    const menu = menuPermissions.value[i]
    str += bits.includes(menu.id) ? '1' : '0'
  }
  return str
}

// 全选菜单权限
const selectAllMenus = () => {
  currentDepartment.supportChannels = '1'.repeat(menuPermissions.value.length)
}

// 全不选菜单权限
const clearAllMenus = () => {
  currentDepartment.supportChannels = '0'.repeat(menuPermissions.value.length)
}

// 绘制多边形
const drawPolygon = (positions) => {
  const polygonPath = positions
    .map(normalizeMapPosition)
    .filter(Boolean)

  if (attendancePolygon.value) {
    attendancePolygon.value.setMap(null)
  }

  attendancePolygon.value = new AMap.Polygon({
    path: polygonPath,
    strokeColor: '#FF0000',
    strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.3
  })
  attendancePolygon.value.setMap(attendanceMap.value)
}

// 保存考勤定位
const saveAttendanceLocation = () => {
  if (attendanceMarkers.value.length === 4) {
    const coords = attendanceMarkers.value.map(m => {
      const pos = m.getPosition()
      return { lng: pos.lng, lat: pos.lat }
    })
    currentDepartment.attendanceLocation = coords
    closeAttendanceLocationDialog()
  } else {
    ElMessage.warning('请先选择四个点')
  }
}

// 格式化考勤定位显示
const formatAttendanceLocation = (locations) => {
  if (!locations || locations.length === 0) return '未设置'
  return locations.map(l => `${l.lng.toFixed(4)}, ${l.lat.toFixed(4)}`).join('; ')
}

// 加载数据
const loadData = () => {
  departmentStore.loadDepartments()
}

// 只允许 4 位数字时间输入
const normalizeTimeInput = (value) => {
  if (value == null) return ''
  return String(value).replace(/\D/g, '').slice(0, 4)
}

// 工作日字符串 <-> 数组
const getAttendanceDaysArray = () => {
  if (!currentDepartment.AttendanceDay) return []
  return String(currentDepartment.AttendanceDay).split('')
}

const setAttendanceDaysFromArray = (vals) => {
  const sorted = Array.isArray(vals) ? vals.slice().sort() : []
  currentDepartment.AttendanceDay = sorted.join('')
}

// 格式化考勤展示
const formatAttendanceRule = (dept) => {
  if (!dept || dept.SuperiorDept == -1) return '———'

  const dayMap = { '1': '一', '2': '二', '3': '三', '4': '四', '5': '五', '6': '六', '7': '日' }

  const days = String(dept.AttendanceDay || '')
    .split('')
    .filter(d => dayMap[d])
    .map(d => dayMap[d])

  const dayText = days.length ? `周${days.join('、')}` : ''

  const formatTime = (val) => {
    const s = String(val || '')
    if (s.length !== 4) return s
    return `${s.slice(0, 2)}:${s.slice(2)}`
  }

  const formatRule = (start, end) => {
    if (!start || !end) return ''
    const startStr = formatTime(start)
    const endStr = formatTime(end)
    const startNum = Number(String(start).replace(/\D/g, '').slice(0, 4))
    const endNum = Number(String(end).replace(/\D/g, '').slice(0, 4))
    const nextDayPrefix = startNum && endNum && startNum > endNum ? '次日' : ''
    return `${startStr}-${nextDayPrefix}${endStr}`
  }

  const rule1 = formatRule(dept.AttendanceRule1Start, dept.AttendanceRule1End)
  const rule2 = formatRule(dept.AttendanceRule2Start, dept.AttendanceRule2End)
  const forceEnd = dept.ForceEndTime ? `强制下班:${formatTime(dept.ForceEndTime)}` : ''

  const timeText = [rule1, rule2, forceEnd].filter(Boolean).join(' ')
  if (dayText && timeText) return `${dayText}<br/>${timeText}`
  return dayText || timeText || '———'
}

// 获取行类名（用于设置背景色）
const getRowClassName = ({ row, rowIndex }) => {
  if (row.isSubDept) {
    return 'table-row-sub-dept'
  }
  // 一级部门交替颜色
  return rowIndex % 2 === 0 ? 'table-row-primary-even' : 'table-row-primary-odd'
}

onMounted(() => {
  loadData()
})

onBeforeUnmount(() => {
  destroyAttendanceMap()
})
</script>

<template>
  <div class="template-container">
    <div class="template-header">
      <div class="page-title">部门信息维护</div>
    </div>
    
    <div class="template-list-card">
      <div class="search-form-container">
        <div class="form-actions">
          <el-button type="primary" @click="openAddLevel1Dialog" :icon="Plus">新增一级部门</el-button>
          <el-button type="primary" @click="openAddLevel2Dialog" :icon="Plus">新增二级部门</el-button>
        </div>
      </div>
      
      <el-table
        :data="tableData"
        style="width: 100%"
        v-loading="loading"
        border
        highlight-current-row
        :show-overflow-tooltip="true"
        row-key="DeptID"
        :row-class-name="getRowClassName"
      >
        <el-table-column label="部门名称" min-width="190" align="center">
          <template #default="scope">
            <div class="dept-name-cell" :class="{ 'is-sub-dept': scope.row.isSubDept }">
              <span 
                v-if="!scope.row.isSubDept && getSubDepartments(scope.row.DeptID).length > 0"
                class="expand-icon"
                :class="{ 'is-expanded': isDepartmentExpanded(scope.row.DeptID) }"
                @click="toggleDepartment(scope.row.DeptID)"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
              </span>
              <span class="dept-name" :class="{ 'clickable': !scope.row.isSubDept && getSubDepartments(scope.row.DeptID).length > 0 }" @click="!scope.row.isSubDept && getSubDepartments(scope.row.DeptID).length > 0 && toggleDepartment(scope.row.DeptID)">
                {{ scope.row.DeptName }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="人数" min-width="70" align="center">
          
        </el-table-column>
        <el-table-column label="排班模式" min-width="85" align="center">
          <template #default="scope">
            {{ scope.row.ShiftType == 0 ? '固定班制' : (scope.row.ShiftType == 1 ? '自由工时' : (scope.row.ShiftType == 2 ? '排班制' : '———')) }}
          </template>
        </el-table-column>
        <el-table-column label="考勤规则" min-width="180" align="center">
          <template #default="scope">
            <span v-html="formatAttendanceRule(scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="175" fixed="right" align="center">
          <template #default="scope">
            <el-button-group v-if="!scope.row.isSubDept">
              <el-button @click="openEditDialog(scope.row)" :icon="Edit" size="small">编辑</el-button>
              <el-button type="danger" @click="handleDelete(scope.row)" :icon="Delete" size="small">删除</el-button>
            </el-button-group>
            <el-button-group v-else>
              <el-button @click="openEditDialog(scope.row)" :icon="Edit" size="small">编辑</el-button>
              <el-button type="danger" @click="handleDelete(scope.row)" :icon="Delete" size="small">删除</el-button>
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
    
    <!-- 新增一级部门对话框 -->
    <el-dialog
      v-model="addLevel1DialogVisible"
      title="新增一级部门"
      width="620px"
      destroy-on-close
    >
      <el-form label-width="120px">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <el-form-item label="部门名称" required>
              <el-input v-model="currentDepartment.DeptName" placeholder="请输入部门名称" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <el-form-item label="菜单权限" required>
              <div class="menu-actions">
                <el-button @click="selectAllMenus">全选</el-button>
                <el-button @click="clearAllMenus">全不选</el-button>
              </div>
              <el-checkbox-group 
                :model-value="getBitsFromString(currentDepartment.supportChannels)" 
                @update:model-value="(val) => { currentDepartment.supportChannels = getStringFromBits(val) }"
                class="checkbox-group-wrapper"
              >
                <el-checkbox 
                  v-for="menu in menuPermissions" 
                  :key="menu.id" 
                  :label="menu.id"
                >
                  {{ menu.name }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <template #footer>
        <el-button @click="addLevel1DialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveDepartment">保存</el-button>
      </template>
    </el-dialog>

    <!-- 新增二级部门对话框 -->
    <el-dialog
      v-model="addLevel2DialogVisible"
      title="新增二级部门"
      width="620px"
      destroy-on-close
    >
      <el-form label-width="120px">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <el-form-item label="部门名称" required>
              <el-input v-model="currentDepartment.DeptName" placeholder="请输入部门名称" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <el-form-item label="上级部门" required>
              <el-select 
                v-model="currentDepartment.SuperiorDept" 
                placeholder="请选择上级部门"
                clearable
                style="width: 100%"
              >
                <el-option 
                  v-for="dept in departments.filter(d => (d.SuperiorDept === -1 || d.SuperiorDept == null) && d.DeptID !== currentDepartment.DeptID)"
                  :key="dept.DeptID"
                  :label="dept.DeptName"
                  :value="dept.DeptID"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <el-form-item label="排班模式" required>
              <el-select
                v-model="currentDepartment.ShiftType"
                placeholder="请选择排班模式"
                style="width: 100%"
              >
                <el-option
                  v-for="opt in shiftTypeOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <el-form-item label="工作日" required>
              <el-checkbox-group
                :model-value="getAttendanceDaysArray()"
                @update:model-value="setAttendanceDaysFromArray"
                class="checkbox-group-wrapper"
              >
                <el-checkbox
                  v-for="day in weekDayOptions"
                  :key="day.value"
                  :label="day.value"
                >
                  {{ day.label }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-form-item label="规则1上班" required>
              <el-input
                v-model="currentDepartment.AttendanceRule1Start"
                placeholder="如 0900"
                maxlength="4"
                @input="(val) => { currentDepartment.AttendanceRule1Start = normalizeTimeInput(val) }"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-form-item label="规则1下班" required>
              <el-input
                v-model="currentDepartment.AttendanceRule1End"
                placeholder="如 1800"
                maxlength="4"
                @input="(val) => { currentDepartment.AttendanceRule1End = normalizeTimeInput(val) }"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-form-item label="规则2上班">
              <el-input
                v-model="currentDepartment.AttendanceRule2Start"
                placeholder="如 0900"
                maxlength="4"
                @input="(val) => { currentDepartment.AttendanceRule2Start = normalizeTimeInput(val) }"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-form-item label="规则2下班">
              <el-input
                v-model="currentDepartment.AttendanceRule2End"
                placeholder="如 1800"
                maxlength="4"
                @input="(val) => { currentDepartment.AttendanceRule2End = normalizeTimeInput(val) }"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-form-item label="强制下班时间">
              <el-input
                v-model="currentDepartment.ForceEndTime"
                placeholder="如 1800"
                maxlength="4"
                @input="(val) => { currentDepartment.ForceEndTime = normalizeTimeInput(val) }"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <el-form-item label="考勤定位">
              <el-button @click="openAttendanceLocationDialog">维护定位信息</el-button>
              <div v-if="currentDepartment.attendanceLocation && currentDepartment.attendanceLocation.length > 0" style="margin-top: 10px;">
                当前定位：{{ formatAttendanceLocation(currentDepartment.attendanceLocation) }}
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <el-form-item label="菜单权限" required>
              <div class="menu-actions">
                <el-button @click="selectAllMenus">全选</el-button>
                <el-button @click="clearAllMenus">全不选</el-button>
              </div>
              <el-checkbox-group 
                :model-value="getBitsFromString(currentDepartment.supportChannels)" 
                @update:model-value="(val) => { currentDepartment.supportChannels = getStringFromBits(val) }"
                class="checkbox-group-wrapper"
              >
                <el-checkbox 
                  v-for="menu in menuPermissions" 
                  :key="menu.id" 
                  :label="menu.id"
                >
                  {{ menu.name }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <template #footer>
        <el-button @click="addLevel2DialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveDepartment">保存</el-button>
      </template>
    </el-dialog>

    <!-- 部门编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑部门信息"
      width="620px"
      destroy-on-close
    >
      <el-form label-width="120px">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <el-form-item label="部门名称" required>
              <el-input v-model="currentDepartment.DeptName" placeholder="请输入部门名称" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20"
          v-if="currentDepartment.SuperiorDept !== -1 && currentDepartment.SuperiorDept != null"
        >
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <el-form-item label="上级部门">
              <el-select 
                v-model="currentDepartment.SuperiorDept" 
                placeholder="请选择上级部门（可选）"
                clearable
                style="width: 100%"
              >
                <el-option 
                  v-for="dept in departments.filter(d => (d.SuperiorDept === -1 || d.SuperiorDept == null) && d.DeptID !== currentDepartment.DeptID)"
                  :key="dept.DeptID"
                  :label="dept.DeptName"
                  :value="dept.DeptID"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <el-form-item label="排班模式" required>
              <el-select
                v-model="currentDepartment.ShiftType"
                placeholder="请选择排班模式"
                style="width: 100%"
              >
                <el-option
                  v-for="opt in shiftTypeOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <el-form-item label="工作日" required>
              <el-checkbox-group
                :model-value="getAttendanceDaysArray()"
                @update:model-value="setAttendanceDaysFromArray"
                class="checkbox-group-wrapper"
              >
                <el-checkbox
                  v-for="day in weekDayOptions"
                  :key="day.value"
                  :label="day.value"
                >
                  {{ day.label }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-form-item label="规则1上班" required>
              <el-input
                v-model="currentDepartment.AttendanceRule1Start"
                placeholder="如 0900"
                maxlength="4"
                @input="(val) => { currentDepartment.AttendanceRule1Start = normalizeTimeInput(val) }"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-form-item label="规则1下班" required>
              <el-input
                v-model="currentDepartment.AttendanceRule1End"
                placeholder="如 1800"
                maxlength="4"
                @input="(val) => { currentDepartment.AttendanceRule1End = normalizeTimeInput(val) }"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row 
          :gutter="20"
          v-if="currentDepartment.SuperiorDept !== -1 && currentDepartment.SuperiorDept != null"
        >
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-form-item label="规则2上班">
              <el-input
                v-model="currentDepartment.AttendanceRule2Start"
                placeholder="如 0900"
                maxlength="4"
                @input="(val) => { currentDepartment.AttendanceRule2Start = normalizeTimeInput(val) }"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-form-item label="规则2下班">
              <el-input
                v-model="currentDepartment.AttendanceRule2End"
                placeholder="如 1800"
                maxlength="4"
                @input="(val) => { currentDepartment.AttendanceRule2End = normalizeTimeInput(val) }"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-form-item label="强制下班时间">
              <el-input
                v-model="currentDepartment.ForceEndTime"
                placeholder="如 1800"
                maxlength="4"
                @input="(val) => { currentDepartment.ForceEndTime = normalizeTimeInput(val) }"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row
          :gutter="20"
          v-if="currentDepartment.SuperiorDept !== -1 && currentDepartment.SuperiorDept != null"
        >
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <el-form-item label="考勤定位">
              <el-button @click="openAttendanceLocationDialog">维护定位信息</el-button>
              <div v-if="currentDepartment.attendanceLocation && currentDepartment.attendanceLocation.length > 0" style="margin-top: 10px;">
                当前定位：{{ formatAttendanceLocation(currentDepartment.attendanceLocation) }}
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <el-form-item label="菜单权限" required>
              <div class="menu-actions">
                <el-button @click="selectAllMenus">全选</el-button>
                <el-button @click="clearAllMenus">全不选</el-button>
              </div>
              <el-checkbox-group 
                :model-value="getBitsFromString(currentDepartment.supportChannels)" 
                @update:model-value="(val) => { currentDepartment.supportChannels = getStringFromBits(val) }"
                class="checkbox-group-wrapper"
              >
                <el-checkbox 
                  v-for="menu in menuPermissions" 
                  :key="menu.id" 
                  :label="menu.id"
                >
                  {{ menu.name }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveDepartment">保存</el-button>
      </template>
    </el-dialog>
    
    <!-- 考勤定位对话框 -->
    <el-dialog
      v-model="attendanceLocationDialogVisible"
      title="维护考勤定位信息"
      width="800px"
      destroy-on-close
    >
      <div id="attendanceMap" style="height: 400px;"></div>
      <p style="margin-top: 10px;">请在地图上点击四个点来框选考勤区域。</p>
      <template #footer>
        <el-button @click="resetAttendanceLocationDraft">重画</el-button>
        <el-button @click="closeAttendanceLocationDialog">取消</el-button>
        <el-button type="primary" @click="saveAttendanceLocation">保存</el-button>
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

.menu-actions {
  margin-bottom: 10px;
  display: flex;
  gap: 10px;
}

.checkbox-group-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 0px 10px;
  padding: 5px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding: 0 15px 15px;
}

/* 部门名称单元格 */
.dept-name-cell {
  position: relative;
  text-align: center;
  padding: 0 30px;
}

/* 展开图标 */
.expand-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  cursor: pointer;
  transition: transform 0.3s ease;
  color: #606266;
}

.expand-icon:hover {
  color: #409eff;
}

.expand-icon.is-expanded {
  transform: translateY(-50%) rotate(90deg);
}

.dept-name {
  display: inline-block;
  text-align: center;
}

.dept-name.clickable {
  cursor: pointer;
}

/* 一级部门偶数行背景色 */
:deep(.table-row-primary-even) {
  background-color: #deecff;
}

/* 一级部门奇数行背景色 */
:deep(.table-row-primary-odd) {
  background-color: #ffffff;
}

/* 二级部门统一背景色 */
:deep(.table-row-sub-dept) {
  background-color: #fafbfc;
}
</style> 