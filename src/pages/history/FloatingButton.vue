<template>
  <button class="floating-button" @click="onClick">
    <i class="fa-solid fa-plus"></i>
  </button>
</template>

<script setup>
const emit = defineEmits(['click'])
const onClick = () => emit('click')
</script>

<style scoped>
.floating-button {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background-color: #ffb400;
  color: white;
  padding: 12px 16px;
  border-radius: 50%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
  font-size: 24px;
  cursor: pointer;
  z-index: 1000;
}
</style>
