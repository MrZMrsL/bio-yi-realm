// specialization.js - 生化易界专精系统数据
// 每个专精的初始属性、技能树、成长倾向

/**
 * 专精配置数据结构
 * key: 专精标识符
 * name: 显示名称
 * icon: 图标
 * color: 主题色
 * shortDesc: 一句话简介（选人界面展示）
 * playstyleLabel: 战斗风格标签
 * subjects: 出题学科
 * initialBonus: 初始属性加成
 * growthPer3Levels: 每3级额外成长
 * skills: 技能树 [{ level, name, desc, icon, effect }]
 */

export const SPECIALIZATIONS = [
  // ============ 化学专精 ============
  {
    key: 'chem',
    name: '化学专精',
    icon: '⚗️',
    color: '#e74c3c',
    shortDesc: '以分子为刃，元素为盾，专攻化学反应与物质变化',
    playstyleLabel: '玻璃大炮',
    playstyleDesc: '高伤害高风险，连续答对化学题可触发爆炸性输出',
    subjects: ['化学'],
    initialBonus: {
      atk: 5,
      def: 0,
      hp: 0,
      critRate: 0.05,   // 暴击率 +5%
      dodgeRate: 0,
      expBonus: 0
    },
    growthPer3Levels: {
      atk: 2,
      def: 0,
      hp: 0,
      desc: '攻击力额外+2'
    },
    skills: [
      {
        level: 5,
        name: '燃烧反应',
        icon: '🔥',
        desc: '答对化学题时，额外造成50%持续伤害（3回合）',
        effect: 'chem_burn'
      },
      {
        level: 15,
        name: '催化增效',
        icon: '🧪',
        desc: '使用药水时效果翻倍',
        effect: 'chem_potion_boost'
      },
      {
        level: 30,
        name: '元素爆破',
        icon: '💥',
        desc: '化学题连击上限+2（最高5连），达到5连时伤害再×1.5',
        effect: 'chem_combo_mastery'
      }
    ]
  },

  // ============ 生物专精 ============
  {
    key: 'bio',
    name: '生物专精',
    icon: '🧬',
    color: '#2ecc71',
    shortDesc: '洞察生命密码，驾驭基因之力，擅长持久战与恢复',
    playstyleLabel: '持久战士',
    playstyleDesc: '高血量高容错，越战越勇，适合稳扎稳打型玩家',
    subjects: ['生物'],
    initialBonus: {
      atk: 0,
      def: 3,
      hp: 30,
      critRate: 0,
      dodgeRate: 0,
      expBonus: 0
    },
    growthPer3Levels: {
      atk: 0,
      def: 1,
      hp: 15,
      desc: '生命上限+15，防御+1'
    },
    skills: [
      {
        level: 5,
        name: '细胞再生',
        icon: '🔄',
        desc: '每场战斗开始时恢复20%生命',
        effect: 'bio_regen'
      },
      {
        level: 15,
        name: '基因适应',
        icon: '🧬',
        desc: '答错时只受50%反噬伤害',
        effect: 'bio_damage_reduce'
      },
      {
        level: 30,
        name: '共生体',
        icon: '🤝',
        desc: '宠物提供的属性加成翻倍（攻击/防御/生命）',
        effect: 'bio_symbiosis'
      }
    ]
  },

  // ============ 易学专精 ============
  {
    key: 'yi',
    name: '易学专精',
    icon: '☯️',
    color: '#9b59b6',
    shortDesc: '通晓阴阳变化，掌握天地玄机，厚积薄发后期逆袭',
    playstyleLabel: '后期王者',
    playstyleDesc: '前期较弱需要耐心培养，等级越高优势越大',
    subjects: ['易学'],
    initialBonus: {
      atk: 0,
      def: 0,
      hp: 0,
      critRate: 0,
      dodgeRate: 0.05,
      expBonus: 0.1
    },
    growthPer3Levels: {
      atk: 1,
      def: 1,
      hp: 5,
      desc: '全属性+1（可自由分配属性点+1）'
    },
    skills: [
      {
        level: 5,
        name: '卦象预判',
        icon: '🔮',
        desc: '战斗开始时有30%概率闪避敌人第一次攻击',
        effect: 'yi_first_dodge'
      },
      {
        level: 15,
        name: '阴阳调和',
        icon: '☯️',
        desc: '每答对3题，恢复10%生命',
        effect: 'yi_balance_heal'
      },
      {
        level: 30,
        name: '太极领域',
        icon: '🌀',
        desc: '每场战斗有1次机会将答错的题"重roll"一次（换一道新题）',
        effect: 'yi_retry'
      }
    ]
  },

  // ============ 生化专精 ============
  {
    key: 'biochem',
    name: '生化专精',
    icon: '🔬',
    color: '#f39c12',
    shortDesc: '兼顾化学与生物，双学科交叉，适应性最强的均衡之选',
    playstyleLabel: '均衡大师',
    playstyleDesc: '双学科题库丰富，容错率高，适合想全面发展的玩家',
    subjects: ['化学', '生物'],
    initialBonus: {
      atk: 2,
      def: 1,
      hp: 15,
      critRate: 0,
      dodgeRate: 0,
      expBonus: 0
    },
    growthPer3Levels: {
      atk: 0,
      def: 0,
      hp: 0,
      desc: '随机获得1项化学或生物专精的成长加成'
    },
    skills: [
      {
        level: 5,
        name: '交叉反应',
        icon: '⚡',
        desc: '连续答对不同学科题目时，连击伤害额外+25%',
        effect: 'biochem_cross_combo'
      },
      {
        level: 15,
        name: '双重打击',
        icon: '💫',
        desc: '答题正确时20%概率触发双倍伤害',
        effect: 'biochem_double_strike'
      },
      {
        level: 30,
        name: '学科融会',
        icon: '🔗',
        desc: '化学题和生物题共享连击计数（不再因学科切换断连击）',
        effect: 'biochem_unified_combo'
      }
    ]
  },

  // ============ 全部专精 ============
  {
    key: 'all',
    name: '全部专精',
    icon: '🌟',
    color: '#d4a853',
    shortDesc: '博学多才，三学科全部涉猎，前期全面后期无敌',
    playstyleLabel: '六边形战士',
    playstyleDesc: '入门门槛最高，三学科题库量最大，后期属性全面碾压',
    subjects: ['化学', '生物', '易学'],
    initialBonus: {
      atk: 2,
      def: 2,
      hp: 10,
      critRate: 0,
      dodgeRate: 0,
      expBonus: 0.05
    },
    growthPer3Levels: {
      atk: 1,
      def: 1,
      hp: 8,
      desc: '全属性+1'
    },
    skills: [
      {
        level: 5,
        name: '博闻强识',
        icon: '📖',
        desc: '所有学科题目都有10%概率触发额外经验+5',
        effect: 'all_extra_exp'
      },
      {
        level: 15,
        name: '融会贯通',
        icon: '🧠',
        desc: '每答对一个不同学科的题，攻击永久+1（上限20），当前积累：{count}',
        effect: 'all_cross_knowledge',
        state: { count: 0 }
      },
      {
        level: 30,
        name: '万象归宗',
        icon: '🌌',
        desc: '战斗中可消耗一次机会切换当前出题学科',
        effect: 'all_switch_subject'
      }
    ]
  }
]

// 通过 key 快速查找专精
export function getSpecialization(key) {
  return SPECIALIZATIONS.find(s => s.key === key) || null
}

// 获取专精的初始属性加成（计算总值）
export function getInitialBonus(key, stat) {
  const spec = getSpecialization(key)
  if (!spec) return 0
  return spec.initialBonus[stat] || 0
}

// 获取专精在指定等级已解锁的技能
export function getUnlockedSkills(key, level) {
  const spec = getSpecialization(key)
  if (!spec) return []
  return spec.skills.filter(s => level >= s.level)
}

// 获取专精在指定等级待解锁的下一个技能
export function getNextSkill(key, level) {
  const spec = getSpecialization(key)
  if (!spec) return null
  return spec.skills.find(s => level < s.level) || null
}

// 获取专精的整体描述文本（用于预览）
export function getSpecSummary(key) {
  const spec = getSpecialization(key)
  if (!spec) return null
  return {
    ...spec,
    totalSkills: spec.skills.length,
    skillMilestones: spec.skills.map(s => s.level)
  }
}
