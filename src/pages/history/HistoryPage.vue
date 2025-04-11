<template>
  <div class="history-page">
    <div v-if="!showModal && !showEditModal">
      <!-- 날짜 및 필터 -->
      <div class="header-row">
        <div class="title" style="margin-bottom: 20px">
          <i class="fa-solid fa-money-check-dollar"></i>
          <span>Expense</span>
        </div>
        <div class="history-filter">
          <div class="date-display" style="color: #ffb400">
            <button @click="prevPeriod" style="color: #ffb400">&lt;</button>
            <span class="month-display">{{ formattedDate }}</span>
            <button @click="nextPeriod" style="color: #ffb400">&gt;</button>
          </div>
          <select v-model="filterMode" class="filter-select">
            <option value="month">Monthly</option>
            <option value="week">Weekly</option>
            <option value="year">Yearly</option>
          </select>
        </div>
      </div>

      <!-- 요약 -->
      <div class="summary-bar">
        <span class="summary-item">
          <span class="summary-label">전체</span>

          <span class="amount">
            {{
              burgerStore.isBurgerMode
                ? burgerStore.burgerFormat(filteredTotal)
                : filteredTotal.toLocaleString() + '원'
            }}
          </span>
        </span>
        <span class="summary-item income">
          <span class="summary-label">수입</span>
          <span class="amount">
            {{
              burgerStore.isBurgerMode
                ? burgerStore.burgerFormat(filteredIncome)
                : filteredIncome.toLocaleString() + '원'
            }}
          </span>
        </span>
        <span class="summary-item expense">
          <span class="summary-label">지출</span>
          <span class="amount">
            {{
              burgerStore.isBurgerMode
                ? burgerStore.burgerFormat(filteredExpense)
                : filteredExpense.toLocaleString() + '원'
            }}
          </span>
        </span>
      </div>

      <!-- 내역 테이블 -->
      <table class="history-table">
        <thead>
          <tr>
            <th></th>
            <!-- 체크박스 칼럼 -->
            <th>날짜</th>
            <th>분류</th>
            <th>금액</th>
            <th>내용</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredTransactions.length === 0">
            <td colspan="5" class="empty">
              <p style="font-size: 50px">🍔</p>
              <p>데이터가 없습니다.</p>
            </td>
          </tr>
          <tr
            v-for="item in filteredTransactions"
            :key="item.id"
            @click="openReceipt(item)"
            style="cursor: pointer"
          >
            <td></td>
            <td style="position: relative">
              <span style="display: block; text-align: center">
                {{ item.date }}
              </span>
            </td>
            <td :class="item.type === '수입' ? 'income' : 'expense'">
              {{ item.category }}
            </td>
            <td :class="item.type === '수입' ? 'income' : 'expense'">
              {{
                burgerStore.isBurgerMode
                  ? burgerStore.burgerFormat(item.amount)
                  : item.amount.toLocaleString() + '원'
              }}
            </td>
            <td>{{ item.title }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <TransactionModal
    v-if="!!showModal"
    :show="showModal"
    @close="showModal = false"
    @saved="refreshData"
  />

  <TransactionReceipt
    v-if="showReceipt"
    :transaction="selectedTransaction"
    :type="selectedTransaction.type"
    @close="showReceipt = false"
    @deleted="handleDelete"
    @edit="openEditModal"
  />

  <TransactionModalEdit
    v-if="showEditModal && selectedTransaction"
    :transaction="selectedTransaction"
    @close="closeEditModal"
    @saved="refreshData"
  />

  <FloatingButton @click="showModal = !showModal" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { useIncomeStore } from '@/stores/incomeStores.js'
import { useExpenseStore } from '@/stores/expenseStores.js'
import FloatingButton from './FloatingButton.vue'
import TransactionModal from './TransactionModal.vue'
import TransactionReceipt from './TransactionReceipt.vue'
import TransactionModalEdit from './TransactionModalEdit.vue'
import apiClient from '@/utils/axios'
// 햄버거 버전
import { useBurgerModeStore } from '@/stores/burgerMode'
const burgerStore = useBurgerModeStore()

const incomeStore = useIncomeStore()
const expenseStore = useExpenseStore()

const currentDate = ref(dayjs())
const filterMode = ref('month')
const showModal = ref(false)

const getWeekRange = date => {
  const startOfWeek = dayjs(date).startOf('week')
  const endOfWeek = dayjs(date).endOf('week')
  return [startOfWeek, endOfWeek]
}

const formattedDate = computed(() => {
  if (filterMode.value === 'month') {
    return currentDate.value.format('YY.MM')
  } else if (filterMode.value === 'week') {
    const [start, end] = getWeekRange(currentDate.value)
    return `${start.format('MM.DD')} ~ ${end.format('MM.DD')}`
  } else if (filterMode.value === 'year') {
    return currentDate.value.format('YYYY년')
  }
  return ''
})

const filteredTransactions = computed(() => {
  const allIncomes = incomeStore.incomes.map(i => ({ ...i, type: '수입' }))
  const allExpenses = expenseStore.expenses.map(e => ({ ...e, type: '지출' }))
  const all = [...allIncomes, ...allExpenses]

  if (filterMode.value === 'month') {
    const selectedMonth = currentDate.value.format('YYYY-MM')
    return all.filter(t => dayjs(t.date).format('YYYY-MM') === selectedMonth)
  }

  if (filterMode.value === 'week') {
    const [start, end] = getWeekRange(currentDate.value)
    return all.filter(t => {
      const txDate = dayjs(t.date)
      return (
        txDate.isAfter(start.subtract(1, 'day')) &&
        txDate.isBefore(end.add(1, 'day'))
      )
    })
  }

  if (filterMode.value === 'year') {
    const selectedYear = currentDate.value.format('YYYY')
    return all.filter(t => dayjs(t.date).format('YYYY') === selectedYear)
  }

  return []
})

const filteredIncome = computed(() => {
  return filteredTransactions.value
    .filter(t => t.type === '수입')
    .reduce((acc, cur) => acc + cur.amount, 0)
})

const filteredExpense = computed(() => {
  return filteredTransactions.value
    .filter(t => t.type === '지출')
    .reduce((acc, cur) => acc + cur.amount, 0)
})

const filteredTotal = computed(
  () => filteredIncome.value - filteredExpense.value,
)

const prevPeriod = () => {
  if (filterMode.value === 'month')
    currentDate.value = currentDate.value.subtract(1, 'month')
  else if (filterMode.value === 'week')
    currentDate.value = currentDate.value.subtract(1, 'week')
  else if (filterMode.value === 'year')
    currentDate.value = currentDate.value.subtract(1, 'year')
}

const nextPeriod = () => {
  if (filterMode.value === 'month')
    currentDate.value = currentDate.value.add(1, 'month')
  else if (filterMode.value === 'week')
    currentDate.value = currentDate.value.add(1, 'week')
  else if (filterMode.value === 'year')
    currentDate.value = currentDate.value.add(1, 'year')
}
// 영수증 및 삭제버튼
const selectedTransaction = ref(null)
const showReceipt = ref(false)

const openReceipt = item => {
  // 이미 같은 항목을 선택한 경우 → 토글 닫기
  if (selectedTransaction.value?.id === item.id) {
    showReceipt.value = false
    selectedTransaction.value = null
    return
  }

  // 새로운 항목 선택 → 열기
  selectedTransaction.value = item
  showReceipt.value = true
}

const handleDelete = async (id, type) => {
  const confirmed = window.confirm('정말 삭제하시겠습니까?')
  if (!confirmed) return

  const endpoint = type === '수입' ? `/incomes/${id}` : `/expenses/${id}`

  try {
    await apiClient.delete(endpoint)
    alert('삭제되었습니다.')
    await refreshData() // 수입/지출 다시 불러오기
    showReceipt.value = false // 모달 닫기
  } catch (error) {
    console.error(error)
    alert('삭제 중 오류가 발생했습니다.')
  }
}

// 수정 버튼 구현
const showEditModal = ref(false)

const openEditModal = transaction => {
  // 영수증 닫기
  showReceipt.value = false

  // 수정 모달 열기
  selectedTransaction.value = transaction
  showEditModal.value = true
}
const closeEditModal = () => {
  showEditModal.value = false
  selectedTransaction.value = null
}

const refreshData = async () => {
  await incomeStore.fetchIncomes()
  await expenseStore.fetchExpenses()
}

onMounted(refreshData)
</script>

<style scoped>
.title {
  color: #ffb400;
  font-size: 32px;
  font-weight: bold;
  margin-top: 24px;
}
.title i {
  margin-right: 8px;
}
.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between; /* h2와 change-filter를 양쪽으로 배치 */
}

