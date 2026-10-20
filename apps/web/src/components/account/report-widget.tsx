'use client'

import { Flag } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { api, type ReportReason, signInHref, useAccount } from '@/lib/api'
import { reportReasons } from '@/lib/registry/review'
import { cn } from '@/lib/utils'

const quiet =
  'inline-flex items-center gap-1.5 self-start px-1 text-label-md text-secondary transition-colors hover:text-on-surface'

/**
 * "Report this widget" under a listing (PLAN, Takedown). Signed in, it opens a short form that goes
 * to the reviewers; signed out, it signs you in first and comes back here.
 */
export function ReportWidget({
  enabled,
  widgetId,
  version,
}: {
  enabled: boolean
  widgetId: string
  version?: string
}) {
  const account = useAccount(enabled)
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<ReportReason>()
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string>()
  const here = `/widgets/${encodeURIComponent(widgetId)}`

  const flag = <Flag aria-hidden="true" strokeWidth={1.75} className="size-3.5" />
  // Without the API there's nowhere to send a report, so the link explains how reporting works.
  if (!enabled) {
    return (
      <Link href="/docs/content-policy#reporting" className={quiet}>
        {flag}
        Report this widget
      </Link>
    )
  }
  if (sent) {
    return (
      <p role="status" className="px-1 text-body-sm text-secondary">
        Thanks. A reviewer will look at your report.
      </p>
    )
  }
  if (account.status === 'signed-out') {
    return (
      <a href={signInHref(here)} className={quiet}>
        {flag}
        Sign in to report this widget
      </a>
    )
  }
  if (!open) {
    return (
      <button
        type="button"
        className={quiet}
        disabled={account.status === 'loading'}
        onClick={() => setOpen(true)}
      >
        {flag}
        Report this widget
      </button>
    )
  }

  async function send(event: React.FormEvent) {
    event.preventDefault()
    if (!reason) return
    setBusy(true)
    setError(undefined)
    try {
      await api('/reports', { json: { widgetId, version, reason, body: body.trim() } })
      setSent(true)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={send} className="flex flex-col gap-3 rounded-lg bg-surface p-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-label-lg">What&apos;s wrong with it?</legend>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(reportReasons) as ReportReason[]).map((key) => (
            <label
              key={key}
              className={cn(
                'cursor-pointer rounded-full px-3 py-1 text-body-sm transition-colors has-focus-visible:outline-2 has-focus-visible:outline-primary',
                reason === key ? 'bg-primary text-surface' : 'bg-muted hover:text-on-surface',
              )}
            >
              <input
                type="radio"
                name="reason"
                value={key}
                checked={reason === key}
                onChange={() => setReason(key)}
                className="sr-only"
              />
              {reportReasons[key]}
            </label>
          ))}
        </div>
      </fieldset>
      <Textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={4}
        maxLength={2000}
        required
        aria-label="What happened"
        placeholder="What happened, and on which version."
      />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={busy || !reason || !body.trim()}>
          {busy ? 'Sending…' : 'Send report'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-body-sm text-error">
          {error}
        </p>
      )}
    </form>
  )
}
