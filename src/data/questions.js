// questions.js - 生化易界题库（异步按需加载版）

// 使用数组对象保证 live binding，预加载后内容自动填充
export const ALL_QUESTIONS = []
export const CHEM_QUESTIONS = []
export const BIO_QUESTIONS = []
export const YI_QUESTIONS = []

let loaded = false
let loadingPromise = null

// 异步加载所有题目（并行）
export async function preloadQuestions() {
  if (loaded) return
  if (loadingPromise) return loadingPromise

  loadingPromise = (async () => {
    const [
      { CHEM_EASY }, { CHEM_MEDIUM_1 }, { CHEM_MEDIUM_2 },
      { CHEM_HARD }, { CHEM_EXP_MEDIUM }, { CHEM_EXP_HARD },
      { BIO_EASY }, { BIO_MEDIUM }, { BIO_HARD },
      { BIO_EXP_MEDIUM }, { BIO_EXP_HARD },
      { YI_MEDIUM }
    ] = await Promise.all([
      import('./chem_easy.js'),
      import('./chem_medium_1.js'),
      import('./chem_medium_2.js'),
      import('./chem_hard.js'),
      import('./chem_exp_medium.js'),
      import('./chem_exp_hard.js'),
      import('./bio_easy.js'),
      import('./bio_medium.js'),
      import('./bio_hard.js'),
      import('./bio_exp_medium.js'),
      import('./bio_exp_hard.js'),
      import('./yi_medium.js')
    ])

    CHEM_QUESTIONS.length = 0
    CHEM_QUESTIONS.push(
      ...CHEM_EASY,
      ...CHEM_MEDIUM_1,
      ...CHEM_MEDIUM_2,
      ...CHEM_HARD,
      ...CHEM_EXP_MEDIUM,
      ...CHEM_EXP_HARD
    )

    BIO_QUESTIONS.length = 0
    BIO_QUESTIONS.push(
      ...BIO_EASY,
      ...BIO_MEDIUM,
      ...BIO_HARD,
      ...BIO_EXP_MEDIUM,
      ...BIO_EXP_HARD
    )

    YI_QUESTIONS.length = 0
    YI_QUESTIONS.push(...YI_MEDIUM)

    ALL_QUESTIONS.length = 0
    ALL_QUESTIONS.push(...CHEM_QUESTIONS, ...BIO_QUESTIONS, ...YI_QUESTIONS)

    // 为每道题添加唯一 id（基于题目文本的哈希，不依赖外部 id）
    for (const q of ALL_QUESTIONS) {
      q.id = getQuestionId(q)
    }

    loaded = true
  })()

  return loadingPromise
}

export function isQuestionsLoaded() {
  return loaded
}

// 为每道题添加唯一 id（基于题目文本的哈希，不依赖外部 id）
function getQuestionId(q) {
  // 用题目文本 + 答案选项拼接后的简单 hash
  const str = (q.q || '') + (q.options ? q.options.join('|') : '') + (q.answer ?? '')
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i)
    h |= 0
  }
  return 'q_' + Math.abs(h).toString(36)
}

// 已用题目记录：按 difficulty 维护已用 id 集合
// 注意：这是全局单例，游戏生命周期内持续有效，刷新页面重置
const usedQuestions = {
  easy: new Set(),
  medium: new Set(),
  hard: new Set(),
  all: new Set()  // 跨难度的全局已用记录（可选）
}

let lastResetFloor = 0

// 重置已用记录（如用户要求重新开始、或所有题目用完了）
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

// 获取已用记录数量（调试）
export function getUsedCount() {
  return {
    easy: usedQuestions.easy.size,
    medium: usedQuestions.medium.size,
    hard: usedQuestions.hard.size,
    all: usedQuestions.all.size
  }
}

// 导出已用记录（用于存档持久化）
export function exportUsedQuestions() {
  return {
    easy: Array.from(usedQuestions.easy),
    medium: Array.from(usedQuestions.medium),
    hard: Array.from(usedQuestions.hard),
    all: Array.from(usedQuestions.all),
    lastResetFloor
  }
}

// 导入已用记录（从存档恢复）
export function importUsedQuestions(data) {
  if (!data) return
  usedQuestions.easy = new Set(data.easy || [])
  usedQuestions.medium = new Set(data.medium || [])
  usedQuestions.hard = new Set(data.hard || [])
  usedQuestions.all = new Set(data.all || [])
  lastResetFloor = data.lastResetFloor || 0
}

// 按难度和学科筛选题目，优先从未使用过的题目中抽取
export function getQuestions(subject, difficulty, count = 5) {
  if (!loaded || ALL_QUESTIONS.length === 0) {
    console.warn('[questions] 题库尚未加载完成，请先调用 preloadQuestions()')
    return []
  }

  let pool = ALL_QUESTIONS.filter(q => {
    const matchSubject = subject === 'all' || q.subject === subject
    const matchDiff = difficulty === 'all' || q.diff === difficulty
    return matchSubject && matchDiff
  })

  if (pool.length === 0) return []

  // 先筛选出未使用过的题目
  let usedSet = usedQuestions[difficulty] || usedQuestions.all
  let unusedPool = pool.filter(q => !usedSet.has(q.id))

  // 如果未使用的题目不够，且池子总数量 > count，则只从 unused 中抽取（宁可数量少也不重复）
  // 如果 unused 为空，说明全部用完了，重置该难度的已用记录
  if (unusedPool.length === 0) {
    // 全部用完了，清空记录重新来
    if (difficulty !== 'all') {
      usedQuestions[difficulty] = new Set()
      usedSet = usedQuestions[difficulty]
    } else {
      usedQuestions.all = new Set()
      usedSet = usedQuestions.all
    }
    unusedPool = pool
  }

  // Fisher-Yates 洗牌算法，比 sort(() => Math.random() - 0.5) 更均匀
  const shuffled = [...unusedPool]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  const selected = shuffled.slice(0, Math.min(count, shuffled.length))

  // 记录已用
  selected.forEach(q => {
    usedSet.add(q.id)
    // 同时记录到对应难度的集合中
    if (q.diff && usedQuestions[q.diff]) {
      usedQuestions[q.diff].add(q.id)
    }
  })

  return selected
}

// 按楼层获取题目（难度递增）
export function getAllQuestions() {
  return [...ALL_QUESTIONS, ...CHEM_QUESTIONS, ...BIO_QUESTIONS, ...YI_QUESTIONS]
}

export function getQuestionsForFloor(floor, count = 5) {
  let difficulty = 'easy'
  if (floor >= 10) difficulty = 'hard'
  else if (floor >= 5) difficulty = 'medium'

  return getQuestions('all', difficulty, count)
}
