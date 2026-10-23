import { addedPermissions } from '@shiftpane/format'
import { ArrowUpRight, ChevronLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ReportWidget } from '@/components/account/report-widget'
import { PermissionList } from '@/components/market/permission-list'
import { Readme } from '@/components/market/readme'
import { SourceViewer } from '@/components/market/source-viewer'
import { DefinitionCard, MetaRow } from '@/components/site/list-group'
import { WidgetStructuredData } from '@/components/site/structured-data'
import { Button } from '@/components/ui/button'
import { PreviewStage } from '@/components/widgets/preview-stage'
import { WidgetGlyph } from '@/components/widgets/widget-icon'
import { formatDate, formatInterval } from '@/lib/format'
import { categoryInfo, updatedAt } from '@/lib/registry'
import { getAuthor, getWidget, getWidgets, hasApi } from '@/lib/registry/gallery'
import { packageFiles } from '@/lib/registry/package'
import { installLink } from '@/lib/site'

// Listed widgets are prerendered and refreshed in the background (ISR); one approved after the
// build renders on its first visit. Ids the gallery doesn't have are a 404.
export const revalidate = 60

export async function generateStaticParams() {
  return (await getWidgets()).map((widget) => ({ id: widget.id }))
}

export async function generateMetadata({ params }: PageProps<'/widgets/[id]'>): Promise<Metadata> {
  const { id } = await params
  const widget = await getWidget(id)
  if (!widget) return {}
  return {
    title: `${widget.name} widget`,
    description: widget.summary,
    alternates: { canonical: `/widgets/${id}` },
    openGraph: {
      type: 'website',
      title: widget.name,
      description: widget.summary,
      url: `/widgets/${id}`,
    },
  }
}

