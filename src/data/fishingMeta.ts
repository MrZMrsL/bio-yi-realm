// 钓鱼系统 - 轻量级元数据（同步导出，避免与 fishing.js 大数据动态加载冲突）

export interface RarityConfig {
  label: string
  weight: number
  color: string
}

export type Rarity = 'common' | 'normal' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'special'

// 稀有度配置（概率权重）
export const RARITY_CONFIG: Record<Rarity, RarityConfig> = {
  common: { label: '普通', weight: 40, color: '#888' },
  normal: { label: '一般', weight: 30, color: '#2ecc71' },
  rare: { label: '稀有', weight: 18, color: '#3498db' },
  epic: { label: '史诗', weight: 8, color: '#9b59b6' },
  legendary: { label: '传说', weight: 3, color: '#d4a853' },
  mythic: { label: '神话', weight: 1, color: '#e74c3c' },
  special: { label: '限定', weight: 0, color: '#ff6b6b' }, // 特殊条件触发
}

// 各稀有度鱼类数量统计（用于图鉴进度计算）
export const FISH_RARITY_COUNTS: Record<Rarity, number> = {
  common: 20,
  epic: 15,
  legendary: 6,
  mythic: 10,
  normal: 38,
  rare: 20,
  special: 40,
}

export const TOTAL_FISH_COUNT = 149
