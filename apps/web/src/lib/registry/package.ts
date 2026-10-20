import type { Manifest, Widget } from '@shiftpane/format'

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
  language: 'json' | 'js' | 'markdown'
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
