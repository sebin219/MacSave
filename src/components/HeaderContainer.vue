<script setup>
import { ref } from 'vue'
import { useBurgerModeStore } from '@/stores/burgerMode'
import { useRouter } from 'vue-router'
const router = useRouter()
const burgerStore = useBurgerModeStore()

const today = ref(
  new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
)
const hoveredIndex = ref(null)
const menuItems = [
  { path: '/history', label: 'Expense', hoverLabel: '지출 내역' },
  { path: '/calendar', label: 'Calendar', hoverLabel: '캘린더' },
  { path: '/stats', label: 'Analysis', hoverLabel: '분석' },
  { path: '/settings', label: 'Setting', hoverLabel: '설정' },
]
function goHistory() {
  router.push('/history')
}
</script>

<template>
  <header class="app-header">
    <!-- 왼쪽: 로고 -->
    <div class="left">
      <img class="logo" src="/logo.png" alt="MacSave 로고" @click="goHistory" />
    </div>

    <!-- 오른쪽: 메뉴 + 날짜 묶음 -->
    <div class="right-group">
      <nav class="menu-list">
        <RouterLink
          v-for="(item, index) in menuItems"
          :key="item.path"
          :to="item.path"
          class="menu-item"
          exact
          @mouseover="hoveredIndex = index"
          @mouseleave="hoveredIndex = null"
          >{{
            hoveredIndex === index ? item.hoverLabel : item.label
          }}</RouterLink
        >
        <button
          class="burgerbtn"
          :class="{ active: burgerStore.isBurgerMode }"
          @click="burgerStore.toggleMode"
        >
          <i class="fa-solid fa-burger"></i>
        </button>
      </nav>
      <div class="date">{{ today }}</div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  background-color: #1d2329;
  padding: 0 24px;
}

.logo {
  width: 70px;
  height: auto;
  cursor: pointer;
}

/* 오른쪽 영역 전체 (메뉴 + 날짜) */
.right-group {
  display: flex;
  align-items: center;
  gap: 32px;
}

/* 메뉴 */
.menu-list {
  display: flex;
  gap: 30px;
}

.menu-item {
  font-size: 17px;
  font-weight: 600;
  text-decoration: none;
  color: #ffb400;
  padding: 6px 10px;
  border-radius: 8px;
  height: 24px;
  width: 80px;
  text-align: center;
}
.menu-item:hover {
  transition: 0.3s;
}
.router-link-exact-active {
  background-color: rgba(255, 223, 145, 0.5);
  box-shadow: inset 0 2px 0px rgba(0, 0, 0, 0.7);
}
/* 햄버거 버튼 */
.burgerbtn {
  background-color: transparent;
  border-radius: 8px;
}
.burgerbtn.active {
  border: 2px solid #ffb400;
}
.fa-burger {
  color: #ffb400;
}
/* 날짜는 맨 오른쪽 */
.date {
  font-size: 15px;
  color: #8a8a8a;
  white-space: nowrap;
  position: relative;
  font-weight: 900;
}
</style>
