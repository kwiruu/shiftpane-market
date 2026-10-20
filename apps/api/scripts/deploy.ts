import { execFileSync } from 'node:child_process'
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { bundle } from './build.ts'

/**
 * Deploys the API to Heroku without git: bundles it, packs the bundle with the migrations and the
 * first-party widgets into a tarball, uploads that as a source blob and starts a build (Heroku's
 * Build API). Heroku then runs the release phase (migrations) and restarts the dyno.
 *
 *   HEROKU_API_KEY=… HEROKU_APP=shiftpane-api pnpm --filter @shiftpane/api deploy:heroku
 *
 * `--stage <dir>` only writes the slug's files to `<dir>`, to run them locally first.
 */

const root = join(import.meta.dirname, '..')
const repo = join(root, '..', '..')

/** The files the dyno gets: no node_modules, since the bundle carries everything. */
export function stage(dir: string) {
  rmSync(dir, { recursive: true, force: true })
  cpSync(join(root, 'dist'), join(dir, 'dist'), { recursive: true })
  cpSync(join(repo, 'packages', 'db', 'migrations'), join(dir, 'migrations'), { recursive: true })
  cpSync(join(repo, 'first-party'), join(dir, 'first-party'), { recursive: true })
  const node = readFileSync(join(repo, '.node-version'), 'utf8').trim().split('.')[0]
  const manifest = {
    name: 'shiftpane-api',
    private: true,
    type: 'module',
    engines: { node: `${node}.x` },
    scripts: { start: 'node --enable-source-maps dist/server.js' },
  }
  writeFileSync(join(dir, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  writeFileSync(
    join(dir, 'Procfile'),
    'release: node dist/migrate.js\nweb: node --enable-source-maps dist/server.js\n',
  )
}

async function heroku<T>(path: string, init: RequestInit = {}): Promise<T> {
  const key = process.env.HEROKU_API_KEY
  if (!key) throw new Error('HEROKU_API_KEY is not set')
  const response = await fetch(`https://api.heroku.com${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.heroku+json; version=3',
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })
  const body = (await response.json()) as T & { message?: string }
  if (!response.ok) throw new Error(`Heroku ${path} answered ${response.status}: ${body.message}`)
  return body
}

interface Source {
  source_blob: { get_url: string; put_url: string }
}

interface Build {
  id: string
  status: 'pending' | 'succeeded' | 'failed'
  output_stream_url: string
}

async function deploy(app: string) {
  const dir = mkdtempSync(join(tmpdir(), 'shiftpane-api-'))
  const slug = join(dir, 'slug')
  stage(slug)
  const tarball = join(dir, 'source.tgz')
  execFileSync('tar', ['-czf', tarball, '-C', slug, '.'])

  const { source_blob: blob } = await heroku<Source>(`/apps/${app}/sources`, { method: 'POST' })
  const upload = await fetch(blob.put_url, { method: 'PUT', body: readFileSync(tarball) })
  if (!upload.ok) throw new Error(`Uploading the source answered ${upload.status}`)

  const commit = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: repo })
    .toString()
    .trim()
  const build = await heroku<Build>(`/apps/${app}/builds`, {
    method: 'POST',
    body: JSON.stringify({ source_blob: { url: blob.get_url, version: commit } }),
  })
  console.info(`Building ${commit} on ${app}…`)
  try {
    const output = await fetch(build.output_stream_url)
    if (output.body) for await (const chunk of output.body) process.stdout.write(chunk)
  } catch {
    // Some networks can't reach the log stream; the build runs either way.
    console.info(`Can't stream the build log; it's at ${build.output_stream_url}`)
  }

  let status = build.status
  while (status === 'pending') {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    status = (await heroku<Build>(`/apps/${app}/builds/${build.id}`)).status
  }
  rmSync(dir, { recursive: true, force: true })
  if (status !== 'succeeded') throw new Error(`The build ${status}`)
  console.info('Built. The release phase migrates the database, then the dyno restarts.')
}

const args = process.argv.slice(2)
await bundle()
if (args[0] === '--stage') {
  stage(args[1] ?? join(root, '.slug'))
  console.info(`Staged in ${args[1] ?? join(root, '.slug')}`)
} else {
  await deploy(process.env.HEROKU_APP ?? 'shiftpane-api')
}
