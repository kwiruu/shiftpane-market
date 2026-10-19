import type * as React from 'react'

import { cn } from '@/lib/utils'

// DESIGN.md, input: a white pill, 40px, body-md, with a hairline so it reads as a field on white
// cards too. An optional leading icon sits inside the pill.
function Input({
  className,
  icon,
  ...props
}: React.ComponentProps<'input'> & { icon?: React.ReactNode }) {
  return (
    <span
      data-slot="input"
      className={cn(
        'relative flex h-10 w-full items-center rounded-full bg-surface text-on-surface shadow-[inset_0_0_0_1px_var(--color-border)] transition-shadow focus-within:shadow-[inset_0_0_0_1px_var(--color-primary)]',
        className,
      )}
    >
      {icon && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 flex text-secondary [&_svg]:size-4"
        >
          {icon}
        </span>
      )}
      <input
        className={cn(
          'h-full w-full min-w-0 rounded-full bg-transparent px-4 text-body-md outline-none placeholder:text-secondary disabled:opacity-40 [&::-webkit-search-cancel-button]:hidden',
          icon && 'pl-10',
        )}
        {...props}
      />
    </span>
  )
}

export { Input }
