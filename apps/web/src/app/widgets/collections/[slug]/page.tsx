import { ChevronLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { CatalogGrid } from '@/components/market/widget-tile'
import { catalogEntries } from '@/lib/registry/catalog'
import { collectionBySlug, collections } from '@/lib/registry/collections'
import { getWidgets } from '@/lib/registry/gallery'

export const revalidate = 60

export function generateStaticParams() {
  return collections.map((collection) => ({ slug: collection.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<'/widgets/collections/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const collection = collectionBySlug(slug)
  if (!collection) return {}
  return {
    title: `${collection.title}: widgets`,
    description: collection.summary,
    alternates: { canonical: `/widgets/collections/${slug}` },
  }
}

/** A collection: its gallery widgets to install, then the ones that come with the app. */
export default async function CollectionPage({ params }: PageProps<'/widgets/collections/[slug]'>) {
  const { slug } = await params
  const collection = collectionBySlug(slug)
  if (!collection) notFound()
  const listed = await getWidgets()
  const entries = catalogEntries(listed).filter((entry) =>
    entry.type === 'built-in'
      ? collection.builtIn.includes(entry.id)
      : collection.widgets.includes(entry.id),
  )

  return (
    <div className="frame flex flex-col pt-28 sm:pt-32">
      <Link
        href="/widgets"
        className="mb-6 inline-flex w-fit items-center gap-1 text-body-sm text-secondary hover:text-on-surface"
      >
        <ChevronLeft aria-hidden="true" strokeWidth={1.75} className="size-4" />
        Widgets
      </Link>
      <header className="max-w-180">
        <p className="font-sans text-label-sm text-secondary uppercase">Collection</p>
        <h1 className="mt-2 text-headline-lg">{collection.title}</h1>
        <p className="mt-3 max-w-[44ch] text-body-lg text-secondary">{collection.summary}</p>
      </header>

      <CatalogGrid entries={entries} className="mt-10" />
    </div>
  )
}
