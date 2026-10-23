import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { bindingsOf, categories, type SourceName, sources } from '@shiftpane/format'
import { describe, expect, it } from 'vitest'

import { countByCategory, newestWidgets, searchWidgets } from './index'
import { packageFiles } from './package'
import { widgets } from './seed'

const ids = (list: { id: string }[]) => list.map((widget) => widget.id)

describe('searchWidgets', () => {
  it('returns everything for an empty query', () => {
    expect(searchWidgets(widgets, {})).toHaveLength(widgets.length)
  })

  it('ranks a name match above a README mention', () => {
    const found = ids(searchWidgets(widgets, { query: 'gpu' }))
    expect(found[0]).toBe('gpu-ring')
    expect(found).toContain('hardware-temps')
  })

  it('needs every word to match', () => {
    expect(ids(searchWidgets(widgets, { query: 'github stars' }))).toEqual(['github-stars'])
    expect(searchWidgets(widgets, { query: 'github bananas' })).toEqual([])
  })

  it('filters by category, with or without words', () => {
    expect(ids(searchWidgets(widgets, { category: 'dev' }))).toEqual(['github-stars'])
    expect(searchWidgets(widgets, { query: 'gpu', category: 'dev' })).toEqual([])
  })
})

describe('countByCategory and newestWidgets', () => {
  it('counts every category, empty ones included', () => {
    const counts = countByCategory(widgets)
    expect(Object.keys(counts).sort()).toEqual([...categories].sort())
    expect(counts.system).toBeGreaterThan(0)
    expect(counts.weather).toBe(1)
  })

  it('puts the most recently listed first', () => {
    const dates = newestWidgets(widgets).map((widget) => widget.createdAt)
    expect(dates).toEqual([...dates].sort().reverse())
  })
})

// The marketplace's own checks (PLAN, Moderation), applied to the seed: if these fail, the seed
// would not have passed review either.
describe('the seed widgets', () => {
  it.each(widgets.map((widget) => [widget.id, widget] as const))(
    '%s passes the view checks',
    (_, widget) => {
      for (const bind of bindingsOf(widget.view)) {
        if (bind.startsWith('@')) {
          const name = bind.slice(1).split('/')[0] as SourceName
          expect(name in sources, `${bind} names a source`).toBe(true)
          expect(widget.permissions.sources, `${bind} is declared`).toContain(name)
        } else {
          const first = bind.split('/')[1] ?? ''
          expect(widget.sample, `${bind} resolves in sample.json`).toHaveProperty(first)
        }
      }
    },
  )

  it.each(widgets.map((widget) => [widget.id, widget] as const))(
    '%s lists its versions newest first, latest matching the manifest',
    (_, widget) => {
      const dates = widget.versions.map((version) => version.publishedAt)
      expect(dates).toEqual([...dates].sort().reverse())
      expect(widget.versions[0]?.permissions).toEqual(widget.permissions)
      for (const size of Object.keys(widget.view)) expect(widget.sizes).toContain(size)
    },
  )

  it('has ids that are unique and lowercase-kebab', () => {
    expect(new Set(ids(widgets)).size).toBe(widgets.length)
    for (const id of ids(widgets)) expect(id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  })
})

// The seed is the site's offline copy of the first-party packages the API publishes; the two have
// to say the same thing.
describe('the seed and first-party/', () => {
  const firstParty = join(import.meta.dirname, '../../../../../first-party')

  it.each(widgets.map((widget) => [widget.id, widget] as const))(
    '%s matches its package folder',
    (_, widget) => {
      for (const file of packageFiles(widget)) {
        const text = readFileSync(join(firstParty, widget.id, file.name), 'utf8')
        // Biome formats the JSON files, so compare what they say.
        if (file.language === 'json') expect(JSON.parse(text)).toEqual(JSON.parse(file.content))
        else expect(text).toBe(file.content)
      }
      expect(readFileSync(join(firstParty, widget.id, 'README.md'), 'utf8')).toBe(widget.readme)
    },
  )
})
