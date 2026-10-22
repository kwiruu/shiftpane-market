// Copies the packages the site shares with the ShiftPane app into vendor/shiftpane, so the
// gallery draws widgets with the app's own renderer and reads them with the app's own format.
//
//   pnpm sync:shiftpane           copy from ../shiftpane (or SHIFTPANE_REPO)
//   pnpm sync:shiftpane --check   fail if vendor/shiftpane differs from what a copy would give
//
// The packages are the app's source, unchanged; only their package.json is trimmed to what the
// site needs. Once they are published to npm, the site can depend on them instead.
import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const source = process.env.SHIFTPANE_REPO ?? join(root, '..', 'shiftpane')
const target = join(root, 'vendor', 'shiftpane')
const check = process.argv.includes('--check')

/** Each package, and which of its files the site uses. */
const PACKAGES = {
  'widget-sdk': { files: ['src'], exports: { '.': './src/index.ts' } },
  protocol: { files: ['src'], exports: { '.': './src/index.ts' } },
  layout: { files: ['src'], exports: { '.': './src/index.ts' } },
  board: {
    files: ['src'],
    exports: {
      '.': './src/index.ts',
      './model': './src/model.ts',
      './format': './src/format.ts',
      './parts': './src/parts.tsx',
      './board.css': './src/board.css',
    },
  },
  // Only the icons: the site has its own fonts and theme.
  ui: { files: ['src/icons.tsx', 'src/solar.tsx'], exports: { './icons': './src/icons.tsx' } },
}

const skip = (name) => /\.test\.tsx?$/.test(name)

/** Every file a copy would hold, by its path under vendor/shiftpane, with its content. */
function copy() {
  const out = new Map()
  for (const [name, { files, exports }] of Object.entries(PACKAGES)) {
    const from = join(source, 'packages', name)
    const add = (path) => {
      if (statSync(path).isDirectory()) {
        for (const entry of readdirSync(path)) add(join(path, entry))
      } else if (!skip(path)) {
        out.set(
          join(name, relative(from, path)).replaceAll('\\', '/'),
          readFileSync(path, 'utf8').replaceAll('\r\n', '\n'),
        )
      }
    }
    for (const file of files) add(join(from, file))
    const original = JSON.parse(readFileSync(join(from, 'package.json'), 'utf8'))
    const dependencies = Object.fromEntries(
      Object.entries(original.dependencies ?? {}).filter(
        ([dep]) => dep.startsWith('@shiftpane/') || dep === 'zod',
      ),
    )
    const pkg = {
      name: original.name,
      version: original.version,
      private: true,
      description: `${original.description} (copied from the ShiftPane app; see vendor/shiftpane/README.md)`,
      type: 'module',
      exports,
      ...(Object.keys(dependencies).length > 0 && { dependencies }),
      // React's types too, for the site's typecheck, which reads these files from where they are.
      ...(name === 'board' || name === 'ui'
        ? {
            peerDependencies: { react: 'catalog:' },
            devDependencies: { '@types/react': 'catalog:', react: 'catalog:' },
          }
        : {}),
    }
    out.set(`${name}/package.json`, `${JSON.stringify(pkg, null, 2)}\n`)
  }
  let commit = 'unknown'
  try {
    commit = execFileSync('git', ['-C', source, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
  } catch {}
  out.set(
    'README.md',
    `# vendor/shiftpane

Copied from [kwiruu/shiftpane](https://github.com/kwiruu/shiftpane) at \`${commit}\` by
\`pnpm sync:shiftpane\`: the widget format (\`@shiftpane/widget-sdk\`) and the widget renderer
(\`@shiftpane/board\`, with what it needs), so the gallery draws widgets exactly as the app and the
phone do. Don't edit these files here; change them in the app and copy them again.
`,
  )
  return { out, commit }
}

if (!existsSync(join(source, 'packages', 'board'))) {
  console.error(`No ShiftPane repo at ${source}. Set SHIFTPANE_REPO to its folder.`)
  process.exit(1)
}

const { out, commit } = copy()
// What's there now, leaving out the links pnpm puts in each package's node_modules.
const current = new Map()
const walk = (dir) => {
  if (!existsSync(dir)) return
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules') continue
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) walk(path)
    else current.set(relative(target, path).replaceAll('\\', '/'), readFileSync(path, 'utf8'))
  }
}
walk(target)

if (check) {
  const differs = [...new Set([...out.keys(), ...current.keys()])].filter(
    (path) => path !== 'README.md' && out.get(path) !== current.get(path),
  )
  if (differs.length > 0) {
    console.error(
      `vendor/shiftpane differs from ${source}:\n  ${differs.join('\n  ')}\nRun pnpm sync:shiftpane.`,
    )
    process.exit(1)
  }
  console.info('vendor/shiftpane matches the app')
} else {
  for (const path of current.keys()) rmSync(join(target, path))
  for (const [path, text] of out) {
    mkdirSync(dirname(join(target, path)), { recursive: true })
    writeFileSync(join(target, path), text)
  }
  console.info(`copied ${out.size} files from ShiftPane ${commit.slice(0, 7)}`)
}
