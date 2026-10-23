import type { Metadata } from 'next'
import Link from 'next/link'
import { CategoryChips } from '@/components/market/category-chips'
import { SearchForm } from '@/components/market/search-form'
import { CatalogGrid } from '@/components/market/widget-tile'
import { Badge } from '@/components/ui/badge'
import { countByCategory } from '@/lib/registry'
import { catalogEntries } from '@/lib/registry/catalog'
import { collections } from '@/lib/registry/collections'
import { getWidgets } from '@/lib/registry/gallery'

const description =
  'Explore all ShiftPane widgets in one gallery, including built-in widgets and free marketplace extras.'

export const metadata: Metadata = {
  title: 'Widgets',
  description,
  alternates: { canonical: '/widgets' },
  openGraph: { type: 'website', title: 'Widgets', description, url: '/widgets' },
}

export const revalidate = 60

export default async function WidgetsHome() {
  const widgets = await getWidgets()
  const entries = catalogEntries(widgets)
  const counts = countByCategory(entries)
  return (
    <div className="frame flex flex-col pt-28 sm:pt-32">
      <header className="max-w-180">
        <Badge live variant="outline" className="mb-5" data-cursor="More when uploads open">
          First-party widgets while the gallery opens
        </Badge>
        <h1 className="text-headline-lg">Widgets</h1>
        <p className="mt-3 max-w-[44ch] text-body-lg text-secondary">
          Explore every widget for your phone&apos;s board, from the ones built into ShiftPane to
          free extras you can install. Previews show each widget in its small layout.
        </p>
        <SearchForm className="mt-8 max-w-120" />
        <CategoryChips counts={counts} className="mt-4" />
      </header>

      <section aria-labelledby="all-widgets" className="mt-14">
        <h2 id="all-widgets" className="font-sans text-label-sm text-secondary uppercase">
          All widgets
        </h2>
        <CatalogGrid entries={entries} className="mt-3" />
      </section>

      <section aria-labelledby="collections" className="mt-14">
        <h2 id="collections" className="font-sans text-label-sm text-secondary uppercase">
          Collections
        </h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-3">
          {collections.map((collection) => (
            <li key={collection.slug} className="flex">
              <Link
                href={`/widgets/collections/${collection.slug}`}
                data-cursor={`Open ${collection.title}`}
                className="flex flex-1 flex-col rounded-lg bg-surface p-5 transition-colors hover:bg-muted"
              >
                <h3 className="font-sans text-body-md">{collection.title}</h3>
                <p className="mt-1 text-body-sm text-secondary">{collection.summary}</p>
                <p className="mt-auto pt-4 text-label-md text-secondary">
                  {collection.widgets.length + collection.builtIn.length} widgets
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
