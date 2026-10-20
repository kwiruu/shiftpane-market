'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { api, type Report, useApi } from '@/lib/api'
import { formatDate } from '@/lib/format'
import { reportReasons } from '@/lib/registry/review'

import { ErrorPanel, Panel, Placeholder } from './account-gate'
import { ReasonAction } from './reason-action'

/** What people reported, newest first, with what a reviewer can do about each. */
export function Reports() {
  const { data, error, reload } = useApi<{ reports: Report[] }>('/admin/reports')
  if (error) return <ErrorPanel error={error} />
  if (!data) return <Placeholder />
  if (data.reports.length === 0) {
    return (
      <Panel>
        <p className="text-body-md text-secondary">Nobody has reported anything.</p>
      </Panel>
    )
  }
  return (
    <ul className="flex flex-col gap-3">
      {data.reports.map((report) => (
        <ReportCard key={report.id} report={report} onChange={reload} />
      ))}
    </ul>
  )
}

function ReportCard({ report, onChange }: { report: Report; onChange: () => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()
  const widget = encodeURIComponent(report.widgetId)

  async function resolve() {
    setBusy(true)
    setError(undefined)
    try {
      await api(`/admin/reports/${report.id}/resolve`, { method: 'POST' })
      onChange()
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <li className="rounded-lg bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/widgets/${widget}`}
          className="text-body-md underline decoration-border underline-offset-4 hover:decoration-current"
        >
          {report.widgetName}
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
      <p className="mt-3 text-body-md whitespace-pre-line">{report.body}</p>
      <p className="mt-2 text-body-sm text-secondary">
        Reported {formatDate(report.createdAt)}
        {report.reporter && ` by ${report.reporter}`}
      </p>
      {report.status === 'open' && (
        <div className="mt-4 flex flex-wrap items-start gap-2">
          <Button variant="outline" size="sm" disabled={busy} onClick={resolve}>
            Resolve
          </Button>
          {report.version && (
            <ReasonAction
              label={`Yank ${report.version}`}
              placeholder="Why, shown in the app beside the widget"
              onConfirm={async (reason) => {
                await api(
                  `/widgets/${widget}/versions/${encodeURIComponent(report.version ?? '')}/yank`,
                  { json: { reason } },
                )
                onChange()
              }}
            />
          )}
          <ReasonAction
            label="Take the widget down"
            confirmLabel="Take it down"
            placeholder="Why, shown in the app beside the widget"
            onConfirm={async (reason) => {
              await api(`/admin/widgets/${widget}/yank`, { json: { reason } })
              onChange()
            }}
          />
        </div>
      )}
      {error && (
        <p role="alert" className="mt-3 text-body-sm text-error">
          {error}
        </p>
      )}
    </li>
  )
}
