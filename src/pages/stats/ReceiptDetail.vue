<script setup>
import { computed } from 'vue'

const props = defineProps(['category', 'items'])
const emits = defineEmits(['back'])

const totalAmount = computed(() =>
  props.items.reduce((sum, item) => sum + item.amount, 0),
)

const formattedTotal = computed(() => {
  return totalAmount.value.toLocaleString()
})
</script>

<template>
  <div class="receipt-detail">
    <div class="header">
      <button @click="$emit('back')" class="back-button">
        <i class="fa-solid fa-arrow-left"></i>
      </button>
      <h3 class="receipt-title">4월 {{ category }} 영수증</h3>
    </div>
    <ul class="receipt-list">
      <li class="receipt-item">
        <span class="date">날짜</span>
        <span class="memo">항목</span>
        <span class="amount">금액</span>
      </li>
      <li v-for="item in items" :key="item.id" class="receipt-item">
        <span class="date">{{ item.date }}</span>
        <span class="memo">{{ item.title }}</span>
        <span class="amount">- {{ item.amount.toLocaleString() }} 원</span>
      </li>
    </ul>

    <div class="bottom-section">
      <hr class="divider" />
      <p class="total">총 합계 : -{{ formattedTotal }} 원</p>
      <div class="footer">
        <p class="brand">MacSave 🍔</p>
        <img src="/public/Barcord.png" alt="바코드" class="barcode" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.receipt-detail {
  background: rgba(249, 249, 249, 0.8);
  border: 1px solid #ccc;
  padding: 24px;
  font-family: 'Arial', sans-serif;
  color: #333;
  width: 400px;
  height: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}
.header {
  display: flex;
  justify-content: space-between;
}
.back-button {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
}
.receipt-title {
  width: 100%;
  text-align: center;
  font-weight: bold;
  font-size: 20px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
.receipt-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex-grow: 1;
  max-height: 100%;
}
.receipt-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}
.receipt-item span {
  flex: 1;
}
.memo {
  text-align: center;
}
.amount {
  text-align: right;
}
.bottom-section {
  margin-top: auto; /* 하단으로 밀기 */
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.divider {
  border: none;
  border-top: 3px solid #5f5f5f;
  margin: 4px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
.total {
  margin-top: 24px;
  font-weight: bold;
  font-size: 15px;
  text-align: right;
  margin-bottom: 0;
}
.footer {
  margin-top: 8px;
  text-align: center;
  justify-content: right;
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}
.barcode {
  width: 50%;
  height: 90%;
}

.brand {
  margin-top: 50px;
  font-weight: bold;
  font-size: 16px;
  color: #555;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
</style>
