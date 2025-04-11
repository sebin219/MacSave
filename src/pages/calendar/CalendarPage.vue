<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import koLocale from '@fullcalendar/core/locales/ko'
import { useIncomeStore } from '@/stores/incomeStores'
import { useExpenseStore } from '@/stores/expenseStores'
import dayjs from 'dayjs'
// 햄버거 모드
import { useBurgerModeStore } from '@/stores/burgerMode'
const burgerStore = useBurgerModeStore()

const incomeStore = useIncomeStore()
const expenseStore = useExpenseStore()

const currentRange = ref({
  start: '',
  end: '',
})

const calendarOptions = ref({
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
  weekends: true,
  locale: koLocale,
  height: 'auto',
  headerToolbar: {
    left: '',
    center: '',
    right: 'today prev title next',
  },
  buttonText: {
    today: 'Today',
  },
  titleFormat: {
    year: '2-digit',
    month: '2-digit',
  },
  dayCellContent(arg) {
    return arg.date.getDate().toString()
  },
  events: [],
  eventContent(arg) {
    const { income = 0, expense = 0 } = arg.event.extendedProps
    const total = income - expense

    const container = document.createElement('div')
    container.innerHTML = `
      <div class="fc-custom-event">
        <div class="expense">-${expense.toLocaleString()}원</div>
        <div class="income">+${income.toLocaleString()}원</div>
        <div class="total">${total.toLocaleString()}원</div>
      </div>
    `
    return { domNodes: [container] }
  },
  datesSet(arg) {
    const currentMonthStart = dayjs(arg.start)
      .add(1, 'month')
      .startOf('month')
      .format('YYYY-MM-DD')
    const currentMonthEnd = dayjs(arg.start)
      .add(1, 'month')
      .endOf('month')
      .format('YYYY-MM-DD')
    currentRange.value = {
      start: currentMonthStart,
      end: currentMonthEnd,
    }
  },
})

onMounted(async () => {
  await incomeStore.fetchIncomes()
  await expenseStore.fetchExpenses()

  const calendarApi = calendarOptions.value.getApi?.()
  if (calendarApi) {
    const view = calendarApi.view
    const currentMonthStart = dayjs(view.currentStart)
      .add(1, 'month')
      .startOf('month')
      .format('YYYY-MM-DD')
    const currentMonthEnd = dayjs(view.currentStart)
      .add(1, 'month')
      .endOf('month')
      .format('YYYY-MM-DD')
    currentRange.value = {
      start: currentMonthStart,
      end: currentMonthEnd,
    }
  }
})

const filteredIncomes = computed(() => {
  return incomeStore.incomes.filter(i => {
    return (
      i.date >= currentRange.value.start && i.date <= currentRange.value.end
    )
  })
})

const filteredExpenses = computed(() => {
  return expenseStore.expenses.filter(e => {
    return (
      e.date >= currentRange.value.start && e.date <= currentRange.value.end
    )
  })
})

const totalIncome = computed(() =>
  filteredIncomes.value.reduce((sum, i) => sum + i.amount, 0),
)

const totalExpense = computed(() =>
  filteredExpenses.value.reduce((sum, e) => sum + e.amount, 0),
)

const totalSum = computed(() => totalIncome.value - totalExpense.value)

const dailyEvents = computed(() => {
  const incomeMap = {}
  const expenseMap = {}

  incomeStore.incomes.forEach(i => {
    const date = i.date.slice(0, 10)
    incomeMap[date] = (incomeMap[date] || 0) + i.amount
  })

  expenseStore.expenses.forEach(e => {
    const date = e.date.slice(0, 10)
    expenseMap[date] = (expenseMap[date] || 0) + e.amount
  })

  const allDates = new Set([
    ...Object.keys(incomeMap),
    ...Object.keys(expenseMap),
  ])
  const result = []

  allDates.forEach(date => {
    result.push({
      start: date,
      allDay: true,
      display: 'block',
      extendedProps: {
        income: incomeMap[date] || 0,
        expense: expenseMap[date] || 0,
      },
    })
  })

  return result
})

watch(
  dailyEvents,
  () => {
    calendarOptions.value.events = dailyEvents.value
  },
  { immediate: true },
)
</script>

