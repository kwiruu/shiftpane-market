import { type Category, compareVersions, type Permissions } from '@shiftpane/format'

/**
 * The two files the desktop app reads (PLAN, "API"): `index.json`, every live widget and its
 * approved versions, and `revoked.json`, the versions it must disable. Both are rewritten whenever a
 * version is approved or yanked, and served from storage, never from the API, so installing keeps
 * working while the API is down.
 */

export interface IndexVersion {
  sha256: string
  size: number
  url: string
  minAppVersion: string
  permissions: Permissions
}

export interface IndexEntry {
  id: string
  name: string
  summary: string
  author: { login: string }
  categories: Category[]
  latest: string
  versions: Record<string, IndexVersion>
}

export interface RegistryIndex {
  format: 1
  generatedAt: string
  widgets: IndexEntry[]
}

export interface RevokedVersion {
  id: string
  version: string
  reason: string
  yankedAt: string
}

export interface RevokedList {
  format: 1
  generatedAt: string
  versions: RevokedVersion[]
}

/** One live widget with its approved versions, as the API reads it from the database. */
export interface IndexInput {
  id: string
  name: string
  summary: string
  author: string
  categories: Category[]
  versions: (Omit<IndexVersion, 'url'> & { version: string })[]
}

export function buildIndex(
  widgets: IndexInput[],
  packageUrl: (sha256: string) => string,
  now = new Date(),
): RegistryIndex {
  const entries = widgets
    .filter((widget) => widget.versions.length > 0)
    .map((widget): IndexEntry => {
      const ordered = [...widget.versions].sort((a, b) => compareVersions(b.version, a.version))
      return {
        id: widget.id,
        name: widget.name,
        summary: widget.summary,
        author: { login: widget.author },
        categories: widget.categories,
        latest: ordered[0]?.version ?? '',
        versions: Object.fromEntries(
          ordered.map(({ version, ...rest }) => [
            version,
            { ...rest, url: packageUrl(rest.sha256) },
          ]),
        ),
      }
    })
    .sort((a, b) => a.id.localeCompare(b.id))
  return { format: 1, generatedAt: now.toISOString(), widgets: entries }
}

export function buildRevoked(versions: RevokedVersion[], now = new Date()): RevokedList {
  const sorted = [...versions].sort(
    (a, b) => a.id.localeCompare(b.id) || compareVersions(a.version, b.version),
  )
  return { format: 1, generatedAt: now.toISOString(), versions: sorted }
}

/** The bytes that get signed and stored. Signatures are over these exactly, so never re-serialize. */
export function serialize(value: RegistryIndex | RevokedList): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(value, null, 2)}\n`)
}
