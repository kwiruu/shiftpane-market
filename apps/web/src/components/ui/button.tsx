import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import type * as React from 'react'

import { cn } from '@/lib/utils'

// DESIGN.md, Buttons: pills, 40px tall, label-lg. Primary is ink on light, secondary is a white
// surface, tertiary is text only. States stay subtle: a small contrast shift and a 0.98 press.
const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full text-label-lg whitespace-nowrap transition-[background-color,color,opacity,scale] duration-200 ease-out-expo outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40 motion-reduce:active:scale-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-surface hover:opacity-85',
        primary: 'bg-primary text-surface hover:opacity-85',
        secondary: 'bg-surface text-on-surface hover:bg-muted',
        outline:
          'bg-surface text-on-surface shadow-[inset_0_0_0_1px_var(--color-border)] hover:bg-muted',
        ghost: 'text-on-surface hover:bg-muted',
        tertiary:
          'h-auto! min-h-0! rounded-none px-0! text-label-md text-on-surface hover:opacity-70 active:scale-100',
        destructive: 'bg-surface text-error hover:bg-muted',
        link: 'h-auto! min-h-0! rounded-none px-0! text-on-surface underline underline-offset-4 decoration-border hover:decoration-current active:scale-100',
      },
      size: {
        default: 'min-h-10 px-4',
        sm: 'min-h-8 px-3 text-label-md',
        lg: 'min-h-12 px-5 text-body-md font-semibold',
        icon: 'size-10',
        // 32px to look at, 40px to hit.
        'icon-sm': 'size-8 after:absolute after:-inset-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
