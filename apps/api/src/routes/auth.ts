import { randomBytes } from 'node:crypto'

import { sessions } from '@shiftpane/db'
import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'

import {
  createSession,
  endBrowserSession,
  hashToken,
  requireUser,
  SESSION_COOKIE,
  sessionCookie,
  startBrowserSession,
  upsertDevUser,
  upsertGitHubUser,
} from '../auth.ts'
import type { AppEnv, Deps } from '../context.ts'
import { parseJson } from './body.ts'

const STATE_COOKIE = 'sp_oauth'

const devForm = z.object({
  login: z.string().regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38})$/),
  role: z.enum(['', 'author', 'reviewer', 'admin']).optional(),
  next: z.string().optional(),
})

/** A path on the site to go back to after signing in; anything else goes to the dashboard. */
const safeNext = (next: string | undefined) =>
  next && /^\/(?!\/)[\w\-./?=&%]*$/.test(next) ? next : '/dashboard'

/**
 * GitHub sign-in (PLAN, Auth). The site reaches these through its `/api` rewrite, so the callback
 * is on the site's origin and the session cookie is first-party. Until the GitHub OAuth app exists
 * (its client id and secret are unset), sign-in answers 503 and everything else still works.
 */
export function authRoutes(deps: Deps) {
  const app = new Hono<AppEnv>()
  const redirectUri = `${deps.config.siteOrigin}/api/v1/auth/github/callback`

  const github = () => {
    if (!deps.github) throw new HTTPException(503, { message: "Sign-in isn't set up yet." })
    return deps.github
  }

  app.get('/auth/github', (c) => {
    const state = randomBytes(16).toString('base64url')
    const next = safeNext(c.req.query('next'))
    setCookie(c, STATE_COOKIE, `${state}:${next}`, {
      ...sessionCookie(deps, 600),
      path: '/api/v1/auth',
    })
    return c.redirect(github().authorizeUrl(state, redirectUri))
  })

  app.get('/auth/github/callback', async (c) => {
    const client = github()
    const [state, next] = (getCookie(c, STATE_COOKIE) ?? '').split(/:(.*)/s)
    deleteCookie(c, STATE_COOKIE, { path: '/api/v1/auth' })
    const code = c.req.query('code')
    if (!state || state !== c.req.query('state') || !code) {
      return c.redirect(`${deps.config.siteOrigin}/dashboard?signin=expired`)
    }
    const token = await client.exchangeCode(code, redirectUri)
    const user = await upsertGitHubUser(deps, await client.user(token))
    await startBrowserSession(c, deps, user.id)
    return c.redirect(`${deps.config.siteOrigin}${safeNext(next)}`)
  })

  // Local only (see `devSignIn` in config.ts): the site's dev sign-in form posts here.
  if (deps.config.devSignIn) {
    app.post('/auth/dev', async (c) => {
      const form = devForm.safeParse(await c.req.parseBody())
      if (!form.success) throw new HTTPException(400, { message: 'Give a GitHub-style login.' })
      const user = await upsertDevUser(deps, form.data.login, form.data.role || undefined)
      await startBrowserSession(c, deps, user.id)
      return c.redirect(`${deps.config.siteOrigin}${safeNext(form.data.next)}`, 303)
    })
  }

  app.post('/auth/logout', async (c) => {
    const bearer = c.req.header('authorization')?.match(/^Bearer\s+(\S+)$/i)?.[1]
    const token = bearer ?? getCookie(c, SESSION_COOKIE)
    if (token) await deps.db.delete(sessions).where(eq(sessions.id, hashToken(token)))
    endBrowserSession(c)
    return c.body(null, 204)
  })

  // The desktop app and the CLI: show the user a code, then poll until they enter it on GitHub.
  app.post('/device-code', async (c) => c.json(await github().startDevice()))

  app.post('/device-code/token', async (c) => {
    const { deviceCode } = await parseJson(c, z.object({ deviceCode: z.string().min(1).max(200) }))
    const poll = await github().pollDevice(deviceCode)
    if (poll.status !== 'done') return c.json(poll, poll.status === 'failed' ? 400 : 202)
    const user = await upsertGitHubUser(deps, await github().user(poll.token))
    const session = await createSession(deps, user.id, 'device')
    return c.json({ status: 'done', token: session.token, user: { login: user.login } })
  })

  app.get('/me', (c) => {
    const user = requireUser(c)
    return c.json({
      user: {
        login: user.login,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
    })
  })

  return app
}
