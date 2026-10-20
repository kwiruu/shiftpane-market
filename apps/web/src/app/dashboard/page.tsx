import { ChevronRight, Plus } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { SampleNotice } from '@/components/market/sample-notice'
import { StatusBadge } from '@/components/market/status-badge'
import { Button } from '@/components/ui/button'
import { WidgetGlyph } from '@/components/widgets/widget-icon'
import { formatDate } from '@/lib/format'
import { submissions } from '@/lib/registry/review'
import { widgets as sampleWidgets } from '@/lib/registry/seed'

export const metadata: Metadata = {
  title: 'Your widgets',
  robots: { index: false, follow: false },
}

/**
 * The author dashboard (PLAN, W4). Signed-in authors will see their own widgets here; until sign-in
 * exists it shows the first-party widgets and the sample submissions, and says so.
 */
export default function DashboardPage() {
  const widgets = sampleWidgets
  return (
    <div className="frame flex flex-col pt-28 sm:pt-32">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-headline-lg">Your widgets</h1>
          <p className="mt-3 max-w-[44ch] text-body-lg text-secondary">
            Everything you&apos;ve uploaded, and where each version is.
          </p>
        </div>
        <Button asChild>
          <Link href="/upload">
            <Plus aria-hidden="true" strokeWidth={1.75} />
            Upload a version
          </Link>
        </Button>
      </header>

      <div className="mt-8">
        <SampleNotice>
          Sign-in isn&apos;t open yet, so this is what the dashboard will look like, filled with the
          first-party widgets.
        </SampleNotice>
      </div>

      <section aria-labelledby="waiting" className="mt-10">
        <h2 id="waiting" className="font-sans text-label-sm text-secondary uppercase">
          Waiting
        </h2>
        <ul className="mt-3 flex flex-col gap-3">
          {submissions.map((submission) => {
            const widget = widgets.find((w) => w.id === submission.widgetId)
            if (!widget) return null
            const flags = Object.values(submission.report).filter((r) => r.result === 'flag').length
            return (
              <li key={submission.id} className="rounded-lg bg-surface p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <WidgetGlyph name={widget.icon} className="size-9" />
                  <p className="text-body-md">
                    {widget.name}{' '}
                    <span className="font-mono text-code text-secondary">{submission.version}</span>
                  </p>
                  <span className="ml-auto">
                    <StatusBadge status={submission.status} />
                  </span>
                </div>
                <p className="mt-3 text-body-md text-secondary">{submission.notes}</p>
                <p className="mt-3 text-body-sm text-secondary">
                  Uploaded {formatDate(submission.submittedAt)}
                  <span aria-hidden="true"> · </span>
                  {submission.status === 'checking'
                    ? 'Checks are running'
                    : flags === 0
                      ? 'Every check passed'
                      : `${flags} ${flags === 1 ? 'check' : 'checks'} flagged for the reviewer`}
                </p>
                {submission.reviewerNote && (
                  <div className="mt-4 rounded-md bg-muted p-4 text-body-sm">
                    <p className="text-label-sm text-secondary uppercase">Reviewer&apos;s note</p>
                    <p className="mt-1">{submission.reviewerNote}</p>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="live" className="mt-10">
        <h2 id="live" className="font-sans text-label-sm text-secondary uppercase">
          Live
        </h2>
        <ul className="mt-3 flex flex-col rounded-lg bg-surface px-5 py-2 sm:px-6 [&>*+*]:border-t [&>*+*]:border-tertiary">
          {widgets.map((widget) => (
            <li key={widget.id}>
              <Link
                href={`/widgets/${widget.id}`}
                className="group/row -mx-2 flex min-h-14 items-center gap-3 rounded-md px-2 py-3 transition-colors hover:bg-muted"
              >
                <WidgetGlyph name={widget.icon} className="size-9" />
                <span className="flex min-w-0 flex-col">
                  <span className="text-body-md">{widget.name}</span>
                  <span className="text-body-sm text-secondary">
                    {widget.versions[0]?.version} ·{' '}
                    {formatDate(widget.versions[0]?.publishedAt ?? widget.createdAt)}
                  </span>
                </span>
                <span className="ml-auto hidden sm:inline">
                  <StatusBadge status="approved" />
                </span>
                <ChevronRight
                  aria-hidden="true"
                  strokeWidth={1.75}
                  className="size-4 flex-none text-secondary transition-transform group-hover/row:translate-x-0.5"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
