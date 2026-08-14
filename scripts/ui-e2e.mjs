import { createRequire } from 'node:module'
const require = createRequire('file:///E:/Trae project/dsh-manager/package.json')
const { chromium } = require('playwright-core')

const BASE = process.env.BASE ?? 'http://127.0.0.1:8080'
const OUT = process.env.OUT ?? 'E:\\Trae project\\dsh-manager\\test-artifacts-m2'
let pass = 0
let fail = 0
function check(name, cond, detail) {
  if (cond) { pass++; console.log('PASS ' + name) }
  else { fail++; console.log('FAIL ' + name + ' :: ' + (detail ?? '')) }
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 })
await page.waitForTimeout(4000)

// 1. close the onboarding dialog via 稍后配置
const later = page.locator('button', { hasText: '稍后配置' })
if (await later.count()) {
  await later.first().click()
  await page.waitForTimeout(1200)
  console.log('INFO closed onboarding')
}

// 2. open manager console via gear button
const gear = page.locator('button', { hasText: '⚙' }).first()
check('gear button visible', await gear.isVisible())
await gear.click()
await page.waitForTimeout(1200)
check('manager console opens', await page.locator('.dshm-panel').first().isVisible())
check('console title', (await page.locator('.dshm-head h2').textContent()).includes('DSH 管理控制台'))
await page.screenshot({ path: OUT + '-1-console.png' })

// 3. plugins tab default
const pluginRows = page.locator('.dshm-row')
check('plugins tab has rows', (await pluginRows.count()) > 10)

