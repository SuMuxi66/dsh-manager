// Diagnose: after clicking 继续, does the modal mask actually go away?
import { chromium } from 'playwright-core'
const port = process.argv[2] ?? '60231'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 820 } })
page.on('pageerror', (e) => console.log('PAGE ERROR:', String(e).slice(0, 200)))
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded', timeout: 30000 })
await page.waitForSelector('text=设置', { timeout: 120000 })
await page.waitForTimeout(3000)
const before = await page.evaluate(() => {
  const masks = [...document.querySelectorAll('div')].filter((d) => d.className && String(d.className).includes('mask'))
  return { masks: masks.length, gear: document.querySelector('[aria-label="管理控制台"]') !== null, notice: document.body.innerText.includes('探索未至之境') }
})
console.log('before click:', JSON.stringify(before))
const cont = page.getByRole('button', { name: '继续' })
console.log('继续 count:', await cont.count())
if (await cont.count()) await cont.click()
await page.waitForTimeout(3000)
const after = await page.evaluate(() => {
  const el = document.querySelector('[aria-label="管理控制台"]')
  const r = el?.getBoundingClientRect()
  const top = el && r ? document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) : null
  return {
    masks: [...document.querySelectorAll('div')].filter((d) => d.className && String(d.className).includes('mask')).length,
    notice: document.body.innerText.includes('探索未至之境'),
    hitTest: top === el ? 'self' : top ? `${top.tagName}.${top.className}` : 'null',
  }
})
console.log('after click:', JSON.stringify(after))
await browser.close()