<template>
  <div class="calendar-wrapper">
    <h2><i class="fa-solid fa-calendar-days"></i> Calendar</h2>

    <div class="summary-box">
      <div class="summary-item">
        전체<br />
        <span class="amount">
          {{
            burgerStore.isBurgerMode
              ? burgerStore.burgerFormat(totalSum)
              : totalSum.toLocaleString() + '원'
          }}
        </span>
      </div>
      <div class="summary-item income">
        수입<br />

        <span class="amount">
          {{
            burgerStore.isBurgerMode
              ? burgerStore.burgerFormat(totalIncome)
              : totalIncome.toLocaleString() + '원'
          }}
        </span>
      </div>
      <div class="summary-item expense">
        지출<br />

        <span class="amount">
          {{
            burgerStore.isBurgerMode
              ? burgerStore.burgerFormat(totalExpense)
              : totalExpense.toLocaleString() + '원'
          }}
        </span>
      </div>
    </div>

    <FullCalendar :options="calendarOptions" />
  </div>
</template>

<style>
html,
body,
#app,
.calendar-wrapper {
  height: 100%;
  padding: 0;
}

.fc {
  height: 100% !important;
  color: #f0f0f0;
}

.fc .fc-daygrid-body {
  background-color: rgba(31, 31, 31, 0.2);
}

.fc-toolbar {
  margin-bottom: 0.3rem !important;
}

.fc-header-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
}

.fc-toolbar-chunk:last-child {
  display: flex;
  align-items: center;
  gap: 10px;
}

.fc .fc-col-header-cell {
  background-color: #3a4046;
}

.fc .fc-col-header-cell-cushion {
  font-size: 15px;
  font-weight: 500;
  color: rgb(211, 211, 211);
}

.fc .fc-toolbar-title {
  font-size: 20px;
  font-weight: 500;
  color: #ffb400;
}

.fc-button {
  padding: 5px 10px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  background-color: rgb(51, 51, 51) !important;
  color: #ffb400 !important;
}

.fc-button:hover {
  filter: brightness(0.8);
}

.fc-button:disabled {
  background-color: #ccc;
  color: #666;
  cursor: not-allowed;
}

.fc .fc-event-title {
  font-size: 16px !important;
  color: #1976d2;
  font-weight: bold;
  white-space: pre-wrap;
  word-break: keep-all;
  padding: 2px 4px;
  border-radius: 4px;
}

.fc .fc-daygrid-day-number {
  font-size: 13px;
  color: #f2f2f2;
  font-weight: 500;
}

/* 해당 제외 다른 날짜들 */
.fc-day-other {
  background-color: rgb(66, 66, 66, 0.3);
  color: #a8a8a8;
}

/* 오늘 날짜의 배경색 */
.fc .fc-day-today {
  background-color: rgb(127, 151, 212, 0.4) !important;
}

/* 기존 스타일 끄기 */
.fc-event-time,
.fc-daygrid-event-dot {
  display: none;
}

/* 요약카드 */
.summary-box {
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
}

.summary-item:first-child {
  color: #1c1b1b;
  font-weight: 600;
}

.summary-item.income {
  color: rgb(1, 147, 200);
  font-weight: 600;
}

.summary-item.expense {
  color: rgb(234, 3, 3);
  font-weight: 600;
}

.summary-item .amount {
  font-size: 16px;
  display: block;
  margin-top: 4px;
}

.fc .fc-custom-event {
  text-align: right;
  padding-right: 4px;
}

.fc .fc-custom-event .expense {
  color: #ff2929;
  font-size: 15px;
  line-height: 1.1;
}

.fc .fc-custom-event .income {
  color: rgb(63, 176, 217);
  font-size: 15px;
  line-height: 1.1;
}

.fc .fc-custom-event .total {
  color: #f2f2f2;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.1;
  margin-top: 2px;
}

.fc .fc-event {
  background-color: transparent !important;
  border: none !important;
  padding: 0 !important;
}
/* 달력 하단의 흰 여백 제거*/
.fc-view-harness,
.fc-scroller-harness {
  min-height: auto !important;
  height: auto !important;
  padding-bottom: 0 !important;
  margin-bottom: 0 !important;
}

/* 필요시 추가: 달력 전체 wrapper 높이 제한 */
/*.calendar-wrapper {
  max-height: calc(100vh - 0px); /* 헤더나 다른 요소 높이 감안하여 조정
  overflow-y: auto;
}*/

.calendar-wrapper h2 {
  color: #ffb400;
  font-size: 32px;
}

/* 달력의 테두리 색 선정 */
.fc .fc-scrollgrid,
.fc .fc-daygrid-day,
.fc .fc-daygrid-day-frame,
.fc .fc-daygrid-body,
.fc .fc-daygrid-body table {
  border-color: #b5b5b5 !important;
}
</style>
