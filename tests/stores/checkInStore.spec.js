import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCheckInStore } from '../../src/stores/checkInStore.ts'
import { usePlayerStore } from '../../src/stores/playerStore.ts'
import { useEquipmentStore } from '../../src/stores/equipmentStore.ts'
import {
  getTodayString,
  isSameDay,
  isYesterday,
  diffDays,
} from '../../src/utils/date.ts'

vi.mock('../../src/platform/env.js', () => ({
  isH5: () => true,
  isMiniProgram: () => false,
  isApp: () => false,
}))

vi.mock('../../src/utils/date.ts', () => ({
  getTodayString: vi.fn(() => '2026-06-23'),
  isSameDay: vi.fn((a, b) => a === b),
  isYesterday: vi.fn(() => false),
  diffDays: vi.fn((a, b) => {
    const parse = (str) => {
      const [y, m, d] = str.split('-').map(Number)
      return new Date(y, m - 1, d)
    }
    return Math.round((parse(b) - parse(a)) / (24 * 60 * 60 * 1000))
  }),
  isBefore: vi.fn(),
  isAfter: vi.fn(),
  parseDateString: vi.fn(),
}))

describe('CheckIn Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    getTodayString.mockReturnValue('2026-06-23')
    isSameDay.mockImplementation((a, b) => a === b)
    isYesterday.mockImplementation(() => false)
  })

  it('初始状态可以签到', () => {
    const store = useCheckInStore()
    expect(store.canCheckInToday).toBe(true)
    expect(store.hasCheckedInToday).toBe(false)
    expect(store.currentStreak).toBe(0)
    expect(store.totalCheckIns).toBe(0)
  })

  it('签到后获得奖励，并更新连击', () => {
    const store = useCheckInStore()
    const playerStore = usePlayerStore()

    const result = store.checkInToday()

    expect(result.success).toBe(true)
    expect(store.currentStreak).toBe(1)
    expect(store.totalCheckIns).toBe(1)
    expect(store.canCheckInToday).toBe(false)
    expect(playerStore.gold).toBeGreaterThan(0)
    expect(result.messages.length).toBeGreaterThan(0)
  })

  it('重复签到返回失败', () => {
    const store = useCheckInStore()
    store.checkInToday()
    const result = store.checkInToday()
    expect(result.success).toBe(false)
    expect(store.totalCheckIns).toBe(1)
  })

  it('连续两天签到增加连击', () => {
    const store = useCheckInStore()

    store.checkInToday()
    expect(store.currentStreak).toBe(1)

    // 模拟第二天
    getTodayString.mockReturnValue('2026-06-24')
    isSameDay.mockImplementation((a, b) => a === b)
    isYesterday.mockImplementation((prev, today) => prev === '2026-06-23' && today === '2026-06-24')

    const result = store.checkInToday()
    expect(result.success).toBe(true)
    expect(store.currentStreak).toBe(2)
    expect(store.totalCheckIns).toBe(2)
  })

  it('断签后连击重置为 1', () => {
    const store = useCheckInStore()

    store.checkInToday() // 2026-06-23
    expect(store.currentStreak).toBe(1)

    // 模拟三天后（断签）
    getTodayString.mockReturnValue('2026-06-26')
    isSameDay.mockImplementation((a, b) => a === b)
    isYesterday.mockImplementation(() => false)

    const result = store.checkInToday()
    expect(result.success).toBe(true)
    expect(store.currentStreak).toBe(1)
    expect(store.totalCheckIns).toBe(2)
  })

  it('存档序列化与反序列化保留状态', () => {
    const store = useCheckInStore()
    store.checkInToday()

    const data = store.serialize()
    expect(data.checkInStreak).toBe(1)
    expect(data.checkInTotal).toBe(1)
    expect(data.checkInLastDate).toBe('2026-06-23')

    store.reset()
    expect(store.currentStreak).toBe(0)

    store.deserialize(data)
    expect(store.currentStreak).toBe(1)
    expect(store.totalCheckIns).toBe(1)
    expect(store.lastCheckInDate).toBe('2026-06-23')
  })

  it('读档时若断签则连击归零', () => {
    const store = useCheckInStore()

    store.deserialize({
      checkInLastDate: '2026-06-20',
      checkInStreak: 5,
      checkInTotal: 10,
      checkInDates: { '2026-06-20': true },
    })

    expect(store.lastCheckInDate).toBe('2026-06-20')
    expect(store.totalCheckIns).toBe(10)
    expect(store.currentStreak).toBe(0)
  })
})
