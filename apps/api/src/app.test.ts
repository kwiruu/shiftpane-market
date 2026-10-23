import { readdirSync, readFileSync } from 'node:fs'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { packPackage } from '@shiftpane/checks'
import { connect, migrateDb } from '@shiftpane/db'
import type { Widget } from '@shiftpane/format'
import { generateKeyPair, type RegistryIndex, verifyBytes } from '@shiftpane/index'
import { FsStorage } from '@shiftpane/storage'
import { afterEach, describe, expect, it } from 'vitest'

import { createApp } from './app.ts'
import type { Config } from './config.ts'
import type { Deps } from './context.ts'
import { publishFirstParty } from './first-party.ts'
import type { GitHub, GitHubUser } from './github.ts'

const site = 'http://localhost:3000'

// biome-ignore lint/suspicious/noExplicitAny: the tests read responses field by field
type Body = any
const body = async (response: Response | Promise<Response>): Promise<Body> =>
  (await response).json()
const firstParty = join(import.meta.dirname, '../../../first-party')

const profiles: Record<string, GitHubUser> = {
  octocat: {
    id: 583231,
    login: 'octocat',
    name: 'The Octocat',
    bio: 'Mascot',
    avatarUrl: null,
    createdAt: new Date('2011-01-25'),
  },
  kwiruu: {
    id: 1001,
    login: 'kwiruu',
    name: 'Keiru',
    bio: null,
    avatarUrl: null,
    createdAt: new Date('2019-05-01'),
  },
  mona: {
    id: 1002,
    login: 'mona',
    name: null,
    bio: null,
    avatarUrl: null,
    createdAt: new Date('2020-01-01'),
  },
}

/** GitHub as the tests need it: the code is the login, and device code `ok` is approved. */
const fakeGitHub: GitHub = {
  authorizeUrl: (state) => `https://github.test/authorize?state=${state}`,
  exchangeCode: async (code) => `token-${code}`,
  user: async (token) => {
    const profile = profiles[token.slice('token-'.length)]
    if (!profile) throw new Error('unknown token')
    return profile
  },
  startDevice: async () => ({
    deviceCode: 'ok',
    userCode: 'ABCD-1234',
    verificationUri: 'https://github.com/login/device',
    expiresIn: 900,
    interval: 5,
  }),
  pollDevice: async (code) =>
    code === 'ok' ? { status: 'done', token: 'token-octocat' } : { status: 'pending' },
}

const cleanup: (() => Promise<void>)[] = []
afterEach(async () => {
  for (const close of cleanup.splice(0)) await close()
})

async function setup({ github = true, devSignIn = true } = {}) {
  const url = 'pglite:memory'
  const { db, close } = await connect(url)
  cleanup.push(close)
  await migrateDb(db, url)
  const keys = generateKeyPair()
  const config: Config = {
    port: 0,
    production: false,
    databaseUrl: url,
    siteOrigin: site,
    registryUrl: 'http://localhost:8787/registry',
    signingKey: keys.privateKey,
    adminLogins: ['kwiruu'],
    devSignIn,
  }
  const storage = new FsStorage(await mkdtemp(join(tmpdir(), 'registry-')), config.registryUrl)
  const deps: Deps = { db, storage, config, github: github ? fakeGitHub : undefined }
  const app = createApp(deps)

  const call = (path: string, init: RequestInit & { cookie?: string } = {}) => {
    const headers = new Headers(init.headers)
    if (init.cookie) {
      headers.set('Cookie', init.cookie)
      headers.set('Origin', site)
    }
    return app.request(path, { ...init, headers })
  }
  const json = (path: string, body: unknown, cookie?: string) =>
    call(path, {
      method: 'POST',
      cookie,
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })

  /** Signs in through the GitHub flow and returns the session cookie. */
  const signIn = async (login: string) => {
    const start = await call('/api/v1/auth/github?next=/upload')
    expect(start.status).toBe(302)
    const state = new URL(start.headers.get('location') ?? '').searchParams.get('state')
    const oauth = start.headers.getSetCookie()[0]?.split(';')[0] ?? ''
    const callback = await call(`/api/v1/auth/github/callback?code=${login}&state=${state}`, {
      headers: { Cookie: oauth },
    })
    expect(callback.headers.get('location')).toBe(`${site}/upload`)
    const session = callback.headers.getSetCookie().find((c) => c.startsWith('sp_session='))
    expect(session).toBeDefined()
    return session?.split(';')[0] ?? ''
  }

  const upload = (zip: Uint8Array, cookie: string, notes = 'First release.') => {
    const form = new FormData()
    form.set('package', new Blob([zip.slice()], { type: 'application/zip' }), 'widget.zip')
    form.set('notes', notes)
    return call('/api/v1/uploads', { method: 'POST', body: form, cookie })
  }

  const file = async (key: string) => storage.read(key)
  return { app, deps, keys, call, json, signIn, upload, file }
}