export default async function WidgetPage({ params }: PageProps<'/widgets/[id]'>) {
  const { id } = await params
  const widget = await getWidget(id)
  if (!widget) notFound()

  const author = await getAuthor(widget.author)
  const latest = widget.versions[0]

  return (
    <div className="frame flex flex-col pt-28 sm:pt-32">
      <WidgetStructuredData widget={widget} />
      <Link
        href="/widgets"
        className="-ml-1 mb-6 inline-flex items-center gap-1 self-start text-label-lg text-secondary transition-colors hover:text-on-surface"
      >
        <ChevronLeft aria-hidden="true" strokeWidth={1.75} className="size-4" />
        Widgets
      </Link>

      <header className="flex items-start gap-4">
        <WidgetGlyph name={widget.icon} className="size-14 rounded-lg" />
        <div className="min-w-0">
          <h1 className="text-headline-lg">{widget.name}</h1>
          <p className="mt-1 max-w-[48ch] text-body-lg text-secondary">{widget.summary}</p>
          <p className="mt-3 text-body-sm text-secondary">
            By{' '}
            <Link
              href={`/authors/${widget.author}`}
              className="text-on-surface underline decoration-border underline-offset-4 hover:decoration-current"
            >
              {author?.name ?? widget.author}
            </Link>
            {author?.verified && <span className="ml-1.5 text-on-surface">✓ Verified</span>}
            <span aria-hidden="true"> · </span>
            {latest && <>Version {latest.version}</>}
            <span aria-hidden="true"> · </span>
            Updated {formatDate(updatedAt(widget))}
          </p>
        </div>
      </header>

      <div className="mt-10 grid gap-3 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6">
        <div className="flex min-w-0 flex-col gap-3">
          <PreviewStage
            widget={widget}
            stageClassName="h-[420px]"
            caption="Drawn in your browser from the widget's sample data. On your phone it shows your PC's own."
          />

          <section aria-labelledby="readme" className="mt-6 rounded-lg bg-surface p-6 sm:p-8">
            <h2 id="readme" className="mb-4 font-sans text-label-sm text-secondary uppercase">
              Readme
            </h2>
            <Readme source={widget.readme} />
          </section>

          <section aria-labelledby="source" className="rounded-lg bg-surface p-6 sm:p-8">
            <h2 id="source" className="font-sans text-label-sm text-secondary uppercase">
              Source
            </h2>
            <p className="mt-2 mb-5 max-w-[56ch] text-body-sm text-secondary">
              Every file in the package, exactly as reviewed.{' '}
              {widget.collector
                ? 'collector.js is the only code, and it runs in the sandbox on your PC.'
                : 'There is no collector, so no code from this widget runs anywhere.'}
            </p>
            <SourceViewer files={packageFiles(widget)} />
          </section>
        </div>

        <aside className="flex flex-col gap-3 lg:sticky lg:top-[calc(var(--spacing-header)+24px)] lg:self-start">
          <div className="flex flex-col gap-3 rounded-lg bg-surface p-5">
            <Button asChild size="lg" className="w-full">
              <a href={installLink(widget.id)} data-cursor="Opens ShiftPane on this PC">
                Install in ShiftPane
              </a>
            </Button>
            <p className="text-body-sm text-secondary">
              Opens the desktop app, which checks the package&apos;s signature, then shows you what
              it can do before anything runs. Needs ShiftPane {widget.minAppVersion} or later.
            </p>
            <Link
              href="/docs/install"
              className="text-label-md text-on-surface underline decoration-border underline-offset-4 hover:decoration-current"
            >
              Don&apos;t have ShiftPane yet?
            </Link>
          </div>

          <PermissionList permissions={widget.permissions} />

          <DefinitionCard label="Details">
            <MetaRow term="Version">{latest?.version}</MetaRow>
            <MetaRow term="Updated">{formatDate(updatedAt(widget))}</MetaRow>
            <MetaRow term="Listed">{formatDate(widget.createdAt)}</MetaRow>
            {widget.installs ? (
              <MetaRow term="Installs">{widget.installs.toLocaleString('en')}</MetaRow>
            ) : null}
            <MetaRow term="Sizes">
              <span className="capitalize">{widget.sizes.join(', ')}</span>
            </MetaRow>
            {widget.refreshSeconds && (
              <MetaRow term="Refreshes">{formatInterval(widget.refreshSeconds)}</MetaRow>
            )}
            <MetaRow term="Category">
              {widget.categories.map((category, index) => (
                <span key={category}>
                  {index > 0 && ', '}
                  <Link
                    href={`/widgets/search?category=${category}`}
                    className="underline decoration-border underline-offset-4 hover:decoration-current"
                  >
                    {categoryInfo[category].label}
                  </Link>
                </span>
              ))}
            </MetaRow>
            <MetaRow term="License">{widget.license}</MetaRow>
            {widget.repository && (
              <MetaRow term="Repository">
                <a
                  href={widget.repository}
                  className="inline-flex items-center gap-0.5 underline decoration-border underline-offset-4 hover:decoration-current"
                >
                  Source
                  <ArrowUpRight aria-hidden="true" strokeWidth={1.75} className="size-3.5" />
                </a>
              </MetaRow>
            )}
          </DefinitionCard>

          {widget.config.length > 0 && (
            <DefinitionCard label="Settings">
              {widget.config.map((field) => (
                <div key={field.key} className="py-3 text-body-sm">
                  <p className="flex justify-between gap-4">
                    <span>{field.label}</span>
                    <span className="text-secondary">
                      {field.default !== undefined
                        ? String(field.default)
                        : field.required
                          ? 'Required'
                          : 'Optional'}
                    </span>
                  </p>
                  {field.help && <p className="mt-0.5 text-secondary">{field.help}</p>}
                </div>
              ))}
            </DefinitionCard>
          )}

          <DefinitionCard label="Versions">
            {widget.versions.map((version, index) => {
              const previous = widget.versions[index + 1]
              const added = previous
                ? addedPermissions(previous.permissions, version.permissions)
                : []
              return (
                <div key={version.version} className="py-3 text-body-sm">
                  <p className="flex justify-between gap-4">
                    <span className="font-mono text-code">{version.version}</span>
                    <span className="text-secondary">{formatDate(version.publishedAt)}</span>
                  </p>
                  <p className="mt-1 text-secondary">{version.notes}</p>
                  {added.length > 0 && (
                    <p className="mt-1 text-secondary">
                      <span className="text-on-surface">Asked again:</span>{' '}
                      {added.map((line) => line.text).join('; ')}
                    </p>
                  )}
                </div>
              )
            })}
          </DefinitionCard>

          <ReportWidget enabled={hasApi} widgetId={widget.id} version={latest?.version} />
        </aside>
      </div>
    </div>
  )
}
