
import { defineStore } from 'pinia'
import { ref } from 'vue'

// 黄一1️⃣，每条注释看一下
export const useUserStore = defineStore('user', () => {
  // 用户信息
  /*
  每一行对应用户的一条属性
  id: 用户ID
  name: 用户名称
  ...
  */
  const userInfo = ref({
    userID: '',
    username: '',
    password: '',
    userdept: '',
    userposition: '',
    userbirthday: '',
    usertel: '',
  })

  // 设置用户信息
  /*
  类似java的set方法
  传入一个对象，更新userInfo中的对应属性
   */
  const setUserInfo = (info) => {
    userInfo.value = { ...userInfo.value, ...info }
  }

  // 获取用户部门
  /**
   * 类似java的get方法，通过一个包装函数获取用户的某个属性
   * @returns 
   */
  const getUserDepartment = () => {
    return userInfo.value.userdept
  }

  // 清空用户信息
  const clearUserInfo = () => {
    userInfo.value = {
      id: '',
      name: '',
      department: 'admin',
      role: '',
      avatar: ''
    }
  }

  return {
    userInfo,
    setUserInfo,
    getUserDepartment,
    clearUserInfo
  }
})
