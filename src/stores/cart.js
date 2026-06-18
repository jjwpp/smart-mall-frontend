// ==================== Smart Mall - 购物车状态管理 (Pinia) ====================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../utils/api'
import { useUserStore } from './user'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const loading = ref(false)

  const count = computed(() => items.value.length)
  const totalAmount = computed(() => {
    return items.value
      .filter(item => item.selected)
      .reduce((sum, item) => sum + (item.productPrice || 0) * item.quantity, 0)
  })

  async function fetchItems() {
    const userStore = useUserStore()
    if (!userStore.isLoggedIn) return
    loading.value = true
    try {
      const res = await api.getCartList(userStore.userId, userStore.token)
      items.value = Array.isArray(res) ? res : []
    } catch (e) {
      console.error('获取购物车失败:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchCount() {
    const userStore = useUserStore()
    if (!userStore.isLoggedIn) return
    try {
      const res = await api.getCartList(userStore.userId, userStore.token)
      items.value = Array.isArray(res) ? res : []
    } catch { /* ignore */ }
  }

  async function addItem(data) {
    const userStore = useUserStore()
    await api.addToCart(data, userStore.token)
    await fetchItems()
  }

  async function updateItem(id, data) {
    const userStore = useUserStore()
    await api.updateCartItem(id, data, userStore.token)
    await fetchItems()
  }

  async function removeItem(id) {
    const userStore = useUserStore()
    await api.deleteCartItem(id, userStore.token)
    await fetchItems()
  }

  async function clearAll() {
    const userStore = useUserStore()
    await api.clearCart(userStore.userId, userStore.token)
    items.value = []
  }

  function clear() {
    items.value = []
  }

  // 仅移除已勾选的商品（结算后使用，保留未勾选的）
  function removeSelected() {
    items.value = items.value.filter(item => !item.selected)
  }

  return {
    items, loading, count, totalAmount,
    fetchItems, fetchCount, addItem, updateItem, removeItem, clearAll, clear, removeSelected
  }
})
