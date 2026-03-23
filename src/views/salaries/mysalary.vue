<template>
  <div class="page">
    <!-- Header -->
    

    <!-- Amount -->
    <div class="amount-card">
      <img class="amount-bg-image" src="../../assets/favicon.ico" alt="" />
      <span>
        <div class="amount">{{ displayPay }}</div>
        <button class="eye-btn" type="button" @click="toggleAmount" :aria-label="showAmount ? '隐藏工资' : '显示工资'">
            {{ showAmount ? '👁' : '🙈' }}
        </button>
      </span>
    </div>

    <!-- Detail List -->
    <div class="card card--income">
      <div class="row" v-for="item in store.items.filter(i => i.type === 'income')" :key="item.label">
        <span class="label">{{ item.label }}</span>
        <span class="value">{{ item.value }}</span>
      </div>
    </div>

    <div class="card card--deduction">
      <div class="row" v-for="item in store.items.filter(i => i.type === 'deduction')" :key="item.label">
        <span class="label">{{ item.label }}</span>
        <span class="value">{{ item.value }}</span>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="bottom">
      <span class="total">实发工资</span>
      <span class="total-value">¥{{ displayPay }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useSalaryStore } from '../../stores/salaryStore'

// 使用 Pinia 中的 salaryStore
const store = useSalaryStore()
const showAmount = ref(true)

const displayPay = computed(() => (showAmount.value ? store.realPay : '****'))

function toggleAmount() {
  showAmount.value = !showAmount.value
}
</script>

<style scoped>
.page {
  background: #f5f6f8;
  min-height: calc(100vh - 120px);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
}

.amount-card {
  margin: 12px;
  padding: 14px 16px 20px;
  border-radius: 14px;
  background: linear-gradient(145deg, #1f6ae5, #2d8cff);
  color: #fff;
  position: relative;
  text-align: center;
  overflow: hidden;
}

.amount-bg-image {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 200px;
  object-fit: cover;
  opacity: 0.5;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.amount-head {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.amount-label {
  font-size: 14px;
  opacity: 0.95;
}

.eye-btn {
  border: 0;
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.amount {
  position: relative;
  z-index: 1;
  font-size: 36px;
  color: #fff;
  font-family: 'Yuanti SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  margin-top: 10px;
}

.card {
  margin-top: 10px;
  background: #fff;
  overflow: hidden;
}

.card--income {
  background: #f0f9f0;
}

.card--deduction {
  background: #fff5f5;
}

.row {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}

.label {
  color: #666;
}

.value {
  color: #222;
}

.bottom {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 50px;
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  border-top: 1px solid #eee;
}

.total {
  font-size: 14px;
  color: #666;
}

.total-value {
  font-size: 18px;
  font-weight: bold;
  color: #000;
}
</style>
