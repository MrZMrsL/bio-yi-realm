/**
 * 日期工具函数
 *
 * 所有日期统一使用本地时间的 `YYYY-MM-DD` 字符串处理，
 * 用于签到、每日限制等不需要精确时刻的场景。
 */

/**
 * 获取今天的日期字符串（本地时间）
 */
export function getTodayString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 将日期字符串解析为本地时间 00:00:00 的 Date 对象
 */
export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day, 0, 0, 0, 0)
}

/**
 * 计算两个日期字符串之间相差的天数
 * 仅比较日期部分，忽略时分秒。
 */
export function diffDays(a: string, b: string): number {
  const dateA = parseDateString(a)
  const dateB = parseDateString(b)
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round((dateB.getTime() - dateA.getTime()) / msPerDay)
}

/**
 * 判断两个日期是否为同一天
 */
export function isSameDay(a: string, b: string): boolean {
  return a === b
}

/**
 * 判断 prevDate 是否是 today 的前一天
 */
export function isYesterday(prevDate: string, today: string): boolean {
  return diffDays(prevDate, today) === 1
}

/**
 * 判断 dateStr 是否早于 today（至少差 1 天）
 */
export function isBefore(dateStr: string, today: string): boolean {
  return diffDays(dateStr, today) > 0
}

/**
 * 判断 dateStr 是否晚于 today
 */
export function isAfter(dateStr: string, today: string): boolean {
  return diffDays(dateStr, today) < 0
}
