// enemies.js - 生化易界敌人数据（合并旧版全部数据，含元素属性）
import { EXTRA_ENEMIES } from './enemies_extra.js'
import { assignElementToEnemies } from './farm.js'

const RAW_ENEMIES = [
  // 基础敌人（1-5层）
  { name: "混沌史莱姆", icon: "🧪", hp: 30, atk: 8, def: 2, subject: "chem", desc: "一团不稳定的化学混合物，似乎随时会爆炸" },
  { name: "DNA螺旋怪", icon: "🧬", hp: 35, atk: 10, def: 1, subject: "bio", desc: "由错乱DNA链构成的生物，能修复自身损伤" },
  { name: "八卦阵灵", icon: "☯️", hp: 40, atk: 12, def: 3, subject: "yi", desc: "守护着易学知识的阵灵，会出题考验入侵者" },
  { name: "有机幽灵", icon: "👻", hp: 25, atk: 15, def: 0, subject: "chem", desc: "失去电子的有机分子，攻击带有腐蚀性" },
  { name: "细胞壁守卫", icon: "🛡️", hp: 50, atk: 6, def: 5, subject: "bio", desc: "拥有厚实细胞壁的防御型生物，难以击破" },
  
  // 新增敌人（10-30层）
  ...EXTRA_ENEMIES.bio,
  ...EXTRA_ENEMIES.chem,
  ...EXTRA_ENEMIES.yi
]

// 给所有敌人分配元素属性
export const ENEMIES = assignElementToEnemies(RAW_ENEMIES)

// 按学科筛选敌人
export function getEnemiesBySubject(subject) {
  return ENEMIES.filter(e => e.subject === subject)
}

// 随机获取敌人
export function getRandomEnemy(subject = 'all') {
  let pool = subject === 'all' ? ENEMIES : getEnemiesBySubject(subject)
  return pool[Math.floor(Math.random() * pool.length)]
}

// 按楼层获取敌人（难度递增）
export function getEnemyForFloor(floor) {
  let pool = ENEMIES
  
  // 1-5层：基础敌人
  if (floor <= 5) {
    pool = ENEMIES.filter(e => e.hp <= 50 && e.atk <= 15)
  }
  // 6-10层：中等敌人
  else if (floor <= 10) {
    pool = ENEMIES.filter(e => e.hp > 30 && e.hp <= 80)
  }
  // 10层以上：高级敌人
  else {
    pool = ENEMIES.filter(e => e.hp > 60)
  }
  
  if (pool.length === 0) pool = ENEMIES
  return pool[Math.floor(Math.random() * pool.length)]
}
