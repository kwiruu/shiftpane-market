import type * as React from 'react'

import { cn } from '@/lib/utils'

// A muted well for longer text: notes to a reviewer, a reviewer's note, a report.
function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'w-full resize-y rounded-md bg-muted p-3 text-body-sm text-on-surface outline-none placeholder:text-secondary focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-60',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
