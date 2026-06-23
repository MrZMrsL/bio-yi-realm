/**
 * useFloatingDamage — 伤害数字飘字效果
 *
 * 在战斗场景中创建浮动数字，CSS 动画上升 + 淡出。
 * H5 使用纯 DOM 实现；小程序/App 暂不支持，调用为空操作。
 */

const MAX_NUMBERS = 10
const ANIMATION_DURATION = 1000 // ms

let activeCount = 0

// #ifndef H5
export function showFloatingDamage() {}
export function showHealNumber() {}
// #endif

// #ifdef H5
/**
 * 在指定容器中显示一个浮动伤害数字
 * @param {HTMLElement} containerEl - 容器元素（需 position: relative）
 * @param {number} amount - 伤害数值
 * @param {object} options
 * @param {number} options.x - 相对容器的 x 位置（px），默认居中
 * @param {number} options.y - 相对容器的 y 位置（px），默认居中偏上
 * @param {boolean} options.isCritical - 是否暴击
 * @param {string} options.label - 额外文字标签（如 "暴击！"）
 * @param {string} options.color - 文字颜色（覆盖默认）
 */
export function showFloatingDamage(containerEl, amount, options = {}) {
  if (!containerEl || activeCount >= MAX_NUMBERS) return

  activeCount++

  const el = document.createElement('div')
  const isCritical = options.isCritical || false
  const color = options.color || (isCritical ? '#f1c40f' : '#ffffff')

  const text = isCritical ? `-${amount}` : `-${amount}`
  const label = options.label ? ` ${options.label}` : ''

  el.textContent = text + label
  el.style.cssText = `
    position: absolute;
    left: ${options.x ?? 50}%;
    top: ${options.y ?? 35}%;
    transform: translate(-50%, -50%);
    font-size: ${isCritical ? '28' : '20'}px;
    font-weight: ${isCritical ? '900' : '700'};
    color: ${color};
    text-shadow: 0 0 ${isCritical ? '12' : '6'}px ${color}40,
                 0 2px 4px rgba(0,0,0,0.6);
    pointer-events: none;
    z-index: 20;
    font-family: 'Segoe UI', sans-serif;
    animation: float-up-${isCritical ? 'crit' : 'normal'} ${ANIMATION_DURATION}ms ease-out forwards;
    white-space: nowrap;
  `

  // 动态注入关键帧（仅在第一次调用时注入）
  const styleId = '__floating_damage_keyframes'
  if (!document.getElementById(styleId)) {
    const styleSheet = document.createElement('style')
    styleSheet.id = styleId
    styleSheet.textContent = `
      @keyframes float-up-normal {
        0%   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        30%  { opacity: 1; transform: translate(-50%, -70%) scale(1.1); }
        70%  { opacity: 0.7; transform: translate(-50%, -110%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -150%) scale(0.9); }
      }
      @keyframes float-up-crit {
        0%   { opacity: 1; transform: translate(-50%, -50%) scale(0.5); }
        20%  { opacity: 1; transform: translate(-50%, -60%) scale(1.4); }
        40%  { opacity: 1; transform: translate(-50%, -80%) scale(1.2); }
        80%  { opacity: 0.8; transform: translate(-50%, -120%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -160%) scale(0.8); }
      }
    `
    document.head.appendChild(styleSheet)
  }

  containerEl.appendChild(el)

  // 动画结束后移除 DOM 元素
  setTimeout(() => {
    if (el.parentNode) el.parentNode.removeChild(el)
    activeCount = Math.max(0, activeCount - 1)
  }, ANIMATION_DURATION)
}

/**
 * 显示回复数字（绿色，带 + 号）
 */
export function showHealNumber(containerEl, amount, options = {}) {
  if (!containerEl || activeCount >= MAX_NUMBERS) return
  activeCount++
  // 复用，但修改样式
  options.color = options.color || '#2ecc71'

  const el = document.createElement('div')
  el.textContent = `+${amount}`
  el.style.cssText = `
    position: absolute;
    left: ${options.x ?? 50}%;
    top: ${options.y ?? 45}%;
    transform: translate(-50%, -50%);
    font-size: 20px;
    font-weight: 700;
    color: #2ecc71;
    text-shadow: 0 0 6px rgba(46,204,113,0.5), 0 2px 4px rgba(0,0,0,0.6);
    pointer-events: none;
    z-index: 20;
    animation: heal-up 1000ms ease-out forwards;
    white-space: nowrap;
    font-family: 'Segoe UI', sans-serif;
  `

  const styleId = '__heal_keyframes'
  if (!document.getElementById(styleId)) {
    const ss = document.createElement('style')
    ss.id = styleId
    ss.textContent = `
      @keyframes heal-up {
        0%   { opacity: 1; transform: translate(-50%, -50%) scale(0.8); }
        25%  { opacity: 1; transform: translate(-50%, -70%) scale(1.2); }
        75%  { opacity: 0.8; transform: translate(-50%, -120%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -160%) scale(0.9); }
      }
    `
    document.head.appendChild(ss)
  }

  containerEl.appendChild(el)
  setTimeout(() => {
    if (el.parentNode) el.parentNode.removeChild(el)
    activeCount = Math.max(0, activeCount - 1)
  }, ANIMATION_DURATION)
}
// #endif
