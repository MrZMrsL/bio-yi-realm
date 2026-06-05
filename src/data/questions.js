// questions.js - 生化易界题库（渐进式按需加载版）
// 策略：先加载当前楼层需要的难度，后续难度后台渐进加载

export const ALL_QUESTIONS = []
export const CHEM_QUESTIONS = []
export const BIO_QUESTIONS = []
export const YI_QUESTIONS = []

let loaded = false
let loadingPromise = null
let _loadProgress = 0

export function getLoadProgress() { return _loadProgress }

// 各难度对应的文件列表（用于按需加载）
const DIFFICULTY_FILES = {
  easy: [
    { file: 'chem_easy.js', key: 'CHEM_EASY' },
    { file: 'bio_easy.js', key: 'BIO_EASY' },
    { file: 'yi_easy.js', key: 'YI_EASY' }
  ],
  medium: [
    { file: 'chem_medium_1.js', key: 'CHEM_MEDIUM_1' },
    { file: 'chem_medium_2.js', key: 'CHEM_MEDIUM_2' },
    { file: 'bio_medium.js', key: 'BIO_MEDIUM' },
    { file: 'yi_medium.js', key: 'YI_MEDIUM' }
  ],
  hard: [
    { file: 'chem_hard.js', key: 'CHEM_HARD' },
    { file: 'chem_exp_medium.js', key: 'CHEM_EXP_MEDIUM' },
    { file: 'chem_exp_hard.js', key: 'CHEM_EXP_HARD' },
    { file: 'bio_hard.js', key: 'BIO_HARD' },
    { file: 'bio_exp_medium.js', key: 'BIO_EXP_MEDIUM' },
    { file: 'bio_exp_hard.js', key: 'BIO_EXP_HARD' },
    { file: 'yi_hard.js', key: 'YI_HARD' }
  ]
}

// 已加载的难度标记
const loadedDifficulty = { easy: false, medium: false, hard: false }

// 已加载的模块缓存
const loadedModules = {}

function updateProgress(loadedCount, totalCount) {
  _loadProgress = Math.round((loadedCount / totalCount) * 100)
}

// 确保指定难度的题目已加载
async function ensureDifficulty(difficulty) {
  if (loadedDifficulty[difficulty]) return

  const files = DIFFICULTY_FILES[difficulty]
  if (!files) return

  const results = await Promise.all(
    files.map(f => import('./' + f.file).then(m => {
      loadedModules[f.key] = m[f.key]
      updateProgress(Object.keys(loadedModules).length, 14)
    }))
  )

  // 推入对应的学科数组
  const modules = loadedModules
  if (difficulty === 'easy') {
    CHEM_QUESTIONS.push(...(modules.CHEM_EASY || []))
    BIO_QUESTIONS.push(...(modules.BIO_EASY || []))
    YI_QUESTIONS.push(...(modules.YI_EASY || []))
  } else if (difficulty === 'medium') {
    CHEM_QUESTIONS.push(...(modules.CHEM_MEDIUM_1 || []), ...(modules.CHEM_MEDIUM_2 || []))
    BIO_QUESTIONS.push(...(modules.BIO_MEDIUM || []))
    YI_QUESTIONS.push(...(modules.YI_MEDIUM || []))
  } else if (difficulty === 'hard') {
    CHEM_QUESTIONS.push(...(modules.CHEM_HARD || []), ...(modules.CHEM_EXP_MEDIUM || []), ...(modules.CHEM_EXP_HARD || []))
    BIO_QUESTIONS.push(...(modules.BIO_HARD || []), ...(modules.BIO_EXP_MEDIUM || []), ...(modules.BIO_EXP_HARD || []))
    YI_QUESTIONS.push(...(modules.YI_HARD || []))
  }

  // 同步到 ALL_QUESTIONS
  ALL_QUESTIONS.length = 0
  ALL_QUESTIONS.push(...CHEM_QUESTIONS, ...BIO_QUESTIONS, ...YI_QUESTIONS)

  // 为新题生成 id
  for (const q of ALL_QUESTIONS) {
    if (!q.id) q.id = getQuestionId(q)
  }

  loadedDifficulty[difficulty] = true
}

// 全量预加载（后台渐进）
export async function preloadQuestions() {
  if (loaded) return
  if (loadingPromise) return loadingPromise

  loadingPromise = (async () => {
    // 第一阶段：加载 easy（最快，游戏可开）
    await ensureDifficulty('easy')
    // 第二阶段：加载 medium（后台）
    await ensureDifficulty('medium')
    // 第三阶段：加载 hard（后台）
    await ensureDifficulty('hard')

    loaded = true
  })()

  // 不 await，让调用方可以 fire-and-forget
  // 返回 promise 但调用方也可以选择 await
  return loadingPromise
}

