'use client'

import type { Widget } from '@shiftpane/format'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CategoryChips } from '@/components/market/category-chips'
import { SearchForm } from '@/components/market/search-form'
import { CatalogGrid } from '@/components/market/widget-tile'
import { Button } from '@/components/ui/button'
import { categoryInfo, countByCategory, isCategory } from '@/lib/registry'
import { catalogEntries, searchCatalog } from '@/lib/registry/catalog'

/** The search box, the categories, and what matches, all from the URL. */
export function SearchResults({ widgets }: { widgets: Widget[] }) {
  const params = useSearchParams()
  const query = params.get('q')?.trim() ?? ''
  const rawCategory = params.get('category')
  const category = isCategory(rawCategory) ? rawCategory : undefined
  const results = searchCatalog(widgets, { query, category })

  const heading = query
    ? `Widgets matching “${query}”`
    : category
      ? categoryInfo[category].label
      : 'All widgets'

  return (
    <>
      <header className="max-w-180">
        <h1 className="text-headline-lg">{heading}</h1>
        <p className="mt-3 text-body-lg text-secondary" aria-live="polite">
          {results.length === 1 ? '1 widget' : `${results.length} widgets`}
          {category && query ? ` in ${categoryInfo[category].label}` : ''}
        </p>
        {/* Keyed by the query so the box follows back and forward navigation. */}
        <SearchForm
          key={query}
          query={query}
          category={category}
          className="mt-8 max-w-120"
          autoFocus={!query && !category}
        />
        <CategoryChips
          counts={countByCategory(catalogEntries(widgets))}
          current={category}
          query={query}
          className="mt-4"
        />
      </header>

      {results.length > 0 ? (
        <CatalogGrid entries={results} className="mt-10" />
      ) : (
        <div className="mt-10 flex flex-col items-start gap-4 rounded-lg bg-surface p-6 sm:p-8">
          <p className="text-body-md">Nothing matches that yet.</p>
          <p className="max-w-[48ch] text-body-md text-secondary">
            Try fewer words, or another category. Or make it: most widgets that show PC data take no
            code at all.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="primary">
              <Link href="/docs/making-widgets">Make a widget</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/widgets/search">All widgets</Link>
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
