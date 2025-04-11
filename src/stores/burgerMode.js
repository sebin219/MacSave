import { defineStore } from 'pinia'

// burgerMode.js
export const useBurgerModeStore = defineStore('burgerMode', {
  state: () => ({
    isBurgerMode: false,
    burgerPrice: 5500,
  }),
  actions: {
    toggleMode() {
      this.isBurgerMode = !this.isBurgerMode
    },
    burgerFormat(amount) {
      const absAmount = Math.abs(amount)
      const count = Math.floor(absAmount / this.burgerPrice)

      if (count === 0) return '0'
      if (count <= 5) {
        return amount < 0 ? '-' + '🍔'.repeat(count) : '🍔'.repeat(count)
      }
      return amount < 0
        ? `- ${count.toLocaleString()} x 🍔`
        : `${count.toLocaleString()} x 🍔`
    },
  },
})
