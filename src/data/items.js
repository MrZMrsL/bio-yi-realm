export const EQUIPMENT = [
  { id: 'chem_pen', name: '化学之笔', type: 'weapon', atk: 5, desc: '书写化学方程式的专用笔，攻击+5', price: 50 },
  { id: 'bio_glass', name: '生物显微镜', type: 'weapon', atk: 8, desc: '洞察微观世界的神器，攻击+8', price: 100 },
  { id: 'yi_compass', name: '罗盘', type: 'weapon', atk: 6, desc: '古人寻龙点穴之法器，攻击+6', price: 75 },
  { id: 'lab_coat', name: '白大褂', type: 'armor', def: 5, desc: '实验室标配，防御+5', price: 60 },
  { id: 'safety_goggles', name: '护目镜', type: 'armor', def: 3, desc: '保护你的眼睛，防御+3', price: 40 },
  { id: 'periodic_table', name: '元素周期表', type: 'accessory', atk: 2, def: 2, desc: '随身携带的知识宝库，攻击+2 防御+2', price: 80 },
];

export const CONSUMABLES = [
  { id: 'hp_potion', name: '生命药水', type: 'potion', effect: 'hp', value: 30, desc: '恢复30点生命值', price: 15 },
  { id: 'elixir', name: '精力药剂', type: 'potion', effect: 'hp', value: 60, desc: '恢复60点生命值', price: 30 },
  { id: 'exp_scroll', name: '经验卷轴', type: 'scroll', effect: 'exp', value: 50, desc: '获得50点经验值', price: 25 },
];
