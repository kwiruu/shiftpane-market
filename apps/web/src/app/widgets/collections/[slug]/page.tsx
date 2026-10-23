import { ChevronLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { BuiltInWidgets } from '@/components/market/built-in'
import { WidgetGrid } from '@/components/market/widget-tile'
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
  const widgets = collection.widgets.flatMap((id) => listed.filter((widget) => widget.id === id))

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

      {widgets.length > 0 && (
        <section aria-labelledby="to-install" className="mt-14">
          <h2 id="to-install" className="font-sans text-label-sm text-secondary uppercase">
            From the gallery
          </h2>
          <WidgetGrid widgets={widgets} className="mt-3" />
        </section>
      )}

      {collection.builtIn.length > 0 && (
        <section aria-labelledby="built-in" className="mt-14">
          <h2 id="built-in" className="font-sans text-label-sm text-secondary uppercase">
            Comes with ShiftPane
          </h2>
          <BuiltInWidgets kinds={collection.builtIn} className="mt-3" />
        </section>
      )}
    </div>
  )
}
