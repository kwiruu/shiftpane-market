import type { CheckContext, CheckedPackage, OpenedPackage } from '@shiftpane/checks'
import { reviews, users, versions, widgets } from '@shiftpane/db'
import {
  type Author,
  addedPermissions,
  type Category,
  compareVersions,
  type Permissions,
  type ReviewStatus,
  type Widget,
} from '@shiftpane/format'
import { and, count, desc, eq, getTableColumns, inArray, sql } from 'drizzle-orm'
import { HTTPException } from 'hono/http-exception'

import type { Deps, User } from './context.ts'
import { publishRegistry, storePackage } from './publish.ts'

/**
 * The registry's operations, shared by the routes and the first-party publish script so both go
 * through the same pipeline: submit a checked package, approve or reject it, yank it, and read the
 * gallery back in the shape the site's pages already use (`Widget` in @shiftpane/format).
 */

/** What the checks need to know about the widget an upload names. */
export async function checkContextFor(
  deps: Deps,
  user: User,
  id: string | undefined,
): Promise<CheckContext> {
  const uploader = {
    login: user.login,
    official: user.official,
    githubCreatedAt: user.githubCreatedAt,
  }
  if (!id) return { uploader, now: deps.now?.() }
  const [widget] = await deps.db
    .select({ ownerLogin: users.login })
    .from(widgets)
    .innerJoin(users, eq(widgets.ownerId, users.id))
    .where(eq(widgets.id, id))
    .limit(1)
  if (!widget) return { uploader, now: deps.now?.() }
  const existing = await deps.db
    .select({
      version: versions.version,
      status: versions.status,
      permissions: versions.permissions,
    })
    .from(versions)
    .where(eq(versions.widgetId, id))
  return {
    uploader,
    existing: { ownerLogin: widget.ownerLogin, versions: existing },
    now: deps.now?.(),
  }
}

/** Saves a checked upload as a version waiting for review. */
export async function submitVersion(
  deps: Deps,
  user: User,
  opened: OpenedPackage,
  checked: CheckedPackage,
  notes: string,
  zip: Uint8Array,
) {
  const { manifest, view, sample, readme, license, collector } = checked
  if (!checked.passed || !manifest || !view || !sample) {
    throw new Error('Only a package that passed its checks can be submitted')
  }
  return deps.db.transaction(async (tx) => {
    await tx
      .insert(widgets)
      .values({
        id: manifest.id,
        ownerId: user.id,
        name: manifest.name,
        summary: manifest.description,
        categories: manifest.categories,
      })
      .onConflictDoNothing()
    const [owner] = await tx
      .select({ ownerId: widgets.ownerId })
      .from(widgets)
      .where(eq(widgets.id, manifest.id))
    if (owner?.ownerId !== user.id) {
      throw new HTTPException(409, { message: `The id ${manifest.id} belongs to another author.` })
    }
    const [version] = await tx
      .insert(versions)
      .values({
        widgetId: manifest.id,
        version: manifest.version,
        status: 'in_review',
        manifest,
        permissions: manifest.permissions,
        files: {
          view,
          sample,
          readme: readme ?? '',
          license: license ?? '',
          ...(collector ? { collector } : {}),
        },
        sha256: opened.sha256,
        size: opened.size,
        package: zip,
        hasCollector: collector !== undefined,
        notes,
        report: checked.report,
        submittedBy: user.id,
      })
      .onConflictDoNothing()
      .returning()
    if (!version) {
      throw new HTTPException(409, { message: `${manifest.version} is already uploaded.` })
    }
    return version
  })
}

async function versionById(deps: Deps, id: string) {
  const [version] = await deps.db.select().from(versions).where(eq(versions.id, id)).limit(1)
  if (!version) throw new HTTPException(404, { message: 'No such version.' })
  return version
}

/** Approved versions an author needs, none of them yanked, for the fast lane with code. */
export const TRACK_RECORD = 3

/**
 * Why an upload may skip the review queue, or null when a person has to look (PLAN, Review: the
 * fast lane). Only an update qualifies, and only when it asks for nothing the approved version
 * didn't: then either it has no code, or its author is verified or has a clean track record.
 */
