<script setup>
import HeaderContainer from '@/components/HeaderContainer.vue'
</script>
<!-- DefaultLayout.vue -->
<template>
  <div class="app-container">
    <HeaderContainer />
    <div class="main-layout">
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>
<style scoped>
/* 전체 레이아웃 */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #3a4046;
}

.main-layout {
  flex: 1;
  position: relative;
}

/* 본문 영역 */
.content {
  position: relative;
  flex: 1;
  min-height: calc(100vh - 74px); /* 헤더 제외한 높이 */
  padding: 24px;
  background-color: #3a4046;
  overflow: hidden;
  z-index: 0;
}

/* 배경 로고 */
.content::before {
  content: '';
  position: fixed;
  top: 60%; /* .content 기준으로 중앙 */
  left: 50%;
  transform: translate(-50%, -50%);
  background-image: url('/logo.png');
  background-repeat: no-repeat;
  background-size: 550px auto;
  opacity: 0.35;
  width: 550px;
  height: 600px;
  z-index: -1; /* 콘텐츠보다 아래 */
  pointer-events: none;
}
</style>
