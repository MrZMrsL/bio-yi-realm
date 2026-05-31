// enemies.js - 生化易界敌人数据（合并旧版全部数据，含元素属性）
import { EXTRA_ENEMIES } from './enemies_extra.js'
import { assignElementToEnemies } from './farm.js'

const RAW_ENEMIES = [
  // 基础敌人（1-5层）
  { name: "混沌史莱姆", icon: "🧪", hp: 45, atk: 12, def: 4, subject: "chem", desc: "一团不稳定的化学混合物，似乎随时会爆炸" },
  { name: "DNA螺旋怪", icon: "🧬", hp: 48, atk: 14, def: 3, subject: "bio", desc: "由错乱DNA链构成的生物，能修复自身损伤" },
  { name: "八卦阵灵", icon: "☯️", hp: 52, atk: 15, def: 5, subject: "yi", desc: "守护着易学知识的阵灵，会出题考验入侵者" },
  { name: "有机幽灵", icon: "👻", hp: 40, atk: 18, def: 2, subject: "chem", desc: "失去电子的有机分子，攻击带有腐蚀性" },
  { name: "细胞壁守卫", icon: "🛡️", hp: 60, atk: 10, def: 8, subject: "bio", desc: "拥有厚实细胞壁的防御型生物，难以击破" },
  
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

// === 平滑成长曲线公式（替代硬编码楼层筛选）===
// 敌人属性按楼层指数增长，每层都有细微的压迫感提升

// 成长参数
const GROWTH_BASE = 1.08;      // 每层基础属性提升8%
const GROWTH_ATK = 1.07;       // 攻击成长系数
const GROWTH_DEF = 1.05;       // 防御成长系数
const FLOOR_MULTIPLIER = 0.5;  // 楼层额外加成系数

// 计算敌人实际属性（基于楼层）
export function calculateEnemyStats(baseEnemy, floor) {
  const scale = Math.pow(GROWTH_BASE, floor - 1) + (floor * FLOOR_MULTIPLIER);
  return {
    ...baseEnemy,
    hp: Math.floor(baseEnemy.hp * scale),
    atk: Math.floor(baseEnemy.atk * Math.pow(GROWTH_ATK, floor - 1)),
    def: Math.floor((baseEnemy.def || 0) * Math.pow(GROWTH_DEF, floor - 1)),
    // 保留原始基础值用于显示
    baseHp: baseEnemy.hp,
    baseAtk: baseEnemy.atk,
    baseDef: baseEnemy.def || 0
  };
}

// 按楼层获取敌人（平滑成长版）
export function getEnemyForFloor(floor) {
  let pool = ENEMIES;

  // 1-5层：基础敌人池
  if (floor <= 5) {
    pool = ENEMIES.filter(e => e.baseHp <= 55 || e.hp <= 55);
  }
  // 6-15层：中等敌人池
  else if (floor <= 15) {
    pool = ENEMIES.filter(e => (e.hp > 30 && e.hp <= 80) || e.baseHp > 30);
  }
  // 16-30层：高级敌人
  else if (floor <= 30) {
    pool = ENEMIES.filter(e => e.hp > 60 || e.baseHp > 60);
  }
  // 30层以上：全部敌人（属性已平滑缩放）
  else {
    pool = ENEMIES;
  }

  if (pool.length === 0) pool = ENEMIES;

  const baseEnemy = pool[Math.floor(Math.random() * pool.length)];
  return calculateEnemyStats(baseEnemy, floor);
}

// 获取Boss级敌人（用于Boss房间）
export function getBossForFloor(floor) {
  const bossPool = ENEMIES.filter(e => e.hp > 80 || e.baseHp > 80 || e.atk > 20);
  const pool = bossPool.length > 0 ? bossPool : ENEMIES;
  const baseEnemy = pool[Math.floor(Math.random() * pool.length)];
  // Boss额外1.5倍属性
  const scaled = calculateEnemyStats(baseEnemy, floor);
  return {
    ...scaled,
    hp: Math.floor(scaled.hp * 1.5),
    maxHp: Math.floor(scaled.hp * 1.5),
    atk: Math.floor(scaled.atk * 1.3),
    def: Math.floor(scaled.def * 1.2),
    isBoss: true
  };
}
