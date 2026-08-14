import { createRequire } from 'node:module'
const require = createRequire('file:///E:/Trae project/dsh-manager/package.json')
const { chromium } = require('playwright-core')

const BASE = process.env.BASE ?? 'http://127.0.0.1:52859'
const OUT = process.env.OUT ?? 'E:\\Trae project\\dsh-manager\\test-artifacts-layout'
let pass = 0
let fail = 0
function check(name, cond, detail) {
  if (cond) { pass++; console.log('PASS ' + name) }
  else { fail++; console.log('FAIL ' + name + ' :: ' + (detail ?? '')) }
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 950 } })
await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 })
await page.waitForTimeout(4000)

// close onboarding
const later = page.locator('button', { hasText: '稍后配置' })
if (await later.count()) {
  await later.first().click()
  await page.waitForFunction(() => {
    const dlg = [...document.querySelectorAll('[class*="dialog"], [role="dialog"]')]
    return dlg.every((d) => d.getBoundingClientRect().width === 0 && d.getBoundingClientRect().height === 0)
  }, null, { timeout: 10000 }).catch(() => {})
  await page.waitForTimeout(500)
}

// 1. open official settings
await page.locator('button', { hasText: '设置' }).first().click()
await page.waitForTimeout(1500)
let body = await page.locator('body').textContent()
check('settings panel opened', body.includes('通用设置'))
check('no 管理控制台 entry remains', !body.includes('管理控制台'))
check('Skills 管理 page listed', body.includes('Skills 管理'))
check('MCP 管理 page listed', body.includes('MCP 管理'))
await page.screenshot({ path: OUT + '-1-settings-nav.png' })

// 2. official 插件 page: our tabs inside
await page.locator('text=插件').first().click()
await page.waitForTimeout(1500)
body = await page.locator('body').textContent()
check('plugins page shows 插件管理 tab', body.includes('插件管理'))
check('plugins page shows 插件市场 tab', body.includes('插件市场'))
await page.screenshot({ path: OUT + '-2-plugins-tabs.png' })

// 3. 插件管理 tab: loader list + toggle
const manageTab = page.locator('button, [role="tab"]', { hasText: '插件管理' }).first()
if (await manageTab.count()) {
  await manageTab.click()
  await page.waitForTimeout(1500)
  const rows = await page.locator('.dshm-row').count()
  check('插件管理 lists plugins', rows > 10, 'rows=' + rows)
  const toggleBtns = await page.locator('.dshm-row button', { hasText: '禁用' }).count()
  check('插件管理 has toggle buttons', toggleBtns > 0, 'btns=' + toggleBtns)
  // toggle a non-core row (never include/cordis/@deepseek-ai core entries)
  const candidate = page.locator('.dshm-row').filter({ hasNotText: 'cordis' }).filter({ hasNotText: '@deepseek-ai' }).first()
  const firstToggle = candidate.locator('button', { hasText: '禁用' }).first()
  if (await firstToggle.count()) {
    const rowText = await candidate.textContent()
    console.log('INFO toggling row: ' + (rowText ?? '').slice(0, 60))
    await firstToggle.click()
    await page.waitForTimeout(1200)
    body = await page.locator('.dshm-body').textContent()
    check('toggle produces status message', body.includes('已禁用') || body.includes('已启用'))
    // restore
    const restore = candidate.locator('button', { hasText: '启用' }).first()
    if (await restore.count()) { await restore.click(); await page.waitForTimeout(1200) }
  } else {
    console.log('SKIP toggle (no non-core toggleable row)')
  }
  await page.screenshot({ path: OUT + '-3-plugins-manage.png' })
} else {
  console.log('SKIP 插件管理 tab (not found)')
}

// 4. 插件市场 tab: cards
const marketTab = page.locator('button, [role="tab"]', { hasText: '插件市场' }).first()
if (await marketTab.count()) {
  await marketTab.click()
  await page.waitForFunction(() => document.querySelectorAll('.dshm-card').length > 5, null, { timeout: 45000 }).catch(() => {})
  const cards = await page.locator('.dshm-card').count()
  check('插件市场 renders cards', cards > 5, 'cards=' + cards)
  check('插件市场 install buttons', (await page.locator('.dshm-card button', { hasText: '安装' }).count()) > 0)
  await page.screenshot({ path: OUT + '-4-plugins-market.png' })
} else {
  console.log('SKIP 插件市场 tab (not found)')
}

// 5. Skills 管理 page
await page.locator('text=Skills 管理').first().click({ force: true })
await page.waitForTimeout(1500)
body = await page.locator('body').textContent()
check('Skills page opens', await page.locator('.dshm-page').first().isVisible())
check('Skills page lists skills', (await page.locator('.dshm-row').count()) > 0)
check('Skills page has import button', body.includes('导入 md 文件'))
// md import
import { writeFileSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
const importName = 'layout-import-' + Date.now().toString(36)
const tmpMd = join(tmpdir(), importName + '.md')
writeFileSync(tmpMd, '---\nname: ' + importName + '\ndescription: layout e2e import\n---\n\n# Layout test\nWorks.')
await page.locator('input[type="file"]').setInputFiles(tmpMd)
await page.waitForTimeout(1500)
body = await page.locator('body').textContent()
check('Skills md import works', body.includes('已导入') && body.includes(importName), body.slice(0, 300))
// uninstall via UI
const importRow = page.locator('.dshm-row', { hasText: importName }).first()
if (await importRow.count()) {
  await importRow.locator('button.danger', { hasText: '卸载' }).click()
  await page.waitForTimeout(1200)
}
unlinkSync(tmpMd)
await page.screenshot({ path: OUT + '-5-skills.png' })

// 6. MCP 管理 page
await page.locator('text=MCP 管理').first().click({ force: true })
await page.waitForTimeout(1500)
body = await page.locator('body').textContent()
check('MCP page opens', await page.locator('.dshm-page').first().isVisible())
check('MCP page lists configured servers', body.includes('browser') || body.includes('运行中'))
// market view
await page.locator('.dshm-btn', { hasText: '开源商店' }).click()
await page.waitForFunction(() => {
  const el = document.querySelector('.dshm-body')
  return el !== null && !el.textContent.includes('搜索中…')
}, null, { timeout: 40000 }).catch(() => {})
await page.waitForTimeout(500)
body = await page.locator('body').textContent()
check('MCP store view renders', body.includes('Smithery'))
const mcpCards = await page.locator('.dshm-card').count()
check('MCP store lists servers', mcpCards > 0, 'cards=' + mcpCards)
// search
await page.locator('.dshm-input').first().fill('github')
await page.locator('.dshm-btn.primary', { hasText: '搜索' }).click()
await page.waitForFunction(() => {
  const el = document.querySelector('.dshm-body')
  return el !== null && !el.textContent.includes('搜索中…')
}, null, { timeout: 40000 }).catch(() => {})
await page.waitForTimeout(500)
body = await page.locator('body').textContent()
check('MCP store search works', body.includes('GitHub') || (await page.locator('.dshm-card').count()) > 0, body.slice(0, 200))
await page.screenshot({ path: OUT + '-6-mcp.png' })

console.log('\n===== LAYOUT RESULT: pass=' + pass + ' fail=' + fail + ' =====')
await browser.close()
process.exit(fail > 0 ? 1 : 0)
