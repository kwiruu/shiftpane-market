import { WIDGET_KINDS } from '@shiftpane/board/model'
import { expect, it } from 'vitest'
import { builtInEntries, catalogEntries, FEATURED_FIRST, searchCatalog } from './catalog'
import { countByCategory } from './index'
import { widgets } from './seed'

it('includes every app widget and every installable listing once', () => {
  const entries = catalogEntries(widgets)
  expect(builtInEntries.map((entry) => entry.id)).toEqual(Object.keys(WIDGET_KINDS))
  expect(entries).toHaveLength(Object.keys(WIDGET_KINDS).length + widgets.length)
  expect(new Set(entries.map((entry) => entry.id)).size).toBe(entries.length)
})
it('finds built-ins and marketplace widgets in the same search', () => {
  const results = searchCatalog(widgets, { query: 'CPU' })
  expect(results.some((entry) => entry.type === 'built-in' && entry.id === 'cpu')).toBe(true)
  expect(results.some((entry) => entry.type === 'marketplace')).toBe(true)
  expect(searchCatalog(widgets, { query: 'stopwatch' }).map((entry) => entry.id)).toEqual(['time'])
  expect(searchCatalog(widgets, { category: 'media' }).map((entry) => entry.id)).toEqual(['media'])
})
it('counts built-in categories alongside the registry', () => {
  const counts = countByCategory(catalogEntries(widgets))
  expect(counts.system).toBe(countByCategory(widgets).system + 4)
  expect(counts.media).toBe(countByCategory(widgets).media + 1)
})
it('lists the featured widgets first, in order, and keeps the rest where they were', () => {
  const ids = catalogEntries(widgets).map((entry) => entry.id)
  expect(ids.slice(0, FEATURED_FIRST.length)).toEqual(FEATURED_FIRST)
  const rest = ids.slice(FEATURED_FIRST.length)
  expect(rest).toEqual(
    [...builtInEntries.map((entry) => entry.id), ...widgets.map((widget) => widget.id)].filter(
      (id) => !FEATURED_FIRST.includes(id),
    ),
  )
})
