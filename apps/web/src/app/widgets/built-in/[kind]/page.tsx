import { Check, ChevronLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BuiltInCard } from '@/components/market/built-in'
import { DefinitionCard, MetaRow } from '@/components/site/list-group'
import { Button } from '@/components/ui/button'
import { categoryInfo } from '@/lib/registry'
import { builtInEntries } from '@/lib/registry/catalog'

export function generateStaticParams() {
  return builtInEntries.map((entry) => ({ kind: entry.id }))
}

export async function generateMetadata({
  params,
}: PageProps<'/widgets/built-in/[kind]'>): Promise<Metadata> {
  const { kind } = await params
  const entry = builtInEntries.find((item) => item.id === kind)
  if (!entry) return {}
  return {
    title: `${entry.name} widget`,
    description: entry.summary,
    alternates: { canonical: `/widgets/built-in/${kind}` },
  }
}

export default async function BuiltInPage({ params }: PageProps<'/widgets/built-in/[kind]'>) {
  const { kind } = await params
  const entry = builtInEntries.find((item) => item.id === kind)
  if (entry?.type !== 'built-in') notFound()

  return (
    <div className="frame flex flex-col pt-28 sm:pt-32">
      <Link
        href="/widgets"
        className="-ml-1 mb-6 inline-flex items-center gap-1 self-start text-label-lg text-secondary transition-colors hover:text-on-surface"
      >
        <ChevronLeft aria-hidden="true" strokeWidth={1.75} className="size-4" />
        Widgets
      </Link>
      <header>
        <h1 className="text-headline-lg">{entry.name}</h1>
        <p className="mt-1 max-w-[48ch] text-body-lg text-secondary">{entry.summary}.</p>
        <p className="mt-3 text-body-sm text-secondary">By ShiftPane · Built in</p>
      </header>
      <div className="mt-10 grid gap-3 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6">
        <figure>
          <div
            role="img"
            aria-label={`${entry.name}, shown at small size with sample data`}
            className="board relative grid h-[420px] place-items-center overflow-hidden rounded-xl p-5 dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]"
          >
            <BuiltInCard kind={entry.id} size="small" className="w-[min(56%,220px)]" />
          </div>
          <figcaption className="mx-auto mt-4 max-w-80 text-center text-body-sm text-secondary">
            Shown with sample data. On your phone it shows your PC&apos;s own.
          </figcaption>
        </figure>
        <aside className="flex flex-col gap-3 lg:self-start">
          <div className="flex flex-col gap-3 rounded-lg bg-surface p-5">
            <Button disabled size="lg" className="w-full">
              <Check aria-hidden="true" /> Already installed
            </Button>
            <p className="text-body-sm text-secondary">
              Included with ShiftPane. Add it to your phone&apos;s board from Phone layout in the
              desktop app.
            </p>
            <Link
              href="/docs/widget-board"
              className="text-label-md text-on-surface underline decoration-border underline-offset-4 hover:decoration-current"
            >
              How to add widgets
            </Link>
          </div>
          <DefinitionCard label="Details">
            <MetaRow term="Author">ShiftPane</MetaRow>
            <MetaRow term="Availability">Built in</MetaRow>
            <MetaRow term="Category">
              {entry.categories.map((category) => categoryInfo[category].label).join(', ')}
            </MetaRow>
          </DefinitionCard>
        </aside>
      </div>
    </div>
  )
}
