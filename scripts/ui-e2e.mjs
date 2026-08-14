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
await page.locator('.dshm-btn.primary', { hasText: '新增 MCP 服务器' }).click()
await page.waitForTimeout(400)
check('mcp add form opens', await page.locator('.dshm-form').first().isVisible())
await page.locator('.dshm-form button', { hasText: '取消' }).click()
await page.waitForTimeout(300)

// 6. keys tab
await page.locator('.dshm-tab', { hasText: 'Keys' }).click()
await page.waitForTimeout(1200)
const keysText = await page.locator('.dshm-body').textContent()
check('keys lists refs', keysText.includes('DEEPSEEK_API_KEY'), keysText.slice(0, 200))
check('keys never shows a stored value', !keysText.includes('secret-value-123'))
// set a key via the form
const refInput = page.locator('.dshm-sec input').first()
const valueInput = page.locator('.dshm-sec input[type="password"]').first()
await refInput.fill('DEEPSEEK_API_KEY')
await valueInput.fill('ui-e2e-secret-456')
await page.locator('.dshm-btn.primary', { hasText: '保存' }).first().click()
await page.waitForTimeout(1200)
const keysText2 = await page.locator('.dshm-body').textContent()
check('key set ok message', keysText2.includes('已保存'))
check('key now configured', keysText2.includes('已配置'))
check('no value leak after set', !keysText2.includes('ui-e2e-secret-456'))
await page.screenshot({ path: OUT + '-4-keys.png' })
// clear it
const clearBtn = page.locator('.dshm-row button.danger', { hasText: '清除' }).first()
if (await clearBtn.count()) {
  await clearBtn.click()
  await page.waitForTimeout(1200)
  const keysText3 = await page.locator('.dshm-body').textContent()
  check('key cleared', keysText3.includes('未配置'))
} else {
  console.log('SKIP key clear (no writable row)')
}

// 7. models tab
await page.locator('.dshm-tab', { hasText: '模型' }).click()
await page.waitForTimeout(1200)
const modelsText = await page.locator('.dshm-body').textContent()
check('models shows default provider', modelsText.includes('deepseek-official'))
check('models shows providers', modelsText.includes('llm-pi-ai') || modelsText.includes('llm-deepseek'))
await page.screenshot({ path: OUT + '-5-models.png' })

// 8. theme tab
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

// 9. market tab still fine
await page.locator('.dshm-tab', { hasText: '市场' }).click()
await page.waitForTimeout(1500)
const marketCards = page.locator('.dshm-card')
check('market tab renders cards', (await marketCards.count()) > 5)

console.log('\n===== UI RESULT: pass=' + pass + ' fail=' + fail + ' =====')
await browser.close()
process.exit(fail > 0 ? 1 : 0)
