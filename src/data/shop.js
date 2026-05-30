export const SHOP_ITEMS = [
  // ===== 消耗品 =====
  {
    id: 'shop_hp_potion',
    name: '生命药水',
    type: 'consumable',
    subtype: 'heal',
    price: 20,
    effect: { hp: 30 },
    desc: '恢复30点生命值',
    icon: '❤️',
    unlockLevel: 1
  },
  {
    id: 'shop_elixir',
    name: '精力药剂',
    type: 'consumable',
    subtype: 'heal',
    price: 40,
    effect: { hp: 60 },
    desc: '恢复60点生命值',
    icon: '💖',
    unlockLevel: 3
  },
  {
    id: 'shop_exp_scroll',
    name: '经验卷轴',
    type: 'consumable',
    subtype: 'exp',
    price: 30,
    effect: { exp: 50 },
    desc: '获得50点经验值',
    icon: '📜',
    unlockLevel: 1
  },
  {
    id: 'shop_power_drink',
    name: '力量饮料',
    type: 'consumable',
    subtype: 'buff',
    price: 50,
    effect: { atk: 5 },
    desc: '攻击力+5（本层有效）',
    icon: '⚡',
    unlockLevel: 5
  },

  // ===== 装备 =====
  {
    id: 'shop_lab_coat',
    name: '实验白大褂',
    type: 'equipment',
    subtype: 'armor',
    price: 80,
    def: 5,
    desc: '防御+5',
    icon: '🥼',
    unlockLevel: 1
  },
  {
    id: 'shop_chem_pen',
    name: '化学之笔',
    type: 'equipment',
    subtype: 'weapon',
    price: 100,
    atk: 5,
    desc: '攻击+5',
    icon: '✏️',
    unlockLevel: 1
  },
  {
    id: 'shop_periodic_table',
    name: '元素周期表',
    type: 'equipment',
    subtype: 'accessory',
    price: 120,
    atk: 2, def: 2,
    desc: '攻击+2 防御+2',
    icon: '📋',
    unlockLevel: 2
  },
  {
    id: 'shop_microscope',
    name: '显微镜',
    type: 'equipment',
    subtype: 'weapon',
    price: 200,
    atk: 8,
    desc: '攻击+8',
    icon: '🔬',
    unlockLevel: 5
  },
  {
    id: 'shop_goggles',
    name: '护目镜',
    type: 'equipment',
    subtype: 'armor',
    price: 60,
    def: 3,
    desc: '防御+3',
    icon: '🥽',
    unlockLevel: 1
  },
  {
    id: 'shop_compass',
    name: '罗盘',
    type: 'equipment',
    subtype: 'weapon',
    price: 150,
    atk: 6,
    desc: '攻击+6',
    icon: '🧭',
    unlockLevel: 3
  },

  // ===== 材料（应急用） =====
  {
    id: 'shop_water_essence',
    name: '水之精华',
    type: 'material',
    price: 15,
    desc: '水元素升级材料',
    icon: '💧',
    unlockLevel: 1
  },
  {
    id: 'shop_fire_core',
    name: '火焰核心',
    type: 'material',
    price: 15,
    desc: '火元素升级材料',
    icon: '🔥',
    unlockLevel: 1
  },
  {
    id: 'shop_acid_crystal',
    name: '酸液结晶',
    type: 'material',
    price: 15,
    desc: '酸元素升级材料',
    icon: '🧪',
    unlockLevel: 1
  },
  {
    id: 'shop_thunder_stone',
    name: '雷电石',
    type: 'material',
    price: 15,
    desc: '电元素升级材料',
    icon: '⚡',
    unlockLevel: 1
  },
  {
    id: 'shop_ice_shard',
    name: '冰霜碎片',
    type: 'material',
    price: 15,
    desc: '冰元素升级材料',
    icon: '❄️',
    unlockLevel: 1
  },
  {
    id: 'shop_wind_feather',
    name: '风之羽毛',
    type: 'material',
    price: 15,
    desc: '风元素升级材料',
    icon: '🪶',
    unlockLevel: 1
  },
];
