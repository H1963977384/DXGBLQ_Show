import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export const useEmployeesStore = defineStore('employees', () => {
  // 状态
  const employees = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 员工数据列表
  const detailedEmployees = [
    {
      staffID: 'E001',
      staffName: '戴一',
      staffGender: '男',
      staffDept: '中心区域（夜班）',
      staffPos: '经理',
      staffPhone: '13800138001',
      staffHireDate: '2020-01-15',
      staffBirthday: '1990-05-20',
      staffEmail: 'zhangsan@example.com',
      staffStatus: 'active',
      createdTime: '2020-01-15 09:00:00',
      updatedTime: '2023-06-01 10:00:00'
    },
    {
      staffID: 'E002',
      staffName: '周二',
      staffGender: '女',
      staffDept: '中心区域（夜班）',
      staffPos: '主管',
      staffPhone: '13800138002',
      staffHireDate: '2020-03-20',
      staffBirthday: '1992-08-15',
      staffEmail: 'lisi@example.com',
      staffStatus: 'active',
      createdTime: '2020-03-20 09:00:00',
      updatedTime: '2023-06-02 15:00:00'
    },
    {
      staffID: 'E003',
      staffName: '张三',
      staffGender: '男',
      staffDept: '峡谷游船组',
      staffPos: '会计',
      staffPhone: '13800138003',
      staffHireDate: '2021-06-10',
      staffBirthday: '1988-12-03',
      staffEmail: 'wangwu@example.com',
      staffStatus: 'active',
      createdTime: '2021-06-10 09:00:00',
      updatedTime: '2023-06-03 11:00:00'
    },
    {
      staffID: 'E004',
      staffName: '李四',
      staffGender: '男',
      staffDept: '司机班',
      staffPos: '司机',
      staffPhone: '13800138004',
      staffHireDate: '2019-08-25',
      staffBirthday: '1985-03-18',
      staffEmail: 'zhaoliu@example.com',
      staffStatus: 'active',
      createdTime: '2019-08-25 09:00:00',
      updatedTime: '2023-06-04 14:30:00'
    },
    {
      staffID: 'E005',
      staffName: '武五',
      staffGender: '女',
      staffDept: '一线考勤组（排班）',
      staffPos: '专员',
      staffPhone: '13800138005',
      staffHireDate: '2022-01-10',
      staffBirthday: '1995-07-22',
      staffEmail: 'qianqi@example.com',
      staffStatus: 'active',
      createdTime: '2022-01-10 09:00:00',
      updatedTime: '2023-06-05 10:00:00'
    },
    {
      staffID: 'E006',
      staffName: '刘六',
      staffGender: '男',
      staffDept: '动力维修部（指挥中心、电工）',
      staffPos: '助理',
      staffPhone: '13800138006',
      staffHireDate: '2021-11-05',
      staffBirthday: '1993-11-30',
      staffEmail: 'sunba@example.com',
      staffStatus: 'active',
      createdTime: '2021-11-05 09:00:00',
      updatedTime: '2023-06-06 12:00:00'
    },
    {
      staffID: 'E007',
      staffName: '王八',
      staffGender: '女',
      staffDept: '一线考勤组',
      staffPos: '出纳',
      staffPhone: '13800138007',
      staffHireDate: '2020-09-15',
      staffBirthday: '1991-04-12',
      staffEmail: 'zhoujiu@example.com',
      staffStatus: 'active',
      createdTime: '2020-09-15 09:00:00',
      updatedTime: '2023-06-07 16:00:00'
    },
    {
      staffID: 'E008',
      staffName: '柴九',
      staffGender: '男',
      staffDept: '一线考勤组',
      staffPos: '司机',
      staffPhone: '13800138008',
      staffHireDate: '2018-05-20',
      staffBirthday: '1987-09-08',
      staffEmail: 'wushi@example.com',
      staffStatus: 'active',
      createdTime: '2018-05-20 09:00:00',
      updatedTime: '2023-06-08 11:30:00'
    },
    {
      staffID: 'E009',
      staffName: '张十一',
      staffGender: '男',
      staffDept: '一线考勤组',
      staffPos: '司机',
      staffPhone: '13800138009',
      staffHireDate: '2018-05-20',
      staffBirthday: '1987-09-08',
      staffEmail: 'zhangshiyi@example.com',
      staffStatus: 'active',
      createdTime: '2018-05-20 09:00:00',
      updatedTime: '2023-06-08 11:30:00'
    },
    {
      staffID: 'E010',
      staffName: '李十二',
      staffGender: '男',
      staffDept: '司机班',
      staffPos: '司机',
      staffPhone: '13800138010',
      staffHireDate: '2018-05-20',
      staffBirthday: '1987-09-08',
      staffEmail: 'lishier@example.com',
      staffStatus: 'active',
      createdTime: '2018-05-20 09:00:00',
      updatedTime: '2023-06-08 11:30:00'
    },
    {
      staffID: 'E011',
      staffName: '万十三',
      staffGender: '男',
      staffDept: '司机班',
      staffPos: '司机',
      staffPhone: '13800138011',
      staffHireDate: '2018-05-20',
      staffBirthday: '1987-09-08',
      staffEmail: 'wanshisan@example.com',
      staffStatus: 'active',
      createdTime: '2018-05-20 09:00:00',
      updatedTime: '2023-06-08 11:30:00'
    }
  ]

  // 加载员工列表
  const loadEmployees = () => {
    loading.value = true
    error.value = null

    // 模拟API调用
    setTimeout(() => {
      employees.value = detailedEmployees
      loading.value = false
    }, 300)
  }

  // 根据ID获取员工
  const getEmployeeById = (id) => {
    return employees.value.find(e => e.staffID === id)
  }

  // 根据名称获取员工
  const getEmployeeByName = (name) => {
    return employees.value.find(e => e.staffName === name)
  }

  // 添加员工
  const addEmployee = (employee) => {
    const existingEmployee = employees.value.find(e => e.staffID === employee.staffID)

    if (existingEmployee) {
      ElMessage.error(`工号 ${employee.staffID} 已存在`)
      return false
    }

    const newEmployee = {
      ...employee,
      staffStatus: employee.staffStatus || 'active',
      createdTime: new Date().toISOString().replace('T', ' ').substr(0, 19),
      updatedTime: new Date().toISOString().replace('T', ' ').substr(0, 19)
    }

    employees.value.push(newEmployee)
    ElMessage.success('员工添加成功')
    return newEmployee
  }

  // 更新员工
  const updateEmployee = (id, updatedEmployee) => {
    const index = employees.value.findIndex(e => e.staffID === id)

    if (index !== -1) {
      employees.value[index] = {
        ...employees.value[index],
        ...updatedEmployee,
        updatedTime: new Date().toISOString().replace('T', ' ').substr(0, 19)
      }

      ElMessage.success('员工信息更新成功')
      return true
    }

    ElMessage.error('未找到要更新的员工')
    return false
  }

  // 删除员工
  const deleteEmployee = (id) => {
    const index = employees.value.findIndex(e => e.staffID === id)

    if (index !== -1) {
      employees.value.splice(index, 1)
      ElMessage.success('员工删除成功')
      return true
    }

    ElMessage.error('未找到要删除的员工')
    return false
  }

  // 重置员工密码
  const resetPassword = (id) => {
    const employee = getEmployeeById(id)
    if (employee) {
      // 这里应该调用后端API重置密码
      ElMessage.success(`已重置员工 ${employee.staffName} 的密码`)
      return true
    }

    ElMessage.error('未找到要重置密码的员工')
    return false
  }

  return {
    employees,
    loading,
    error,
    loadEmployees,
    getEmployeeById,
    getEmployeeByName,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    resetPassword
  }
})
