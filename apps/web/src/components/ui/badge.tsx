import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import type * as React from 'react'

import { cn } from '@/lib/utils'

// DESIGN.md, chip: a compact white pill, 28px, body-sm. `live` adds the accent dot.
const badgeVariants = cva(
  'group/badge inline-flex h-7 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full px-3 text-body-sm whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-primary [&>svg]:pointer-events-none [&>svg]:size-3.5',
  {
    variants: {
      variant: {
        default: 'bg-surface text-on-surface',
        outline: 'bg-surface text-on-surface shadow-[inset_0_0_0_1px_var(--color-border)]',
        muted: 'bg-muted text-on-surface',
        ink: 'bg-primary text-surface',
        destructive: 'bg-surface text-error',
        success: 'bg-surface text-success',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant = 'default',
  live = false,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean; live?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span'

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    >
      {live && <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />}
      {/* With asChild, the child element becomes the badge and the dot goes inside it. */}
      <Slot.Slottable>{children}</Slot.Slottable>
    </Comp>
  )
}

export { Badge, badgeVariants }
