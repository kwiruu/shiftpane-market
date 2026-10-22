'use client'

import { ChevronRight, Plus } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { flagSummary } from '@/components/market/check-list'
import { StatusBadge } from '@/components/market/status-badge'
import { Button } from '@/components/ui/button'
import { WidgetGlyph } from '@/components/widgets/widget-icon'
import { api, type Submission, useApi } from '@/lib/api'
import { formatDate } from '@/lib/format'

import { AccountGate, ErrorPanel, Panel, Placeholder } from './account-gate'
import { ReasonAction } from './reason-action'

/** The author dashboard (PLAN, W4): what you've uploaded, where each version is, and why. */
export function Dashboard({ enabled }: { enabled: boolean }) {
  const [expired, setExpired] = useState(false)
  // The sign-in callback comes back here with ?signin=expired when its state cookie ran out.
  useEffect(() => {
    setExpired(new URLSearchParams(window.location.search).get('signin') === 'expired')
  }, [])

  return (
    <>
      {expired && (
        <p role="alert" className="mb-3 rounded-lg bg-surface p-4 text-body-sm text-error">
          That sign-in took too long or was opened twice. Try again.
        </p>
      )}
      <AccountGate
        enabled={enabled}
        next="/dashboard"
        signInText="Sign in with GitHub to see the widgets you've uploaded and where each version is."
      >
        {() => <Submissions />}
      </AccountGate>
    </>
  )
}

function Submissions() {
  const { data, error, reload } = useApi<{ submissions: Submission[] }>('/me/widgets')
  if (error) return <ErrorPanel error={error} />
  if (!data) return <Placeholder />

  const { submissions } = data
  if (submissions.length === 0) {
    return (
      <Panel>
        <h2 className="text-headline-sm">Nothing uploaded yet</h2>
        <p className="mt-2 mb-6 max-w-[48ch] text-body-md text-secondary">
          Upload a widget package and it shows up here, with the checks&apos; report and the
          reviewer&apos;s decision.
        </p>
        <Button asChild>
          <Link href="/upload">
            <Plus aria-hidden="true" strokeWidth={1.75} />
            Publish a widget
          </Link>
        </Button>
      </Panel>
    )
  }

  const waiting = submissions.filter((s) => s.status === 'in_review' || s.status === 'checking')
  // Newest upload first, so the widget worked on last comes first too.
  const widgets = new Map<string, Submission[]>()
  for (const submission of submissions) {
    widgets.set(submission.widgetId, [...(widgets.get(submission.widgetId) ?? []), submission])
  }

  return (
    <>
      {waiting.length > 0 && (
        <section aria-labelledby="waiting" className="mb-10">
          <h2 id="waiting" className="font-sans text-label-sm text-secondary uppercase">
            Waiting for review
          </h2>
          <ul className="mt-3 flex flex-col gap-3">
            {waiting.map((submission) => (
              <li key={submission.id} className="rounded-lg bg-surface p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <WidgetGlyph name={submission.icon} className="size-9" />
                  <p className="text-body-md">
                    {submission.name}{' '}
                    <span className="font-mono text-code text-secondary">{submission.version}</span>
                  </p>
                  <span className="ml-auto">
                    <StatusBadge status={submission.status} />
                  </span>
                </div>
                {submission.notes && (
                  <p className="mt-3 text-body-md text-secondary">{submission.notes}</p>
                )}
                <p className="mt-3 text-body-sm text-secondary">
                  Uploaded {formatDate(submission.submittedAt)}
                  <span aria-hidden="true"> · </span>
                  {flagSummary(submission.report)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="yours">
        <h2 id="yours" className="font-sans text-label-sm text-secondary uppercase">
          Every version
        </h2>
        <div className="mt-3 flex flex-col gap-3">
          {[...widgets].map(([id, versions]) => (
            <WidgetHistory key={id} versions={versions} onChange={reload} />
          ))}
        </div>
      </section>
    </>
  )
}

/** One widget and every version of it, newest first. Live ones can be yanked from here. */
function WidgetHistory({ versions, onChange }: { versions: Submission[]; onChange: () => void }) {
  const [newest] = versions
  if (!newest) return null
  const listed = versions.some((version) => version.status === 'approved')
  return (
    <article className="rounded-lg bg-surface px-5 py-2 sm:px-6">
      <header className="flex min-h-16 items-center gap-3 py-3">
        <WidgetGlyph name={newest.icon} className="size-9" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-body-md">{newest.name}</span>
          <span className="font-mono text-code text-secondary">{newest.widgetId}</span>
        </span>
        {listed && (
          <Link
            href={`/widgets/${newest.widgetId}`}
            className="group/row inline-flex items-center gap-0.5 text-label-md text-secondary transition-colors hover:text-on-surface"
          >
            Listing
            <ChevronRight
              aria-hidden="true"
              strokeWidth={1.75}
              className="size-4 transition-transform group-hover/row:translate-x-0.5"
            />
          </Link>
        )}
      </header>
      <ul className="flex flex-col border-t border-tertiary [&>*+*]:border-t [&>*+*]:border-tertiary">
        {versions.map((version) => (
          <li key={version.id} className="flex flex-col gap-2 py-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="font-mono text-code">{version.version}</span>
              <span className="text-body-sm text-secondary">{formatDate(version.submittedAt)}</span>
              <span className="ml-auto">
                <StatusBadge status={version.status} />
              </span>
            </div>
            {version.notes && <p className="text-body-sm text-secondary">{version.notes}</p>}
            {version.reviewerNote && (
              <div className="rounded-md bg-muted p-4 text-body-sm">
                <p className="text-label-sm text-secondary uppercase">Reviewer&apos;s note</p>
                <p className="mt-1">{version.reviewerNote}</p>
              </div>
            )}
            {version.yankReason && (
              <p className="text-body-sm text-secondary">Yanked: {version.yankReason}</p>
            )}
            {version.status === 'approved' && (
              <div className="mt-1 flex">
                <ReasonAction
                  label={`Yank ${version.version}`}
                  placeholder="Why, for the people who have it installed"
                  onConfirm={async (reason) => {
                    await api(
                      `/widgets/${encodeURIComponent(version.widgetId)}/versions/${encodeURIComponent(version.version)}/yank`,
                      { json: { reason } },
                    )
                    onChange()
                  }}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </article>
  )
}
