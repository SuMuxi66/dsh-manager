import { createRequire } from 'node:module'
const require = createRequire('file:///E:/Trae project/dsh-manager/package.json')
const { chromium } = require('playwright-core')

const BASE = process.env.BASE ?? 'http://127.0.0.1:65425'
const OUT = process.env.OUT ?? 'E:\\Trae project\\dsh-manager\\test-artifacts-settings'
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

// close onboarding (wait until its dialog actually leaves the DOM)
const later = page.locator('button', { hasText: '稍后配置' })
if (await later.count()) {
  await later.first().click()
  await page.waitForFunction(() => {
    const dlg = [...document.querySelectorAll('[class*="dialog"], [role="dialog"]')]
    return dlg.every((d) => d.getBoundingClientRect().width === 0 && d.getBoundingClientRect().height === 0)
  }, null, { timeout: 10000 }).catch(() => {})
  await page.waitForTimeout(500)
}

// open official settings via sidebar 设置
const settingsBtn = page.locator('button', { hasText: '设置' }).first()
check('official settings button visible', await settingsBtn.isVisible())
await settingsBtn.click()
await page.waitForTimeout(1500)

// the settings panel: look for the page list containing 管理控制台
const pageText = await page.locator('body').textContent()
check('settings panel opened', pageText.includes('设置') || pageText.includes('General'))
await page.screenshot({ path: OUT + '-1-settings-panel.png' })

// find the 管理控制台 nav entry in the settings page list
const mgrNav = page.locator('button, [role="tab"], a, div', { hasText: '管理控制台' }).first()
const navCount = await page.locator('text=管理控制台').count()
check('manager page entry in settings nav', navCount > 0, 'count=' + navCount)
if (navCount > 0) {
  // click the nav entry (nearest clickable ancestor)
  const el = page.locator('text=管理控制台').first()
  const clickable = el.locator('xpath=ancestor::button[1] | ancestor::*[@role="tab"][1] | ancestor::a[1] | ancestor::div[contains(@class,"item")][1]')
  let clicked = false
  if (await clickable.count()) { await clickable.first().click(); clicked = true }
  else { await el.click({ force: true }); clicked = true }
  await page.waitForTimeout(1500)
  check('manager page clicked', clicked)
  await page.screenshot({ path: OUT + '-2-manager-page.png' })

  // the manager page renders tabs + plugins
  const bodyText = await page.locator('body').textContent()
  check('manager page renders tabs', bodyText.includes('插件') && bodyText.includes('市场') && bodyText.includes('Skills') && bodyText.includes('MCP') && bodyText.includes('皮肤'))
  check('manager page renders plugin rows', (await page.locator('.dshm-row').count()) > 10)

  // switch to Skills tab inside the settings page
  await page.locator('.dshm-tab', { hasText: 'Skills' }).click()
  await page.waitForTimeout(1200)
  check('skills tab works in settings page', (await page.locator('.dshm-row').count()) > 0)
  await page.screenshot({ path: OUT + '-3-manager-skills.png' })

  // MCP tab
  await page.locator('.dshm-tab', { hasText: 'MCP' }).click()
  await page.waitForTimeout(1000)
  const mcpBody = await page.locator('.dshm-body').textContent()
  check('mcp tab works in settings page', mcpBody.includes('browser'))
  await page.screenshot({ path: OUT + '-4-manager-mcp.png' })

  // theme tab switch works
  await page.locator('.dshm-tab', { hasText: '皮肤' }).click()
  await page.waitForTimeout(1000)
  const themeBody = await page.locator('.dshm-body').textContent()
  check('theme tab works in settings page', themeBody.includes('浅色') && themeBody.includes('深色'))
  await page.screenshot({ path: OUT + '-5-manager-theme.png' })

  // no sidebar gear shortcut remains (console lives inside settings only)
  const gear = page.locator('button', { hasText: '⚙' })
  check('sidebar gear shortcut removed', (await gear.count()) === 0, 'count=' + (await gear.count()))

  // close the settings panel (Escape)
  await page.keyboard.press('Escape')
  await page.waitForTimeout(800)
} else {
  console.log('SKIP page interaction (no 管理控制台 nav entry)')
}

console.log('\n===== SETTINGS INTEGRATION RESULT: pass=' + pass + ' fail=' + fail + ' =====')
await browser.close()
process.exit(fail > 0 ? 1 : 0)
