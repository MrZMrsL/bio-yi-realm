const puppeteer = require('puppeteer-core')
const http = require('http')
const fs = require('fs')
const path = require('path')

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const DIST_DIR = path.resolve(__dirname, '../dist/build/h5')
const SCREENSHOT_PATH = path.resolve(__dirname, '../test-focus-result.png')

function serveStatic(port) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url)
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(DIST_DIR, 'index.html')
      }
      const ext = path.extname(filePath)
      const mime = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml',
      }[ext] || 'application/octet-stream'
      res.writeHead(200, { 'Content-Type': mime })
      fs.createReadStream(filePath).pipe(res)
    })
    server.listen(port, () => resolve(server))
  })
}

async function main() {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  const server = await serveStatic(3456)
  console.log('Serving built H5 at http://localhost:3456')

  let browser
  try {
    browser = await puppeteer.launch({
      executablePath: EDGE_PATH,
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-extensions',
        '--disable-background-networking',
      ],
    })

    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 720 })
    await page.goto('http://localhost:3456', { waitUntil: 'networkidle0' })
    await page.bringToFront()
    await sleep(200)

    // Wait for the input to appear
    await page.waitForSelector('.name-input', { timeout: 5000 })
    await sleep(500)

    // Inspect uni-input internals
    const internals = await page.evaluate(() => {
      const uniInput = document.querySelector('.name-input')
      if (!uniInput) return { exists: false }
      const shadow = uniInput.shadowRoot
      const innerInput = uniInput.querySelector('input') || shadow?.querySelector('input')
      const innerStyles = innerInput ? window.getComputedStyle(innerInput) : null
      return {
        tagName: uniInput.tagName,
        hasShadowRoot: !!shadow,
        innerInputTag: innerInput?.tagName,
        innerInputTabIndex: innerInput?.tabIndex,
        innerInputExists: !!innerInput,
        children: Array.from(uniInput.children).map((c) => c.tagName),
        shadowChildren: shadow ? Array.from(shadow.children).map((c) => c.tagName) : [],
        innerInputStyles: innerStyles
          ? {
              display: innerStyles.display,
              visibility: innerStyles.visibility,
              opacity: innerStyles.opacity,
              pointerEvents: innerStyles.pointerEvents,
              position: innerStyles.position,
              zIndex: innerStyles.zIndex,
              width: innerStyles.width,
              height: innerStyles.height,
              left: innerStyles.left,
              top: innerStyles.top,
            }
          : null,
        html: uniInput ? uniInput.outerHTML.slice(0, 800) : null,
        placeholderStyles: (() => {
          const ph = uniInput?.querySelector('.uni-input-placeholder')
          if (!ph) return null
          const s = window.getComputedStyle(ph)
          return {
            position: s.position,
            width: s.width,
            height: s.height,
            top: s.top,
            left: s.left,
            pointerEvents: s.pointerEvents,
            zIndex: s.zIndex,
          }
        })(),
      }
    })
    console.log('uni-input internals:', JSON.stringify(internals, null, 2))

    // Get input properties before click
    const before = await page.evaluate(() => {
      const input = document.querySelector('.name-input')
      const styles = input ? window.getComputedStyle(input) : null
      return {
        exists: !!input,
        disabled: input ? input.disabled : null,
        readOnly: input ? input.readOnly : null,
        tabIndex: input ? input.tabIndex : null,
        rect: input
          ? {
              x: input.getBoundingClientRect().x,
              y: input.getBoundingClientRect().y,
              width: input.getBoundingClientRect().width,
              height: input.getBoundingClientRect().height,
              top: input.getBoundingClientRect().top,
              left: input.getBoundingClientRect().left,
            }
          : null,
        display: styles ? styles.display : null,
        visibility: styles ? styles.visibility : null,
        opacity: styles ? styles.opacity : null,
        pointerEvents: styles ? styles.pointerEvents : null,
        userSelect: styles ? styles.userSelect : null,
        zIndex: styles ? styles.zIndex : null,
        position: styles ? styles.position : null,
        parentDisplay: input && input.parentElement ? window.getComputedStyle(input.parentElement).display : null,
        parentVisibility: input && input.parentElement ? window.getComputedStyle(input.parentElement).visibility : null,
      }
    })
    console.log('Input before click:', JSON.stringify(before, null, 2))

    // Click the input
    await page.click('.name-input')
    await sleep(500)

    const afterClick = await page.evaluate(() => {
      const input = document.querySelector('.name-input')
      const innerInput = input.querySelector('input')
      const rect = input.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      return {
        elementFromPoint: document.elementFromPoint(centerX, centerY)?.tagName,
        elementFromPointClass: document.elementFromPoint(centerX, centerY)?.className,
        activeElementTag: document.activeElement?.tagName,
        activeElementClass: document.activeElement?.className,
        hasFocus: document.hasFocus(),
        isInputActive: document.activeElement === innerInput,
      }
    })
    console.log('After click:', JSON.stringify(afterClick, null, 2))

    // Type something
    await page.type('.name-input', '测试', { delay: 50 })
    await sleep(300)

    // Check active element and value
    const after = await page.evaluate(() => {
      const input = document.querySelector('.name-input')
      const innerInput = input.querySelector('input')
      return {
        activeElementTag: document.activeElement ? document.activeElement.tagName : null,
        activeElementClass: document.activeElement ? document.activeElement.className : null,
        inputValue: innerInput ? innerInput.value : null,
        isInputActive: document.activeElement === innerInput,
      }
    })
    console.log('Input after click/type:', JSON.stringify(after, null, 2))

    await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true })
    console.log('Screenshot saved to', SCREENSHOT_PATH)

    if (!after.isInputActive) {
      console.error('FAIL: Input did not become the active element after click')
      process.exitCode = 1
    } else if (after.inputValue !== '测试') {
      console.error('FAIL: Could not type into input')
      process.exitCode = 1
    } else {
      console.log('PASS: Input is focusable and accepts text')
    }
  } catch (err) {
    console.error('Error:', err)
    process.exitCode = 1
  } finally {
    if (browser) await browser.close()
    server.close()
  }
}

main()
