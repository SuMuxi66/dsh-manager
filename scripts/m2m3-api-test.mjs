const BASE = process.env.BASE ?? 'http://127.0.0.1:8080'
let pass = 0
let fail = 0

async function call(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
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

// 2. skill detail
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

// 3. skill install (paste form)
const tname = 'mgr-e2e-test-' + Date.now().toString(36)
r = await call('POST', '/manager/api/skills/install', {
  name: tname,
  content: '---\nname: ' + tname + '\ndescription: e2e test skill\n---\n\n# Usage\nJust a test.',
})
check('skill install', r.status === 200 && r.json.ok === true, JSON.stringify(r.json))
r = await call('GET', '/manager/api/skills')
check('skill visible after install', (r.json.skills ?? []).some((s) => s.name === tname), JSON.stringify(r.json).slice(0, 300))
r = await call('POST', '/manager/api/skills/install', { name: '../evil', content: 'x' })
check('skill install rejects traversal', r.status === 400, JSON.stringify(r.json))

// 4. skill import (md file): frontmatter name wins
const importContent = '---\nname: my-imported-helper\ndescription: imported via md\n---\n\n# Help\nDo things.'
r = await call('POST', '/manager/api/skills/import', { filename: 'whatever.md', content: importContent })
check('skill import uses frontmatter name', r.status === 200 && r.json.ok === true && r.json.name === 'my-imported-helper', JSON.stringify(r.json))
r = await call('GET', '/manager/api/skills')
check('imported skill visible', (r.json.skills ?? []).some((s) => s.name === 'my-imported-helper'), JSON.stringify(r.json).slice(0, 300))
// import without frontmatter: filename fallback
const fallbackName = 'file-fallback-' + Date.now().toString(36)
r = await call('POST', '/manager/api/skills/import', { filename: fallbackName + '.md', content: '# No frontmatter here' })
check('skill import falls back to filename', r.status === 200 && r.json.ok === true && r.json.name === fallbackName, JSON.stringify(r.json))
// imported skills land in <DSH_HOME>/skills (user-dsh root)
const dshHome = process.env.DSH_HOME ?? ''
const dshSkills = dshHome !== '' ? dshHome + '\\skills' : null
if (dshSkills !== null) {
  const fs = await import('node:fs')
  check('imported skill on disk under DSH_HOME/skills', fs.existsSync(dshSkills + '\\my-imported-helper\\SKILL.md'), dshSkills)
} else {
  console.log('SKIP disk path check (DSH_HOME not set)'); pass++
}
// import with weird name normalization
r = await call('POST', '/manager/api/skills/import', { filename: 'My Cool Skill!.md', content: '---\nname: "My Cool Skill!"\ndescription: x\n---\nbody' })
check('skill import normalizes name', r.status === 200 && r.json.ok === true && /^[a-z0-9][a-z0-9._-]*$/.test(r.json.name ?? ''), JSON.stringify(r.json))
// import empty content
r = await call('POST', '/manager/api/skills/import', { filename: 'empty.md', content: '' })
check('skill import rejects empty content', r.status === 400, JSON.stringify(r.json))
// cleanup imported + installed
for (const name of ['my-imported-helper', fallbackName, tname]) {
  await call('POST', '/manager/api/skills/uninstall', { name })
}
r = await call('GET', '/manager/api/skills')
check('cleanup done', !(r.json.skills ?? []).some((s) => s.name === 'my-imported-helper' || s.name === fallbackName || s.name === tname), JSON.stringify(r.json).slice(0, 200))

// 5. mcp list
r = await call('GET', '/manager/api/mcp')
check('mcp list ok', r.status === 200 && r.json.ok === true, JSON.stringify(r.json).slice(0, 400))
const mcpServers = r.json.servers ?? []

// 6. mcp save (add stdio server) + remove
const mcpId = 'mcp-e2e-' + Date.now().toString(36)
const mcpName = 'e2e-' + Date.now().toString(36)
r = await call('POST', '/manager/api/mcp/save', {
  servers: [
    ...mcpServers.map((s) => ({ id: s.id, config: { serverName: s.serverName, transport: s.transport, command: s.command, args: s.args, url: s.url } })),
    { id: mcpId, config: { serverName: mcpName, transport: 'stdio', command: 'npx', args: ['-y', '@modelcontextprotocol/server-everything'] } },
  ],
})
check('mcp save add', r.status === 200 && r.json.ok === true, JSON.stringify(r.json))
r = await call('POST', '/manager/api/mcp/save', {
  servers: mcpServers.map((s) => ({ id: s.id, config: { serverName: s.serverName, transport: s.transport, command: s.command, args: s.args, url: s.url } })),
})
check('mcp save remove', r.status === 200 && r.json.ok === true, JSON.stringify(r.json))

// 7. mcp market (Smithery store)
r = await call('GET', '/manager/api/mcp/market?q=github')
check('mcp market search ok', r.status === 200 && r.json.ok === true && Array.isArray(r.json.servers) && r.json.servers.length > 0, JSON.stringify(r.json).slice(0, 400))
const marketServers = r.json.servers ?? []
console.log('  market hits = ' + marketServers.length + ' first=' + (marketServers[0]?.name ?? '') + ' url=' + (marketServers[0]?.url ?? 'none'))
const withUrl = marketServers.find((s) => s.url !== null)
check('market entry has name+desc', marketServers.every((s) => typeof s.name === 'string' && s.name !== ''), JSON.stringify(marketServers[0]))
if (withUrl !== undefined) {
  // install from market
  const installName = withUrl.id
  r = await call('POST', '/manager/api/mcp/install-market', { name: installName, url: withUrl.url })
  check('mcp install-market ok', r.status === 200 && r.json.ok === true, JSON.stringify(r.json))
  r = await call('GET', '/manager/api/mcp')
  check('installed market server persisted', (r.json.servers ?? []).some((s) => s.id === 'mcp-' + installName), JSON.stringify(r.json).slice(0, 300))
  // duplicate install rejected
  r = await call('POST', '/manager/api/mcp/install-market', { name: installName, url: withUrl.url })
  check('mcp install-market rejects duplicate', r.status === 409, JSON.stringify(r.json))
  // remove it
  const after = (await call('GET', '/manager/api/mcp')).json.servers ?? []
  r = await call('POST', '/manager/api/mcp/save', {
    servers: after.filter((s) => s.id !== 'mcp-' + installName).map((s) => ({ id: s.id, config: { serverName: s.serverName, transport: s.transport, command: s.command, args: s.args, url: s.url } })),
  })
  check('installed market server removed', r.status === 200 && r.json.ok === true, JSON.stringify(r.json))
} else {
  console.log('SKIP market install (no server with remote url in results)')
  pass++
}
// validation
r = await call('POST', '/manager/api/mcp/install-market', { name: 'bad name!', url: 'https://x.example/mcp' })
check('install-market rejects bad name', r.status === 400, JSON.stringify(r.json))
r = await call('POST', '/manager/api/mcp/install-market', { name: 'okname', url: 'not-a-url' })
check('install-market rejects bad url', r.status === 400, JSON.stringify(r.json))

// 8. models endpoints must be gone
r = await call('GET', '/manager/api/models')
check('models endpoints removed (404)', r.status === 404, JSON.stringify(r.json))

// 9. theme
r = await call('GET', '/manager/api/theme')
check('theme get ok', r.status === 200 && r.json.ok === true, JSON.stringify(r.json).slice(0, 300))
const current = r.json.preference
const next = current === 'dark' ? 'light' : 'dark'
r = await call('POST', '/manager/api/theme', { preference: next })
check('theme set', r.status === 200 && r.json.ok === true, JSON.stringify(r.json))
await call('POST', '/manager/api/theme', { preference: current })

// 10. keys endpoints must be gone
r = await call('GET', '/manager/api/keys')
check('keys endpoints removed (404)', r.status === 404, JSON.stringify(r.json))

// 11. plugins still fine
r = await call('GET', '/manager/api/plugins')
check('plugins still ok', r.status === 200 && r.json.ok === true, JSON.stringify(r.json).slice(0, 200))

console.log('\n===== RESULT: pass=' + pass + ' fail=' + fail + ' =====')
process.exit(fail > 0 ? 1 : 0)
