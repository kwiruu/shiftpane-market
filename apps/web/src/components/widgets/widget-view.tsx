'use client'

import { ViewWidget } from '@shiftpane/board'
import { configDefaults, sampleSources, type Widget, type WidgetSize } from '@shiftpane/format'
import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'

/*
 * The phone's widget board, drawn in the browser from a widget's view.json and sample.json
 * (DESIGN.md, Widget previews). The drawing is the app's own: `ViewWidget` from @shiftpane/board,
 * copied into vendor/shiftpane by `pnpm sync:shiftpane`, so a widget looks here exactly as it does
 * in the desktop window and on the phone. Like the phone, it renders only ShiftPane's own
 * components, so nothing a widget author wrote runs here either.
 *
 * System sources (`@cpu/percent` and the like) read the SDK's sample PC, and buttons do nothing.
 * Decorative: whatever contains a preview carries its text description.
 */

/** The shape of a tile, in board cells: small is one, medium two wide, large two by two. */
export const tileAspect: Record<WidgetSize, string> = {
  small: 'aspect-square',
  medium: 'aspect-[2.1/1]',
  large: 'aspect-square',
}

// A tenth of a cell, on each axis. Container units can't round the container itself, so percentages.
const tileRadius: Record<WidgetSize, string> = {
  small: '11%',
  medium: `${11 / 2.1}% / 11%`,
  large: '5.5%',
}

/**
 * The app's card padding, `fluid(12, 7.5, 24)`. A picture of a phone sets `--fmin: 0` on its board
 * so the padding shrinks with its cards instead of stopping at 12px.
 */
const padding = 'clamp(calc(12px * var(--fmin, 1)), 7.5cqmin, 24px)'

export function WidgetCard({
  widget,
  size,
  className,
}: {
  widget: Widget
  size: WidgetSize
  className?: string
}) {
  return (
    <div
      aria-hidden="true"
      inert
      className={cn(
        widget.tone === 'light' ? 'tone-light' : 'tone-dark',
        'relative isolate overflow-hidden bg-card text-card-ink shadow-[inset_0_0_0_1px_var(--card-edge)] [container-type:size]',
        tileAspect[size],
        className,
      )}
      style={{ borderRadius: tileRadius[size] } as CSSProperties}
    >
      {/* The padding sits inside the container so `cqmin` refers to this card, not the page. */}
      <div className="absolute inset-0 flex flex-col" style={{ padding }}>
        <ViewWidget
          view={widget.view}
          size={size}
          context={{
            sample: widget.sample,
            sources: sampleSources,
            config: configDefaults(widget.config),
          }}
          actions={widget.permissions.actions}
          connected
          onAction={() => {}}
        />
      </div>
    </div>
  )
}
