'use client'

import { type PcData, SampleFeed, WIDGET_KINDS, WidgetCard } from '@shiftpane/board'
import type { WidgetSize } from '@shiftpane/format'
import { type CSSProperties, useEffect, useSyncExternalStore } from 'react'
import { cn } from '@/lib/utils'

/** A widget that comes with ShiftPane: a clock, the calendar, now playing, the PC's stats. */
export type BuiltInKind = keyof typeof WIDGET_KINDS

/** In the order the app lists them. */
const KINDS = Object.keys(WIDGET_KINDS) as BuiltInKind[]

// One sample PC for the whole page, running while anything shows it.
const feed = new SampleFeed()
let showing = 0

function useSampleData(): PcData {
  useEffect(() => {
    showing += 1
    feed.start()
    return () => {
      showing -= 1
      if (showing === 0) feed.stop()
    }
  }, [])
  return useSyncExternalStore(feed.store.subscribe, feed.store.getState, feed.store.getState)
}

const aspect: Record<WidgetSize, string> = {
  small: 'aspect-square',
  medium: 'aspect-[2.1/1]',
  large: 'aspect-square',
}

// A tenth of a cell, on each axis, as the gallery's cards.
const radius: Record<WidgetSize, string> = {
  small: '11%',
  medium: `${11 / 2.1}% / 11%`,
  large: '5.5%',
}

/**
 * A built-in widget drawn by the app's own code (@shiftpane/board) from its sample PC, which
 * wanders a little each second. Decorative, like the other pictures of widgets.
 */
export function BuiltInCard({
  kind,
  size,
  className,
}: {
  kind: BuiltInKind
  size: WidgetSize
  className?: string
}) {
  const data = useSampleData()
  return (
    <div
      aria-hidden="true"
      inert
      className={cn('overflow-hidden', aspect[size], className)}
      style={{ borderRadius: radius[size] }}
    >
      <WidgetCard
        widget={{ kind, tone: WIDGET_KINDS[kind].tone }}
        radius={0}
        data={data}
        connected
        onMediaAction={() => {}}
      />
    </div>
  )
}

/**
 * The widgets that come with ShiftPane. They're in the app already, so there's nothing to install
 * and no page for each: these tiles only show what they look like.
 */
export function BuiltInWidgets({
  kinds = KINDS,
  className,
}: {
  /** Which ones, in this order; all of them by default. */
  kinds?: BuiltInKind[]
  className?: string
}) {
  return (
    <ul className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {kinds.map((kind) => {
        const info = WIDGET_KINDS[kind]
        const wide = info.columns === 2
        return (
          <li key={kind} className="flex flex-col rounded-lg bg-surface p-2">
            {/* A thumbnail like a gallery tile's: the cards are a fraction of a phone's. */}
            <div
              className="board relative grid aspect-[16/10] place-items-center overflow-hidden rounded-md dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]"
              style={{ '--fmin': 0 } as CSSProperties}
            >
              <BuiltInCard
                kind={kind}
                size={wide ? 'medium' : 'small'}
                className={wide ? 'w-[82%]' : 'w-[42%]'}
              />
            </div>
            <div className="flex flex-1 flex-col px-2 pt-3 pb-2">
              <h3 className="font-sans text-body-md">{info.name}</h3>
              <p className="mt-0.5 line-clamp-2 text-body-sm text-secondary">{info.description}.</p>
              <p className="mt-auto pt-3 text-label-md text-secondary">ShiftPane · Built in</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
