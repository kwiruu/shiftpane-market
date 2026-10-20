'use client'

import type { WidgetSize } from '@shiftpane/format'
import { useId } from 'react'
import { cn } from '@/lib/utils'

/** A segmented control for a widget's sizes: a muted pill, the chosen size on a white pill. */
export function SizeSwitch({
  sizes,
  value,
  onChange,
  label,
}: {
  sizes: WidgetSize[]
  value: WidgetSize
  onChange: (size: WidgetSize) => void
  /** What the sizes are of, for screen readers: "GPU ring". */
  label: string
}) {
  const id = useId()
  if (sizes.length < 2) return null
  return (
    <div className="inline-flex rounded-full bg-muted p-0.5">
      <span className="sr-only" id={id}>
        {label} size
      </span>
      {sizes.map((size) => (
        <button
          key={size}
          type="button"
          aria-pressed={value === size}
          aria-describedby={id}
          onClick={() => onChange(size)}
          className={cn(
            'rounded-full px-3 py-1 text-label-md capitalize transition-colors',
            value === size
              ? 'bg-surface text-on-surface shadow-xs'
              : 'text-secondary hover:text-on-surface',
          )}
        >
          {size}
        </button>
      ))}
    </div>
  )
}
