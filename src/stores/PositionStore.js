import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export const usePositionStore = defineStore('position', () => {
  // 状态
  const position = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 职级数据列表
  const detailedPositions = [
    {
      positionID: 1,
      positionName: '普通员工',
      updatedTime: '2023-06-01 10:00:00'
    },
    {
      positionID: 2,
      positionName: '部门主管',
      updatedTime: '2023-06-02 15:00:00'
    },
    {
      positionID: 3,
      positionName: '总经理',
      updatedTime: '2023-06-03 11:00:00'
    },
    {
      positionID: 4,
      positionName: '董事',
      updatedTime: '2023-06-04 14:30:00'
    }
  ]

  // 加载职级列表
  const loadPositions = () => {
    loading.value = true
    error.value = null
    
    // 模拟API调用
    setTimeout(() => {
      position.value = detailedPositions
      loading.value = false
    }, 300)
  }

  // 根据ID获取职级
  const getPositionById = (id) => {
    return position.value.find(p => p.positionID === id)
  }

  // 根据名称获取职级
  const getPositionByName = (name) => {
    return position.value.find(p => p.positionName === name)
  }

  // 添加职级
  const addPosition = (position) => {
    // 检查名称是否已存在
    const existingPosition = position.value.find(p => 
      p.positionName === position.positionName
    )
    
    if (existingPosition) {
      ElMessage.error(`职级名称 ${position.positionName} 已存在`)
      return false
    }
    
    // 生成新ID
    const newId = Math.max(...position.value.map(p => typeof p.positionID === 'number' ? p.positionID : 0), 0) + 1

    const newPosition = {
      ...position,
      positionID: newId,
      status: position.status || 'active',
      createdTime: new Date().toISOString().replace('T', ' ').substr(0, 19),
      updatedTime: new Date().toISOString().replace('T', ' ').substr(0, 19)
    }

    position.value.push(newPosition)
    ElMessage.success('职级添加成功')
    return newPosition
  }

  // 更新职级
  const updatePosition = (id, updatedPosition) => {
    const index = position.value.findIndex(p => p.positionID === id)
    
    if (index !== -1) {
      position.value[index] = {
        ...position.value[index],
        ...updatedPosition,
        updatedTime: new Date().toISOString().replace('T', ' ').substr(0, 19)
      }

      ElMessage.success('职级更新成功')
      return true
    }

    ElMessage.error('未找到要更新的职级')
    return false
  }

  // 删除职级
  const deletePosition = (id) => {
    const index = position.value.findIndex(p => p.positionID === id)
    
    if (index !== -1) {
      position.value.splice(index, 1)
      ElMessage.success('职级删除成功')
      return true
    }

    ElMessage.error('未找到要删除的职级')
    return false
  }

  return {
    position,
    loading,
    error,
    loadPositions,
    getPositionById,
    getPositionByName,
    addPosition,
    updatePosition,
    deletePosition
  }
})