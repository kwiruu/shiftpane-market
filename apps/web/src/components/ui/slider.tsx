'use client'

import { Slider as SliderPrimitive } from 'radix-ui'
import * as React from 'react'

import { cn } from '@/lib/utils'

// An ink range on a muted track, with a white knob. Radix gives the thumb role="slider", so its
// accessible name and value text go there.
function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  thumbLabelledBy,
  thumbValueText,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & {
  thumbLabelledBy?: string
  thumbValueText?: string
}) {
  const values = React.useMemo(
    () => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]),
    [value, defaultValue, min, max],
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        'relative flex h-6 w-full touch-none items-center select-none data-disabled:opacity-40',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1 grow overflow-hidden rounded-full bg-muted">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-primary" />
      </SliderPrimitive.Track>
      {values.map((_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          aria-labelledby={thumbLabelledBy}
          aria-valuetext={thumbValueText}
          className="block size-5 rounded-full bg-surface shadow-[0_0_0_1px_var(--color-border),0_2px_6px_rgb(0_0_0/0.12)] outline-none after:absolute after:-inset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
