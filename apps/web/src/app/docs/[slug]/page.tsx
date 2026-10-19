import { ArrowLeft, ArrowRight, ChevronLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DocStructuredData } from '@/components/site/structured-data'
import { TableOfContents } from '@/components/site/table-of-contents'
import { docs, getDoc, getNeighbors } from '@/lib/docs'
import { getHeadings } from '@/lib/toc'

// Every doc is prerendered at build time; unknown slugs are a 404.
export const dynamicParams = false

export function generateStaticParams() {
  return docs.map((doc) => ({ slug: doc.slug }))
}

export async function generateMetadata({ params }: PageProps<'/docs/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const doc = getDoc(slug)
  if (!doc) return {}
  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical: `/docs/${slug}` },
    openGraph: {
      type: 'article',
      title: doc.title,
      description: doc.description,
      url: `/docs/${slug}`,
    },
  }
}

export default async function DocPage({ params }: PageProps<'/docs/[slug]'>) {
  const { slug } = await params
  const doc = getDoc(slug)
  if (!doc) notFound()

  const { default: Content } = await import(`@/content/docs/${slug}.mdx`)
  const headings = await getHeadings(slug)
  const { previous, next } = getNeighbors(slug)

  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_184px] xl:gap-14">
      <DocStructuredData title={doc.title} description={doc.description} slug={slug} />
      <article className="min-w-0 max-w-180">
        {/* On phones the sidebar is hidden, so offer the way back. */}
        <Link
          href="/docs"
          className="-ml-1 mb-6 inline-flex items-center gap-1 text-label-lg text-secondary md:hidden"
        >
          <ChevronLeft aria-hidden="true" strokeWidth={1.75} className="size-4" />
          Documentation
        </Link>

        <header>
          <h1 className="text-headline-lg">{doc.title}</h1>
          <p className="mt-3 max-w-[40ch] text-body-lg text-secondary">{doc.description}</p>
        </header>

        <div className="mt-8 rounded-lg bg-surface p-6 sm:p-8">
          <Content />
        </div>

        {(previous || next) && (
          <nav aria-label="More documentation" className="mt-3 grid grid-cols-2 gap-3">
            {previous ? (
              <Link
                href={`/docs/${previous.slug}`}
                className="flex flex-col gap-1 rounded-lg bg-surface p-4 transition-colors hover:bg-muted"
              >
                <span className="inline-flex items-center gap-1 text-label-sm text-secondary uppercase">
                  <ArrowLeft aria-hidden="true" strokeWidth={1.75} className="size-3" />
                  Previous
                </span>
                <span className="text-body-md">{previous.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                href={`/docs/${next.slug}`}
                className="flex flex-col items-end gap-1 rounded-lg bg-surface p-4 text-right transition-colors hover:bg-muted"
              >
                <span className="inline-flex items-center gap-1 text-label-sm text-secondary uppercase">
                  Next
                  <ArrowRight aria-hidden="true" strokeWidth={1.75} className="size-3" />
                </span>
                <span className="text-body-md">{next.title}</span>
              </Link>
            )}
          </nav>
        )}
      </article>

      {/* Only when there's something to jump between. Hidden below 1280px, where it would crowd the doc. */}
      {headings.length > 1 && (
        <aside className="hidden xl:block">
          <div
            data-lenis-prevent
            className="sticky top-[calc(var(--spacing-header)+24px)] max-h-[calc(100dvh-var(--spacing-header)-48px)] overflow-y-auto pt-1 pb-8"
          >
            <TableOfContents items={headings} />
          </div>
        </aside>
      )}
    </div>
  )
}
