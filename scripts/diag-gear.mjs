// Diagnose the gear button: position, occlusion, sidebar state.
import { chromium } from 'playwright-core'
const port = process.argv[2] ?? '60231'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 820 } })
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded', timeout: 30000 })
await page.waitForSelector('[aria-label="管理控制台"]', { timeout: 60000 })
await page.waitForTimeout(2000)
const info = await page.evaluate(() => {
  const el = document.querySelector('[aria-label="管理控制台"]')
  const r = el.getBoundingClientRect()
  const probe = (x, y) => {
    const top = document.elementFromPoint(x, y)
    return top === el ? 'self' : top ? `${top.tagName}.${typeof top.className === 'string' ? top.className : ''}` : 'null'
  }
  return {
    rect: { x: r.x, y: r.y, w: r.width, h: r.height },
    center: probe(r.x + r.width / 2, r.y + r.height / 2),
    corner: probe(r.x + 2, r.y + 2),
    visible: el.offsetParent !== null,
    sidebarBtn: document.querySelector('[aria-label="收起侧边栏"]') !== null,
    bodyHasManager: document.body.innerText.includes('管理控制台'),
  }
})
console.log(JSON.stringify(info, null, 1))
await page.screenshot({ path: 'test-artifacts-gear.png' })
await browser.close()
