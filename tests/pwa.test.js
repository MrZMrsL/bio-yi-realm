import { describe, it, expect, vi } from 'vitest'
import { readFileSync, existsSync, statSync, readdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// ---------------------------------------------------------------------------
// 工具函数
// ---------------------------------------------------------------------------

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = resolve(ROOT, 'dist')
const PUBLIC = resolve(ROOT, 'public')
const SRC = resolve(ROOT, 'src')

function readFile(path) {
  return readFileSync(path, 'utf-8')
}

function fileExists(path) {
  return existsSync(path)
}

function fileSize(path) {
  return statSync(path).size
}

// ---------------------------------------------------------------------------
// 1. vite.config.js — PWA 插件配置验证
// ---------------------------------------------------------------------------

describe('vite.config.js — PWA 插件配置', () => {
  const configPath = resolve(ROOT, 'vite.config.js')
  const configContent = readFile(configPath)

  it('应导入 VitePWA 插件', () => {
    expect(configContent).toContain("import { VitePWA } from 'vite-plugin-pwa'")
  })

  it('应在 plugins 数组中注册 VitePWA', () => {
    expect(configContent).toContain('VitePWA')
  })

  it('registerType 应为 autoUpdate', () => {
    expect(configContent).toContain("registerType: 'autoUpdate'")
  })

  it('includeAssets 应包含所有 PWA 资产', () => {
    expect(configContent).toContain("favicon.svg")
    expect(configContent).toContain("pwa-192x192.png")
    expect(configContent).toContain("pwa-512x512.png")
  })

  // ---- Manifest 配置 ----

  it('manifest.name 应为 "生化易界"', () => {
    expect(configContent).toContain("name: '生化易界'")
  })

  it('manifest.short_name 应为 "生化易界"', () => {
    expect(configContent).toContain("short_name: '生化易界'")
  })

  it('manifest.description 应包含 RPG 知识问答', () => {
    expect(configContent).toContain("RPG知识问答")
  })

  it('manifest.theme_color 应为 #1a1a2e', () => {
    expect(configContent).toContain("theme_color: '#1a1a2e'")
  })

  it('manifest.background_color 应为 #1a1a2e', () => {
    expect(configContent).toContain("background_color: '#1a1a2e'")
  })

  it('manifest.display 应为 standalone（全屏模式）', () => {
    expect(configContent).toContain("display: 'standalone'")
  })

  it('manifest.start_url 应为 "."', () => {
    expect(configContent).toContain("start_url: '.'")
  })

  it('manifest.icons 应包含 192x192 和 512x512 两个尺寸', () => {
    expect(configContent).toContain("sizes: '192x192'")
    expect(configContent).toContain("sizes: '512x512'")
  })

  it('manifest.icons 应包含 maskable 用途图标', () => {
    expect(configContent).toContain("purpose: 'maskable'")
  })

  // ---- Workbox 配置 ----

  it('workbox.globPatterns 应匹配所有静态资源', () => {
    expect(configContent).toContain("globPatterns")
    expect(configContent).toContain("**/*.{js,css,html,svg,png,ico,json}")
  })

  it('Workbox 应配置图片资源的 CacheFirst 策略', () => {
    expect(configContent).toContain("handler: 'CacheFirst'")
    expect(configContent).toContain("cacheName: 'images'")
  })

  it('Workbox 应配置字体的 CacheFirst 策略', () => {
    expect(configContent).toContain("cacheName: 'fonts'")
  })

  it('Workbox 应配置文档的 NetworkFirst 策略', () => {
    expect(configContent).toContain("handler: 'NetworkFirst'")
    expect(configContent).toContain("cacheName: 'documents'")
  })

  it('base 应为 "./" 以支持相对路径部署', () => {
    expect(configContent).toContain("base: './'")
  })
})

// ---------------------------------------------------------------------------
// 2. index.html — 入口文件验证
// ---------------------------------------------------------------------------

describe('index.html — PWA 入口元标签', () => {
  const htmlPath = resolve(ROOT, 'index.html')
  const html = readFile(htmlPath)

  it('lang 属性应为 zh-CN', () => {
    expect(html).toContain('lang="zh-CN"')
  })

  it('title 应为 "生化易界 - RPG 知识问答"', () => {
    expect(html).toContain('<title>生化易界 - RPG 知识问答</title>')
  })

  it('应包含 theme-color meta 标签', () => {
    expect(html).toContain('name="theme-color"')
    expect(html).toContain('content="#1a1a2e"')
  })

  it('应包含 apple-mobile-web-app-capable meta 标签', () => {
    expect(html).toContain('name="apple-mobile-web-app-capable"')
    expect(html).toContain('content="yes"')
  })

  it('应包含 apple-mobile-web-app-status-bar-style meta 标签', () => {
    expect(html).toContain('name="apple-mobile-web-app-status-bar-style"')
    expect(html).toContain('content="black-translucent"')
  })

  it('应包含 apple-mobile-web-app-title meta 标签', () => {
    expect(html).toContain('name="apple-mobile-web-app-title"')
    expect(html).toContain('content="生化易界"')
  })

  it('应包含 apple-touch-icon link 标签', () => {
    expect(html).toContain('rel="apple-touch-icon"')
    expect(html).toContain('href="/pwa-192x192.png"')
  })
})

// ---------------------------------------------------------------------------
// 3. Build Output — 构建产物验证
// ---------------------------------------------------------------------------

describe('构建产物（dist/）— PWA 文件完整性', () => {
  it('manifest.webmanifest 文件应存在', () => {
    expect(fileExists(resolve(DIST, 'manifest.webmanifest'))).toBe(true)
  })

  it('manifest.webmanifest 应包含有效 JSON 及关键字段', () => {
    const manifest = JSON.parse(readFile(resolve(DIST, 'manifest.webmanifest')))
    expect(manifest.name).toBe('生化易界')
    expect(manifest.short_name).toBe('生化易界')
    expect(manifest.description).toBe('生化易界 - RPG知识问答游戏')
    expect(manifest.display).toBe('standalone')
    expect(manifest.theme_color).toBe('#1a1a2e')
    expect(manifest.background_color).toBe('#1a1a2e')
    expect(manifest.start_url).toBe('.')
    expect(manifest.scope).toBe('.')
    expect(Array.isArray(manifest.icons)).toBe(true)
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2)
  })

  it('manifest.icons 应包含 192x192 和 512x512 图标', () => {
    const manifest = JSON.parse(readFile(resolve(DIST, 'manifest.webmanifest')))
    const sizes = manifest.icons.map(i => i.sizes)
    expect(sizes).toContain('192x192')
    expect(sizes).toContain('512x512')
  })

  it('manifest.icons 中应有 maskable 用途图标', () => {
    const manifest = JSON.parse(readFile(resolve(DIST, 'manifest.webmanifest')))
    const maskableIcons = manifest.icons.filter(i => i.purpose === 'maskable')
    expect(maskableIcons.length).toBeGreaterThanOrEqual(1)
  })

  it('sw.js（Service Worker）文件应存在', () => {
    expect(fileExists(resolve(DIST, 'sw.js'))).toBe(true)
  })

  it('registerSW.js 文件应存在', () => {
    expect(fileExists(resolve(DIST, 'registerSW.js'))).toBe(true)
  })

  it('registerSW.js 应包含 Service Worker 注册代码', () => {
    const content = readFile(resolve(DIST, 'registerSW.js'))
    expect(content).toContain('serviceWorker')
    expect(content).toContain('./sw.js')
  })

  it('workbox runtime 文件应存在', () => {
    const files = readdirSync(DIST)
    expect(files.some(f => f.startsWith('workbox-') && f.endsWith('.js'))).toBe(true)
  })

  it('PWA 图标 192x192 应存在于 dist 目录', () => {
    expect(fileExists(resolve(DIST, 'pwa-192x192.png'))).toBe(true)
  })

  it('PWA 图标 512x512 应存在于 dist 目录', () => {
    expect(fileExists(resolve(DIST, 'pwa-512x512.png'))).toBe(true)
  })

  it('构建产物的 index.html 应包含 manifest link 标签', () => {
    const html = readFile(resolve(DIST, 'index.html'))
    expect(html).toContain('rel="manifest"')
    expect(html).toContain('manifest.webmanifest')
  })

  it('构建产物的 index.html 应包含 registerSW 脚本标签', () => {
    const html = readFile(resolve(DIST, 'index.html'))
    expect(html).toContain('registerSW.js')
  })
})

