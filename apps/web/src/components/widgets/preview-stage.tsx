'use client'

import type { Widget, WidgetSize } from '@shiftpane/format'
import { useState } from 'react'
import { cn } from '@/lib/utils'

import { SizeSwitch } from './size-switch'
import { WidgetCard } from './widget-view'

// One board cell, as wide as the phone draws it at this size of stage. Large tiles are two by two.
const width: Record<WidgetSize, string> = {
  small: 'w-[min(36%,180px)]',
  medium: 'w-[min(78%,380px)]',
  large: 'w-[min(78%,380px)]',
}

/**
 * A widget on a patch of the phone's black board, with its sizes under it. The stage is as tall
 * as the largest tile, so picking a size never moves the page (DESIGN.md, Widget previews). The
 * landing page puts it on the desktop wallpaper instead.
 */
export function PreviewStage({
  widget,
  caption,
  className,
  stageClassName,
  wallpaper,
}: {
  widget: Widget
  caption?: React.ReactNode
  className?: string
  stageClassName?: string
  wallpaper?: boolean
}) {
  const [size, setSize] = useState<WidgetSize>(
    widget.sizes.includes('medium') ? 'medium' : (widget.sizes[0] ?? 'small'),
  )
  return (
    <figure className={className}>
      <div
        role="img"
        aria-label={`${widget.name}, shown at ${size} size with sample data`}
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
        <div className={cn('relative', width[size])}>
          <WidgetCard widget={widget} size={size} />
        </div>
      </div>
      <div className="mt-4 flex flex-col items-center gap-3">
        <SizeSwitch sizes={widget.sizes} value={size} onChange={setSize} label={widget.name} />
        {caption && (
          <figcaption className="max-w-80 text-center text-body-sm text-secondary">
            {caption}
          </figcaption>
        )}
      </div>
    </figure>
  )
}