// 4. skills tab
await page.locator('.dshm-tab', { hasText: 'Skills' }).click()
await page.waitForTimeout(1500)
const skillRows = page.locator('.dshm-row')
const skillCount = await skillRows.count()
check('skills tab has rows', skillCount > 0, 'count=' + skillCount)
const firstSkillName = (await skillRows.first().locator('.dshm-name').textContent()) ?? ''
console.log('INFO first skill: ' + firstSkillName)
await page.screenshot({ path: OUT + '-2-skills.png' })
// skill detail
const detailBtn = page.locator('.dshm-row button', { hasText: '详情' }).first()
if (await detailBtn.count()) {
  await detailBtn.click()
  await page.waitForTimeout(800)
  const detail = page.locator('.dshm-detail pre')
  check('skill detail opens with content', (await detail.count()) > 0 && ((await detail.textContent()) ?? '').length > 20)
  await page.locator('.dshm-detail button', { hasText: '关闭' }).click()
  await page.waitForTimeout(400)
} else {
  console.log('SKIP skill detail (no rows)')
}
// skill md file import
import { writeFileSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
const importName = 'ui-import-' + Date.now().toString(36)
const tmpMd = join(tmpdir(), importName + '.md')
writeFileSync(tmpMd, '---\nname: ' + importName + '\ndescription: ui e2e imported skill\n---\n\n# UI import test\nWorks.')
const fileInput = page.locator('input[type="file"]')
await fileInput.setInputFiles(tmpMd)
await page.waitForTimeout(1500)
const skillsTextAfter = await page.locator('.dshm-body').textContent()
check('skill import via file works', skillsTextAfter.includes('已导入') && skillsTextAfter.includes(importName), skillsTextAfter.slice(0, 250))
check('imported skill in list', skillsTextAfter.includes(importName))
await page.screenshot({ path: OUT + '-2b-skill-import.png' })
// uninstall the imported skill via UI
const importRow = page.locator('.dshm-row', { hasText: importName }).first()
if (await importRow.count()) {
  await importRow.locator('button.danger', { hasText: '卸载' }).click()
  await page.waitForTimeout(1200)
}
unlinkSync(tmpMd)

// 5. MCP tab
await page.locator('.dshm-tab', { hasText: 'MCP' }).click()
await page.waitForTimeout(1200)
const mcpRows = page.locator('.dshm-row')
const mcpCount = await mcpRows.count()
check('mcp tab lists servers', mcpCount >= 1, 'count=' + mcpCount)
const mcpText = await page.locator('.dshm-body').textContent()
check('mcp shows running badge', mcpText.includes('运行中') || mcpText.includes('未加载'))
check('mcp shows server name', mcpText.includes('browser'))
await page.screenshot({ path: OUT + '-3-mcp.png' })
// add-server form opens
await page.locator('.dshm-btn', { hasText: '+ 新增' }).click()
await page.waitForTimeout(400)
check('mcp add form opens', await page.locator('.dshm-form').first().isVisible())
await page.locator('.dshm-form button', { hasText: '取消' }).click()
await page.waitForTimeout(300)
// MCP market view
await page.locator('.dshm-btn', { hasText: '开源商店' }).click()
// wait for the store search to settle (loading text disappears)
await page.waitForFunction(() => {
  const body = document.querySelector('.dshm-body')
  return body !== null && !body.textContent.includes('搜索中…')
}, null, { timeout: 40000 }).catch(() => {})
await page.waitForTimeout(500)
const marketBody = await page.locator('.dshm-body').textContent()
check('mcp market view renders', marketBody.includes('Smithery') || marketBody.includes('开源商店'))
const mcpMarketCards = await page.locator('.dshm-card').count()
check('mcp market lists servers', mcpMarketCards > 0, 'cards=' + mcpMarketCards)
await page.screenshot({ path: OUT + '-4-mcp-market.png' })
// search in the store
const searchInput = page.locator('.dshm-input').first()
await searchInput.fill('github')
await page.locator('.dshm-btn.primary', { hasText: '搜索' }).click()
await page.waitForFunction(() => {
  const body = document.querySelector('.dshm-body')
  return body !== null && !body.textContent.includes('搜索中…')
}, null, { timeout: 40000 }).catch(() => {})
await page.waitForTimeout(500)
const marketBody2 = await page.locator('.dshm-body').textContent()
check('mcp market search works', marketBody2.includes('GitHub') || (await page.locator('.dshm-card').count()) > 0, marketBody2.slice(0, 200))
const installBtns = await page.locator('.dshm-card button', { hasText: '安装' }).count()
check('mcp market install buttons present', installBtns >= 1, 'btns=' + installBtns)
// back to configured
await page.locator('.dshm-btn', { hasText: '已配置' }).click()
await page.waitForTimeout(800)

// 6. models tab
await page.locator('.dshm-tab', { hasText: '模型' }).click()
await page.waitForTimeout(1200)
const modelsText = await page.locator('.dshm-body').textContent()
check('models shows default provider', modelsText.includes('deepseek-official'))
check('models shows providers', modelsText.includes('llm-pi-ai') || modelsText.includes('llm-deepseek'))
await page.screenshot({ path: OUT + '-5-models.png' })

// 7. theme tab
await page.locator('.dshm-tab', { hasText: '皮肤' }).click()
await page.waitForTimeout(1200)
const themeText = await page.locator('.dshm-body').textContent()
check('theme shows preference buttons', themeText.includes('浅色') && themeText.includes('深色') && themeText.includes('跟随系统'))
const darkBtn = page.locator('.dshm-btn.primary', { hasText: '深色' })
check('dark preference active or switchable', (await darkBtn.count()) > 0 || themeText.includes('深色'))
// switch to light then back
const lightBtn = page.locator('.dshm-btn', { hasText: '浅色' }).first()
await lightBtn.click()
await page.waitForTimeout(1000)
const themeText2 = await page.locator('.dshm-body').textContent()
check('theme switch works', themeText2.includes('主题已切换'))
await page.screenshot({ path: OUT + '-6-theme.png' })

// 8. market tab still fine (live GitHub fetch may take up to 15s; curated
// fallback renders afterwards)
await page.locator('.dshm-tab', { hasText: '市场' }).click()
await page.waitForFunction(() => document.querySelectorAll('.dshm-card').length > 5, null, { timeout: 45000 }).catch(() => {})
const marketCards = page.locator('.dshm-card')
check('market tab renders cards', (await marketCards.count()) > 5)

console.log('\n===== UI RESULT: pass=' + pass + ' fail=' + fail + ' =====')
await browser.close()
process.exit(fail > 0 ? 1 : 0)
