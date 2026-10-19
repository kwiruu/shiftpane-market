import Link from 'next/link'

import { WidgetCard } from '@/components/widgets/widget-view'
import { categoryInfo, getAuthor } from '@/lib/registry'
import type { Widget, WidgetSize } from '@/lib/registry/types'
import { cn } from '@/lib/utils'

// The tile shows the widget at the size that fills its preview best.
const previewSize = (widget: Widget): WidgetSize =>
  widget.sizes.includes('medium') ? 'medium' : (widget.sizes[0] ?? 'small')

/**
 * A widget in the gallery (DESIGN.md, Widget tiles): a white card with the widget on a patch of
 * the phone's board, then its name, its summary, and who made it.
 */
export function WidgetTile({ widget, className }: { widget: Widget; className?: string }) {
  const size = previewSize(widget)
  const author = getAuthor(widget.author)
  return (
    <Link
      href={`/widgets/${widget.id}`}
      data-cursor={`Open ${widget.name}`}
      className={cn(
        'group/tile flex flex-col rounded-lg bg-surface p-2 transition-colors hover:bg-muted',
        className,
      )}
    >
      <div className="board relative grid aspect-[16/10] place-items-center overflow-hidden rounded-md dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]">
        <div
          className={cn(
            'transition-transform duration-300 ease-out-expo group-hover/tile:scale-[1.03] motion-reduce:transition-none',
            size === 'small' ? 'w-[42%]' : 'w-[82%]',
          )}
        >
          <WidgetCard widget={widget} size={size} />
        </div>
      </div>
      <div className="flex flex-1 flex-col px-2 pt-3 pb-2">
        <h3 className="font-sans text-body-md">{widget.name}</h3>
        <p className="mt-0.5 line-clamp-2 text-body-sm text-secondary">{widget.summary}</p>
        <p className="mt-auto pt-3 text-label-md text-secondary">
          {author?.name ?? widget.author}
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
