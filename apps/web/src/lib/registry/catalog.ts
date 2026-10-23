import { WIDGET_KINDS } from '@shiftpane/board/model'
import type { Category, Widget } from '@shiftpane/format'
import { searchWidgets } from './index'

export type BuiltInKind = keyof typeof WIDGET_KINDS
export type CatalogEntry =
  | { type: 'built-in'; id: BuiltInKind; name: string; summary: string; categories: Category[] }
  | {
      type: 'marketplace'
      id: string
      name: string
      summary: string
      categories: Category[]
      widget: Widget
    }

export const builtInEntries: CatalogEntry[] = (Object.keys(WIDGET_KINDS) as BuiltInKind[]).map(
  (id) => ({
    type: 'built-in',
    id,
    name: WIDGET_KINDS[id].name,
    summary: WIDGET_KINDS[id].description,
    categories: [
      id === 'media'
        ? 'media'
        : ['cpu', 'memory', 'network', 'pc-stats'].includes(id)
          ? 'system'
          : 'productivity',
    ],
  }),
)

/** The widgets we want seen first, in this order; the rest keep their own order after them. */
export const FEATURED_FIRST = [
  'github-contributions',
  'analog-clock',
  'memory',
  'laptop-battery',
  'weather',
  'gpu-ring',
]

function featuredFirst(entries: CatalogEntry[]): CatalogEntry[] {
  const rank = (entry: CatalogEntry) => {
    const index = FEATURED_FIRST.indexOf(entry.id)
    return index === -1 ? FEATURED_FIRST.length : index
  }
  // Array.prototype.sort is stable, so everything unlisted stays where it was.
  return [...entries].sort((a, b) => rank(a) - rank(b))
}

export function catalogEntries(widgets: Widget[]): CatalogEntry[] {
  return featuredFirst([
    ...builtInEntries,
    ...widgets.map(
      (widget): CatalogEntry => ({
        type: 'marketplace',
        id: widget.id,
        name: widget.name,
        summary: widget.summary,
        categories: widget.categories,
        widget,
      }),
    ),
  ])
}

export function searchCatalog(
  widgets: Widget[],
  options: { query?: string; category?: Category },
): CatalogEntry[] {
  const words = (options.query ?? '').toLowerCase().split(/\s+/).filter(Boolean)
  const builtIns = builtInEntries.filter(
    (entry) =>
      (!options.category || entry.categories.includes(options.category)) &&
      words.every((word) =>
        `${entry.id} ${entry.name} ${entry.summary} ${entry.categories.join(' ')} ShiftPane`
          .toLowerCase()
          .includes(word),
      ),
  )
  return featuredFirst([
    ...builtIns,
    ...catalogEntries(searchWidgets(widgets, options)).filter(
      (entry) => entry.type === 'marketplace',
    ),
  ])
}
