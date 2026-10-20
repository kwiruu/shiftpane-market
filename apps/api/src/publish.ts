import { users, versions, widgets } from '@shiftpane/db'
import type { Category } from '@shiftpane/format'
import { buildIndex, buildRevoked, type IndexInput, serialize, signBytes } from '@shiftpane/index'
import { and, eq } from 'drizzle-orm'

import type { Deps } from './context.ts'

/** Packages never change once published, so caches may keep them for good. */
const PACKAGE_CACHE = 365 * 24 * 60 * 60
/** The index is rewritten on every approval and yank; a minute is Blob's shortest cache. */
const INDEX_CACHE = 60

export const packageKey = (sha256: string) => `packages/${sha256}.zip`

export async function storePackage({ storage }: Deps, sha256: string, bytes: Uint8Array) {
  await storage.put(packageKey(sha256), bytes, {
    contentType: 'application/zip',
    cacheSeconds: PACKAGE_CACHE,
  })
}

/**
 * Rewrites index.json and revoked.json, with their signatures, from the database. Runs after every
 * approval and yank; each run reads the committed state, so two at once still end up right. The
 * signature goes up before the file it signs: in the moment between, an app that fetches both sees
 * a mismatch and tries again later, which it must handle anyway.
 */
export async function publishRegistry(deps: Deps) {
  const { db, storage, config } = deps
  const now = deps.now?.() ?? new Date()

  const rows = await db
    .select({
      id: widgets.id,
      name: widgets.name,
      summary: widgets.summary,
      categories: widgets.categories,
      author: users.login,
      version: versions.version,
      sha256: versions.sha256,
      size: versions.size,
      manifest: versions.manifest,
      permissions: versions.permissions,
    })
    .from(versions)
    .innerJoin(widgets, eq(versions.widgetId, widgets.id))
    .innerJoin(users, eq(widgets.ownerId, users.id))
    .where(and(eq(versions.status, 'approved'), eq(widgets.status, 'live')))

  const byWidget = new Map<string, IndexInput>()
  for (const row of rows) {
    let entry = byWidget.get(row.id)
    if (!entry) {
      entry = {
        id: row.id,
        name: row.name,
        summary: row.summary,
        author: row.author,
        categories: row.categories as Category[],
        versions: [],
      }
      byWidget.set(row.id, entry)
    }
    entry.versions.push({
      version: row.version,
      sha256: row.sha256,
      size: row.size,
      minAppVersion: row.manifest.minAppVersion,
      permissions: row.permissions,
    })
  }
  const index = buildIndex([...byWidget.values()], (sha) => storage.url(packageKey(sha)), now)

  const yanked = await db
    .select({
      id: versions.widgetId,
      version: versions.version,
      reason: versions.yankReason,
      yankedAt: versions.yankedAt,
    })
    .from(versions)
    .where(eq(versions.status, 'yanked'))
  const revoked = buildRevoked(
    yanked.map((row) => ({
      id: row.id,
      version: row.version,
      reason: row.reason ?? '',
      yankedAt: (row.yankedAt ?? now).toISOString(),
    })),
    now,
  )

  for (const [name, value] of [
    ['index.json', index],
    ['revoked.json', revoked],
  ] as const) {
    const bytes = serialize(value)
    const signature = new TextEncoder().encode(`${signBytes(bytes, config.signingKey)}\n`)
    const options = { cacheSeconds: INDEX_CACHE }
    await storage.put(`${name}.sig`, signature, { ...options, contentType: 'text/plain' })
    await storage.put(name, bytes, { ...options, contentType: 'application/json' })
  }
  return { index, revoked }
}
