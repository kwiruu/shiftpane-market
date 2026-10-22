'use client'

import { checks } from '@shiftpane/format'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

import { StatusBadge } from '@/components/market/status-badge'
import { Badge } from '@/components/ui/badge'
import { WidgetGlyph } from '@/components/widgets/widget-icon'
import { type Decision, type QueueEntry, useApi } from '@/lib/api'
import { formatDate } from '@/lib/format'

import { ErrorPanel, Panel, Placeholder } from './account-gate'

// Checks that always send a version to a person; the queue names them on each row.
const alwaysHuman = new Set(checks.filter((check) => check.alwaysHuman).map((check) => check.id))

const rows =
  'flex flex-col rounded-lg bg-surface px-5 py-2 sm:px-6 [&>*+*]:border-t [&>*+*]:border-tertiary'

/** What waits for a reviewer, oldest first, and the latest decisions under it. */
export function ReviewQueue() {
  const { data, error } = useApi<{ queue: QueueEntry[]; decided: Decision[] }>('/admin/queue')
  if (error) return <ErrorPanel error={error} />
  if (!data) return <Placeholder />

  return (
    <>
      {data.queue.length === 0 ? (
        <Panel>
          <p className="text-body-md text-secondary">Nothing is waiting for review.</p>
        </Panel>
      ) : (
        <ul className={rows}>
          {data.queue.map(({ version, author, widgetName, icon }) => {
            const flagged = Object.entries(version.report).filter(([, r]) => r.result === 'flag')
            const needsPerson = flagged.some(([id]) => alwaysHuman.has(id))
            return (
              <li key={version.id}>
                <Link
                  href={`/admin/review/${version.id}`}
                  className="group/row -mx-2 flex min-h-16 flex-wrap items-center gap-x-3 gap-y-2 rounded-md px-2 py-4 transition-colors hover:bg-muted"
                >
                  <WidgetGlyph name={icon} className="size-9" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-body-md">
                      {widgetName}{' '}
                      <span className="font-mono text-code text-secondary">{version.version}</span>
                    </span>
                    <span className="text-body-sm text-secondary">
                      {author} · uploaded {formatDate(version.submittedAt)} · {flagged.length}{' '}
                      flagged
                    </span>
                  </span>
                  <span className="flex flex-wrap gap-2">
                    {needsPerson && <Badge variant="muted">Needs a person</Badge>}
                    <StatusBadge status={version.status} />
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
      )}

      {data.decided.length > 0 && (
        <>
          <h2 className="mt-10 font-sans text-label-sm text-secondary uppercase">Decided</h2>
          <ul className={`mt-3 ${rows}`}>
            {data.decided.map((decision) => (
              <li key={`${decision.id}:${decision.decidedAt}`}>
                <Link
                  href={`/admin/review/${decision.id}`}
                  className="group/row -mx-2 flex min-h-14 items-center gap-3 rounded-md px-2 py-3 transition-colors hover:bg-muted"
                >
                  <WidgetGlyph name={decision.icon} className="size-9" />
                  <span className="min-w-0 flex-1 text-body-md">
                    {decision.widgetName}{' '}
                    <span className="font-mono text-code text-secondary">{decision.version}</span>
                    <span className="block text-body-sm text-secondary">
                      Decided {formatDate(decision.decidedAt)}
                    </span>
                  </span>
                  <StatusBadge status={decision.status} />
                  <ChevronRight
                    aria-hidden="true"
                    strokeWidth={1.75}
                    className="size-4 flex-none text-secondary"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}