// 按楼层需要加载对应难度（同步调用时按需触发）
export async function ensureQuestionsForFloor(floor) {
  let difficulty = 'easy'
  if (floor >= 10) difficulty = 'hard'
  else if (floor >= 5) difficulty = 'medium'

  // 如果该难度未加载，同步等待
  if (!loadedDifficulty[difficulty]) {
    await ensureDifficulty(difficulty)
    // 后台继续加载其余难度
    preloadQuestions()
  }
}

export function isQuestionsLoaded() {
  return loaded
}

export function isPreloadStarted() {
  return loadingPromise !== null
}

export function getLoadedDifficulty() {
  return { ...loadedDifficulty }
}

// 为每道题添加唯一 id（基于题目文本的哈希）
function getQuestionId(q) {
  const str = (q.q || '') + (q.options ? q.options.join('|') : '') + (q.answer ?? '')
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i)
    h |= 0
  }
  return 'q_' + Math.abs(h).toString(36)
}

// 已用题目记录
const usedQuestions = {
  easy: new Set(),
  medium: new Set(),
  hard: new Set(),
  all: new Set()
}

let lastResetFloor = 0

export function resetUsedQuestions(difficulty = null) {
  if (difficulty) {
    usedQuestions[difficulty] = new Set()
  } else {
    usedQuestions.easy = new Set()
    usedQuestions.medium = new Set()
    usedQuestions.hard = new Set()
    usedQuestions.all = new Set()
  }
}

export function getUsedCount() {
  return {
    easy: usedQuestions.easy.size,
    medium: usedQuestions.medium.size,
    hard: usedQuestions.hard.size,
    all: usedQuestions.all.size
  }
}

export function exportUsedQuestions() {
  return {
    easy: Array.from(usedQuestions.easy),
    medium: Array.from(usedQuestions.medium),
    hard: Array.from(usedQuestions.hard),
    all: Array.from(usedQuestions.all),
    lastResetFloor
  }
}

export function importUsedQuestions(data) {
  if (!data) return
  usedQuestions.easy = new Set(data.easy || [])
  usedQuestions.medium = new Set(data.medium || [])
  usedQuestions.hard = new Set(data.hard || [])
  usedQuestions.all = new Set(data.all || [])
  lastResetFloor = data.lastResetFloor || 0
}

// 按难度和学科筛选题目
export function getQuestions(subject, difficulty, count = 5) {
  if (ALL_QUESTIONS.length === 0) {
    // 题库还没加载，尝试按需加载当前难度
    ensureDifficulty(difficulty)
    return []
  }

  let pool = ALL_QUESTIONS.filter(q => {
    const matchSubject = subject === 'all' || q.subject === subject
    const matchDiff = difficulty === 'all' || q.diff === difficulty
    return matchSubject && matchDiff
  })

  if (pool.length === 0) return []

  let usedSet = usedQuestions[difficulty] || usedQuestions.all
  let unusedPool = pool.filter(q => !usedSet.has(q.id))

  if (unusedPool.length === 0) {
    if (difficulty !== 'all') {
      usedQuestions[difficulty] = new Set()
      usedSet = usedQuestions[difficulty]
    } else {
      usedQuestions.all = new Set()
      usedSet = usedQuestions.all
    }
    unusedPool = pool
  }

  const shuffled = [...unusedPool]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  const selected = shuffled.slice(0, Math.min(count, shuffled.length))

  selected.forEach(q => {
    usedSet.add(q.id)
    if (q.diff && usedQuestions[q.diff]) {
      usedQuestions[q.diff].add(q.id)
    }
  })

  return selected
}

export function getAllQuestions() {
  return [...ALL_QUESTIONS, ...CHEM_QUESTIONS, ...BIO_QUESTIONS, ...YI_QUESTIONS]
}

export function getQuestionsForFloor(floor, count = 5, spec = 'all') {
  let difficulty = 'easy'
  if (floor >= 10) difficulty = 'hard'
  else if (floor >= 5) difficulty = 'medium'

  let subject = 'all'
  if (spec === 'chem') subject = 'chem'
  else if (spec === 'bio') subject = 'bio'
  else if (spec === 'yi') subject = 'yi'
  else if (spec === 'biochem') {
    subject = Math.random() < 0.5 ? 'chem' : 'bio'
  }

  return getQuestions(subject, difficulty, count)
}
