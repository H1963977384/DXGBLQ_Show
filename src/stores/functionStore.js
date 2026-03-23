import { defineStore } from 'pinia';

export const useFunctionStore = defineStore('functionStore', {
  state: () => ({
    // 固定的顶部菜单（微信插件风格）
    staticItems: [
      { text: '企业通讯录', icon: 'tree-icon', color: '#2683e6', routerLink: '/mobile/addressList' }
    ],
    // 动态业务应用列表
    rawListData: [
      { id: 101, name: '个人资料', category: '个人中心', svg: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 14h1v4"/><path d="M16 2v4"/><path d="M3 10h18"/><path d="M8 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/></svg>', routerLink: '/profile' },
      { id: 102, name: '工资条', category: '个人中心', svg: '<svg viewBox="0 -1 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="m12 10 3-3"/><path d="m9 7 3 3v7.5"/><path d="M9 11h6"/><path d="M9 15h6"/></svg>', routerLink: '/salaries/mysalary' },
      { id: 201, name: '打卡', category: '考勤管理', svg: '<svg viewBox="0 -1 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19.43 12.935c.357-.967.57-1.955.57-2.935a8 8 0 0 0-16 0c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 1.202 0 32.197 32.197 0 0 0 .813-.728"/><circle cx="12" cy="10" r="3"/><path d="m16 18 2 2 4-4"/></svg>', routerLink: '/mobile/signin' },
      { id: 202, name: '排班', category: '考勤管理', svg: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 14h1v4"/><path d="M16 2v4"/><path d="M3 10h18"/><path d="M8 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/></svg>', routerLink: '/attendance/shifts' },
      { id: 203, name: '加班申请', category: '考勤管理', svg: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 14h1v4"/><path d="M16 2v4"/><path d="M3 10h18"/><path d="M8 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/></svg>' },
      
      //{ id: 401, name: '积分查询', category: '积分管理', svg: '<svg viewBox="0 -1 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 16V9.5a1 1 0 0 1 5 0"/><path d="M8 12h4"/><path d="M8 16h7"/><circle cx="12" cy="12" r="10"/></svg>' },
      //{ id: 402, name: '抽奖', category: '积分管理', svg: '<svg viewBox="0 -1 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>', routerLink: '/scores/lottery'},
    ]
  }),

  getters: {
    // 按 Category 分组的自定义逻辑
    groupedByCategory: (state) => {
      const groups = state.rawListData.reduce((acc, item) => {
        const key = item.category;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      }, {});

      // 转为数组格式，方便 template 渲染
      // 如果需要特定顺序，可以在这里加一个 map 排序逻辑
      return Object.keys(groups).map(categoryName => ({
        name: categoryName,
        items: groups[categoryName]
      }));
    }
  }
});
