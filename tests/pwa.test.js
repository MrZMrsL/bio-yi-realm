import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync, statSync, readdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = resolve(ROOT, 'dist')
const PUBLIC = resolve(ROOT, 'public')

function readFile(path) { return readFileSync(path, 'utf-8') }
function fileExists(path) { return existsSync(path) }
function fileSize(path) { return statSync(path).size }

// ---------------------------------------------------------------------------
// 构建产物（dist/）验证 — 仅在 npm run build 之后运行
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

  it('dist 中的 PWA 图标应与 public 源文件尺寸一致', () => {
    const dist192 = fileSize(resolve(DIST, 'pwa-192x192.png'))
    const dist512 = fileSize(resolve(DIST, 'pwa-512x512.png'))
    const pub192 = fileSize(resolve(PUBLIC, 'pwa-192x192.png'))
    const pub512 = fileSize(resolve(PUBLIC, 'pwa-512x512.png'))
    expect(dist192).toBe(pub192)
    expect(dist512).toBe(pub512)
  })
})
