/**
 * 存档服务
 *
 * 提供防抖保存（requestSave）与立即保存（saveNow/flushSave）。
 * 各子 store 只需引入本服务，不再直接依赖 game.js 的门面 store，
 * 从而切断“子 store → game.js → 子 store”的循环依赖。
 */

let saveCallback = null
let timer = null
let pending = false

const DEBOUNCE_MS = 300

/**
 * 注册实际执行保存的回调（由 game.js 在初始化时设置）
 * @param {() => void} cb
 */
export function registerSaveCallback(cb) {
  saveCallback = cb
}

function invokeSave() {
  if (typeof saveCallback === 'function') {
    saveCallback()
  }
}

function clearTimer() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

/**
 * 触发防抖保存。高频调用会在 DEBOUNCE_MS 内合并为一次。
 */
export function requestSave() {
  pending = true
  if (timer) return
  timer = setTimeout(() => {
    flushSave()
  }, DEBOUNCE_MS)
}

/**
 * 立即保存，并清空待保存队列。
 */
export function saveNow() {
  flushSave()
}

/**
 * 强制刷盘（页面卸载前调用）
 */
export function flushSave() {
  clearTimer()
  pending = false
  invokeSave()
}

/**
 * 是否有尚未写入的存档
 * @returns {boolean}
 */
export function hasPendingSave() {
  return pending
}

/**
 * 页面关闭前强制保存（仅 H5）
 */
// #ifdef H5
function setupBeforeUnload() {
  if (typeof window === 'undefined') return
  window.addEventListener('beforeunload', () => {
    if (hasPendingSave()) {
      flushSave()
    }
  })
}

setupBeforeUnload()
// #endif

/**
 * 小程序/App 隐藏时强制保存
 * 由 App.vue / Page 生命周期调用
 */
export function flushSaveIfNeeded() {
  if (hasPendingSave()) {
    flushSave()
  }
}
