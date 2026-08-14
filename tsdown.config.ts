/**
 * Standalone tsdown config for dsh-manager: the node-half lib build plus the
 * browser client bundle, mirroring the official clientBundle preset (banner/
 * footer module-loader handoff, platform externals) without the monorepo's
 * purity gate and CSS pipeline (this package uses inline styles only).
 */
import { defineConfig } from 'tsdown'

/** Resolved by the browser's loader module table (platform seed entries + react). */
const EXTERNALS = [
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-runtime',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-connection',
  'react',
  'react-dom',
]

const NODE_ENV = process.env.NODE_ENV ?? 'production'

export default defineConfig([
  {
    name: 'dsh-manager',
    entry: ['lib/types/index.js', 'lib/types/invariant.js'],
    outDir: 'lib',
    format: ['esm'],
    platform: 'node',
    target: 'es2024',
    fixedExtension: false,
    dts: false,
    clean: false,
  },
  {
    name: 'dsh-manager/client',
    entry: { client: 'lib/types/client/index.js' },
    outDir: 'lib',
    format: 'cjs',
    platform: 'browser',
    dts: false,
    sourcemap: true,
    clean: false,
    external: EXTERNALS,
    define: {
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
      'import.meta.env.MODE': JSON.stringify(NODE_ENV),
      'import.meta.env': JSON.stringify({ MODE: NODE_ENV }),
    },
    noExternal: (id) => (EXTERNALS.includes(id) ? undefined : true),
    outputOptions: {
      entryFileNames: 'client.js',
      banner: `window.__ModuleLoader__.load({ id: "dsh-manager", factory: (require) => {`,
      footer: 'return module.exports; } });',
      intro: 'var module = { exports: {} }; var exports = module.exports;',
    },
  },
])
