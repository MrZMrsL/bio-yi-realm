// 钓鱼系统 - 数据访问层（动态加载大数据，减少主包体积）
import type { Fish, Book } from '../types.ts'
import { getBookSubject } from './fishingUtils.ts'
import { RARITY_CONFIG, FISH_RARITY_COUNTS, TOTAL_FISH_COUNT } from './fishingMeta.ts'
export { getBookSubject, RARITY_CONFIG, FISH_RARITY_COUNTS, TOTAL_FISH_COUNT }

interface FishingDataModule {
  ALL_FISH: Fish[]
  FISHING_BOOKS: Book[]
  KNOWLEDGE_POINTS: Record<string, string[]>
}

let _fishingDataPromise: Promise<FishingDataModule> | null = null
let _fishingData: FishingDataModule | null = null

async function loadFishingData(): Promise<FishingDataModule> {
  if (_fishingData) return _fishingData
  if (!_fishingDataPromise) {
    _fishingDataPromise = import('./fishingData.ts').then(m => {
      _fishingData = m as unknown as FishingDataModule
      return _fishingData
    })
  }
  return _fishingDataPromise
}

export async function getAllFishes(): Promise<Fish[]> {
  const data = await loadFishingData()
  return data.ALL_FISH
}

export async function getAllBooks(): Promise<Book[]> {
  const data = await loadFishingData()
  return data.FISHING_BOOKS
}

export async function getBookKnowledgePoints(bookName: string): Promise<string[]> {
  const data = await loadFishingData()
  return data.KNOWLEDGE_POINTS[bookName] || []
}

// 根据钓鱼等级获取可钓的鱼
export async function getFishPool(fishingLevel: number = 1): Promise<Fish[]> {
  const ALL_FISH = await getAllFishes()
  const pool: Fish[] = []
  for (const f of ALL_FISH) {
    if (f.rarity === 'common' && fishingLevel >= 1) pool.push(f)
    else if (f.rarity === 'normal' && fishingLevel >= 1) pool.push(f)
    else if (f.rarity === 'rare' && fishingLevel >= 3) pool.push(f)
    else if (f.rarity === 'epic' && fishingLevel >= 5) pool.push(f)
    else if (f.rarity === 'legendary' && fishingLevel >= 7) pool.push(f)
    else if (f.rarity === 'mythic' && fishingLevel >= 10) pool.push(f)
    else if (f.rarity === 'special') pool.push(f) // 特殊条件单独处理
  }
  return pool
}

// 随机抽取一条鱼（按权重）
export async function drawFish(fishingLevel: number = 1): Promise<Fish | null> {
  const pool = await getFishPool(fishingLevel)
  if (pool.length === 0) return null

  const weighted = pool.map(f => ({
    ...f,
    weight: RARITY_CONFIG[(f.rarity as keyof typeof RARITY_CONFIG)]?.weight || 10,
  }))

  const totalWeight = weighted.reduce((s, f) => s + f.weight, 0)
  let roll = Math.random() * totalWeight

  for (const f of weighted) {
    roll -= f.weight
    if (roll <= 0) return f
  }

  return weighted[weighted.length - 1]
}

// 随机抽取一本古籍（按钓鱼等级）
export async function drawBook(fishingLevel: number = 1): Promise<Book | null> {
  const FISHING_BOOKS = await getAllBooks()
  const pool = FISHING_BOOKS.filter(b => {
    if (b.rarity === 'normal' && fishingLevel >= 1) return true
    if (b.rarity === 'rare' && fishingLevel >= 5) return true
    if (b.rarity === 'epic' && fishingLevel >= 8) return true
    return false
  })
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}


