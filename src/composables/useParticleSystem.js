/**
 * useParticleSystem — 轻量 Canvas2D 粒子系统
 *
 * H5 使用 Canvas 覆盖层实现高性能粒子特效；
 * 小程序/App 暂不支持，调用为空操作。
 */

// #ifndef H5
export function useParticleSystem() {
  return {
    init: () => {},
    emitBurst: () => {},
    emitFloat: () => {},
    emitScreenSparks: () => {},
    clear: () => {},
    destroy: () => {},
    resize: () => {},
  }
}
// #endif

// #ifdef H5
export function useParticleSystem() {
  let canvas = null
  let ctx = null
  let containerEl = null
  let particles = []
  let animFrameId = null
  let isRunning = false
  let isMobile = false
  let resizeObserver = null

  // 粒子最大数量
  const MAX_PARTICLES = 120
  const MAX_PARTICLES_MOBILE = 60

  /** 初始化：在容器上方创建 canvas 覆盖层 */
  function init(containerElement) {
    if (!containerElement) return
    containerEl = containerElement

    // 检测是否移动端
    isMobile = window.innerWidth < 768

    // 创建 canvas
    canvas = document.createElement('canvas')
    canvas.style.cssText = `
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none;
      z-index: 10;
      border-radius: inherit;
    `
    canvas.width = containerEl.offsetWidth || containerEl.clientWidth
    canvas.height = containerEl.offsetHeight || containerEl.clientHeight

    containerEl.style.position = containerEl.style.position || 'relative'
    containerEl.appendChild(canvas)
    ctx = canvas.getContext('2d')

    // ResizeObserver: 容器尺寸变化时同步 canvas 尺寸，也解决首次渲染时尺寸为 0 的问题
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => resize())
      resizeObserver.observe(containerEl)
    }

    // 延迟再检查一次尺寸，处理首次挂载时尚未渲染完成的情况
    requestAnimationFrame(() => resize())

    isRunning = true
    loop()
  }

  /** 发射一群粒子（爆炸效果） */
  function emitBurst(cx, cy, count = 30, colors = ['#f1c40f', '#e67e22', '#f39c12'], options = {}) {
    const maxP = isMobile ? MAX_PARTICLES_MOBILE : MAX_PARTICLES
    const speedMin = options.speedMin || 2
    const speedMax = options.speedMax || 8
    const sizeMin = options.sizeMin || 3
    const sizeMax = options.sizeMax || 8
    const life = options.life || 1.0
    const gravity = options.gravity ?? 120

    for (let i = 0; i < count; i++) {
      if (particles.length >= maxP) break

      const angle = Math.random() * Math.PI * 2
      const speed = speedMin + Math.random() * (speedMax - speedMin)
      const size = sizeMin + Math.random() * (sizeMax - sizeMin)
      const color = colors[Math.floor(Math.random() * colors.length)]

      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
        color,
        alpha: 1,
        life,
        maxLife: life,
        gravity,
        drag: 0.98,
        type: 'burst',
      })
    }
  }

  /** 发射一簇上升飘浮粒子（持续效果） */
  function emitFloat(cx, cy, count = 8, colors = ['#ffffff'], options = {}) {
    const maxP = isMobile ? MAX_PARTICLES_MOBILE : MAX_PARTICLES
    const speedMin = options.speedMin || 0.3
    const speedMax = options.speedMax || 1.2
    const sizeMin = options.sizeMin || 2
    const sizeMax = options.sizeMax || 5
    const life = options.life || 0.8

    for (let i = 0; i < count; i++) {
      if (particles.length >= maxP) break

      particles.push({
        x: cx + (Math.random() - 0.5) * 40,
        y: cy,
        vx: (Math.random() - 0.5) * speedMax,
        vy: -(speedMin + Math.random() * (speedMax - speedMin)),
        size: sizeMin + Math.random() * (sizeMax - sizeMin),
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.7,
        life,
        maxLife: life,
        gravity: -20, // 负重力 = 上升
        drag: 0.99,
        type: 'float',
      })
    }
  }

  /** 屏幕周围闪光粒子（连续暴击/限时预警） */
  function emitScreenSparks(colors = ['#e74c3c', '#f39c12'], count = 15) {
    const maxP = isMobile ? MAX_PARTICLES_MOBILE : MAX_PARTICLES
    const w = canvas.width
    const h = canvas.height

    for (let i = 0; i < count; i++) {
      if (particles.length >= maxP) break

      // 在屏幕四边随机位置生成
      const edge = Math.floor(Math.random() * 4)
      let x, y
      switch (edge) {
        case 0:
          x = Math.random() * w
          y = 0
          break // 上
        case 1:
          x = w
          y = Math.random() * h
          break // 右
        case 2:
          x = Math.random() * w
          y = h
          break // 下
        case 3:
          x = 0
          y = Math.random() * h
          break // 左
      }

      const angle = Math.random() * Math.PI * 2
      const speed = 1 + Math.random() * 3

      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.6,
        life: 0.6 + Math.random() * 0.4,
        maxLife: 1.0,
        gravity: 0,
        drag: 0.97,
        type: 'spark',
      })
    }
  }

  /** 清除所有粒子 */
  function clear() {
    particles = []
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  /** 销毁：停止循环，移除 canvas */
  function destroy() {
    isRunning = false
    if (animFrameId) {
      cancelAnimationFrame(animFrameId)
      animFrameId = null
    }
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
    particles = []
    if (canvas && containerEl) {
      containerEl.removeChild(canvas)
    }
    canvas = null
    ctx = null
    containerEl = null
  }

  /** 调整 canvas 尺寸（容器大小变化时调用） */
  function resize() {
    if (!canvas || !containerEl) return
    canvas.width = containerEl.offsetWidth || containerEl.clientWidth
    canvas.height = containerEl.offsetHeight || containerEl.clientHeight
  }

  // ---- 内部循环 ----

  function loop() {
    if (!isRunning) return
    animFrameId = requestAnimationFrame(loop)
    update()
    render()
  }

  function update() {
    const dt = 1 / 60

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]

      // 物理更新
      p.vx *= p.drag
      p.vy *= p.drag
      p.vy += p.gravity * dt
      p.x += p.vx
      p.y += p.vy

      // 生命周期
      p.life -= dt
      p.alpha = Math.max(0, p.life / p.maxLife)

      // 回收死亡粒子
      if (p.life <= 0) {
        particles.splice(i, 1)
      }
    }
  }

  function render() {
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const p of particles) {
      ctx.globalAlpha = p.alpha
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.globalAlpha = 1
  }

  return {
    init,
    emitBurst,
    emitFloat,
    emitScreenSparks,
    clear,
    destroy,
    resize,
  }
}
// #endif
