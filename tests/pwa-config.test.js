import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync, statSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = resolve(ROOT, 'public')

function readFile(path) { return readFileSync(path, 'utf-8') }
function fileExists(path) { return existsSync(path) }
function fileSize(path) { return statSync(path).size }

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
// 3. 图标文件 — 源文件检查
// ---------------------------------------------------------------------------

describe('PWA 图标源文件', () => {
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
})

// ---------------------------------------------------------------------------
// 4. 依赖检查
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
