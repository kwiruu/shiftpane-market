import type { Widget, WidgetSize } from '@shiftpane/format'
import { BuiltInCard, type BuiltInKind } from '@/components/market/built-in'
import { cn } from '@/lib/utils'

import { WidgetCard } from './widget-view'

const span: Record<WidgetSize, string> = {
  small: 'col-span-1',
  medium: 'col-span-2',
  large: 'col-span-2',
}

/** A widget on the board: one from the gallery, or one that comes with the app. */
export type BoardItem =
  | { widget: Widget; size: WidgetSize }
  | { kind: BuiltInKind; size: WidgetSize }

/**
 * A piece of the phone's widget board: black, two columns of cells (override with `grid-cols-*`
 * for a phone held sideways), small tiles taking one cell, medium ones two across, large ones two
 * by two. It's a picture of a phone, so its cards are small: their type scales with them instead of
 * keeping the pixel minimums a real card has. Decorative, like the cards on it.
 */
export function PhoneBoard({ items, className }: { items: BoardItem[]; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'board grid grid-cols-2 content-start gap-[4cqw] [grid-auto-flow:dense]',
        className,
      )}
      style={{ '--fmin': 0 } as React.CSSProperties}
    >
      {items.map((item, index) =>
        'kind' in item ? (
          <BuiltInCard
            key={`${item.kind}-${index}`}
            kind={item.kind}
            size={item.size}
            className={span[item.size]}
          />
        ) : (
          <WidgetCard
            key={`${item.widget.id}-${index}`}
            widget={item.widget}
            size={item.size}
            className={span[item.size]}
          />
        ),
      )}
    </div>
  )
}
