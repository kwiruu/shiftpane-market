import { ArrowUpRight, ChevronRight } from 'lucide-react'
import Link from 'next/link'

import { cn } from '@/lib/utils'

/**
 * A definition card (DESIGN.md, Definition cards): a white card with a small uppercase label,
 * then rows split by tertiary hairlines. Use DefinitionRow for term and detail pairs, or ListRow
 * for links.
 */
export function DefinitionCard({
  label,
  inset = false,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<'section'>, 'title'> & {
  label?: string
  /** A muted well, for use inside another white card (the docs). */
  inset?: boolean
}) {
  return (
    <section
      className={cn(
        'rounded-lg px-5 py-2 sm:px-6',
        inset ? 'my-5 bg-muted sm:px-5' : 'bg-surface',
        className,
      )}
      {...props}
    >
      {label && (
        <h2 className="pt-4 pb-1 font-sans text-label-sm text-secondary uppercase">{label}</h2>
      )}
      <div
        className={cn(
          'flex flex-col [&>*+*]:border-t',
          inset ? '[&>*+*]:border-border' : '[&>*+*]:border-tertiary',
        )}
      >
        {children}
      </div>
    </section>
  )
}

/** A term on the left and its detail on the right; the detail moves underneath on phones. */
export function DefinitionRow({
  term,
  children,
  className,
}: {
  term: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('grid gap-1 py-4 sm:grid-cols-[200px_1fr] sm:gap-8', className)}>
      <div className="text-body-md text-on-surface">{term}</div>
      <div className="min-w-0 text-body-md text-secondary">{children}</div>
    </div>
  )
}

/** A row that links somewhere, with a chevron (or an arrow for other sites). */
export function ListRow({
  href,
  selected,
  className,
  children,
}: {
  href: string
  selected?: boolean
  className?: string
  children: React.ReactNode
}) {
  const external = !href.startsWith('/')
  const Icon = external ? ArrowUpRight : ChevronRight
  const classes = cn(
    'group/row -mx-2 flex min-h-12 items-center gap-3 rounded-md px-2 py-3 text-body-md text-on-surface transition-colors hover:bg-muted aria-[current=page]:bg-muted',
    className,
  )
  const content = (
    <>
      {children}
      <Icon
        aria-hidden="true"
        strokeWidth={1.75}
        className="ml-auto size-4 flex-none text-secondary transition-transform duration-200 group-hover/row:translate-x-0.5"
      />
    </>
  )

  return external ? (
    <a href={href} className={classes}>
      {content}
    </a>
  ) : (
    <Link href={href} aria-current={selected ? 'page' : undefined} className={classes}>
      {content}
    </Link>
  )
}

/** Title and subtitle stacked inside a row. */
export function RowText({ title, detail }: { title: React.ReactNode; detail?: React.ReactNode }) {
  return (
    <span className="flex min-w-0 flex-col">
      <span className="text-body-md text-on-surface">{title}</span>
      {detail && <span className="text-body-sm text-secondary">{detail}</span>}
    </span>
  )
}

/** A compact term and value on one line, for narrow cards such as a widget's details. */
export function MetaRow({ term, children }: { term: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3 text-body-sm">
      <span className="flex-none text-secondary">{term}</span>
      <span className="min-w-0 text-right text-on-surface">{children}</span>
    </div>
  )
}
