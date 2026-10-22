import { describe, expect, it } from 'vitest'

import type { VersionRecord } from '@/lib/api'

import { manifestOf, versionFiles } from './package'
import { widgets } from './seed'

describe('versionFiles', () => {
  it('shows an uploaded manifest in the documented key order, whatever order it was kept in', () => {
    const [widget] = widgets
    if (!widget) throw new Error('no seed widgets')
    const manifest = manifestOf(widget)
    // Postgres jsonb keeps keys shortest first.
    const shuffled = Object.fromEntries(
      Object.entries(manifest).sort(([a], [b]) => a.length - b.length || a.localeCompare(b)),
    ) as typeof manifest
    const version = {
      manifest: shuffled,
      files: { view: widget.view, sample: widget.sample, readme: '# Hi\n', license: 'MIT\n' },
    } as VersionRecord

    const files = versionFiles(version)
    expect(files.map((file) => file.name)).toEqual([
      'manifest.json',
      'view.json',
      'sample.json',
      'README.md',
      'LICENSE',
    ])
    expect(Object.keys(JSON.parse(files[0]?.content ?? '{}'))).toEqual(Object.keys(manifest))
  })
})
