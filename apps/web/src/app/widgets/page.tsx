import type { Metadata } from 'next'
import { BuiltInWidgets } from '@/components/market/built-in'
import { CategoryChips } from '@/components/market/category-chips'
import { SearchForm } from '@/components/market/search-form'
import { WidgetGrid } from '@/components/market/widget-tile'
import { Badge } from '@/components/ui/badge'
import { countByCategory, featuredWidgets } from '@/lib/registry'
import { getWidgets } from '@/lib/registry/gallery'

const description =
  'Free widgets for the ShiftPane board on your phone. Each is checked and reviewed by a person before it is listed.'

export const metadata: Metadata = {
  title: 'Widgets',
  description,
  alternates: { canonical: '/widgets' },
  openGraph: { type: 'website', title: 'Widgets', description, url: '/widgets' },
}

export const revalidate = 60

export default async function WidgetsHome() {
  const widgets = await getWidgets()
  const counts = countByCategory(widgets)
  return (
    <div className="frame flex flex-col pt-28 sm:pt-32">
      <header className="max-w-180">
        <Badge live variant="outline" className="mb-5" data-cursor="More when uploads open">
          First-party widgets while the gallery opens
        </Badge>
        <h1 className="text-headline-lg">Widgets</h1>
        <p className="mt-3 max-w-[44ch] text-body-lg text-secondary">
          Free widgets for your phone&apos;s board. Each one is checked, then reviewed by a person,
          before it&apos;s listed, and installs in the ShiftPane app.
        </p>
        <SearchForm className="mt-8 max-w-120" />
        <CategoryChips counts={counts} className="mt-4" />
      </header>

      <section aria-labelledby="featured" className="mt-14">
        <h2 id="featured" className="font-sans text-label-sm text-secondary uppercase">
          Featured
        </h2>
        <WidgetGrid widgets={featuredWidgets(widgets)} className="mt-3" />
      </section>

      <section aria-labelledby="built-in" className="mt-14">
        <h2 id="built-in" className="font-sans text-label-sm text-secondary uppercase">
          Comes with ShiftPane
        </h2>
        <p className="mt-1 max-w-[60ch] text-body-sm text-secondary">
          Already in the app, so there&apos;s nothing to install: add them to your board from its
          Widgets page.
        </p>
        <BuiltInWidgets className="mt-3" />
      </section>
    </div>
  )
}
