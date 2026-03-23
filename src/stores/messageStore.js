import { defineStore } from 'pinia';

export const useMessageStore = defineStore('message', {
  state: () => ({
    messages: [
      {
        id: 1,
        type: 'system',
        title: '贵宾接送提醒',
        content: '张先生 的火车将于30分钟后抵达 张家界西 站，请及时到站接送。',
        time: '1分钟前',
        status: '未读'
      },
      {
        id: 1,
        type: 'system',
        title: '客房清洁提醒',
        content: '客房 1203 号需要进行日常清洁，请安排工作人员前往。',
        time: '1分钟前',
        status: '未读'
      }
    ]
  }),
  actions: {
    toggleRead(id) {
      const msg = this.messages.find(m => m.id === id);
      if (msg) {
        msg.status = msg.status === '未读' ? '已读' : '未读';
      }
    }
  }
});