export async function fastLane(
  deps: Deps,
  user: User,
  version: { widgetId: string; permissions: Permissions; hasCollector: boolean },
): Promise<string | null> {
  const approved = await deps.db
    .select({ version: versions.version, permissions: versions.permissions })
    .from(versions)
    .where(and(eq(versions.widgetId, version.widgetId), eq(versions.status, 'approved')))
  const latest = approved.sort((a, b) => compareVersions(b.version, a.version))[0]
  if (!latest) return null
  if (addedPermissions(latest.permissions, version.permissions).length > 0) return null
  if (!version.hasCollector) return 'an update with no code that asks for nothing new'
  if (user.official || user.verified) {
    return 'an update from a verified author that asks for nothing new'
  }
  const [record] = await deps.db
    .select({
      approved: count(sql`case when ${versions.status} = 'approved' then 1 end`),
      yanked: count(sql`case when ${versions.status} = 'yanked' then 1 end`),
    })
    .from(versions)
    .where(eq(versions.submittedBy, user.id))
  if ((record?.approved ?? 0) >= TRACK_RECORD && (record?.yanked ?? 0) === 0) {
    return 'an update from an author with a clean track record that asks for nothing new'
  }
  return null
}

/**
 * Publishes a version: its package goes to storage first (content-addressed, so doing it twice is
 * harmless), then the database says approved, then the index is rewritten. With no reviewer, the
 * fast lane approved it.
 */
export async function approveVersion(
  deps: Deps,
  versionId: string,
  reviewer: User | null,
  note = '',
) {
  const version = await versionById(deps, versionId)
  if (version.status !== 'in_review') {
    throw new HTTPException(409, { message: `This version is ${version.status}, not in review.` })
  }
  if (!version.package) throw new Error(`Version ${versionId} has no package to publish`)
  await storePackage(deps, version.sha256, version.package)

  const now = deps.now?.() ?? new Date()
  await deps.db.transaction(async (tx) => {
    const [updated] = await tx
      .update(versions)
      .set({ status: 'approved', publishedAt: now, package: null })
      .where(and(eq(versions.id, versionId), eq(versions.status, 'in_review')))
      .returning({ id: versions.id })
    if (!updated) throw new HTTPException(409, { message: 'Someone else decided first.' })
    await tx
      .insert(reviews)
      .values({ versionId, reviewerId: reviewer?.id ?? null, decision: 'approve', note })

    // The listing follows the newest approved version.
    const approved = await tx
      .select({ version: versions.version, manifest: versions.manifest })
      .from(versions)
      .where(and(eq(versions.widgetId, version.widgetId), eq(versions.status, 'approved')))
    const newest = approved.sort((a, b) => compareVersions(b.version, a.version))[0]
    if (newest) {
      await tx
        .update(widgets)
        .set({
          name: newest.manifest.name,
          summary: newest.manifest.description,
          categories: newest.manifest.categories,
        })
        .where(eq(widgets.id, version.widgetId))
    }
  })
  await publishRegistry(deps)
}

export async function rejectVersion(deps: Deps, versionId: string, reviewer: User, note: string) {
  if (!note.trim()) throw new HTTPException(400, { message: 'Say why, for the author.' })
  await deps.db.transaction(async (tx) => {
    const [updated] = await tx
      .update(versions)
      .set({ status: 'rejected' })
      .where(and(eq(versions.id, versionId), eq(versions.status, 'in_review')))
      .returning({ id: versions.id })
    if (!updated) throw new HTTPException(409, { message: 'This version is not in review.' })
    await tx
      .insert(reviews)
      .values({ versionId, reviewerId: reviewer.id, decision: 'reject', note })
  })
}

/** Takes approved versions out of the index and into revoked.json; every app disables them. */
export async function yank(
  deps: Deps,
  widgetId: string,
  reason: string,
  options: { version?: string; wholeWidget?: boolean },
) {
  if (!reason.trim())
    throw new HTTPException(400, { message: 'Say why: the app shows the reason.' })
  const now = deps.now?.() ?? new Date()
  const where = options.version
    ? and(
        eq(versions.widgetId, widgetId),
        eq(versions.version, options.version),
        eq(versions.status, 'approved'),
      )
    : and(eq(versions.widgetId, widgetId), eq(versions.status, 'approved'))
  const yanked = await deps.db.transaction(async (tx) => {
    const rows = await tx
      .update(versions)
      .set({ status: 'yanked', yankedAt: now, yankReason: reason })
      .where(where)
      .returning({ version: versions.version })
    if (options.wholeWidget) {
      await tx
        .update(widgets)
        .set({ status: 'yanked', yankReason: reason })
        .where(eq(widgets.id, widgetId))
    }
    return rows
  })
  if (yanked.length === 0 && !options.wholeWidget) {
    throw new HTTPException(404, { message: 'No live version by that number.' })
  }
  await publishRegistry(deps)
  return yanked.map((row) => row.version)
}

export async function widgetOwner(deps: Deps, widgetId: string) {
  const [row] = await deps.db
    .select({ ownerId: widgets.ownerId })
    .from(widgets)
    .where(eq(widgets.id, widgetId))
  return row?.ownerId
}

const defaultIcons: Partial<Record<Category, string>> = {
  system: 'gauge',
  media: 'music',
  productivity: 'coffee',
}

