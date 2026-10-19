import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/format'
import { getWidget } from '@/lib/registry'
import { reportReasons, reports } from '@/lib/registry/review'

export const metadata = { title: 'Reports' }

export default function ReportsPage() {
  return (
    <>
      <h1 className="text-headline-lg">Reports</h1>
      <p className="mt-3 max-w-[48ch] text-body-lg text-secondary">
        What people reported. Yanking a version puts it on the revocation list, and every app turns
        it off within six hours.
      </p>

      <ul className="mt-10 flex flex-col gap-3">
        {reports.map((report) => {
          const widget = getWidget(report.widgetId)
          return (
            <li key={report.id} className="rounded-lg bg-surface p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/widgets/${report.widgetId}`}
                  className="text-body-md underline decoration-border underline-offset-4 hover:decoration-current"
                >
                  {widget?.name ?? report.widgetId}
                </Link>
                {report.version && (
                  <span className="font-mono text-code text-secondary">{report.version}</span>
                )}
                <Badge variant="muted">{reportReasons[report.reason]}</Badge>
                <span className="ml-auto">
                  {report.status === 'open' ? (
                    <Badge variant="outline" live>
                      Open
                    </Badge>
                  ) : (
                    <Badge variant="success">Resolved</Badge>
                  )}
                </span>
              </div>
              <p className="mt-3 text-body-md">{report.body}</p>
              <p className="mt-2 text-body-sm text-secondary">
                Reported {formatDate(report.createdAt)}
              </p>
              {report.status === 'open' && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Resolve
                  </Button>
                  <Button variant="destructive" size="sm" disabled>
                    Yank {report.version ?? 'widget'}
                  </Button>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </>
  )
}
