import type { Metadata } from 'next'
import { Suspense } from 'react'

import { getWidgets } from '@/lib/registry/gallery'

import { SearchResults } from './search-results'

export const metadata: Metadata = {
  title: 'Search widgets',
  description: 'Find widgets for the ShiftPane board by name, category, or what they read.',
  alternates: { canonical: '/widgets/search' },
}

export const revalidate = 60

// The page is prerendered; the results read the query in the browser, so it stays a static file.
export default async function SearchPage() {
  const widgets = await getWidgets()
  return (
    <div className="frame flex flex-col pt-28 sm:pt-32">
      <Suspense>
        <SearchResults widgets={widgets} />
      </Suspense>
    </div>
  )
}