/** The icon the gallery shows: the one an admin set, or one for the widget's first category. */
export const widgetIcon = (widget: { icon: string | null; categories: string[] }) =>
  widget.icon ?? defaultIcons[widget.categories[0] as Category] ?? 'activity'

const day = (date: Date) => date.toISOString().slice(0, 10)

/** Every live widget with an approved version, newest version's content first, as the site shows it. */
export async function listWidgets(deps: Deps, ids?: string[]): Promise<Widget[]> {
  const rows = await deps.db
    .select({ widget: widgets, owner: users.login, version: versions })
    .from(versions)
    .innerJoin(widgets, eq(versions.widgetId, widgets.id))
    .innerJoin(users, eq(widgets.ownerId, users.id))
    .where(
      and(
        eq(versions.status, 'approved'),
        eq(widgets.status, 'live'),
        ids ? inArray(widgets.id, ids) : undefined,
      ),
    )

  const grouped = new Map<
    string,
    {
      widget: typeof widgets.$inferSelect
      owner: string
      versions: (typeof versions.$inferSelect)[]
    }
  >()
  for (const row of rows) {
    const entry = grouped.get(row.widget.id) ?? {
      widget: row.widget,
      owner: row.owner,
      versions: [],
    }
    entry.versions.push(row.version)
    grouped.set(row.widget.id, entry)
  }

  return [...grouped.values()]
    .map(({ widget, owner, versions: list }) => {
      const ordered = list.sort((a, b) => compareVersions(b.version, a.version))
      const latest = ordered[0]
      if (!latest) return undefined
      const { manifest, files } = latest
      const result: Widget = {
        id: widget.id,
        name: widget.name,
        summary: widget.summary,
        author: owner,
        license: manifest.license,
        ...(manifest.repository ? { repository: manifest.repository } : {}),
        categories: widget.categories as Category[],
        icon: widgetIcon(widget),
        tone: widget.tone ?? 'dark',
        ...(widget.featured ? { featured: true } : {}),
        installs: widget.installs,
        minAppVersion: manifest.minAppVersion,
        sizes: manifest.sizes,
        ...(manifest.refreshSeconds ? { refreshSeconds: manifest.refreshSeconds } : {}),
        createdAt: day(widget.createdAt),
        versions: ordered.map((version) => ({
          version: version.version,
          publishedAt: day(version.publishedAt ?? version.submittedAt),
          permissions: version.permissions,
          notes: version.notes,
        })),
        permissions: latest.permissions,
        config: manifest.config,
        view: files.view,
        sample: files.sample,
        ...(files.collector ? { collector: files.collector } : {}),
        readme: files.readme,
      }
      return result
    })
    .filter((widget): widget is Widget => widget !== undefined)
    .sort((a, b) => a.name.localeCompare(b.name))
}

/** Everyone who has a widget in the gallery. */
export async function listAuthors(deps: Deps, logins?: string[]): Promise<Author[]> {
  const listed = await listWidgets(deps)
  const names = new Set(listed.map((widget) => widget.author))
  if (names.size === 0) return []
  const rows = await deps.db
    .select()
    .from(users)
    .where(
      inArray(
        users.login,
        [...names].filter((login) => !logins || logins.includes(login)),
      ),
    )
  return rows
    .map((user) => ({
      login: user.login,
      name: user.name ?? user.login,
      bio: user.bio ?? '',
      joinedAt: day(user.createdAt),
      ...(user.official ? { official: true } : {}),
      ...(user.verified ? { verified: true } : {}),
    }))
    .sort((a, b) => a.login.localeCompare(b.login))
}

/** An author's uploads, newest first, for their dashboard. */
export async function submissionsOf(deps: Deps, userId: string) {
  const { package: _package, ...columns } = getTableColumns(versions)
  const rows = await deps.db
    .select({
      version: columns,
      widget: { icon: widgets.icon, categories: widgets.categories },
      note: reviews.note,
      decision: reviews.decision,
    })
    .from(versions)
    .innerJoin(widgets, eq(versions.widgetId, widgets.id))
    .leftJoin(reviews, eq(reviews.versionId, versions.id))
    .where(eq(widgets.ownerId, userId))
    .orderBy(desc(versions.submittedAt))
  return rows.map(({ version, widget, note, decision }) => ({
    id: version.id,
    widgetId: version.widgetId,
    name: version.manifest.name,
    icon: widgetIcon(widget),
    version: version.version,
    submittedAt: day(version.submittedAt),
    status: version.status as ReviewStatus,
    permissions: version.permissions,
    notes: version.notes,
    report: version.report,
    ...(note && decision === 'reject' ? { reviewerNote: note } : {}),
    ...(version.yankReason ? { yankReason: version.yankReason } : {}),
  }))
}
