/**
 * subjectThemes.js — 三大学科色系统
 *
 * 每一套完整色板含8个色值，覆盖 UI 全场景。
 * 在 store / Battle 等组件中通过 `getSubjectTheme(key)` 获取。
 *
 * 色板结构：
 *   primary       主色（标题、重要强调）
 *   accent        辅色（次要强调、状态标识）
 *   dark          暗色（边框、背景）
 *   light         亮色（高亮文字）
 *   glow          发光色（阴影/粒子）
 *   bg            背景色（半透明，用于卡片/面板做tint）
 *   hp            血条色
 *   hpDark        血条暗色（渐变用）
 */

export const SUBJECT_THEMES = {
  /** 🧪 化学 — 红橙系 */
  chem: {
    key: 'chem',
    name: '化学',
    icon: '🧪',
    primary: '#e74c3c',
    accent: '#f39c12',
    dark: '#c0392b',
    light: '#f1948a',
    glow: 'rgba(231, 76, 60, 0.4)',
    bg: 'rgba(231, 76, 60, 0.12)',
    hp: '#e74c3c',
    hpDark: '#c0392b'
  },

  /** 🧬 生物 — 绿青系 */
  bio: {
    key: 'bio',
    name: '生物',
    icon: '🧬',
    primary: '#2ecc71',
    accent: '#1abc9c',
    dark: '#27ae60',
    light: '#82e0aa',
    glow: 'rgba(46, 204, 113, 0.4)',
    bg: 'rgba(46, 204, 113, 0.12)',
    hp: '#2ecc71',
    hpDark: '#27ae60'
  },

  /** ☯️ 易学 — 紫系 */
  yi: {
    key: 'yi',
    name: '易学',
    icon: '☯️',
    primary: '#9b59b6',
    accent: '#8e44ad',
    dark: '#7d3c98',
    light: '#c39bd3',
    glow: 'rgba(155, 89, 182, 0.4)',
    bg: 'rgba(155, 89, 182, 0.12)',
    hp: '#9b59b6',
    hpDark: '#7d3c98'
  },

  /** ⚔️ 通用/无学科 */
  neutral: {
    key: 'neutral',
    name: '通用',
    icon: '⚔️',
    primary: '#d4a853',
    accent: '#e8c67a',
    dark: '#b8952e',
    light: '#f0d48a',
    glow: 'rgba(212, 168, 83, 0.4)',
    bg: 'rgba(212, 168, 83, 0.12)',
    hp: '#d4a853',
    hpDark: '#b8952e'
  }
}

/**
 * 根据 subject key 获取完整主题色对象
 * @param {'chem'|'bio'|'yi'} key - 学科标识
 * @returns {object} 主题色对象，未知学科返回通用色
 */
export function getSubjectTheme(key) {
  return SUBJECT_THEMES[key] || SUBJECT_THEMES.neutral
}

/**
 * 根据专精 key 获取对应学科的主题色
 * @param {'chem'|'bio'|'yi'|'biochem'|'all'} specKey
 * @returns {object}
 */
export function getSubjectThemeBySpec(specKey) {
  const map = {
    chem: 'chem',
    bio: 'bio',
    yi: 'yi',
    biochem: 'chem',    // 生化专精默认化学色
    all: 'neutral'
  }
  return getSubjectTheme(map[specKey] || 'neutral')
}

/**
 * 获取学科的 CSS border-color 简写（用于动态绑定）
 */
export function subjectBorderColor(key, side = '') {
  const t = getSubjectTheme(key)
  return side ? `border-${side}: 2px solid ${t.primary}` : `border: 2px solid ${t.primary}`
}

/**
 * 获取学科的 CSS background 简写（半透明背景）
 */
export function subjectBg(key) {
  return getSubjectTheme(key).bg
}
