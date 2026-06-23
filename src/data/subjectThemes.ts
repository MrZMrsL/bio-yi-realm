/**
 * subjectThemes.ts — 三大学科色系统
 *
 * 每一套完整色板含8个色值，覆盖 UI 全场景。
 * 在 store / Battle 等组件中通过 `getSubjectTheme(key)` 获取。
 */

import type { SubjectTheme } from '../types.ts'

export type SubjectThemeKey = 'chem' | 'bio' | 'yi' | 'neutral'

export const SUBJECT_THEMES: Record<SubjectThemeKey, SubjectTheme> = {
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
    hpDark: '#c0392b',
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
    hpDark: '#27ae60',
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
    hpDark: '#7d3c98',
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
    hpDark: '#b8952e',
  },
}

/**
 * 根据 subject key 获取完整主题色对象
 */
export function getSubjectTheme(key: string): SubjectTheme {
  return SUBJECT_THEMES[(key as SubjectThemeKey)] || SUBJECT_THEMES.neutral
}

/**
 * 根据专精 key 获取对应学科的主题色
 */
export function getSubjectThemeBySpec(specKey: string): SubjectTheme {
  const map: Record<string, SubjectThemeKey> = {
    chem: 'chem',
    bio: 'bio',
    yi: 'yi',
    biochem: 'chem', // 生化专精默认化学色
    all: 'neutral',
  }
  return getSubjectTheme(map[specKey] || 'neutral')
}

/**
 * 获取学科的 CSS border-color 简写（用于动态绑定）
 */
export function subjectBorderColor(key: string, side: string = ''): string {
  const t = getSubjectTheme(key)
  return side ? `border-${side}: 2px solid ${t.primary}` : `border: 2px solid ${t.primary}`
}

/**
 * 获取学科的 CSS background 简写（半透明背景）
 */
export function subjectBg(key: string): string {
  return getSubjectTheme(key).bg
}