/** gpu-ring, renamed to octo-ring and authored by octocat. */
function octoRing(edit: (manifest: Record<string, unknown>) => void = () => {}) {
  const dir = join(firstParty, 'gpu-ring')
  const files: Record<string, string> = Object.fromEntries(
    readdirSync(dir).map((name) => [name, readFileSync(join(dir, name), 'utf8')]),
  )
  const manifest = JSON.parse(files['manifest.json'] ?? '{}')
  Object.assign(manifest, { id: 'octo-ring', author: 'octocat', version: '1.0.0' })
  edit(manifest)
  files['manifest.json'] = JSON.stringify(manifest)
  return packPackage(files)
}

/** github-stars, which has a collector, renamed to octo-stars and authored by octocat. */
function octoStars(edit: (manifest: Record<string, unknown>) => void = () => {}) {
  const dir = join(firstParty, 'github-stars')
  const files: Record<string, string> = Object.fromEntries(
    readdirSync(dir).map((name) => [name, readFileSync(join(dir, name), 'utf8')]),
  )
  const manifest = JSON.parse(files['manifest.json'] ?? '{}')
  Object.assign(manifest, { id: 'octo-stars', author: 'octocat', version: '1.0.0' })
  edit(manifest)
  files['manifest.json'] = JSON.stringify(manifest)
  return packPackage(files)
}

describe('the public API', () => {
  it('serves an empty gallery and its health', async () => {
    const { call } = await setup()
    expect(await body(call('/api/v1/health'))).toEqual({ ok: true })
    expect(await body(call('/api/v1/widgets'))).toEqual({ widgets: [] })
    expect((await call('/api/v1/widgets/nope')).status).toBe(404)
    expect((await call('/api/v1/nowhere')).status).toBe(404)
  })

  it('lets only the gallery be cached, never an account', async () => {
    const { call, signIn } = await setup()
    const cookie = await signIn('octocat')
    expect((await call('/api/v1/widgets')).headers.get('cache-control')).toBe('public, max-age=30')
    expect((await call('/api/v1/authors')).headers.get('cache-control')).toBe('public, max-age=30')
    for (const path of ['/api/v1/me', '/api/v1/me/widgets', '/api/v1/widgets/nope']) {
      expect((await call(path, { cookie })).headers.get('cache-control')).toBe('private, no-store')
    }
  })
})

