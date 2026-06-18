// ==================== Smart Mall - 用户状态管理 (Pinia) ====================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const TOKEN_KEY = 'sm_token'
const USER_KEY = 'sm_user'

export const useUserStore = defineStore('user', () => {
  // ---- 状态 ----
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const currentUser = ref(JSON.parse(localStorage.getItem(USER_KEY) || 'null'))

  // ---- 计算属性 ----
  const isLoggedIn = computed(() => !!token.value)
  const userId = computed(() => currentUser.value?.id || null)

  // ---- 方法 ----
  function setAuth(t, user) {
    token.value = t
    currentUser.value = { ...user, roles: user.roles || ['USER'] }
    localStorage.setItem(TOKEN_KEY, t)
    localStorage.setItem(USER_KEY, JSON.stringify(currentUser.value))
  }

  function updateProfile(user) {
    currentUser.value = { ...currentUser.value, ...user }
    localStorage.setItem(USER_KEY, JSON.stringify(currentUser.value))
  }

  function logout() {
    token.value = ''
    currentUser.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return {
    token,
    currentUser,
    isLoggedIn,
    userId,
    setAuth,
    updateProfile,
    logout
  }
})
