import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 全局日志/通知 Store
 *
 * 原本 `battleLog` 挂在 `battleStore` 下，导致大量非战斗模块为了写一行日志而依赖 battleStore，
 * 形成循环依赖。抽离为独立 store 后，各业务模块只需依赖此轻量级日志层。
 */
export const useLogStore = defineStore('log', () => {
  const battleLog = ref<string[]>([])

  function push(msg: string) {
    battleLog.value.push(msg)
  }

  function set(messages: string[]) {
    battleLog.value = messages
  }

  function clear() {
    battleLog.value = []
  }

  function reset() {
    battleLog.value = []
  }

  function serialize(): Record<string, unknown> {
    // 日志属于会话级状态，不持久化
    return {}
  }

  function deserialize(_saveData: Record<string, unknown>) {
    reset()
  }

  return {
    battleLog,
    push,
    set,
    clear,
    reset,
    serialize,
    deserialize,
  }
})