.history-page {
  max-height: calc(100vh - 0px); /* 헤더나 다른 요소 높이 감안하여 조정 */
  overflow-y: auto;
}

.history-filter {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  color: white;
}

.date-display {
  font-size: 20px;
  background-color: #333333;
  display: flex;
  align-items: center;
  justify-content: center;

  padding: 6px 12px;
  gap: 80px;
  width: fit-content;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
}

.date-display button {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
}

.date-display button:hover {
  color: #555;
}
.summary-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(255, 223, 145, 0.8);
  padding: 10px 20px;
  border-radius: 10px;
  margin: 10px 0;
  font-weight: bold;
  font-size: 14px;
}

.summary-item {
  flex: 1;
  text-align: center;
  color: #333;
}

.income {
  color: rgb(24, 181, 239);
  font-weight: bold;
}
.expense {
  color: #ff1900;
  font-weight: bold;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
}

.history-table thead {
  font-size: 16px;
  font-weight: lighter;
  align-items: center;
  background-color: rgba(205, 205, 205, 0.6);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
  color: black;
}

.history-table tbody {
  font-size: 16px;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.1);
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
  /* font-weight: bold; */
}

.history-table th,
.history-table td {
  padding: 6px 12px;
  border-collapse: separate;
  border-spacing: 10px;
  border-bottom: 1px solid #ddd;
}

.empty {
  text-align: center;
  color: #888;
  padding: 32px 0;
}

.filter-select {
  color: #ffb400;
  font-size: 16px;
  padding: 8px 12px;
  margin-left: auto;
  border-radius: 5px;
  background-color: #333333;
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
}
</style>
