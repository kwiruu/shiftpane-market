import type { Metadata } from 'next'
import { Suspense } from 'react'

import { getWidgets } from '@/lib/registry'

import { SearchResults } from './search-results'

export const metadata: Metadata = {
  title: 'Search widgets',
  description: 'Find widgets for the ShiftPane board by name, category, or what they read.',
  alternates: { canonical: '/widgets/search' },
}

// The page is prerendered; the results read the query in the browser, so it stays a static file.
export default function SearchPage() {
  return (
    <div className="frame flex flex-col pt-28 sm:pt-32">
      <Suspense>
        <SearchResults widgets={getWidgets()} />
      </Suspense>
    </div>
  )
}
