import { reactive } from 'vue'

const toasts = reactive([])
let idCounter = 0

export function useToast() {
  function show(message, type = 'info', duration = 2200) {
    const id = ++idCounter
    toasts.push({ id, message, type, duration })
    setTimeout(() => remove(id), duration)
  }

  function success(message, duration) {
    show(message, 'success', duration)
  }

  function error(message, duration) {
    show(message, 'error', duration)
  }

  function warning(message, duration) {
    show(message, 'warning', duration)
  }

  function info(message, duration) {
    show(message, 'info', duration)
  }

  function remove(id) {
    const idx = toasts.findIndex(t => t.id === id)
    if (idx !== -1) toasts.splice(idx, 1)
  }

  return { toasts, show, success, error, warning, info, remove }
}
