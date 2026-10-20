import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { checkPackage, manifestIdOf, openPackage, packPackage } from '@shiftpane/checks'
import { users, widgets } from '@shiftpane/db'
import { eq } from 'drizzle-orm'

import type { Deps } from './context.ts'
import { approveVersion, checkContextFor, submitVersion } from './registry.ts'

/** How the gallery shows each first-party widget: not part of the package. */
interface Listing {
  icon: string
  tone: 'dark' | 'light'
  featured: boolean
  /** What's new in this version, as an author would write it when uploading. */
  notes: string
}

/**
 * Publishes the folders in `first-party/` as the ShiftPane account, through the same checks,
 * submission and approval an upload gets. Versions already published are skipped, so it is safe to
 * run on every deploy; raise a widget's version to publish a change.
 */
export async function publishFirstParty(deps: Deps, dir: string) {
  const [owner] = await deps.db
    .insert(users)
    .values({
      login: 'shiftpane',
      name: 'ShiftPane',
      bio: 'First-party widgets, made alongside the app. Each one doubles as an example of what the widget SDK can do.',
      official: true,
    })
    .onConflictDoUpdate({ target: users.login, set: { official: true } })
    .returning()
  if (!owner?.official) throw new Error('The shiftpane login belongs to someone else')

  const listing = JSON.parse(await readFile(join(dir, 'listing.json'), 'utf8')) as Record<
    string,
    Listing
  >
  const published: string[] = []
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries
    .filter((e) => e.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name))) {
    const zip = packPackage(await readFolder(join(dir, entry.name)))
    const opened = openPackage(zip)
    const context = await checkContextFor(deps, owner, manifestIdOf(opened))
    const checked = checkPackage(opened, context)
    const { manifest } = checked
    const done = context.existing?.versions.some(
      (v) => v.version === manifest?.version && v.status !== 'rejected',
    )
    if (done) continue
    if (!checked.passed || !manifest) {
      const failed = Object.entries(checked.report).filter(([, r]) => r.result === 'fail')
      throw new Error(
        `${entry.name} failed its checks: ${JSON.stringify(Object.fromEntries(failed))}`,
      )
    }

    const shown = listing[manifest.id]
    const version = await submitVersion(deps, owner, opened, checked, shown?.notes ?? '', zip)
    await approveVersion(
      deps,
      version.id,
      owner,
      'First-party: published by the ShiftPane project.',
    )
    if (shown) {
      await deps.db
        .update(widgets)
        .set({ icon: shown.icon, tone: shown.tone, featured: shown.featured })
        .where(eq(widgets.id, manifest.id))
    }
    published.push(`${manifest.id}@${manifest.version}`)
  }
  return published
}

/** A package folder's files by their zip names, screenshots included. */
async function readFolder(dir: string): Promise<Record<string, Uint8Array>> {
  const files: Record<string, Uint8Array> = {}
  for (const entry of await readdir(dir, { withFileTypes: true, recursive: true })) {
    if (!entry.isFile()) continue
    const path = join(entry.parentPath, entry.name)
    files[
      path
        .slice(dir.length + 1)
        .split('\\')
        .join('/')
    ] = await readFile(path)
  }
  return files
}
