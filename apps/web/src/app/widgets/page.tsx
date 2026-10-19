import type { Metadata } from 'next'
import Link from 'next/link'

import { CategoryChips } from '@/components/market/category-chips'
import { SearchForm } from '@/components/market/search-form'
import { WidgetGrid } from '@/components/market/widget-tile'
import { DefinitionCard, ListRow, RowText } from '@/components/site/list-group'
import { Badge } from '@/components/ui/badge'
import { WidgetGlyph } from '@/components/widgets/widget-icon'
import { formatDate } from '@/lib/format'
import {
  categoryInfo,
  countByCategory,
  featuredWidgets,
  getWidgets,
  newestWidgets,
} from '@/lib/registry'
import { categories } from '@/lib/registry/types'

const description =
  'Free widgets for the ShiftPane board on your phone. Each is checked and reviewed by a person before it is listed.'

export const metadata: Metadata = {
  title: 'Widgets',
  description,
  alternates: { canonical: '/widgets' },
  openGraph: { type: 'website', title: 'Widgets', description, url: '/widgets' },
}

export default function WidgetsHome() {
  const counts = countByCategory()
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
        <CategoryChips className="mt-4" />
      </header>

      <section aria-labelledby="featured" className="mt-14">
        <h2 id="featured" className="font-sans text-label-sm text-secondary uppercase">
          Featured
        </h2>
        <WidgetGrid widgets={featuredWidgets()} className="mt-3" />
      </section>

      <div className="mt-14 grid gap-3 lg:grid-cols-2">
        <DefinitionCard label="New" className="self-start">
          {newestWidgets(5).map((widget) => (
            <ListRow key={widget.id} href={`/widgets/${widget.id}`}>
              <WidgetGlyph name={widget.icon} className="size-9" />
              <RowText
                title={widget.name}
                detail={`${formatDate(widget.createdAt)} · ${widget.summary}`}
              />
            </ListRow>
          ))}
        </DefinitionCard>

        <div className="flex flex-col gap-3">
          <DefinitionCard label="Categories">
            {categories
              .filter((category) => counts[category] > 0)
              .map((category) => (
                <ListRow key={category} href={`/widgets/search?category=${category}`}>
                  <span className="flex min-w-0 flex-1 items-center justify-between gap-4">
                    <RowText
                      title={categoryInfo[category].label}
                      detail={categoryInfo[category].description}
                    />
                    <span className="text-body-sm text-secondary tabular-nums">
                      {counts[category]}
                    </span>
                  </span>
                </ListRow>
              ))}
          </DefinitionCard>

          <DefinitionCard label="Make your own">
            <ListRow href="/docs/making-widgets">
              <RowText title="Making widgets" detail="Three ways in, one package out." />
            </ListRow>
            <ListRow href="/upload">
              <RowText title="Publish a widget" detail="Checks, review, then it's listed here." />
            </ListRow>
          </DefinitionCard>
        </div>
      </div>

      <p className="mt-6 text-body-sm text-secondary">
        {getWidgets().length} widgets.{' '}
        <Link
          href="/widgets/search"
          className="text-on-surface underline decoration-border underline-offset-4 hover:decoration-current"
        >
          See them all
        </Link>
        .
      </p>
    </div>
  )
}
