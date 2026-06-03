const STORAGE_KEY = 'bio_yi_wrong_book'

export function getWrongQuestions() {
  try { const data = localStorage.getItem(STORAGE_KEY); return data ? JSON.parse(data) : [] }
  catch { return [] }
}

export function saveWrongQuestion(questions) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(questions)) } catch {}
}

export function loadWrongQuestions() {
  return getWrongQuestions()
}

export function clearWrongQuestions() {
  try { localStorage.removeItem(STORAGE_KEY) } catch {}
}
