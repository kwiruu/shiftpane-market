import { FsStorage } from '@shiftpane/storage'
import { sql } from 'drizzle-orm'
import { Hono, type MiddlewareHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { secureHeaders } from 'hono/secure-headers'

import { loadSession, sameOrigin } from './auth.ts'
import type { AppEnv, Deps } from './context.ts'
import { adminRoutes } from './routes/admin.ts'
import { authRoutes } from './routes/auth.ts'
import { authorRoutes } from './routes/author.ts'
import { publicRoutes } from './routes/public.ts'

/**
 * Answers are per person unless a route says otherwise (the gallery's public reads do), so no
 * browser or CDN keeps one person's account, uploads or review queue for the next.
 */
const noStore: MiddlewareHandler<AppEnv> = async (c, next) => {
  await next()
  if (!c.res.headers.has('Cache-Control')) c.header('Cache-Control', 'private, no-store')
}

/** The API (PLAN, "API"), at `/api/v1` behind the site's rewrite. */
export function createApp(deps: Deps) {
  const app = new Hono<AppEnv>()

  app.use(secureHeaders({ crossOriginResourcePolicy: 'same-origin' }))
  app.use('/api/*', noStore, loadSession(deps), sameOrigin(deps))

  app.get('/api/v1/health', async (c) => {
    await deps.db.execute(sql`select 1`)
    return c.json({ ok: true })
  })

  const v1 = new Hono<AppEnv>()
  v1.route('/', publicRoutes(deps))
  v1.route('/', authRoutes(deps))
  v1.route('/', authorRoutes(deps))
  v1.route('/admin', adminRoutes(deps))
  app.route('/api/v1', v1)

  // Locally the registry's files are on disk, so the API serves them where Blob would.
  const { storage } = deps
  if (storage instanceof FsStorage) {
    app.get('/registry/*', async (c) => {
      const key = c.req.path.slice('/registry/'.length)
      const bytes = await storage.read(key).catch(() => undefined)
      if (!bytes) return c.json({ error: 'Not found.' }, 404)
      const type = key.endsWith('.json')
        ? 'application/json'
        : key.endsWith('.zip')
          ? 'application/zip'
          : 'text/plain'
      return c.body(new Uint8Array(bytes), 200, {
        'Content-Type': type,
        'Cache-Control': 'no-cache',
      })
    })
  }

  app.notFound((c) => c.json({ error: 'Not found.' }, 404))
  app.onError((error, c) => {
    if (error instanceof HTTPException) return c.json({ error: error.message }, error.status)
    console.error(error)
    return c.json({ error: 'Something went wrong on our side.' }, 500)
  })

  return app
}
