import { reports, reviews, users, versions, widgets } from '@shiftpane/db'
import { asc, desc, eq, getTableColumns } from 'drizzle-orm'
import { type Context, Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'

import { requireReviewer } from '../auth.ts'
import type { AppEnv, Deps } from '../context.ts'
import { publishRegistry } from '../publish.ts'
import { approveVersion, rejectVersion, widgetIcon, yank } from '../registry.ts'
import { parseJson } from './body.ts'

/** Version and report ids are uuids; anything else would reach Postgres as a syntax error. */
function uuidParam(c: Context, what: string) {
  const id = c.req.param('id') ?? ''
  if (!z.uuid().safeParse(id).success) throw new HTTPException(404, { message: `No such ${what}.` })
  return id
}

/** Every column of a version but the zip itself, which the queue never needs. */
const { package: _package, ...versionColumns } = getTableColumns(versions)

const widgetColumns = {
  name: widgets.name,
  icon: widgets.icon,
  categories: widgets.categories,
  status: widgets.status,
}

/** How the review pages name a widget. */
const widgetSummary = (widget: {
  name: string
  icon: string | null
  categories: string[]
  status: 'live' | 'yanked'
}) => ({ widgetName: widget.name, icon: widgetIcon(widget), widgetStatus: widget.status })

/** The review queue, decisions, takedowns and reports (PLAN, "Reviewer approves", "Takedown"). */
export function adminRoutes(deps: Deps) {
  const app = new Hono<AppEnv>()

  app.use(async (c, next) => {
    requireReviewer(c)
    await next()
  })

  /** What waits for a person, oldest first, and the latest decisions. */
  app.get('/queue', async (c) => {
    const waiting = await deps.db
      .select({ version: versionColumns, widget: widgetColumns, author: users.login })
      .from(versions)
      .innerJoin(widgets, eq(versions.widgetId, widgets.id))
      .innerJoin(users, eq(versions.submittedBy, users.id))
      .where(eq(versions.status, 'in_review'))
      .orderBy(asc(versions.submittedAt))
    const decided = await deps.db
      .select({
        id: versions.id,
        version: versions.version,
        status: versions.status,
        widget: widgetColumns,
        decidedAt: reviews.createdAt,
      })
      .from(reviews)
      .innerJoin(versions, eq(reviews.versionId, versions.id))
      .innerJoin(widgets, eq(versions.widgetId, widgets.id))
      .orderBy(desc(reviews.createdAt))
      .limit(20)
    return c.json({
      queue: waiting.map(({ widget, ...row }) => ({ ...row, ...widgetSummary(widget) })),
      decided: decided.map(({ widget, ...row }) => ({ ...row, ...widgetSummary(widget) })),
    })
  })

  /** One version with everything a reviewer reads, and the live version to diff against. */
  app.get('/versions/:id', async (c) => {
    const [found] = await deps.db
      .select({ version: versionColumns, widget: widgetColumns, author: users.login })
      .from(versions)
      .innerJoin(widgets, eq(versions.widgetId, widgets.id))
      .innerJoin(users, eq(versions.submittedBy, users.id))
      .where(eq(versions.id, uuidParam(c, 'version')))
    if (!found) throw new HTTPException(404, { message: 'No such version.' })
    const { widget, ...row } = found
    const live = await deps.db
      .select(versionColumns)
      .from(versions)
      .where(eq(versions.widgetId, row.version.widgetId))
      .orderBy(desc(versions.publishedAt))
    return c.json({
      ...row,
      ...widgetSummary(widget),
      previous: live.find((v) => v.status === 'approved') ?? null,
    })
  })

  const decision = z.object({ note: z.string().trim().max(2000).default('') })

  app.post('/versions/:id/approve', async (c) => {
    const { note } = await parseJson(c, decision)
    await approveVersion(deps, uuidParam(c, 'version'), requireReviewer(c), note)
    return c.json({ status: 'approved' })
  })

  app.post('/versions/:id/reject', async (c) => {
    const { note } = await parseJson(c, decision)
    await rejectVersion(deps, uuidParam(c, 'version'), requireReviewer(c), note)
    return c.json({ status: 'rejected' })
  })

  app.post('/widgets/:id/yank', async (c) => {
    const { reason } = await parseJson(c, z.object({ reason: z.string().trim().min(1).max(500) }))
    const yanked = await yank(deps, c.req.param('id'), reason, { wholeWidget: true })
    return c.json({ yanked })
  })

  /** How the gallery shows a widget; none of this is in the package. */
  app.patch('/widgets/:id', async (c) => {
    const body = await parseJson(
      c,
      z.object({
        featured: z.boolean().optional(),
        icon: z
          .string()
          .regex(/^[a-z0-9-]{1,48}$/)
          .nullable()
          .optional(),
        tone: z.enum(['dark', 'light']).nullable().optional(),
      }),
    )
    const [updated] = await deps.db
      .update(widgets)
      .set(body)
      .where(eq(widgets.id, c.req.param('id')))
      .returning({ id: widgets.id })
    if (!updated) throw new HTTPException(404, { message: 'No such widget.' })
    return c.json({ ok: true })
  })

  app.get('/reports', async (c) => {
    const rows = await deps.db
      .select({ report: reports, widgetName: widgets.name, reporter: users.login })
      .from(reports)
      .innerJoin(widgets, eq(reports.widgetId, widgets.id))
      .leftJoin(users, eq(reports.reporterId, users.id))
      .orderBy(desc(reports.createdAt))
      .limit(200)
    return c.json({
      reports: rows.map(({ report, ...names }) => ({ ...report, ...names })),
    })
  })

  app.post('/reports/:id/resolve', async (c) => {
    const [updated] = await deps.db
      .update(reports)
      .set({ status: 'resolved' })
      .where(eq(reports.id, uuidParam(c, 'report')))
      .returning({ id: reports.id })
    if (!updated) throw new HTTPException(404, { message: 'No such report.' })
    return c.json({ ok: true })
  })

  /** Rewrites the index from the database, for when a publish failed halfway. */
  app.post('/republish', async (c) => {
    const { index, revoked } = await publishRegistry(deps)
    return c.json({ widgets: index.widgets.length, revoked: revoked.versions.length })
  })

  return app
}
