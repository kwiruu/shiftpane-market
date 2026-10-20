import { checkPackage, manifestIdOf, openPackage } from '@shiftpane/checks'
import { reports, versions, widgets } from '@shiftpane/db'
import { packageLimits } from '@shiftpane/format'
import { and, count, eq, gt } from 'drizzle-orm'
import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'

import { requireUser } from '../auth.ts'
import type { AppEnv, Deps } from '../context.ts'
import { checkContextFor, submissionsOf, submitVersion, widgetOwner, yank } from '../registry.ts'
import { parseJson } from './body.ts'

/** Per account per day (PLAN, "Abuse limits"). */
const UPLOADS_PER_DAY = 10
const REPORTS_PER_DAY = 10

/** Uploading, the author dashboard, yanking your own versions, and reporting a widget. */
export function authorRoutes(deps: Deps) {
  const app = new Hono<AppEnv>()
  const since = () => new Date((deps.now?.() ?? new Date()).getTime() - 86_400_000)

  app.post(
    '/uploads',
    bodyLimit({
      maxSize: packageLimits.totalBytes + 64 * 1024,
      onError: () => {
        throw new HTTPException(413, { message: 'A package is at most 1 MB.' })
      },
    }),
    async (c) => {
      const user = requireUser(c)
      const [recent] = await deps.db
        .select({ n: count() })
        .from(versions)
        .where(and(eq(versions.submittedBy, user.id), gt(versions.submittedAt, since())))
      if ((recent?.n ?? 0) >= UPLOADS_PER_DAY) {
        throw new HTTPException(429, { message: `At most ${UPLOADS_PER_DAY} uploads a day.` })
      }

      const form = await c.req.formData().catch(() => undefined)
      const file = form?.get('package')
      if (!(file instanceof File)) {
        throw new HTTPException(400, { message: 'Attach the zip as the "package" field.' })
      }
      const notes = String(form?.get('notes') ?? '').trim()
      if (notes.length > 500)
        throw new HTTPException(400, { message: 'Keep the notes under 500 characters.' })

      const zip = new Uint8Array(await file.arrayBuffer())
      const opened = openPackage(zip)
      const context = await checkContextFor(deps, user, manifestIdOf(opened))
      const checked = checkPackage(opened, context)
      if (!checked.passed) return c.json({ status: 'failed', report: checked.report }, 422)

      const version = await submitVersion(deps, user, opened, checked, notes, zip)
      return c.json(
        {
          status: version.status,
          id: version.id,
          widgetId: version.widgetId,
          version: version.version,
          report: version.report,
        },
        201,
      )
    },
  )

  app.get('/me/widgets', async (c) => {
    const user = requireUser(c)
    return c.json({ submissions: await submissionsOf(deps, user.id) })
  })

  app.post('/widgets/:id/versions/:version/yank', async (c) => {
    const user = requireUser(c)
    const id = c.req.param('id')
    const owner = await widgetOwner(deps, id)
    if (!owner) throw new HTTPException(404, { message: 'No such widget.' })
    if (owner !== user.id && user.role !== 'admin') {
      throw new HTTPException(403, { message: 'Only its author or an admin can yank it.' })
    }
    const { reason } = await parseJson(c, z.object({ reason: z.string().trim().min(1).max(500) }))
    const yanked = await yank(deps, id, reason, { version: c.req.param('version') })
    return c.json({ yanked })
  })

  app.post('/reports', async (c) => {
    const user = requireUser(c)
    const body = await parseJson(
      c,
      z.object({
        widgetId: z.string().min(1).max(64),
        version: z.string().max(64).optional(),
        reason: z.enum(['broken', 'misleading', 'privacy', 'malware', 'policy']),
        body: z.string().trim().min(1).max(2000),
      }),
    )
    const [recent] = await deps.db
      .select({ n: count() })
      .from(reports)
      .where(and(eq(reports.reporterId, user.id), gt(reports.createdAt, since())))
    if ((recent?.n ?? 0) >= REPORTS_PER_DAY) {
      throw new HTTPException(429, { message: `At most ${REPORTS_PER_DAY} reports a day.` })
    }
    const [widget] = await deps.db
      .select({ id: widgets.id })
      .from(widgets)
      .where(eq(widgets.id, body.widgetId))
    if (!widget) throw new HTTPException(404, { message: 'No such widget.' })
    const [report] = await deps.db
      .insert(reports)
      .values({ ...body, reporterId: user.id })
      .returning({ id: reports.id })
    return c.json({ id: report?.id }, 201)
  })

  return app
}
