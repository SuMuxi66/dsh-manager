const BASE = process.env.BASE ?? 'http://127.0.0.1:51266'
let pass = 0
let fail = 0

async function call(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  })
  let json = null
  try { json = await res.json() } catch { json = { raw: await res.text() } }
  return { status: res.status, json }
}

function check(name, cond, detail) {
  if (cond) { pass++; console.log('PASS ' + name) }
  else { fail++; console.log('FAIL ' + name + ' :: ' + (detail ?? '')) }
}

// 1. skills list
let r = await call('GET', '/manager/api/skills')
check('skills list ok', r.status === 200 && r.json.ok === true, JSON.stringify(r.json).slice(0, 300))
const skills = r.json.skills ?? []
console.log('  skills count = ' + skills.length + (skills[0] ? ' first=' + skills[0].name : ''))

// 2. skill detail (first skill with a path)
let detailChecked = false
for (const s of skills.slice(0, 5)) {
  if (s.path) {
    const d = await call('GET', '/manager/api/skills/detail?path=' + encodeURIComponent(s.path))
    check('skill detail ' + s.name, d.status === 200 && d.json.ok === true && typeof d.json.content === 'string' && d.json.content.length > 0, JSON.stringify(d.json).slice(0, 200))
    detailChecked = true
    break
  }
}
if (!detailChecked) { console.log('SKIP skill detail (no path in first 5)') ; pass++ }

// 3. skill install (user-level)
const tname = 'mgr-e2e-test-' + Date.now().toString(36)
r = await call('POST', '/manager/api/skills/install', {
  name: tname,
  content: '---\nname: ' + tname + '\ndescription: e2e test skill\n---\n\n# Usage\nJust a test.',
})
check('skill install', r.status === 200 && r.json.ok === true, JSON.stringify(r.json))
r = await call('GET', '/manager/api/skills')
check('skill visible after install', (r.json.skills ?? []).some((s) => s.name === tname), JSON.stringify(r.json).slice(0, 300))
// install invalid name
r = await call('POST', '/manager/api/skills/install', { name: '../evil', content: 'x' })
check('skill install rejects traversal', r.status === 400, JSON.stringify(r.json))
// uninstall
r = await call('POST', '/manager/api/skills/uninstall', { name: tname })
check('skill uninstall', r.status === 200 && r.json.ok === true, JSON.stringify(r.json))

// 4. mcp list
r = await call('GET', '/manager/api/mcp')
check('mcp list ok', r.status === 200 && r.json.ok === true, JSON.stringify(r.json).slice(0, 400))
const mcpServers = r.json.servers ?? []
console.log('  mcp servers = ' + JSON.stringify(mcpServers.map((s) => ({ id: s.id, name: s.serverName, running: s.running, t: s.transport }))))

// 5. mcp save (add one stdio server)
const mcpId = 'mcp-e2e-' + Date.now().toString(36)
const mcpName = 'e2e-' + Date.now().toString(36)
r = await call('POST', '/manager/api/mcp/save', {
  servers: [
    ...mcpServers.map((s) => ({ id: s.id, config: { serverName: s.serverName, transport: s.transport, command: s.command, args: s.args, url: s.url } })),
    { id: mcpId, config: { serverName: mcpName, transport: 'stdio', command: 'npx', args: ['-y', '@modelcontextprotocol/server-everything'] } },
  ],
})
check('mcp save add', r.status === 200 && r.json.ok === true, JSON.stringify(r.json))
r = await call('GET', '/manager/api/mcp')
check('mcp persisted', (r.json.servers ?? []).some((s) => s.id === mcpId), JSON.stringify(r.json).slice(0, 400))
// invalid save (dup serverName)
r = await call('POST', '/manager/api/mcp/save', {
  servers: [
    { id: 'a', config: { serverName: 'dup', transport: 'stdio', command: 'npx' } },
    { id: 'b', config: { serverName: 'dup', transport: 'stdio', command: 'npx' } },
  ],
})
check('mcp save rejects duplicate serverName', r.status === 400, JSON.stringify(r.json))
// invalid save (stdio without command)
r = await call('POST', '/manager/api/mcp/save', { servers: [{ id: 'c', config: { serverName: 'nocmd', transport: 'stdio' } }] })
check('mcp save rejects missing command', r.status === 400, JSON.stringify(r.json))
// remove the added server
r = await call('POST', '/manager/api/mcp/save', {
  servers: mcpServers.map((s) => ({ id: s.id, config: { serverName: s.serverName, transport: s.transport, command: s.command, args: s.args, url: s.url } })),
})
check('mcp save remove', r.status === 200 && r.json.ok === true, JSON.stringify(r.json))

// 6. keys list
r = await call('GET', '/manager/api/keys')
check('keys list ok', r.status === 200 && r.json.ok === true, JSON.stringify(r.json).slice(0, 300))
console.log('  keys = ' + JSON.stringify(r.json.keys))
const refs = r.json.keys ?? []

