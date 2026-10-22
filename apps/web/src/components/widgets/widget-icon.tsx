'use client'

// A client module only because @shiftpane/board/parts also holds hooks; the icons themselves are static.
import { WidgetIcon as AppWidgetIcon } from '@shiftpane/board/parts'
import type { CSSProperties } from 'react'

import { cn } from '@/lib/utils'

/**
 * Icons by name, for a widget's `icon` and the `icon` and `button` nodes in its view: the app's own
 * (Solar, from @shiftpane/board), so a widget's icon is the same here as on the phone. Unknown names
 * draw a dot rather than failing.
 */
export function WidgetIcon({
  name,
  className,
  style,
}: {
  name: string
  className?: string
  style?: CSSProperties
}) {
  return <AppWidgetIcon name={name} className={cn('flex-none', className)} style={style} />
}

/** A widget's icon on a black tile, the way the app lists it. */
export function WidgetGlyph({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid size-10 flex-none place-items-center rounded-md bg-black text-white dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12)]',
        className,
      )}
    >
      <WidgetIcon name={name} className="size-[45%]" />
    </span>
  )
}
