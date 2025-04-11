<template>
  <div class="receipt-container" v-if="transaction">
    <button class="close-btn" @click="emitClose">X</button>

    <h2>{{ isExpense ? '지출 상세 내역' : '수입 상세 내역' }}</h2>
    <hr />

    <div class="detail">
      <div class="row">
        <span class="label">날짜</span>
        <span class="value">{{ transaction.date }}</span>
      </div>
      <div class="row">
        <span class="label">금액</span>
        <span class="value">{{ transaction.amount.toLocaleString() }} 원</span>
      </div>
      <div class="row">
        <span class="label">분류</span>
        <span class="value" :class="isExpense ? 'expense' : 'income'">
          {{ transaction.category }}
        </span>
      </div>
      <div class="row">
        <span class="label">내용</span>
        <span class="value">{{ transaction.title }}</span>
      </div>
      <div class="row">
        <span class="label">메모</span>
        <span class="value">{{ transaction.memo || '-' }}</span>
      </div>
    </div>

    <hr />
    <div class="actions">
      <button @click="emitDelete">삭제</button>
      <button @click="emitEdit">수정</button>
    </div>

    <img src="/Barcord.png" alt="barcode" />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  transaction: Object,
  type: String, // '수입' or '지출'
})

const emit = defineEmits(['deleted', 'edit'])

const isExpense = computed(() => props.type === '지출')

const emitDelete = () => {
  emit('deleted', props.transaction.id, props.type)
}

const emitEdit = () => {
  emit('edit', props.transaction) // 부모 컴포넌트로 transaction 데이터 전달
}

const emitClose = () => {
  emit('close') // 부모 컴포넌트로 닫기 이벤트 전달
}
</script>

<style scoped>
.receipt-container {
  position: fixed; /* 화면 기준으로 고정 */
  top: 80px; /* 상단에서 얼마나 떨어질지 조정 */
  right: 20px; /* 우측에서 떨어진 거리 */
  z-index: 1000; /* 다른 요소 위에 올라오도록 */

  background: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 20px;
  width: 300px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  height: 500px;
}
.receipt-container img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 10px auto 0;
}
h2 {
  font-size: 24px;
  text-align: center;
  margin-bottom: 12px;
}

.detail .row {
  display: flex;
  justify-content: space-between;
  margin: 6px 0;
}

.label {
  font-weight: bold;
  color: #444;
}

.value {
  text-align: right;
  max-width: 200px;
  word-break: break-word;
}

.detail p {
  margin: 6px 0;
}

.expense {
  color: red;
  font-weight: bold;
}

.income {
  color: rgb(24, 181, 239);
  font-weight: bold;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
}

.actions button {
  padding: 5px 46px;
  border: none;
  border-radius: 10px;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  background-color: #eee;
  width: 150px;
}
img {
  max-width: 100%;
  height: auto;
  padding: 50% 0px;
}
.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
}
.actions button {
}
</style>
