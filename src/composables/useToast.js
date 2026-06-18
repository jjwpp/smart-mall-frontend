// ==================== Toast 通知 composable ====================
import { ref } from 'vue'

const toasts = ref([])
let idCounter = 0

export function useToast() {
  function show(message, type = 'info', duration = 3000) {
    const id = ++idCounter
    toasts.value.push({ id, message, type })
    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }
    return id
  }

  function remove(id) {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx > -1) toasts.value.splice(idx, 1)
  }

  function success(msg) { return show(msg, 'success') }
  function error(msg) { return show(msg, 'error', 5000) }
  function warning(msg) { return show(msg, 'warning', 4000) }
  function info(msg) { return show(msg, 'info') }

  return { toasts, show, remove, success, error, warning, info }
}