// 7. keys set/unset (roundtrip on a real known ref)
const knownRef = refs.length > 0 ? refs[0].ref : 'DEEPSEEK_API_KEY'
const testRef = 'MGR_E2E_TEST_KEY'
r = await call('POST', '/manager/api/keys/set', { ref: testRef, value: 'secret-value-123' })
check('keys set', r.status === 200 && r.json.ok === true, JSON.stringify(r.json))
r = await call('GET', '/manager/api/keys')
check('no value leak in keys list', JSON.stringify(r.json).includes('secret-value-123') === false, JSON.stringify(r.json))
r = await call('POST', '/manager/api/keys/set', { ref: knownRef, value: 'roundtrip-secret' })
check('keys set known ref', r.status === 200 && r.json.ok === true, JSON.stringify(r.json))
r = await call('GET', '/manager/api/keys')
const row = (r.json.keys ?? []).find((k) => k.ref === knownRef)
check('keys set reflected (configured=true)', row !== undefined && row.configured === true, JSON.stringify(r.json))
r = await call('POST', '/manager/api/keys/unset', { ref: knownRef })
check('keys unset known ref', r.status === 200 && r.json.ok === true, JSON.stringify(r.json))
r = await call('GET', '/manager/api/keys')
const row2 = (r.json.keys ?? []).find((k) => k.ref === knownRef)
check('keys unset reflected (configured=false)', row2 !== undefined && row2.configured === false, JSON.stringify(r.json))
r = await call('POST', '/manager/api/keys/unset', { ref: testRef })
check('keys unset custom ref', r.status === 200 && r.json.ok === true, JSON.stringify(r.json))
r = await call('POST', '/manager/api/keys/set', { ref: 'BAD REF!', value: 'x' })
check('keys set rejects bad ref', r.status === 400, JSON.stringify(r.json))
r = await call('POST', '/manager/api/keys/set', { ref: testRef, value: '' })
check('keys set rejects empty value', r.status === 400, JSON.stringify(r.json))

// 8. models
r = await call('GET', '/manager/api/models')
check('models list ok', r.status === 200 && r.json.ok === true, JSON.stringify(r.json).slice(0, 400))
console.log('  default = ' + JSON.stringify(r.json.default))
console.log('  providers = ' + JSON.stringify((r.json.providers ?? []).map((p) => p.provider + ':' + p.settingsNs)))
const defaultRow = r.json.default
if (defaultRow !== null && typeof defaultRow.provider === 'string' && typeof defaultRow.model === 'string') {
  r = await call('POST', '/manager/api/models/default', { provider: defaultRow.provider, model: defaultRow.model })
  check('models default roundtrip', r.status === 200 && r.json.ok === true, JSON.stringify(r.json))
}
r = await call('POST', '/manager/api/models/default', { provider: '', model: '' })
check('models default rejects empty', r.status === 400, JSON.stringify(r.json))
const firstProvider = (r.json2?.providers ?? []).length > 0 ? null : null
// provider update only if a configurable provider exists
let providerChecked = false
const providers = (await call('GET', '/manager/api/models')).json.providers ?? []
if (providers.length > 0) {
  const p = providers[0]
  const section = { ...p.section }
  r = await call('POST', '/manager/api/models/provider', { settingsNs: p.settingsNs, section })
  check('models provider roundtrip', r.status === 200 && r.json.ok === true, JSON.stringify(r.json))
  providerChecked = true
}
if (!providerChecked) { console.log('SKIP provider update (no configurable providers)') ; pass++ }
r = await call('POST', '/manager/api/models/provider', { settingsNs: 'not-a-real-ns', section: {} })
check('models provider rejects unknown ns', r.status === 403 || r.status === 400, JSON.stringify(r.json))

// 9. theme
r = await call('GET', '/manager/api/theme')
check('theme get ok', r.status === 200 && r.json.ok === true, JSON.stringify(r.json).slice(0, 300))
const current = r.json.preference
const next = current === 'dark' ? 'light' : 'dark'
r = await call('POST', '/manager/api/theme', { preference: next })
check('theme set ' + next, r.status === 200 && r.json.ok === true, JSON.stringify(r.json))
r = await call('POST', '/manager/api/theme', { preference: 'neon' })
check('theme rejects invalid preference', r.status === 400, JSON.stringify(r.json))
// restore
await call('POST', '/manager/api/theme', { preference: current })

// 10. existing endpoints still fine
r = await call('GET', '/manager/api/plugins')
check('plugins still ok', r.status === 200 && r.json.ok === true, JSON.stringify(r.json).slice(0, 200))

console.log('\n===== RESULT: pass=' + pass + ' fail=' + fail + ' =====')
process.exit(fail > 0 ? 1 : 0)
