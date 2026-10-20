import { Hono, type MiddlewareHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'

import type { AppEnv, Deps } from '../context.ts'
import { listAuthors, listWidgets } from '../registry.ts'

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

  app.get('/authors', async (c) => c.json({ authors: await listAuthors(deps) }))

  app.get('/authors/:login', async (c) => {
    const [author] = await listAuthors(deps, [c.req.param('login')])
    if (!author) throw new HTTPException(404, { message: 'No such author.' })
    return c.json({ author })
  })

  return app
}
