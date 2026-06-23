import { getStorageItem, setStorageItem, removeStorageItem } from '../platform/storage.js'

const STORAGE_KEY = 'bio_yi_wrong_book'

export function getWrongQuestions(): unknown[] {
  try {
    const data = getStorageItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveWrongQuestion(questions: unknown[]): void {
  try {
    setStorageItem(STORAGE_KEY, JSON.stringify(questions))
  } catch {
    /* 忽略存储失败 */
  }
}

export function loadWrongQuestions(): unknown[] {
  return getWrongQuestions()
}

export function clearWrongQuestions(): void {
  try {
    removeStorageItem(STORAGE_KEY)
  } catch {
    /* 忽略存储失败 */
  }
}
