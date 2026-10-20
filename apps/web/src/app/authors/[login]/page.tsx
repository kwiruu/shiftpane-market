import { ArrowUpRight } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { WidgetGrid } from '@/components/market/widget-tile'
import { LogoMark } from '@/components/site/logo'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/format'
import { getAuthor, getAuthors, widgetsBy } from '@/lib/registry/gallery'
import { site } from '@/lib/site'

export const revalidate = 60

export async function generateStaticParams() {
  return (await getAuthors()).map((author) => ({ login: author.login }))
}

export async function generateMetadata({
  params,
}: PageProps<'/authors/[login]'>): Promise<Metadata> {
  const { login } = await params
  const author = await getAuthor(login)
  if (!author) return {}
  return {
    title: `${author.name}, widget author`,
    description: author.bio,
    alternates: { canonical: `/authors/${login}` },
  }
}

export default async function AuthorPage({ params }: PageProps<'/authors/[login]'>) {
  const { login } = await params
  const author = await getAuthor(login)
  if (!author) notFound()
  const widgets = await widgetsBy(login)

  return (
    <div className="frame flex flex-col pt-28 sm:pt-32">
      <header className="flex max-w-180 items-start gap-4">
        {author.official ? (
          <LogoMark className="size-16 flex-none" />
        ) : (
          <span
            aria-hidden="true"
            className="grid size-16 flex-none place-items-center rounded-full bg-surface text-headline-sm uppercase"
          >
            {author.name.slice(0, 1)}
          </span>
        )}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-headline-lg">{author.name}</h1>
            {author.official && <Badge variant="ink">Official</Badge>}
          </div>
          <p className="mt-1 text-body-sm text-secondary">
            @{author.login}
            <span aria-hidden="true"> · </span>
            Joined {formatDate(author.joinedAt)}
          </p>
          <p className="mt-3 max-w-[52ch] text-body-lg text-secondary">{author.bio}</p>
          <a
            href={author.official ? site.repo : `https://github.com/${author.login}`}
            className="mt-4 inline-flex items-center gap-0.5 text-label-lg underline decoration-border underline-offset-4 hover:decoration-current"
          >
            {author.official ? 'ShiftPane on GitHub' : 'On GitHub'}
            <ArrowUpRight aria-hidden="true" strokeWidth={1.75} className="size-3.5" />
          </a>
        </div>
      </header>

      <section aria-labelledby="author-widgets" className="mt-14">
        <h2 id="author-widgets" className="font-sans text-label-sm text-secondary uppercase">
          {widgets.length === 1 ? '1 widget' : `${widgets.length} widgets`}
        </h2>
        <WidgetGrid widgets={widgets} className="mt-3" />
      </section>
    </div>
  )
}
