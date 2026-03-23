import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export const useDepartmentStore = defineStore('department', () => {
  // 状态
  const departments = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 部门数据列表
  const detailedDepartments = [
    {
      DeptID: 111,
      DeptName: '行政部',
      SuperiorDept: -1,
      AttendanceDay: '',
      ShiftType: -1,
      supportChannels: '1111100000001111',
      AttendanceRule1Start: '',
      AttendanceRule1End: '',
      AttendanceRule2Start: '',
      AttendanceRule2End: ''
    },
    {
      DeptID: 1,
      DeptName: '一线考勤组',
      SuperiorDept: 111,
      AttendanceDay: '1234567',
      ShiftType: 0,
      supportChannels: '1111100000001111',
      AttendanceRule1Start: '0830',
      AttendanceRule1End: '1200',
      AttendanceRule2Start: '1300',
      AttendanceRule2End: '1630'
    },
    {
      DeptID: 2,
      DeptName: '后勤保障组',
      SuperiorDept: 111,
      AttendanceDay: '',
      ShiftType: 1,
      supportChannels: '1111100000001111',
      AttendanceRule1Start: '0400',
      AttendanceRule1End: '0359',
      AttendanceRule2Start: '',
      AttendanceRule2End: ''
    },
    {
      DeptID: 3,
      DeptName: '一线考勤组（排班）',
      SuperiorDept: 111,
      AttendanceDay: '',
      ShiftType: 2,
      supportChannels: '1111100000001111',
      AttendanceRule1Start: '0830',
      AttendanceRule1End: '1530',
      AttendanceRule2Start: '0930',
      AttendanceRule2End: '1630'
    },
    {
      DeptID: 4,
      DeptName: '动力维修部（指挥中心、电工）',
      SuperiorDept: 111,
      AttendanceDay: '',
      ShiftType: 2,
      supportChannels: '1111100000001111',
      AttendanceRule1Start: '0830',
      AttendanceRule1End: '1530',
      AttendanceRule2Start: '0930',
      AttendanceRule2End: '1630'
    },
    {
      DeptID: 5,
      DeptName: '峡谷游船组',
      SuperiorDept: 111,
      AttendanceDay: '',
      ShiftType: 2,
      supportChannels: '1111100000001111',
      AttendanceRule1Start: '1800',
      AttendanceRule1End: '0600',
      AttendanceRule2Start: '1800',
      AttendanceRule2End: '0830'
    },
    {
      DeptID: 6,
      DeptName: '张家界大峡谷网络运营有限公司',
      SuperiorDept: 111,
      AttendanceDay: '',
      ShiftType: 2,
      supportChannels: '1111100000001111',
      AttendanceRule1Start: '0830',
      AttendanceRule1End: '1530',
      AttendanceRule2Start: '0930',
      AttendanceRule2End: '1630'
    },
    {
      DeptID: 7,
      DeptName: '中心区域（夜班）',
      SuperiorDept: 111,
      AttendanceDay: '1234567',
      ShiftType: 0,
      supportChannels: '1111100000001111',
      AttendanceRule1Start: '1600',
      AttendanceRule1End: '0830',
      AttendanceRule2Start: '',
      AttendanceRule2End: ''
    },
    {
      DeptID: 8,
      DeptName: '动力维修部（指挥中心2）',
      SuperiorDept: 111,
      AttendanceDay: '',
      ShiftType: 2,
      supportChannels: '1111100000001111',
      AttendanceRule1Start: '0830',
      AttendanceRule1End: '1530',
      AttendanceRule2Start: '0930',
      AttendanceRule2End: '1630'
    },
    {
      DeptID: 9,
      DeptName: '司机班',
      SuperiorDept: 111,
      AttendanceDay: '1234567',
      ShiftType: 0,
      supportChannels: '1111100000001111',
      AttendanceRule1Start: '0830',
      AttendanceRule1End: '1730',
      AttendanceRule2Start: '',
      AttendanceRule2End: ''
    }
  ]


  // 加载部门列表
  const loadDepartments = () => {
    loading.value = true
    error.value = null
    
    // 模拟API调用
    setTimeout(() => {
      departments.value = detailedDepartments
      loading.value = false
    }, 300)
  }

  // 根据ID获取部门
  const getDepartmentById = (id) => {
    return departments.value.find(d => d.DeptID === id)
  }

  // 根据名称获取部门
  const getDepartmentByName = (name) => {
    return departments.value.find(d => d.DeptName === name)
  }

  // 添加部门
  const addDepartment = (department) => {
    // 检查名称是否已存在
    const existingDepartment = departments.value.find(d => 
      d.DeptName === department.DeptName
    )
    
    if (existingDepartment) {
      ElMessage.error(`部门名称 ${department.DeptName} 已存在`)
      return false
    }
    
    // 生成新ID
    const newId = Math.max(...departments.value.map(d => typeof d.DeptID === 'number' ? d.DeptID : 0), 0) + 1
    
    const newDepartment = {
      ...department,
      DeptID: newId,
      AttendanceDay: department.AttendanceDay || '1234567',
      status: department.status || 'active',
      createdTime: new Date().toISOString().replace('T', ' ').substr(0, 19),
      updatedTime: new Date().toISOString().replace('T', ' ').substr(0, 19)
    }
    
    departments.value.push(newDepartment)
    ElMessage.success('部门添加成功')
    return newDepartment
  }

  // 更新部门
  const updateDepartment = (id, updatedDepartment) => {
    const index = departments.value.findIndex(d => d.DeptID === id)
    
    if (index !== -1) {
      departments.value[index] = {
        ...departments.value[index],
        ...updatedDepartment,
        updatedTime: new Date().toISOString().replace('T', ' ').substr(0, 19)
      }
      
      ElMessage.success('部门更新成功')
      return true
    }
    
    ElMessage.error('未找到要更新的部门')
    return false
  }

  // 删除部门
  const deleteDepartment = (id) => {
    const index = departments.value.findIndex(d => d.DeptID === id)
    
    if (index !== -1) {
      departments.value.splice(index, 1)
      ElMessage.success('部门删除成功')
      return true
    }
    
    ElMessage.error('未找到要删除的部门')
    return false
  }

  // 获取所有部门的菜单配置
  const getDepartmentMenuConfig = (id) => {
    const department = getDepartmentById(id)
    return department ? department.supportChannels : []
  }

  return {
    departments,
    loading,
    error,
    loadDepartments,
    getDepartmentById,
    getDepartmentByName,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentMenuConfig
  }
})