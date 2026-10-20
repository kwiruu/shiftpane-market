import { type Category, categories } from '@shiftpane/format'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { categoryInfo } from '@/lib/registry'
import { cn } from '@/lib/utils'

/** The categories as chips, each a search link; the current one is the ink chip. */
export function CategoryChips({
  counts,
  current,
  query,
  className,
}: {
  /** Widgets per category; empty categories aren't shown. */
  counts: Record<Category, number>
  current?: Category
  /** Keeps the words being searched for when switching category. */
  query?: string
  className?: string
}) {
  const href = (category?: Category) => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (category) params.set('category', category)
    const search = params.toString()
    return `/widgets/search${search ? `?${search}` : ''}`
  }
  return (
    <nav aria-label="Categories" className={cn('flex flex-wrap gap-2', className)}>
      <Badge asChild variant={current ? 'outline' : 'ink'} className="hover:opacity-85">
        <Link href={href()} aria-current={current ? undefined : 'page'}>
          All
        </Link>
      </Badge>
      {categories
        .filter((category) => counts[category] > 0 || category === current)
        .map((category) => (
          <Badge
            key={category}
            asChild
            variant={current === category ? 'ink' : 'outline'}
            className={current === category ? 'hover:opacity-85' : 'hover:bg-muted'}
          >
            <Link href={href(category)} aria-current={current === category ? 'page' : undefined}>
              {categoryInfo[category].label}
              <span className={current === category ? 'opacity-60' : 'text-secondary'}>
                {counts[category]}
              </span>
            </Link>
          </Badge>
        ))}
    </nav>
  )
}
