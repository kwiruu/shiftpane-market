import type { Category, Widget } from '@shiftpane/format'
import { widgets as sampleWidgets } from './seed'

/**
 * What the site knows about widgets, as pure functions over a list. The list itself comes from
 * `gallery.ts`: the registry API in production, the seed when no API is configured.
 */

export const categoryInfo: Record<Category, { label: string; description: string }> = {
  system: { label: 'System', description: 'CPU, GPU, memory, network and temperatures.' },
  dev: { label: 'Developer', description: 'Repositories, builds, deploys and dev servers.' },
  productivity: { label: 'Productivity', description: 'Timers, tasks and focus.' },
  media: { label: 'Media', description: 'What is playing, and the buttons to control it.' },
  finance: { label: 'Finance', description: 'Prices and portfolios.' },
  weather: { label: 'Weather', description: 'Forecasts and conditions.' },
  fun: { label: 'Fun', description: 'Small delights.' },
  other: { label: 'Other', description: 'Everything else.' },
}

/** A seed widget, for the landing page's pictures of the board. Galleries read `gallery.ts`. */
export function sampleWidget(id: string): Widget | undefined {
  return sampleWidgets.find((widget) => widget.id === id)
}

export function latestVersion(widget: Widget) {
  return widget.versions[0]
}

/** When the widget last changed: its newest version's date. */
export function updatedAt(widget: Widget): string {
  return widget.versions[0]?.publishedAt ?? widget.createdAt
}

export function featuredWidgets(list: Widget[]): Widget[] {
  return list.filter((widget) => widget.featured)
}

/** Most recently listed first. */
export function newestWidgets(list: Widget[], limit = list.length): Widget[] {
  return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit)
}

/** Most recently updated first. */
export function recentlyUpdated(list: Widget[], limit = list.length): Widget[] {
  return [...list].sort((a, b) => updatedAt(b).localeCompare(updatedAt(a))).slice(0, limit)
}

export function countByCategory(list: Pick<Widget, 'categories'>[]): Record<Category, number> {
  const counts = Object.fromEntries(
    Object.keys(categoryInfo).map((category) => [category, 0]),
  ) as Record<Category, number>
  for (const widget of list) for (const category of widget.categories) counts[category]++
  return counts
}

export function isCategory(value: string | null | undefined): value is Category {
  return value != null && value in categoryInfo
}

/**
 * Search by words, best match first: every word has to appear somewhere, and a word in the name
 * counts for more than one in the summary, which counts for more than one in the README.
 */
export function searchWidgets(
  list: Widget[],
  { query = '', category }: { query?: string; category?: Category },
): Widget[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  const inCategory = category ? list.filter((widget) => widget.categories.includes(category)) : list
  if (words.length === 0) return inCategory

  const scored = inCategory.flatMap((widget) => {
    const fields: [string, number][] = [
      [`${widget.name} ${widget.id}`.toLowerCase(), 5],
      [widget.summary.toLowerCase(), 3],
      [
        [
          ...widget.categories.map((c) => categoryInfo[c].label),
          ...widget.permissions.sources,
          ...widget.permissions.network,
          widget.author,
        ]
          .join(' ')
          .toLowerCase(),
        2,
      ],
      [widget.readme.toLowerCase(), 1],
    ]
    let score = 0
    for (const word of words) {
      const best = Math.max(
        0,
        ...fields.map(([text, weight]) => (text.includes(word) ? weight : 0)),
      )
      if (best === 0) return []
      score += best
    }
    return [{ widget, score }]
  })

  return scored.sort((a, b) => b.score - a.score).map((entry) => entry.widget)
}
