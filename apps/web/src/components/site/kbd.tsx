import { cn } from '@/lib/utils'

/** A keycap: a small white pill with a hairline, sized to sit inside a line of text. */
export function Kbd({ className, ...props }: React.ComponentProps<'kbd'>) {
  return (
    <kbd
      className={cn(
        'inline-flex h-[1.5em] min-w-[1.5em] items-center justify-center rounded-sm bg-surface px-1.5 align-[0.1em] font-sans text-[0.8em] font-semibold text-on-surface',
        'shadow-[inset_0_0_0_1px_var(--color-border),0_1px_0_var(--color-border)]',
        className,
      )}
      {...props}
    />
  )
}
