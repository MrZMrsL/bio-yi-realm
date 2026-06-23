import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ACHIEVEMENTS, checkAchievementUnlocked } from '../data/achievements.ts'
import { getAllMonsters, getAllMaterials } from '../data/encyclopedia.ts'
import { usePlayerStore } from './playerStore.ts'
import { useFarmStore } from './farmStore.ts'
import { useDungeonStore } from './dungeonStore.ts'
import { useWeeklyBossStore } from './weeklyBossStore.ts'
import { useLogStore } from './logStore.ts'
import { saveNow } from '../services/saveService.js'


export interface Stats {
  totalCorrect: number
  totalWrong: number
  maxCombo: number
  maxFloor: number
  totalBattles: number
  totalWins: number
  totalFishes: number
  totalForges: number
  subjectCorrect?: Record<string, number>
  [key: string]: unknown
}

export interface Discovery {
  type: string
  name: string
  time: number
  id: number
}

export interface CyclopediaMap {
  monsters?: string[]
  materials?: string[]
  fishes?: string[]
  books?: string[]
  [key: string]: string[] | undefined
}

export const useCyclopediaStore = defineStore('cyclopedia', () => {
  // ===== 图鉴系统 =====
  const cyclopedia = ref<CyclopediaMap>({})
  const newDiscoveries = ref<Discovery[]>([])

  // ===== 统计系统 =====
  const stats = ref<Stats>({
    totalCorrect: 0,
    totalWrong: 0,
    maxCombo: 0,
    maxFloor: 1,
    totalBattles: 0,
    totalWins: 0,
    totalFishes: 0,
    totalForges: 0,
  })

  // ===== 成就系统 =====
  const unlockedAchievements = ref<Record<string, number>>({})
  const newAchievementUnlocks = ref<string[]>([])

  // 异步加载的图鉴总数缓存
  const fishTotal = ref<number>(0)
  const bookTotal = ref<number>(0)
  let totalsPromise: Promise<void> | null = null

  async function ensureTotals() {
    if (fishTotal.value > 0 && bookTotal.value > 0) return
    if (!totalsPromise) {
      totalsPromise = (async () => {
        const { getAllFishes, getAllBooks } = await import('../data/fishing.ts')
        const [fishes, books] = await Promise.all([getAllFishes(), getAllBooks()])
        fishTotal.value = fishes.length
        bookTotal.value = books.length
      })()
    }
    await totalsPromise
  }

  // 敌人名 → 图鉴名映射表
  const ENEMY_TO_ENCYCLOPEDIA_MAP: Record<string, string> = {
    混沌史莱姆: '酸液史莱姆',
    有机幽灵: '蒸馏幽灵',
    DNA螺旋怪: 'DNA编织者',
    细胞壁守卫: '抗体骑士',
    八卦阵灵: '八卦守卫',
    病毒变异体: '病毒传播者',
    耐药菌株: '抗体骑士',
    线粒体损伤者: '线粒体狂战士',
    癌细胞增殖体: '细胞吞噬者',
    免疫逃逸者: '抗体骑士',
    表观遗传沉默者: 'DNA编织者',
    蛋白错误折叠体: '基因窃取者',
    基因重组突变体: '基因窃取者',
    信号通路失控者: '细胞吞噬者',
    端粒耗尽者: '生态主宰',
    自噬缺陷体: '细胞吞噬者',
    氧化应激体: '线粒体狂战士',
    神经退行体: '生态主宰',
    代谢综合征体: '生态主宰',
    细胞凋亡逃避者: '细胞吞噬者',
    CRISPR编辑体: 'DNA编织者',
    酶催化体: '蛋白酶猎手',
    光敏色素体: '叶绿体精灵',
    突触传导体: '生态主宰',
    血红蛋白体: '生态主宰',
    溶酶体消化体: '蛋白酶猎手',
    光合作用体: '叶绿体精灵',
    有丝分裂体: '细胞吞噬者',
    转录因子体: 'DNA编织者',
    自由基链反应体: '试剂融合怪',
    配位饱和体: '结晶傀儡',
    酸碱缓冲体: '碳酸蟹',
    过电位体: '电解精灵',
    晶格缺陷体: '合金巨人',
    手性异构体: '毒理蛇',
    胶体聚沉体: '硫磺蝎',
    反应坐标能垒: '催化剂兽',
    熵增混沌体: '汞妖',
    共振杂化体: '硝石龙',
    电负性差异体: '氧化守卫',
    溶度积边界体: '结晶傀儡',
    Markovnikov规则体: '试剂融合怪',
    勒夏特列逆反体: '元素贤者',
    轨道对称禁阻体: '元素贤者',
    配位场体: '结晶傀儡',
    氧化还原体: '氧化守卫',
    表面活性体: '试剂融合怪',
    sp3杂化体: '合金巨人',
    π共轭体: '硝石龙',
    质子酸体: '酸液史莱姆',
    过渡金属体: '合金巨人',
    氢键缔合体: '碳酸蟹',
    同分异构体: '毒理蛇',
    滴定终点体: '试剂融合怪',
    六冲煞: '卦象幻影',
    六害劫: '卦象幻影',
    三刑狱: '五行灵',
    空亡虚: '爻变虫',
    伏吟局: '太极兽',
    反吟局: '太极兽',
    太岁压: '河图守护者',
    月破击: '洛书使者',
    日辰克: '阴阳师',
    动化退: '爻变虫',
    动化绝: '爻变虫',
    游魂卦: '卦象幻影',
    归魂卦: '卦象幻影',
    用神墓: '五行灵',
    忌神旺: '五行灵',
    青龙腾: '河图守护者',
    白虎啸: '洛书使者',
    朱雀鸣: '阴阳师',
    玄武隐: '六爻术士',
    勾陈滞: '六爻术士',
    螣蛇缠: '六爻术士',
    天乙贵: '乾坤主宰',
    文昌星: '河图守护者',
    桃花煞: '阴阳师',
    驿马动: '六爻术士',
  }

  function addToCyclopedia(category: string, name: string) {
    let displayName = name
    if (category === 'monsters' && ENEMY_TO_ENCYCLOPEDIA_MAP[name]) {
      displayName = ENEMY_TO_ENCYCLOPEDIA_MAP[name]
    }
    if (!cyclopedia.value[category]) {
      cyclopedia.value[category] = []
    }
    if (!cyclopedia.value[category]?.includes(displayName)) {
      cyclopedia.value[category]?.push(displayName)
      const discovery: Discovery = { type: category, name: displayName, time: Date.now(), id: Math.random() }
      newDiscoveries.value.push(discovery)
      setTimeout(() => {
        newDiscoveries.value = newDiscoveries.value.filter(d => d.id !== discovery.id)
      }, 3000)
    }
    checkAchievements()
  }

  function getCyclopediaProgress(category: string) {
    const discovered = cyclopedia.value[category] || []
    let total = 0
    if (category === 'monsters') total = getAllMonsters().length
    else if (category === 'materials') total = getAllMaterials().length
    else {
      ensureTotals() // 触发后台加载，首次可能显示 0，缓存就绪后自动更新
      if (category === 'fishes') total = fishTotal.value
      else if (category === 'books') total = bookTotal.value
    }
    return { discovered: discovered.length, total }
  }

  function isDiscovered(category: string, name: string) {
    return cyclopedia.value[category]?.includes(name) || false
  }

  function getDiscoveryCount(category: string) {
    return cyclopedia.value[category]?.length || 0
  }

  function updateStats(key: keyof Stats, delta: number) {
    stats.value[key] = ((stats.value[key] as number) || 0) + delta
    // 不再每次增量都扫描成就，由调用方在动作结束后统一检查
  }

  function updateMaxCombo(combo: number): void {
    if (combo > stats.value.maxCombo) {
      stats.value.maxCombo = combo
    }
  }

  function recordSubjectCorrect(subject: string): void {
    if (!stats.value.subjectCorrect) stats.value.subjectCorrect = {}
    stats.value.subjectCorrect[subject] = (stats.value.subjectCorrect[subject] || 0) + 1
  }

  function updateMaxFloor(floor: number): void {
    if (floor > stats.value.maxFloor) {
      stats.value.maxFloor = floor
    }
  }

  function checkAchievements() {
    const playerStore = usePlayerStore()
    const farmStore = useFarmStore()
    const dungeonStore = useDungeonStore()
    const weeklyBossStore = useWeeklyBossStore()
    const logStore = useLogStore()

    const state: Record<string, unknown> = {
      stats: stats.value || {},
      farm: farmStore.farm || [],
      level: playerStore.level || 1,
      allClearCount: dungeonStore.allClearCount || 0,
      cyclopedia: cyclopedia.value || {},
      weeklyBossDefeated: weeklyBossStore.weeklyBossDefeated || [],
    }

    for (const ach of ACHIEVEMENTS) {
      if (unlockedAchievements.value[ach.id]) continue
      let unlocked = false
      if (ach.category === 'limited') {
        unlocked = checkAchievementUnlocked(ach, state.weeklyBossDefeated)
      } else {
        unlocked = checkAchievementUnlocked(ach, state)
      }
      if (unlocked) {
        unlockedAchievements.value[ach.id] = Date.now()
        newAchievementUnlocks.value.push(ach.id)
        logStore.push(`🏆 成就解锁：${ach.title}！获得 ${ach.reward?.exp || 0} 经验`)
        if (ach.reward?.exp) {
          playerStore.addExp(ach.reward.exp)
        }
        saveNow()
      }
    }
  }

  function reset() {
    cyclopedia.value = {}
    newDiscoveries.value = []
    stats.value = {
      totalCorrect: 0,
      totalWrong: 0,
      maxCombo: 0,
      maxFloor: 1,
      totalBattles: 0,
      totalWins: 0,
      totalFishes: 0,
      totalForges: 0,
    }
    unlockedAchievements.value = {}
    newAchievementUnlocks.value = []
  }

  function serialize(): Record<string, unknown> {
    return {
      cyclopedia: cyclopedia.value,
      stats: stats.value,
      unlockedAchievements: unlockedAchievements.value,
    }
  }

  function deserialize(saveData: Record<string, unknown>) {
    reset()
    cyclopedia.value = (saveData.cyclopedia as CyclopediaMap) || {}
    const defaultStats: Stats = {
      totalCorrect: 0,
      totalWrong: 0,
      maxCombo: 0,
      maxFloor: 1,
      totalBattles: 0,
      totalWins: 0,
      totalFishes: 0,
      totalForges: 0,
      subjectCorrect: {},
    }
    stats.value = {
      ...defaultStats,
      ...Object.fromEntries(
        Object.entries((saveData.stats as Record<string, unknown>) || {})
          .map(([k, v]) => [k, typeof v === 'number' && !Number.isNaN(v) ? v : 0])
      ),
    } as Stats
    unlockedAchievements.value =
      saveData.unlockedAchievements != null &&
      typeof saveData.unlockedAchievements === 'object' &&
      !Array.isArray(saveData.unlockedAchievements)
        ? (saveData.unlockedAchievements as Record<string, number>)
        : Array.isArray(saveData.unlockedAchievements)
          ? Object.fromEntries((saveData.unlockedAchievements as string[]).map(id => [id, Date.now()]))
          : {}
  }

  return {
    cyclopedia,
    newDiscoveries,
    stats,
    unlockedAchievements,
    newAchievementUnlocks,
    addToCyclopedia,
    getCyclopediaProgress,
    isDiscovered,
    getDiscoveryCount,
    updateStats,
    updateMaxCombo,
    recordSubjectCorrect,
    updateMaxFloor,
    checkAchievements,
    reset,
    serialize,
    deserialize,
  }
})
