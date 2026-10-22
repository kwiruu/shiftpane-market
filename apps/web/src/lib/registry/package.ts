import type { Manifest, Widget } from '@shiftpane/format'

import type { VersionRecord } from '@/lib/api'

/** The `manifest.json` a widget's package carries, rebuilt from what the gallery knows about it. */
export function manifestOf(widget: Widget): Manifest {
  return {
    id: widget.id,
    name: widget.name,
    description: widget.summary,
    version: widget.versions[0]?.version ?? '0.0.0',
    author: widget.author,
    license: widget.license,
    ...(widget.repository ? { repository: widget.repository } : {}),
    categories: widget.categories,
    minAppVersion: widget.minAppVersion,
    sizes: widget.sizes,
    ...(widget.refreshSeconds ? { refreshSeconds: widget.refreshSeconds } : {}),
    permissions: widget.permissions,
    config: widget.config,
  }
}

export interface PackageFile {
  name: string
  language: 'json' | 'js' | 'markdown' | 'text'
  content: string
}

/** The readable files of a package, in the order a reviewer reads them. */
export function packageFiles(widget: Widget): PackageFile[] {
  const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`
  return [
    { name: 'manifest.json', language: 'json' as const, content: json(manifestOf(widget)) },
    { name: 'view.json', language: 'json' as const, content: json(widget.view) },
    { name: 'sample.json', language: 'json' as const, content: json(widget.sample) },
    ...(widget.collector
      ? [{ name: 'collector.js', language: 'js' as const, content: widget.collector }]
      : []),
  ]
}

// The database keeps JSON in its own key order; these put the manifest back in the documented one.
const manifestKeys = [
  'id',
  'name',
  'description',
  'version',
  'author',
  'license',
  'repository',
  'categories',
  'minAppVersion',
  'sizes',
  'refreshSeconds',
  'permissions',
  'config',
]
const permissionKeys = ['sources', 'actions', 'local', 'network', 'secrets']
const byOrder = (order: string[]) => (a: string, b: string) =>
  (order.indexOf(a) + 1 || order.length + 1) - (order.indexOf(b) + 1 || order.length + 1)

function inOrder<T extends object>(value: T, order: string[]): T {
  return Object.fromEntries(Object.entries(value).sort(([a], [b]) => byOrder(order)(a, b))) as T
}

/** Every file of an uploaded version, as the reviewer reads it: what it declares, then what it runs. */
export function versionFiles(version: VersionRecord): PackageFile[] {
  const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`
  const { files } = version
  const manifest = inOrder(
    { ...version.manifest, permissions: inOrder(version.manifest.permissions, permissionKeys) },
    manifestKeys,
  )
  return [
    { name: 'manifest.json', language: 'json' as const, content: json(manifest) },
    { name: 'view.json', language: 'json' as const, content: json(files.view) },
    { name: 'sample.json', language: 'json' as const, content: json(files.sample) },
    ...(files.collector
      ? [{ name: 'collector.js', language: 'js' as const, content: files.collector }]
      : []),
    { name: 'README.md', language: 'markdown' as const, content: files.readme },
    { name: 'LICENSE', language: 'text' as const, content: files.license },
  ]
}

/** An uploaded version as the preview renderer takes a widget: its own view, sample and sizes. */
export function widgetOfVersion(version: VersionRecord, author: string, icon: string): Widget {
  const { manifest, files } = version
  return {
    id: manifest.id,
    name: manifest.name,
    summary: manifest.description,
    author,
    license: manifest.license,
    categories: manifest.categories,
    icon,
    tone: 'dark',
    minAppVersion: manifest.minAppVersion,
    sizes: manifest.sizes,
    createdAt: version.submittedAt.slice(0, 10),
    versions: [],
    permissions: version.permissions,
    config: manifest.config,
    view: files.view,
    sample: files.sample,
    ...(files.collector ? { collector: files.collector } : {}),
    readme: files.readme,
  }
}
