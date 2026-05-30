// 锻造系统 - 配方数据

export const FORGE_RECIPES = [
  // 武器配方
  {
    id: 'forge_water_sword',
    name: '水刃剑',
    type: 'weapon',
    icon: '⚔️',
    desc: '凝聚水之精华的利剑',
    materials: { '水之精华': 3 },
    gold: 50,
    atk: 8,
    def: 0,
    unlockLevel: 1
  },
  {
    id: 'forge_fire_sword',
    name: '炎焰刀',
    type: 'weapon',
    icon: '⚔️',
    desc: '燃烧火焰核心的战刀',
    materials: { '火焰核心': 3 },
    gold: 50,
    atk: 10,
    def: 0,
    unlockLevel: 2
  },
  {
    id: 'forge_thunder_sword',
    name: '雷光剑',
    type: 'weapon',
    icon: '⚔️',
    desc: '雷电石淬炼的迅捷之剑',
    materials: { '雷电石': 4 },
    gold: 80,
    atk: 14,
    def: 0,
    unlockLevel: 3
  },
  {
    id: 'forge_ice_sword',
    name: '霜寒剑',
    type: 'weapon',
    icon: '⚔️',
    desc: '冰霜碎片锻造的寒气之剑',
    materials: { '冰霜碎片': 4 },
    gold: 80,
    atk: 12,
    def: 2,
    unlockLevel: 4
  },
  // 防具配方
  {
    id: 'forge_water_armor',
    name: '水纹甲',
    type: 'armor',
    icon: '🛡️',
    desc: '水之精华编织的柔韧铠甲',
    materials: { '水之精华': 3, '酸液结晶': 2 },
    gold: 60,
    atk: 0,
    def: 8,
    unlockLevel: 1
  },
  {
    id: 'forge_fire_armor',
    name: '炎石甲',
    type: 'armor',
    icon: '🛡️',
    desc: '火焰核心熔铸的坚固铠甲',
    materials: { '火焰核心': 3, '风之羽毛': 2 },
    gold: 60,
    atk: 0,
    def: 10,
    unlockLevel: 2
  },
  {
    id: 'forge_ice_armor',
    name: '冰晶甲',
    type: 'armor',
    icon: '🛡️',
    desc: '冰霜碎片凝结的寒冷铠甲',
    materials: { '冰霜碎片': 4, '水之精华': 2 },
    gold: 100,
    atk: 0,
    def: 14,
    unlockLevel: 4
  },
  // 饰品配方
  {
    id: 'forge_wind_ring',
    name: '风灵戒',
    type: 'accessory',
    icon: '💍',
    desc: '风之羽毛编织的轻盈戒指',
    materials: { '风之羽毛': 3 },
    gold: 70,
    atk: 4,
    def: 4,
    unlockLevel: 2
  },
  {
    id: 'forge_acid_ring',
    name: '酸蚀戒',
    type: 'accessory',
    icon: '💍',
    desc: '酸液结晶打造的腐蚀戒指',
    materials: { '酸液结晶': 4, '雷电石': 2 },
    gold: 120,
    atk: 6,
    def: 6,
    unlockLevel: 5
  },
  // 消耗品配方
  {
    id: 'forge_heal_potion',
    name: '高级恢复药水',
    type: 'potion',
    icon: '🧪',
    desc: '恢复50%生命值',
    materials: { '水之精华': 2, '火焰核心': 1 },
    gold: 30,
    effect: 'heal',
    ratio: 0.5,
    unlockLevel: 1
  },
  {
    id: 'forge_atk_buff',
    name: '攻击强化剂',
    type: 'potion',
    icon: '🧪',
    desc: '攻击力临时+10',
    materials: { '火焰核心': 2, '雷电石': 1 },
    gold: 40,
    effect: 'buff',
    bonusAtk: 10,
    unlockLevel: 3
  }
];

// 获取可用的配方（按解锁等级过滤）
export function getAvailableRecipes(playerLevel) {
  return FORGE_RECIPES.filter(r => r.unlockLevel <= playerLevel);
}

// 检查是否可以锻造
export function canForge(recipe, inventory, gold) {
  if (gold < recipe.gold) return false;
  for (const [mat, need] of Object.entries(recipe.materials)) {
    if ((inventory[mat] || 0) < need) return false;
  }
  return true;
}
