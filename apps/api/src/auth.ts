import { createHash, randomBytes } from 'node:crypto'

import { sessions, users } from '@shiftpane/db'
import { and, eq, gt, isNull, ne } from 'drizzle-orm'
import type { Context, MiddlewareHandler } from 'hono'
import { getCookie } from 'hono/cookie'
import { HTTPException } from 'hono/http-exception'

import type { AppEnv, Deps, User } from './context.ts'
import type { GitHubUser } from './github.ts'

/**
 * Sessions (PLAN, Auth): a random token in an httpOnly cookie for the site, or in an
 * `Authorization: Bearer` header for the desktop app and CLI. The database keeps only its sha256,
 * so a leaked database signs nobody in.
 */

export const SESSION_COOKIE = 'sp_session'
const BROWSER_DAYS = 30
const DEVICE_DAYS = 90

export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

export async function createSession(deps: Deps, userId: string, kind: 'browser' | 'device') {
  const token = randomBytes(32).toString('base64url')
  const now = deps.now?.() ?? new Date()
  const days = kind === 'browser' ? BROWSER_DAYS : DEVICE_DAYS
  await deps.db.insert(sessions).values({
    id: hashToken(token),
    userId,
    kind,
    expiresAt: new Date(now.getTime() + days * 86_400_000),
  })
  return { token, maxAge: days * 86_400 }
}

export function sessionCookie(deps: Deps, maxAge: number) {
  return {
    httpOnly: true,
    secure: deps.config.production,
    sameSite: 'Lax' as const,
    path: '/',
    maxAge,
  }
}

/** Reads the session from the cookie or the bearer token. Never fails: no session is `null`. */
export function loadSession(deps: Deps): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    c.set('user', null)
    c.set('via', null)
    const bearer = c.req.header('authorization')?.match(/^Bearer\s+(\S+)$/i)?.[1]
    const token = bearer ?? getCookie(c, SESSION_COOKIE)
    if (token) {
      const now = deps.now?.() ?? new Date()
      const [row] = await deps.db
        .select({ user: users })
        .from(sessions)
        .innerJoin(users, eq(sessions.userId, users.id))
        .where(
          and(
            eq(sessions.id, hashToken(token)),
            gt(sessions.expiresAt, now),
            isNull(users.bannedAt),
          ),
        )
        .limit(1)
      if (row) {
        c.set('user', row.user)
        c.set('via', bearer ? 'bearer' : 'cookie')
      }
    }
    await next()
  }
}

/**
 * A cookie rides along on any request to this origin, so a write signed in by cookie has to come
 * from the site itself. Bearer tokens are only ever sent on purpose, so they skip this.
 */
export function sameOrigin(deps: Deps): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const unsafe = !['GET', 'HEAD', 'OPTIONS'].includes(c.req.method)
    const hasCookie = getCookie(c, SESSION_COOKIE) !== undefined
    if (unsafe && hasCookie && c.get('via') !== 'bearer') {
      const origin = c.req.header('origin')
      if (origin !== deps.config.siteOrigin) {
        throw new HTTPException(403, { message: 'Writes have to come from the site.' })
      }
    }
    await next()
  }
}

export function requireUser(c: Context<AppEnv>): User {
  const user = c.get('user')
  if (!user) throw new HTTPException(401, { message: 'Sign in first.' })
  return user
}

export function requireReviewer(c: Context<AppEnv>): User {
  const user = requireUser(c)
  if (user.role !== 'reviewer' && user.role !== 'admin') {
    throw new HTTPException(403, { message: 'Only reviewers can do that.' })
  }
  return user
}

/**
 * Creates or updates the user GitHub says signed in. Logins can change on GitHub, so the GitHub id
 * is what identifies someone; if another account still holds the login here, it is moved aside.
 */
export async function upsertGitHubUser(deps: Deps, profile: GitHubUser): Promise<User> {
  const { db, config } = deps
  const login = profile.login
  const [holder] = await db.select().from(users).where(eq(users.login, login)).limit(1)
  if (holder && holder.githubId !== profile.id) {
    if (holder.official)
      throw new HTTPException(409, { message: `The login ${login} is reserved.` })
    await db
      .update(users)
      .set({ login: `${holder.login}~${holder.githubId ?? holder.id}` })
      .where(and(eq(users.id, holder.id), ne(users.official, true)))
  }

  const admin = config.adminLogins.includes(login.toLowerCase())
  const values = {
    githubId: profile.id,
    login,
    name: profile.name,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,
    githubCreatedAt: profile.createdAt,
  }
  const [user] = await db
    .insert(users)
    .values({ ...values, ...(admin ? { role: 'admin' as const } : {}) })
    .onConflictDoUpdate({
      target: users.githubId,
      set: { ...values, ...(admin ? { role: 'admin' as const } : {}) },
    })
    .returning()
  if (!user) throw new Error('The user was not saved')
  if (user.bannedAt) throw new HTTPException(403, { message: 'This account is banned.' })
  return user
}
