import type { Category } from '@shiftpane/format'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

/** A plain GET form: searching works without JavaScript, and the results page reads the URL. */
export function SearchForm({
  query,
  category,
  className,
  autoFocus,
}: {
  query?: string
  category?: Category
  className?: string
  autoFocus?: boolean
}) {
  return (
    <form action="/widgets/search" className={cn('flex gap-2', className)}>
      <label htmlFor="widget-search" className="sr-only">
        Search widgets
      </label>
      <Input
        id="widget-search"
        type="search"
        name="q"
        defaultValue={query}
        placeholder="Search widgets: GPU, GitHub, music…"
        icon={<Search strokeWidth={1.75} />}
        autoComplete="off"
        autoFocus={autoFocus}
      />
      {category && <input type="hidden" name="category" value={category} />}
    </form>
  )
}
