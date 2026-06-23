import type { BattleCard } from '../types.ts'

export const BATTLE_CARDS: BattleCard[] = [
  {
    id: 'hint',
    name: '提示卡',
    icon: '💡',
    type: 'hint',
    desc: '答题时随机排除一个错误选项',
    price: 15,
    unlockLevel: 1,
  },
  {
    id: 'shield',
    name: '护盾卡',
    icon: '🛡️',
    type: 'shield',
    desc: '下一题答错时不受到敌人反击',
    price: 20,
    unlockLevel: 2,
  },
  {
    id: 'crit',
    name: '暴击卡',
    icon: '⚔️',
    type: 'crit',
    desc: '下一题答对时造成 2 倍伤害',
    price: 25,
    unlockLevel: 3,
  },
]

export function getBattleCard(type: string): BattleCard | undefined {
  return BATTLE_CARDS.find(c => c.id === type)
}
