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

export function catalogEntries(widgets: Widget[]): CatalogEntry[] {
  return [
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
  ]
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
  return [
    ...builtIns,
    ...catalogEntries(searchWidgets(widgets, options)).filter(
      (entry) => entry.type === 'marketplace',
    ),
  ]
}
