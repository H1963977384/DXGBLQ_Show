<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <header class="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm mb-6">
      <div class="flex items-center space-x-8">
        <h1 class="text-blue-600 text-2xl font-bold">工资管理系统</h1>
        <nav class="flex space-x-6 text-gray-600">
          <a href="#" class="bg-blue-400 text-white px-4 py-1 rounded-md">首页</a>
          <a href="#">员工管理</a>
          <a href="#">工资核算</a>
          <a href="#">工资条管理</a>
          <a href="#">薪酬报表</a>
        </nav>
      </div>
      <div class="flex items-center space-x-4">
        <span class="text-sm">系统管理员 <span class="bg-blue-100 text-blue-600 px-2 py-1 rounded">管理员</span></span>
        <button class="bg-red-500 text-white px-4 py-1 rounded-md">退出</button>
      </div>
    </header>

    <div class="grid grid-cols-3 gap-6 mb-6">
      <div v-for="item in menuCards" :key="item.title" 
           class="bg-white p-8 rounded-2xl shadow-sm flex flex-col items-center hover:shadow-md transition-shadow cursor-pointer">
        <div class="text-4xl mb-4">{{ item.icon }}</div>
        <h3 class="text-lg font-bold text-gray-800">{{ item.title }}</h3>
        <p class="text-gray-400 text-sm mt-1">{{ item.desc }}</p>
      </div>
    </div>

    <div class="grid grid-cols-4 gap-6 mb-6">
      <div v-for="stat in stats" :key="stat.label" class="bg-white p-6 rounded-2xl shadow-sm relative">
        <h4 class="text-gray-600 font-medium mb-4">{{ stat.label }}</h4>
        <div class="flex items-baseline">
          <span class="text-4xl font-bold">{{ stat.value }}</span>
          <span class="ml-2 text-gray-500 text-sm">{{ stat.unit }}</span>
        </div>
        <p class="text-xs mt-4 text-gray-400" v-html="stat.subText"></p>
        <a href="#" class="text-blue-500 text-xs absolute bottom-6 right-6">点击查看详情</a>
      </div>
    </div>

    <div class="bg-white p-8 rounded-2xl shadow-sm">
      <h3 class="text-lg font-bold mb-6">本月工资核算进度 (2025-12)</h3>
      
      <div class="w-full bg-gray-100 h-8 rounded-full mb-8 relative">
        <div class="bg-blue-400 h-full rounded-full" style="width: 0%"></div>
        <span class="absolute right-0 -top-6 text-blue-400 text-sm">0.0%</span>
      </div>

      <div class="grid grid-cols-5 gap-4 mb-8 text-center">
        <div v-for="step in progressSteps" :key="step.label" class="bg-gray-50 p-4 rounded-lg">
          <p class="text-gray-500 text-sm">{{ step.label }}</p>
          <p class="text-xl font-bold text-blue-500">{{ step.count }}人</p>
          <p class="text-xs text-gray-400">{{ step.percent }}%</p>
        </div>
      </div>

      <div class="border-t pt-6 flex justify-between items-end">
        <div class="text-gray-500 text-sm space-y-1">
          <p>• 还有19名员工待计算工资，请及时处理</p>
          <p>• 本月发放日：2025-12-28</p>
        </div>
        <div class="space-x-4">
          <button class="bg-blue-400 text-white px-8 py-2 rounded-md shadow-lg shadow-blue-200">开始核算</button>
          <button class="bg-gray-100 text-gray-600 px-8 py-2 rounded-md">查看详情</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const menuCards = [
  { title: '工资核算', desc: '一键进入工资计算', icon: '💰' },
  { title: '员工管理', desc: '新增员工 | 批量导入', icon: '👥' },
  { title: '报表查看', desc: '薪酬分析 | 成本统计', icon: '📊' },
  { title: '工资条发放', desc: '生成发放 | 员工查看', icon: '📄' },
  { title: '社保管理', desc: '基数调整 | 比例设置', icon: '🏥' },
  { title: '系统设置', desc: '权限配置 | 参数调整', icon: '⚙️' },
]

const stats = [
  { label: '公司员工总数', value: '19', unit: '人', subText: '<span class="text-green-500">较上月 +3</span> (新增3人, 离职3人)' },
  { label: '本月待核算数', value: '19', unit: '人', subText: '新员工3人 + 调薪员工16人' },
  { label: '本月已发薪', value: '¥0.00', unit: '', subText: '已发放人数：0人' },
  { label: '异常待处理', value: '4', unit: '项', subText: '银行账号异常2人、社保异常2人' },
]

const progressSteps = [
  { label: '待计算', count: 19, percent: 100 },
  { label: '计算中', count: 0, percent: 0 },
  { label: '待审核', count: 0, percent: 0 },
  { label: '已审核', count: 0, percent: 0 },
  { label: '已发放', count: 0, percent: 0 },
]
</script>