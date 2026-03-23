# 设备适配使用指南

## 概述

项目已实现基于**触摸设备检测**的端判断逻辑：
- **桌面端**：显示 Header + Sidebar + Content + Footer
- **手机端**：仅显示 Header + Content（上下结构）

---

## 核心逻辑

### 判断方式（layout/index.vue）

```javascript
const checkIsTouchDevice = () => {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  )
}
```

- ✅ 基于触摸能力判断，而非屏幕宽度
- ✅ 页面加载时判断一次，运行期不变
- ✅ 自动传递 `isMobile` 到子路由

---

## 如何在页面中使用

### 1️⃣ 接收 isMobile 参数

在你的 Vue 组件中：

```vue
<script setup>
defineProps({
  isMobile: {
    type: Boolean,
    default: false
  }
})
</script>
```

### 2️⃣ 条件渲染（完全不同的内容）

```vue
<template>
  <!-- 桌面端显示表格 -->
  <el-table v-if="!isMobile" :data="tableData">
    <!-- ... -->
  </el-table>

  <!-- 手机端显示卡片 -->
  <div v-else class="mobile-cards">
    <div v-for="item in tableData" :key="item.id" class="card">
      <!-- ... -->
    </div>
  </div>
</template>
```

### 3️⃣ 动态样式（相同内容不同布局）

```vue
<template>
  <div :class="isMobile ? 'mobile-layout' : 'desktop-layout'">
    <!-- 内容 -->
  </div>
</template>

<style scoped>
.desktop-layout {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.mobile-layout {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
```

### 4️⃣ 动态组件属性

```vue
<template>
  <!-- 对话框 -->
  <el-dialog
    :width="isMobile ? '90%' : '500px'"
    :fullscreen="isMobile"
  >
    <!-- ... -->
  </el-dialog>

  <!-- 表单 -->
  <el-form
    :label-position="isMobile ? 'top' : 'right'"
    :label-width="isMobile ? 'auto' : '120px'"
  >
    <!-- ... -->
  </el-form>
</template>
```

### 5️⃣ Element Plus 响应式栅格

```vue
<template>
  <el-row :gutter="20">
    <el-col
      v-for="item in items"
      :xs="24"   <!-- 手机：1列 -->
      :sm="12"   <!-- 平板：2列 -->
      :md="8"    <!-- 桌面：3列 -->
      :lg="6"    <!-- 大屏：4列 -->
    >
      <!-- 卡片内容 -->
    </el-col>
  </el-row>
</template>
```

---

## 完整示例模板

查看 [src/views/DEVICE_TEMPLATE.vue](src/views/DEVICE_TEMPLATE.vue) 文件，包含：

- ✅ 6种不同的适配方式
- ✅ 完整的代码示例
- ✅ 样式参考
- ✅ 最佳实践说明

---

## 常用适配场景

| 场景 | 桌面端 | 手机端 | 实现方式 |
|------|--------|--------|----------|
| 数据展示 | 表格 | 卡片列表 | `v-if` 条件渲染 |
| 表单布局 | 横向 label | 纵向 label | `:label-position` 动态属性 |
| 对话框 | 固定宽度 | 全屏/90% | `:fullscreen` / `:width` |
| 网格布局 | 3-4列 | 1列 | Element Plus 栅格或动态 class |
| 按钮组 | 横向排列 | 纵向堆叠 | 动态 class |
| 图片尺寸 | 大图 | 小图 | 动态 style |

---

## 手机端设计建议

### ✅ 推荐做法

1. **单列布局**：手机端优先使用单列，避免横向拥挤
2. **卡片化**：使用卡片代替表格，信息更清晰
3. **大按钮**：增大点击区域（至少 44x44px）
4. **减少交互**：简化复杂操作，避免多层嵌套
5. **全屏对话框**：重要表单使用全屏模式

### ❌ 避免做法

1. 不要在手机端使用多列表格
2. 不要使用过小的按钮和链接
3. 不要使用 hover 效果（触摸设备无 hover）
4. 不要在手机端使用固定宽度布局

---

## 调试技巧

### 开发者工具模拟

Chrome DevTools → Toggle Device Toolbar (Ctrl+Shift+M)

**注意**：仅调整屏幕尺寸不会触发触摸检测，需要勾选 "Touch" 选项

### 真机测试

```bash
# 1. 启动开发服务器
npm run dev

# 2. 查看本地 IP（通常是 192.168.x.x）
ipconfig

# 3. 手机访问
http://你的IP:5173
```

---

## 常见问题

**Q: 为什么使用触摸检测而不是屏幕宽度？**  
A: 触摸检测更准确，避免桌面浏览器缩小窗口时误判为手机端。

**Q: 如果需要同时支持平板怎么办？**  
A: 可以在 checkIsTouchDevice 中添加额外逻辑，或使用 Element Plus 的栅格系统自适应。

**Q: 子组件中获取不到 isMobile？**  
A: 确保父组件通过 props 传递，或使用 provide/inject 在全局提供。

---

## 示例页面

参考现有页面的适配：
- `src/views/dashboard/index.vue` - 仪表盘
- `src/views/hr/employeesInfo.vue` - 员工信息
- `src/views/DEVICE_TEMPLATE.vue` - **完整模板**（推荐）

---

**最后更新**：2026-01-22
