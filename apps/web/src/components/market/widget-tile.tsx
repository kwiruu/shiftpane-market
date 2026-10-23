import type { Widget } from '@shiftpane/format'
import Link from 'next/link'
import { WidgetCard } from '@/components/widgets/widget-view'
import { categoryInfo } from '@/lib/registry'
import type { CatalogEntry } from '@/lib/registry/catalog'
import { cn } from '@/lib/utils'
import { BuiltInTile } from './built-in'

/**
 * A widget in the gallery (DESIGN.md, Widget tiles): a white card with the widget on a patch of
 * the phone's board, then its name, its summary, and who made it.
 */
export function WidgetTile({ widget, className }: { widget: Widget; className?: string }) {
  const size = 'small'
  return (
    <Link
      href={`/widgets/${widget.id}`}
      data-cursor={`Open ${widget.name}`}
      className={cn(
        'group/tile flex flex-col rounded-lg bg-surface p-2 transition-colors hover:bg-muted',
        className,
      )}
    >
      {/* A thumbnail: the cards are a fraction of a phone's, so their type scales with them. */}
      <div
        className="board relative grid aspect-[16/10] place-items-center overflow-hidden rounded-md dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]"
        style={{ '--fmin': 0 } as React.CSSProperties}
      >
        <div
          className={cn(
            'transition-transform duration-300 ease-out-expo group-hover/tile:scale-[1.03] motion-reduce:transition-none',
            'w-[54%]',
          )}
        >
          <WidgetCard widget={widget} size={size} />
        </div>
      </div>
      <div className="flex flex-1 flex-col px-2 pt-3 pb-2">
        <h3 className="font-sans text-body-md">{widget.name}</h3>
        <p className="mt-0.5 line-clamp-2 text-body-sm text-secondary">{widget.summary}</p>
        <p className="mt-auto pt-3 text-label-md text-secondary">
          {widget.authorName ?? widget.author}
          <span aria-hidden="true"> · </span>
          {widget.categories.map((category) => categoryInfo[category].label).join(', ')}
        </p>
      </div>
    </Link>
  )
}

export function WidgetGrid({ widgets, className }: { widgets: Widget[]; className?: string }) {
  return (
    <ul className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {widgets.map((widget) => (
        <li key={widget.id} className="flex">
          <WidgetTile widget={widget} className="flex-1" />
        </li>
      ))}
    </ul>
  )
}

/** Built-ins are display-only; installable widgets retain their existing detail pages. */
export function CatalogGrid({
  entries,
  className,
}: {
  entries: CatalogEntry[]
  className?: string
}) {
  return (
    <ul className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {entries.map((entry) => (
        <li key={`${entry.type}:${entry.id}`} className="flex">
          {entry.type === 'built-in' ? (
            <BuiltInTile kind={entry.id} className="flex-1" />
          ) : (
            <WidgetTile widget={entry.widget} className="flex-1" />
          )}
        </li>
      ))}
    </ul>
  )
}
