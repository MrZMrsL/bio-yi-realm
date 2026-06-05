/**
 * optimize-images.js — 构建时图片压缩管线
 *
 * 使用 sharp 压缩 src/assets/ 和 public/ 下的 PNG 图片。
 * Vite 构建后自动运行，输出压缩后的图片。
 *
 * 用法：构建时自动触发，也可手动运行：
 *   node scripts/optimize-images.js
 *
 * 依赖：sharp（已在 devDependencies 中）
 */

const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const ROOT = path.resolve(__dirname, '..')
const DIRS = [
  path.join(ROOT, 'src', 'assets'),
  path.join(ROOT, 'public')
]

const QUALITY_PNG = 75   // PNG 有损压缩质量 (0-100)
const QUALITY_WEBP = 80  // WebP 质量

async function optimizeFile(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  if (ext !== '.png') return // 仅处理 PNG

  const inputBuffer = fs.readFileSync(filePath)
  const originalSize = inputBuffer.length

  // 压缩 PNG
  const compressedPng = await sharp(inputBuffer)
    .png({ quality: QUALITY_PNG, palette: true })
    .toBuffer()

  // 写回（如果压缩后体积变小）
  if (compressedPng.length < originalSize) {
    fs.writeFileSync(filePath, compressedPng)
    const saved = ((1 - compressedPng.length / originalSize) * 100).toFixed(1)
    console.log(`  ✅ ${path.basename(filePath)}: ${(originalSize / 1024).toFixed(1)}KB → ${(compressedPng.length / 1024).toFixed(1)}KB (节省 ${saved}%)`)
  } else {
    console.log(`  ➡️ ${path.basename(filePath)}: ${(originalSize / 1024).toFixed(1)}KB (已优化，无需压缩)`)
  }

  // 生成 WebP 版本（仅 src/assets 目录，public 保留原格式）
  if (filePath.startsWith(DIRS[0])) {
    const webpPath = filePath.replace(/\.png$/, '.webp')
    const webpBuffer = await sharp(inputBuffer)
      .webp({ quality: QUALITY_WEBP })
      .toBuffer()

    if (webpBuffer.length < originalSize) {
      fs.writeFileSync(webpPath, webpBuffer)
      console.log(`  🆕 ${path.basename(webpPath)}: ${(webpBuffer.length / 1024).toFixed(1)}KB (WebP 格式)`)
    }
  }
}

async function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isFile()) {
      await optimizeFile(fullPath)
    }
  }
}

async function main() {
  console.log('📦 图片压缩管线启动...\n')
  for (const dir of DIRS) {
    if (fs.existsSync(dir)) {
      console.log(`📁 扫描 ${path.relative(ROOT, dir)}/`)
      await walkDir(dir)
    }
  }
  console.log('\n✅ 图片优化完成')
}

main().catch(err => {
  console.error('❌ 图片优化失败:', err.message)
  process.exit(1)
})
