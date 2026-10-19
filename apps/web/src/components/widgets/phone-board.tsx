import type { Widget, WidgetSize } from '@/lib/registry/types'
import { cn } from '@/lib/utils'

import { WidgetCard } from './widget-view'

const span: Record<WidgetSize, string> = {
  small: 'col-span-1',
  medium: 'col-span-2',
  large: 'col-span-2',
}

/**
 * A piece of the phone's widget board: black, two columns of cells, small tiles taking one cell,
 * medium ones a row, large ones two rows. Decorative, like the cards on it.
 */
export function PhoneBoard({
  items,
  className,
}: {
  items: { widget: Widget; size: WidgetSize }[]
  className?: string
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'board grid grid-cols-2 content-start gap-[4cqw] [grid-auto-flow:dense]',
        className,
      )}
    >
      {items.map(({ widget, size }, index) => (
        <WidgetCard
          key={`${widget.id}-${index}`}
          widget={widget}
          size={size}
          className={span[size]}
        />
      ))}
    </div>
  )
}
