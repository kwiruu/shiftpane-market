import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

import { StatusBadge } from '@/components/market/status-badge'
import { Badge } from '@/components/ui/badge'
import { WidgetGlyph } from '@/components/widgets/widget-icon'
import { formatDate } from '@/lib/format'
import { getWidget } from '@/lib/registry'
import { checks } from '@/lib/registry/checks'
import { submissions } from '@/lib/registry/review'

export const metadata = { title: 'Queue' }

// Checks that always send a version to a person; the queue names them on each row.
const alwaysHuman = new Set(checks.filter((check) => check.alwaysHuman).map((check) => check.id))

export default function ReviewQueue() {
  const queue = submissions.filter((s) => s.status === 'in_review' || s.status === 'checking')
  const done = submissions.filter((s) => s.status !== 'in_review' && s.status !== 'checking')
  return (
    <>
      <h1 className="text-headline-lg">Review queue</h1>
      <p className="mt-3 max-w-[48ch] text-body-lg text-secondary">
        Every new widget, and every version that changes its permissions, waits here for a person.
      </p>

      <ul className="mt-10 flex flex-col rounded-lg bg-surface px-5 py-2 sm:px-6 [&>*+*]:border-t [&>*+*]:border-tertiary">
        {queue.map((submission) => {
          const widget = getWidget(submission.widgetId)
          if (!widget) return null
          const flagged = Object.entries(submission.report).filter(([, r]) => r.result === 'flag')
          const reasons = flagged
            .filter(([id]) => alwaysHuman.has(id))
            .map(([id]) => checks.find((c) => c.id === id)?.title)
          return (
            <li key={submission.id}>
              <Link
                href={`/admin/review/${submission.id}`}
                className="group/row -mx-2 flex min-h-16 flex-wrap items-center gap-x-3 gap-y-2 rounded-md px-2 py-4 transition-colors hover:bg-muted"
              >
                <WidgetGlyph name={widget.icon} className="size-9" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-body-md">
                    {widget.name}{' '}
                    <span className="font-mono text-code text-secondary">{submission.version}</span>
                  </span>
                  <span className="text-body-sm text-secondary">
                    {widget.author} · uploaded {formatDate(submission.submittedAt)} ·{' '}
                    {submission.status === 'checking'
                      ? 'checks running'
                      : `${flagged.length} flagged`}
                  </span>
                </span>
                <span className="flex flex-wrap gap-2">
                  {reasons.length > 0 && <Badge variant="muted">Needs a person</Badge>}
                  <StatusBadge status={submission.status} />
                </span>
                <ChevronRight
                  aria-hidden="true"
                  strokeWidth={1.75}
                  className="size-4 flex-none text-secondary transition-transform group-hover/row:translate-x-0.5"
                />
              </Link>
            </li>
          )
        })}
      </ul>

      <h2 className="mt-10 font-sans text-label-sm text-secondary uppercase">Decided</h2>
      <ul className="mt-3 flex flex-col rounded-lg bg-surface px-5 py-2 sm:px-6 [&>*+*]:border-t [&>*+*]:border-tertiary">
        {done.map((submission) => {
          const widget = getWidget(submission.widgetId)
          if (!widget) return null
          return (
            <li key={submission.id}>
              <Link
                href={`/admin/review/${submission.id}`}
                className="group/row -mx-2 flex min-h-14 items-center gap-3 rounded-md px-2 py-3 transition-colors hover:bg-muted"
              >
                <WidgetGlyph name={widget.icon} className="size-9" />
                <span className="min-w-0 flex-1 text-body-md">
                  {widget.name}{' '}
                  <span className="font-mono text-code text-secondary">{submission.version}</span>
                </span>
                <StatusBadge status={submission.status} />
                <ChevronRight
                  aria-hidden="true"
                  strokeWidth={1.75}
                  className="size-4 flex-none text-secondary"
                />
              </Link>
            </li>
          )
        })}
      </ul>
    </>
  )
}
