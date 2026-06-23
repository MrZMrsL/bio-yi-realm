/**
 * 新手引导步骤配置
 *
 * 覆盖核心循环：欢迎 → 选专精 → 主界面 → 地牢 → 战斗 → 养成
 */

export interface GuideStep {
  id: string
  title: string
  text: string
  /** 该步骤属于哪个阶段，便于按场景触发 */
  phase: 'welcome' | 'specialization' | 'dashboard' | 'dungeon' | 'battle' | 'features'
}

export const GUIDE_STEPS: GuideStep[] = [
  {
    id: 'welcome',
    phase: 'welcome',
    title: '欢迎来到生化易界！',
    text: '这是一个以高中化学、生物、易学知识为战斗核心的 Roguelike 地牢探险游戏。答对题目即可触发知识暴击，答错则会受到反噬。准备好了吗？',
  },
  {
    id: 'choose-specialization',
    phase: 'specialization',
    title: '选择你的知识专精',
    text: '三大专精分别对应化学、生物、易学。专精决定你的初始属性、技能树和出题范围。选择后不可更改，请慎重决定！',
  },
  {
    id: 'dashboard-overview',
    phase: 'dashboard',
    title: '冒险主界面',
    text: '这里是你的大本营。上方显示角色状态，下方按钮可以进入地牢、钓鱼、锻造、商店等系统。点击地牢探索开始第一场战斗吧。',
  },
  {
    id: 'dungeon-prep',
    phase: 'dungeon',
    title: '地牢探索',
    text: '每一层地牢有多个房间，其中一个是 Boss 房。击败所有普通房间或直接进入 Boss 房都可以推进进度。注意房间图标代表不同事件。',
  },
  {
    id: 'battle-basics',
    phase: 'battle',
    title: '知识就是武器',
    text: '战斗采用回合制答题：选择你认为正确的答案。答对会触发攻击，连续答对可触发连击暴击；答错则敌人会反击。',
  },
  {
    id: 'battle-cards',
    phase: 'battle',
    title: '道具卡助战',
    text: '战斗中可以使用道具卡：提示卡排除错误选项、护盾卡答错不扣血、暴击卡造成双倍伤害。道具卡可在商店购买或战斗掉落。',
  },
  {
    id: 'post-battle-growth',
    phase: 'features',
    title: '战斗之外的成长',
    text: '回到主界面后，你可以去钓鱼获得灵气与材料，在农场收养怪物获得加成，在锻造店合成装备，或在杂货铺购买补给。多条养成线助你深入高层地牢。',
  },
]

/** 所有步骤的 id 列表，用于判断完成情况 */
export const GUIDE_STEP_IDS = GUIDE_STEPS.map(s => s.id)