describe('sign-in', () => {
  it('signs in with GitHub, and makes admins of ADMIN_LOGINS', async () => {
    const { call, signIn } = await setup()
    const octocat = await signIn('octocat')
    const admin = await signIn('kwiruu')
    expect((await body(call('/api/v1/me', { cookie: octocat }))).user.role).toBe('author')
    expect((await body(call('/api/v1/me', { cookie: admin }))).user.role).toBe('admin')
    expect((await call('/api/v1/me')).status).toBe(401)
  })

  it('refuses a callback whose state does not match', async () => {
    const { call } = await setup()
    const response = await call('/api/v1/auth/github/callback?code=octocat&state=forged')
    expect(response.headers.get('location')).toBe(`${site}/dashboard?signin=expired`)
    expect(response.headers.getSetCookie().some((c) => c.startsWith('sp_session='))).toBe(false)
  })

  it('answers 503 until the GitHub OAuth app is set up', async () => {
    const { call } = await setup({ github: false })
    expect((await call('/api/v1/auth/github')).status).toBe(503)
    expect((await call('/api/v1/device-code', { method: 'POST' })).status).toBe(503)
  })

  it('logs out, clearing the hint the header reads', async () => {
    const { call, signIn } = await setup()
    const cookie = await signIn('octocat')
    const response = await call('/api/v1/auth/logout', { method: 'POST', cookie })
    expect(response.status).toBe(204)
    const cleared = response.headers.getSetCookie()
    expect(cleared.some((c) => c.startsWith('sp_session=;'))).toBe(true)
    expect(cleared.some((c) => c.startsWith('sp_signed_in=;'))).toBe(true)
    expect((await call('/api/v1/me', { cookie })).status).toBe(401)
  })

  it('signs in as anyone locally, with the role asked for', async () => {
    const { call } = await setup()
    const devSignIn = (fields: Record<string, string>, cookie?: string) =>
      call('/api/v1/auth/dev', {
        method: 'POST',
        cookie,
        body: new URLSearchParams(fields),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
    const response = await devSignIn({ login: 'alice', role: 'reviewer', next: '/admin' })
    expect(response.status).toBe(303)
    expect(response.headers.get('location')).toBe(`${site}/admin`)
    const cookies = response.headers.getSetCookie()
    expect(cookies.find((c) => c.startsWith('sp_signed_in=1'))).not.toContain('HttpOnly')
    const cookie = cookies.find((c) => c.startsWith('sp_session='))?.split(';')[0] ?? ''
    expect((await body(call('/api/v1/me', { cookie }))).user).toMatchObject({
      login: 'alice',
      role: 'reviewer',
    })
    expect((await call('/api/v1/admin/queue', { cookie })).status).toBe(200)

    // Signing in again without a role keeps the one it has; a bad login is refused.
    await devSignIn({ login: 'alice' }, cookie)
    expect((await body(call('/api/v1/me', { cookie }))).user.role).toBe('reviewer')
    expect((await devSignIn({ login: '-nope' })).status).toBe(400)
  })

  it('has no local sign-in unless the config allows it', async () => {
    const { call } = await setup({ devSignIn: false })
    const response = await call('/api/v1/auth/dev', {
      method: 'POST',
      body: new URLSearchParams({ login: 'alice', role: 'admin' }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    expect(response.status).toBe(404)
  })

  it('gives the desktop app a bearer token through the device flow', async () => {
    const { call, json } = await setup()
    const start = await body(call('/api/v1/device-code', { method: 'POST' }))
    expect(start.userCode).toBe('ABCD-1234')
    expect((await json('/api/v1/device-code/token', { deviceCode: 'wait' })).status).toBe(202)
    const done = await body(json('/api/v1/device-code/token', { deviceCode: 'ok' }))
    expect(done.user.login).toBe('octocat')

    // A bearer token needs no Origin: it's only ever sent on purpose.
    const form = new FormData()
    form.set('package', new Blob([octoRing().slice()]), 'w.zip')
    const response = await call('/api/v1/uploads', {
      method: 'POST',
      body: form,
      headers: { Authorization: `Bearer ${done.token}` },
    })
    expect(response.status).toBe(201)
  })

  it('refuses cookie-signed writes from another origin', async () => {
    const { app, signIn } = await setup()
    const cookie = await signIn('octocat')
    const form = new FormData()
    form.set('package', new Blob([octoRing().slice()]), 'w.zip')
    const response = await app.request('/api/v1/uploads', {
      method: 'POST',
      body: form,
      headers: { Cookie: cookie, Origin: 'https://evil.example' },
    })
    expect(response.status).toBe(403)
  })
})

describe('uploading, reviewing and publishing', () => {
  it('takes a widget from upload to a signed index and the gallery', async () => {
    const { call, json, signIn, upload, file, keys } = await setup()
    const octocat = await signIn('octocat')
    const admin = await signIn('kwiruu')

    const uploaded = await upload(octoRing(), octocat)
    expect(uploaded.status).toBe(201)
    const submission = await body(uploaded)
    expect(submission).toMatchObject({
      status: 'in_review',
      widgetId: 'octo-ring',
      version: '1.0.0',
    })
    expect(submission.report.layout.result).toBe('pass')

    // Nothing is public until a person approves it.
    expect((await body(call('/api/v1/widgets'))).widgets).toEqual([])
    expect((await call('/api/v1/admin/queue', { cookie: octocat })).status).toBe(403)

    const queue = (await body(call('/api/v1/admin/queue', { cookie: admin }))).queue
    expect(queue).toHaveLength(1)
    expect(queue[0]).toMatchObject({ author: 'octocat', widgetName: 'GPU ring', icon: 'gauge' })
    expect(queue[0].version.package).toBeUndefined()
    const detail = await body(call(`/api/v1/admin/versions/${submission.id}`, { cookie: admin }))
    expect(detail.version.files.readme).toContain('GPU load')
    expect(detail).toMatchObject({ widgetName: 'GPU ring', previous: null })
    expect((await call('/api/v1/admin/versions/not-a-uuid', { cookie: admin })).status).toBe(404)

    const approved = await json(`/api/v1/admin/versions/${submission.id}/approve`, {}, admin)
    expect(approved.status).toBe(200)
    expect((await json(`/api/v1/admin/versions/${submission.id}/approve`, {}, admin)).status).toBe(
      409,
    )

    // The index is signed, lists the widget, and points at a package that is really there.
    const indexBytes = await file('index.json')
    const signature = new TextDecoder().decode(await file('index.json.sig'))
    expect(indexBytes && verifyBytes(indexBytes, signature, [keys.publicKey])).toBe(true)
    const index = JSON.parse(new TextDecoder().decode(indexBytes)) as RegistryIndex
    const entry = index.widgets[0]
    expect(entry).toMatchObject({ id: 'octo-ring', author: { login: 'octocat' }, latest: '1.0.0' })
    const published = entry?.versions['1.0.0']
    expect(published?.url).toBe(`http://localhost:8787/registry/packages/${published?.sha256}.zip`)
    expect((await file(`packages/${published?.sha256}.zip`))?.byteLength).toBe(published?.size)

    const widgets = (await body(call('/api/v1/widgets'))).widgets as Widget[]
    expect(widgets).toHaveLength(1)
    expect(widgets[0]).toMatchObject({
      id: 'octo-ring',
      author: 'octocat',
      icon: 'gauge',
      tone: 'dark',
      sizes: ['small', 'medium'],
      versions: [{ version: '1.0.0', notes: 'First release.' }],
    })
    expect(widgets[0]?.view.small).toBeDefined()
    const author = (await body(call('/api/v1/authors/octocat'))).author
    expect(author).toMatchObject({ login: 'octocat', name: 'The Octocat' })

    const mine = (await body(call('/api/v1/me/widgets', { cookie: octocat }))).submissions
    expect(mine[0]).toMatchObject({
      widgetId: 'octo-ring',
      name: 'GPU ring',
      icon: 'gauge',
      status: 'approved',
    })
    const { decided } = await body(call('/api/v1/admin/queue', { cookie: admin }))
    expect(decided).toMatchObject([
      { id: submission.id, status: 'approved', widgetName: 'GPU ring' },
    ])
  })

  it('answers a failing upload with its report and keeps nothing', async () => {
    const { call, signIn, upload } = await setup()
    const cookie = await signIn('octocat')
    const response = await upload(
      octoRing((m) => (m.author = 'someone-else')),
      cookie,
    )
    expect(response.status).toBe(422)
    expect((await body(response)).report.manifest.result).toBe('fail')
    expect((await body(call('/api/v1/me/widgets', { cookie }))).submissions).toEqual([])
  })

  it('keeps an id with its author and versions moving up', async () => {
    const { json, signIn, upload } = await setup()
    const octocat = await signIn('octocat')
    const admin = await signIn('kwiruu')
    const first = await body(upload(octoRing(), octocat))
    await json(`/api/v1/admin/versions/${first.id}/approve`, {}, admin)

    const again = await upload(octoRing(), octocat)
    expect((await body(again)).report.version.result).toBe('fail')

    const mona = await signIn('mona')
    const taken = await upload(
      octoRing((m) => (m.author = 'mona')),
      mona,
    )
    expect((await body(taken)).report.manifest.note).toContain('another author')

    const next = await upload(
      octoRing((m) => {
        m.version = '1.1.0'
        m.permissions = { sources: ['gpu', 'cpu'] }
      }),
      octocat,
    )
    expect(next.status).toBe(201)
    expect((await body(next)).report.added.result).toBe('flag')
  })

  it('rejects with a note the author can read', async () => {
    const { call, json, signIn, upload } = await setup()
    const octocat = await signIn('octocat')
    const admin = await signIn('kwiruu')
    const { id } = await body(upload(octoRing(), octocat))
    expect((await json(`/api/v1/admin/versions/${id}/reject`, {}, admin)).status).toBe(400)
    await json(`/api/v1/admin/versions/${id}/reject`, { note: 'The ring needs a label.' }, admin)
    const mine = (await body(call('/api/v1/me/widgets', { cookie: octocat }))).submissions
    expect(mine[0]).toMatchObject({ status: 'rejected', reviewerNote: 'The ring needs a label.' })
    // A rejected version number can be used again.
    expect((await upload(octoRing(), octocat)).status).toBe(201)
  })

  it('yanks into revoked.json, and only for the owner or an admin', async () => {
    const { call, json, signIn, upload, file } = await setup()
    const octocat = await signIn('octocat')
    const admin = await signIn('kwiruu')
    const mona = await signIn('mona')
    const { id } = await body(upload(octoRing(), octocat))
    await json(`/api/v1/admin/versions/${id}/approve`, {}, admin)

    const path = '/api/v1/widgets/octo-ring/versions/1.0.0/yank'
    expect((await json(path, { reason: 'mine now' }, mona)).status).toBe(403)
    expect((await json(path, {}, octocat)).status).toBe(400)
    expect((await json(path, { reason: 'Shows the wrong GPU.' }, octocat)).status).toBe(200)

    const revoked = JSON.parse(new TextDecoder().decode(await file('revoked.json')))
    expect(revoked.versions).toMatchObject([
      { id: 'octo-ring', version: '1.0.0', reason: 'Shows the wrong GPU.' },
    ])
    const index = JSON.parse(new TextDecoder().decode(await file('index.json')))
    expect(index.widgets).toEqual([])
    expect((await body(call('/api/v1/widgets'))).widgets).toEqual([])
  })

  it('takes reports from anyone signed in, for reviewers to resolve', async () => {
    const { call, json, signIn, upload } = await setup()
    const octocat = await signIn('octocat')
    const admin = await signIn('kwiruu')
    await upload(octoRing(), octocat)
    const report = { widgetId: 'octo-ring', reason: 'broken', body: 'Shows a dash.' }
    expect((await json('/api/v1/reports', report)).status).toBe(401)
    const { id } = await body(json('/api/v1/reports', report, octocat))
    const open = (await body(call('/api/v1/admin/reports', { cookie: admin }))).reports
    expect(open[0]).toMatchObject({
      id,
      status: 'open',
      widgetName: 'GPU ring',
      reporter: 'octocat',
    })
    expect((await json(`/api/v1/admin/reports/${id}/resolve`, {}, admin)).status).toBe(200)
  })
})

describe('the fast lane, install counts and verified authors', () => {
  it('publishes an update at once when it has no code and asks for nothing new', async () => {
    const { call, json, signIn, upload } = await setup()
    const octocat = await signIn('octocat')
    const admin = await signIn('kwiruu')
    // A first version always waits for a person.
    const first = await body(upload(octoRing(), octocat))
    expect(first.status).toBe('in_review')
    await json(`/api/v1/admin/versions/${first.id}/approve`, {}, admin)

    const update = await body(
      upload(
        octoRing((m) => (m.version = '1.0.1')),
        octocat,
      ),
    )
    expect(update).toMatchObject({
      status: 'approved',
      fastLane: expect.stringContaining('no code'),
    })
    const widgets = (await body(call('/api/v1/widgets'))).widgets as Widget[]
    expect(widgets[0]?.versions.map((v) => v.version)).toEqual(['1.0.1', '1.0.0'])

    // Asking for more goes back to a person.
    const more = await body(
      upload(
        octoRing((m) => {
          m.version = '1.0.2'
          m.permissions = { sources: ['gpu', 'cpu'] }
        }),
        octocat,
      ),
    )
    expect(more.status).toBe('in_review')
    expect(more.fastLane).toBeUndefined()
  })

  it("lets a verified author's code through, and only an admin verifies", async () => {
    const { call, json, signIn, upload } = await setup()
    const octocat = await signIn('octocat')
    const admin = await signIn('kwiruu')
    const first = await body(upload(octoStars(), octocat))
    await json(`/api/v1/admin/versions/${first.id}/approve`, {}, admin)

    // Code from an author nobody vouches for waits.
    const second = await body(
      upload(
        octoStars((m) => (m.version = '1.0.1')),
        octocat,
      ),
    )
    expect(second.status).toBe('in_review')
    await json(`/api/v1/admin/versions/${second.id}/approve`, {}, admin)

    const verify = (cookie: string) =>
      call('/api/v1/admin/authors/octocat', {
        method: 'PATCH',
        cookie,
        body: JSON.stringify({ verified: true }),
        headers: { 'Content-Type': 'application/json' },
      })
    const reviewer = await call('/api/v1/auth/dev', {
      method: 'POST',
      body: new URLSearchParams({ login: 'alice', role: 'reviewer' }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    const alice =
      reviewer.headers
        .getSetCookie()
        .find((c) => c.startsWith('sp_session='))
        ?.split(';')[0] ?? ''
    expect((await verify(alice)).status).toBe(403)
    expect((await verify(octocat)).status).toBe(403)
    expect((await verify(admin)).status).toBe(200)

    const third = await body(
      upload(
        octoStars((m) => (m.version = '1.0.2')),
        octocat,
      ),
    )
    expect(third).toMatchObject({
      status: 'approved',
      fastLane: expect.stringContaining('verified'),
    })
    const authors = (await body(call('/api/v1/authors'))).authors
    expect(authors).toEqual([expect.objectContaining({ login: 'octocat', verified: true })])
  })

  it('counts a first install once per address an hour, and nothing for an unknown widget', async () => {
    const { call, json, signIn, upload } = await setup()
    const octocat = await signIn('octocat')
    const admin = await signIn('kwiruu')
    const first = await body(upload(octoRing(), octocat))
    await json(`/api/v1/admin/versions/${first.id}/approve`, {}, admin)

    const installed = (id: string, address: string) =>
      call(`/api/v1/widgets/${id}/installed`, {
        method: 'POST',
        headers: { 'X-Forwarded-For': `${address}, 10.0.0.1` },
      })
    expect((await installed('octo-ring', '203.0.113.7')).status).toBe(204)
    await installed('octo-ring', '203.0.113.7')
    await installed('octo-ring', '198.51.100.2')
    expect((await installed('no-such-widget', '203.0.113.7')).status).toBe(204)
    const widgets = (await body(call('/api/v1/widgets'))).widgets as Widget[]
    expect(widgets[0]?.installs).toBe(2)
  })

  it('ends a bearer session when the app or the CLI signs out', async () => {
    const { call, json } = await setup()
    const done = await body(json('/api/v1/device-code/token', { deviceCode: 'ok' }))
    const bearer = { Authorization: `Bearer ${done.token}` }
    expect((await call('/api/v1/me', { headers: bearer })).status).toBe(200)
    expect((await call('/api/v1/auth/logout', { method: 'POST', headers: bearer })).status).toBe(
      204,
    )
    expect((await call('/api/v1/me', { headers: bearer })).status).toBe(401)
  })
})

describe('first-party widgets', () => {
  it('publish through the pipeline once, with their gallery settings', async () => {
    const { deps, call, file } = await setup()
    const published = await publishFirstParty(deps, firstParty)
    expect(published).toHaveLength(4)
    expect(await publishFirstParty(deps, firstParty)).toEqual([])

    const widgets = (await body(call('/api/v1/widgets'))).widgets as Widget[]
    expect(widgets.map((w) => w.id).sort()).toEqual([
      'github-stars',
      'gpu-ring',
      'hardware-temps',
      'pc-busy',
    ])
    expect(widgets.find((w) => w.id === 'gpu-ring')).toMatchObject({
      featured: true,
      tone: 'dark',
      icon: 'gauge',
      author: 'shiftpane',
    })
    const authors = (await body(call('/api/v1/authors'))).authors
    expect(authors).toEqual([expect.objectContaining({ login: 'shiftpane', official: true })])
    const index = JSON.parse(new TextDecoder().decode(await file('index.json')))
    expect(index.widgets).toHaveLength(4)
  })
})
