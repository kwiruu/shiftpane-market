import { widgets } from '@shiftpane/db'
import { and, eq, sql } from 'drizzle-orm'
import { Hono, type MiddlewareHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'

import type { AppEnv, Deps } from '../context.ts'
import { listAuthors, listWidgets } from '../registry.ts'

/** One count per address and widget an hour is plenty; more is someone pressing install in a loop. */
const COUNT_EVERY_MS = 3_600_000
const counted = new Map<string, number>()

/**
 * What the site's gallery reads. Short caching: the site revalidates its pages from these. Only
 * these paths are cacheable; everything else under /api is per person (see `noStore` in app.ts).
 */
export function publicRoutes(deps: Deps) {
  const app = new Hono<AppEnv>()

  const cacheable: MiddlewareHandler<AppEnv> = async (c, next) => {
    await next()
    if (c.req.method === 'GET' && c.res.status === 200) {
      c.header('Cache-Control', 'public, max-age=30')
    }
  }
  for (const path of ['/widgets', '/widgets/:id', '/authors', '/authors/:login']) {
    app.use(path, cacheable)
  }

  app.get('/widgets', async (c) => c.json({ widgets: await listWidgets(deps) }))

  app.get('/widgets/:id', async (c) => {
    const [widget] = await listWidgets(deps, [c.req.param('id')])
    if (!widget) throw new HTTPException(404, { message: 'No such widget.' })
    return c.json({ widget })
  })

  // The desktop app's report of a first install from the marketplace. It carries nothing but the
  // widget's id; the address only keeps one install from being counted many times, and is
  // forgotten within the hour.
  app.post('/widgets/:id/installed', async (c) => {
    const id = c.req.param('id')
    const address = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const key = `${address} ${id}`
    const now = Date.now()
    for (const [old, at] of counted) if (now - at > COUNT_EVERY_MS) counted.delete(old)
    if (!counted.has(key)) {
      counted.set(key, now)
      await deps.db
        .update(widgets)
        .set({ installs: sql`${widgets.installs} + 1` })
        .where(and(eq(widgets.id, id), eq(widgets.status, 'live')))
    }
    return c.body(null, 204)
  })

  app.get('/authors', async (c) => c.json({ authors: await listAuthors(deps) }))

  app.get('/authors/:login', async (c) => {
    const [author] = await listAuthors(deps, [c.req.param('login')])
    if (!author) throw new HTTPException(404, { message: 'No such author.' })
    return c.json({ author })
  })

  return app
}
