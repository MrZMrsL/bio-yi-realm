/**
 * 日志工具
 *
 * 生产环境下不输出日志，避免污染控制台并减少信息泄露。
 * 测试文件仍可直接使用 console.*。
 */

const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV

export const logger = {
  log: (...args) => {
    if (isDev) console.log(...args)
  },
  warn: (...args) => {
    if (isDev) console.warn(...args)
  },
  error: (...args) => {
    if (isDev) console.error(...args)
  },
}