// ---------------------------------------------------------------------------
// 4. 图标文件 — 尺寸与格式验证
// ---------------------------------------------------------------------------

describe('PWA 图标文件有效性', () => {
  it('public/pwa-192x192.png 应存在且不为空', () => {
    const path = resolve(PUBLIC, 'pwa-192x192.png')
    expect(fileExists(path)).toBe(true)
    expect(fileSize(path)).toBeGreaterThan(100)
  })

  it('public/pwa-512x512.png 应存在且不为空', () => {
    const path = resolve(PUBLIC, 'pwa-512x512.png')
    expect(fileExists(path)).toBe(true)
    expect(fileSize(path)).toBeGreaterThan(100)
  })

  it('dist/pwa-icon.svg 应存在（build 输出中的 SVG 图标）', () => {
    const path = resolve(DIST, 'pwa-icon.svg')
    expect(fileExists(path)).toBe(true)
  })

  it('dist 的图标应与 public 的图标尺寸匹配', () => {
    // 验证 dist 中的图标文件大小（build 会复制到 dist）
    const dist192 = fileSize(resolve(DIST, 'pwa-192x192.png'))
    const dist512 = fileSize(resolve(DIST, 'pwa-512x512.png'))
    const pub192 = fileSize(resolve(PUBLIC, 'pwa-192x192.png'))
    const pub512 = fileSize(resolve(PUBLIC, 'pwa-512x512.png'))
    expect(dist192).toBe(pub192)
    expect(dist512).toBe(pub512)
  })
})

// ---------------------------------------------------------------------------
// 5. 依赖检查
// ---------------------------------------------------------------------------

describe('PWA 依赖 — package.json', () => {
  const pkg = JSON.parse(readFile(resolve(ROOT, 'package.json')))

  it('vite-plugin-pwa 应在 devDependencies 中', () => {
    expect(pkg.devDependencies).toHaveProperty('vite-plugin-pwa')
  })

  it('vitest 应在 devDependencies 中', () => {
    expect(pkg.devDependencies).toHaveProperty('vitest')
  })
})
