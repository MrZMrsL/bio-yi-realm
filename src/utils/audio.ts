// src/utils/sfx.ts
// Web Audio API 合成音效 — 零外部依赖，纯代码生成

const SOUND_ENABLED_KEY = 'bio_yi_realm_sound_enabled'

let audioCtx: AudioContext | null = null
let soundEnabled = loadSoundEnabled()
let isUnlocked = false
let unlockHandlersAttached = false

function loadSoundEnabled(): boolean {
  try {
    const stored = localStorage.getItem(SOUND_ENABLED_KEY)
    return stored === null ? true : stored === 'true'
  } catch {
    return true
  }
}

function saveSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(SOUND_ENABLED_KEY, String(enabled))
  } catch {
    // localStorage 不可用则忽略
  }
}

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled
  saveSoundEnabled(enabled)
  if (!enabled && audioCtx) {
    audioCtx.suspend().catch(() => {})
  } else if (enabled && audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
}

export function isSoundEnabled(): boolean {
  return soundEnabled
}

/**
 * 解锁音频上下文。
 * 浏览器自动播放策略要求 AudioContext 必须在用户交互（点击/触摸/按键）后创建或恢复。
 * 应在应用首次用户交互时调用一次。
 */
export function unlockAudio(): void {
  if (isUnlocked) return
  isUnlocked = true
  if (!soundEnabled) return
  if (!audioCtx) {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return
    audioCtx = new Ctx()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
}

/**
 * 自动监听首次用户交互事件并解锁音频。
 * 调用一次即可，避免重复绑定。
 */
export function attachAudioUnlockListeners(): void {
  if (unlockHandlersAttached) return
  unlockHandlersAttached = true

  const events = ['click', 'touchstart', 'keydown']
  const handler = () => {
    unlockAudio()
    events.forEach(e => document.removeEventListener(e, handler))
  }
  events.forEach(e => document.addEventListener(e, handler, { once: true }))
}

function getCtx(): AudioContext | null {
  if (!soundEnabled) return null
  // 未解锁前不主动创建 AudioContext，避免触发浏览器自动播放限制
  if (!isUnlocked || !audioCtx) return null
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

interface ToneOptions {
  freq?: number
  type?: OscillatorType
  duration?: number
  volume?: number
  when?: number
}

function playTone({ freq = 440, type = 'sine', duration = 0.1, volume = 0.15, when = 0 }: ToneOptions): void {
  const ctx = getCtx()
  if (!ctx) return
  const t = ctx.currentTime + when
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = type
  osc.frequency.value = freq

  gain.gain.setValueAtTime(volume, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(t)
  osc.stop(t + duration)
}

interface NoiseOptions {
  duration?: number
  volume?: number
  when?: number
  filterFreq?: number
}

function playNoise({ duration = 0.15, volume = 0.1, when = 0, filterFreq = 1000 }: NoiseOptions): void {
  const ctx = getCtx()
  if (!ctx) return
  const t = ctx.currentTime + when
  const bufferSize = ctx.sampleRate * duration
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }

  const noise = ctx.createBufferSource()
  noise.buffer = buffer

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = filterFreq

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(volume, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration)

  noise.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)

  noise.start(t)
  noise.stop(t + duration)
}

// ===== 公开音效 API =====

/** 按钮/选择点击 — 短促高频方波 */
export function sfxClick(): void {
  playTone({ freq: 880, type: 'square', duration: 0.06, volume: 0.08 })
}

/** 答题正确 — 上升三音阶 C-E-G */
export function sfxCorrect(): void {
  playTone({ freq: 523.25, type: 'sine', duration: 0.18, volume: 0.12, when: 0 })
  playTone({ freq: 659.25, type: 'sine', duration: 0.18, volume: 0.12, when: 0.08 })
  playTone({ freq: 783.99, type: 'sine', duration: 0.22, volume: 0.12, when: 0.16 })
}

/** 答题错误 — 低沉下降锯齿波 */
export function sfxWrong(): void {
  playTone({ freq: 200, type: 'sawtooth', duration: 0.25, volume: 0.1 })
  playTone({ freq: 150, type: 'sawtooth', duration: 0.3, volume: 0.08, when: 0.1 })
}

/** 暴击/打击 — 白噪声爆发 + 低频震荡 */
export function sfxCritical(): void {
  playNoise({ duration: 0.18, volume: 0.15, filterFreq: 2000 })
  playTone({ freq: 100, type: 'square', duration: 0.15, volume: 0.12 })
  playTone({ freq: 80, type: 'sawtooth', duration: 0.2, volume: 0.1, when: 0.05 })
}

/** 升级/获得物品 — 闪亮琶音 C-E-G-C */
export function sfxLevelUp(): void {
  playTone({ freq: 523.25, type: 'sine', duration: 0.2, volume: 0.12, when: 0 })
  playTone({ freq: 659.25, type: 'sine', duration: 0.2, volume: 0.12, when: 0.1 })
  playTone({ freq: 783.99, type: 'sine', duration: 0.2, volume: 0.12, when: 0.2 })
  playTone({ freq: 1046.5, type: 'sine', duration: 0.35, volume: 0.15, when: 0.3 })
}

/** 获得物品 — 短促两声 */
export function sfxItemGet(): void {
  playTone({ freq: 880, type: 'sine', duration: 0.1, volume: 0.1, when: 0 })
  playTone({ freq: 1100, type: 'sine', duration: 0.15, volume: 0.12, when: 0.1 })
}

/** 钓鱼水花 — 噪声 + 低通滤波 */
export function sfxSplash(): void {
  playNoise({ duration: 0.3, volume: 0.12, filterFreq: 600 })
  playTone({ freq: 300, type: 'sine', duration: 0.2, volume: 0.06, when: 0.05 })
}

/** 捕捉成功 — 上升五度 */
export function sfxCaptureSuccess(): void {
  playTone({ freq: 440, type: 'sine', duration: 0.15, volume: 0.1, when: 0 })
  playTone({ freq: 660, type: 'sine', duration: 0.2, volume: 0.12, when: 0.1 })
  playTone({ freq: 880, type: 'sine', duration: 0.3, volume: 0.12, when: 0.2 })
}

/** 捕捉失败/逃跑 — 下降 */
export function sfxCaptureFail(): void {
  playTone({ freq: 400, type: 'triangle', duration: 0.2, volume: 0.1, when: 0 })
  playTone({ freq: 300, type: 'triangle', duration: 0.25, volume: 0.08, when: 0.12 })
}

/** 怪物攻击/受伤 — 低频闷响 */
export function sfxHit(): void {
  playNoise({ duration: 0.1, volume: 0.1, filterFreq: 400 })
  playTone({ freq: 120, type: 'square', duration: 0.1, volume: 0.08 })
}

/** 游戏开始/冒险启程 — 和弦 */
export function sfxStart(): void {
  playTone({ freq: 392, type: 'sine', duration: 0.3, volume: 0.1, when: 0 })
  playTone({ freq: 523, type: 'sine', duration: 0.3, volume: 0.1, when: 0.15 })
  playTone({ freq: 659, type: 'sine', duration: 0.4, volume: 0.12, when: 0.3 })
}
