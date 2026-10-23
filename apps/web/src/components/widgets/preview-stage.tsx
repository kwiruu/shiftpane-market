'use client'

import { WIDGET_KINDS } from '@shiftpane/board/model'
import type { Widget } from '@shiftpane/format'
import { BuiltInCard, type BuiltInKind } from '@/components/market/built-in'
import { cn } from '@/lib/utils'

import { WidgetCard } from './widget-view'

/**
 * A small widget preview, using the same layout as the gallery thumbnails.
 */
export function PreviewStage({
  widget,
  builtIn,
  caption,
  className,
  stageClassName,
  wallpaper,
}: {
  /** A gallery widget, or... */
  widget?: Widget
  /** ...one that comes with ShiftPane. */
  builtIn?: BuiltInKind
  caption?: React.ReactNode
  className?: string
  stageClassName?: string
  wallpaper?: boolean
}) {
  return (
    <figure className={className}>
      <div
        role="img"
        aria-label={`${widget?.name ?? (builtIn ? WIDGET_KINDS[builtIn].name : 'Widget')}, shown at small size with sample data`}
        className={cn(
          'board relative grid h-[460px] place-items-center overflow-hidden rounded-xl p-5 dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]',
          wallpaper && 'wallpaper',
          stageClassName,
        )}
      >
        {/* The soft light the phone puts behind its cards, which the wallpaper doesn't need. */}
        {!wallpaper && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 size-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-flame opacity-[0.07] blur-3xl"
          />
        )}
        <div className={cn('relative', 'w-[min(56%,220px)]')}>
          {builtIn ? (
            <BuiltInCard kind={builtIn} size="small" />
          ) : (
            widget && <WidgetCard widget={widget} size="small" />
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-col items-center gap-3">
        {caption && (
          <figcaption className="max-w-80 text-center text-body-sm text-secondary">
            {caption}
          </figcaption>
        )}
      </div>
    </figure>
  )
}
