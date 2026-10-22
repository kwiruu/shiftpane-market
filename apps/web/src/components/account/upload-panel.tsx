'use client'

import type { CheckReport, ReviewStatus } from '@shiftpane/format'
import { FileArchive } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Step, Steps } from '@/components/content/blocks'
import { CheckList, flagSummary } from '@/components/market/check-list'
import { StatusBadge } from '@/components/market/status-badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ApiError, api, signOut, useAccount } from '@/lib/api'
import { cn } from '@/lib/utils'

import { SignInOptions } from './sign-in-options'

type Outcome =
  | {
      kind: 'submitted'
      status: ReviewStatus
      widgetId: string
      version: string
      report: CheckReport
    }
  | { kind: 'failed'; report: CheckReport }
  | { kind: 'error'; message: string }

const MAX_BYTES = 1024 * 1024
const MAX_NOTES = 500

/**
 * The upload itself (PLAN, W3): sign in, drop the zip, read the report. The API runs the checks
 * while the upload waits, so the report comes back with the answer.
 */
export function UploadPanel({ enabled }: { enabled: boolean }) {
  const account = useAccount(enabled)
  const signedIn = account.status === 'signed-in'
  const [file, setFile] = useState<File>()
  const [notes, setNotes] = useState('')
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [outcome, setOutcome] = useState<Outcome>()

  function choose(chosen: File | undefined) {
    setOutcome(undefined)
    if (!chosen) return
    if (chosen.size > MAX_BYTES) {
      setFile(undefined)
      setOutcome({
        kind: 'error',
        message: `${chosen.name} is over 1 MB, the limit for a package.`,
      })
      return
    }
    setFile(chosen)
  }

  async function upload(event: React.FormEvent) {
    event.preventDefault()
    if (!file) return
    setBusy(true)
    setOutcome(undefined)
    const form = new FormData()
    form.set('package', file)
    form.set('notes', notes.trim())
    try {
      const answer = await api<Omit<Extract<Outcome, { kind: 'submitted' }>, 'kind'>>('/uploads', {
        form,
      })
      setOutcome({ kind: 'submitted', ...answer })
      setFile(undefined)
      setNotes('')
    } catch (error) {
      const report =
        error instanceof ApiError && error.status === 422
          ? (error.body as { report?: CheckReport } | null)?.report
          : undefined
      setOutcome(
        report
          ? { kind: 'failed', report }
          : {
              kind: 'error',
              message: error instanceof Error ? error.message : 'Something went wrong.',
            },
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <Steps>
      <Step title="Sign in with GitHub">
        {account.status === 'signed-in' ? (
          <p>
            Signed in as <span className="text-on-surface">{account.me.login}</span>. Your
            manifest&apos;s <code className="font-mono text-code">author</code> has to say the same.{' '}
            <button
              type="button"
              onClick={() => signOut()}
              className="text-on-surface underline decoration-border underline-offset-4 hover:decoration-current"
            >
              Not you?
            </button>
          </p>
        ) : (
          <>
            <p>Your GitHub account is your author name, and where reviewers can reach you.</p>
            {enabled ? (
              account.status === 'signed-out' && <SignInOptions next="/upload" className="mt-1" />
            ) : (
              <p>This copy of the site runs without the registry API, so nobody can sign in.</p>
            )}
          </>
        )}
      </Step>

      <Step title="Upload the package">
        <p>
          A zip of the package&apos;s files, at the top of the zip rather than in a folder, at most
          1 MB. Or share it straight from the desktop app once it can.
        </p>
        <form onSubmit={upload} className="mt-1 flex flex-col gap-3">
          <label
            onDragOver={(event) => {
              if (!signedIn) return
              event.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              if (!signedIn) return
              event.preventDefault()
              setDragging(false)
              choose(event.dataTransfer.files[0])
            }}
            className={cn(
              'flex flex-col items-center gap-2 rounded-md bg-muted px-6 py-10 text-center transition-[opacity,box-shadow] focus-within:outline-2 focus-within:outline-primary',
              signedIn ? 'cursor-pointer' : 'opacity-60',
              dragging && 'shadow-[inset_0_0_0_1px_var(--color-primary)]',
            )}
          >
            <input
              type="file"
              accept=".zip,application/zip"
              disabled={!signedIn || busy}
              onChange={(event) => choose(event.target.files?.[0])}
              className="sr-only"
            />
            <FileArchive aria-hidden="true" strokeWidth={1.5} className="size-8 text-secondary" />
            {file ? (
              <>
                <span className="text-body-md text-on-surface">{file.name}</span>
                <span className="text-body-sm">
                  {Math.max(1, Math.round(file.size / 1024))} KB · choose another
                </span>
              </>
            ) : (
              <>
                <span className="text-body-md text-on-surface">
                  Drop your widget&apos;s .zip here, or choose it
                </span>
                <span className="text-body-sm">
                  {signedIn
                    ? 'manifest.json, view.json, sample.json, README.md, LICENSE'
                    : 'Opens once you’re signed in.'}
                </span>
              </>
            )}
          </label>
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            disabled={!signedIn || busy}
            maxLength={MAX_NOTES}
            rows={3}
            aria-label="What changed"
            placeholder="What changed, for the reviewer and the version list."
          />
          <Button type="submit" className="self-start" disabled={!signedIn || !file || busy}>
            {busy ? 'Checking…' : 'Upload and check'}
          </Button>
        </form>
      </Step>

      <Step title="Read the report">
        <p>
          The checks run as soon as the upload lands. Fix anything that fails and upload again;
          anything flagged goes to the reviewer with your notes.
        </p>
        <div aria-live="polite" className="flex flex-col gap-3 not-empty:mt-4">
          {outcome && <OutcomeReport outcome={outcome} />}
        </div>
      </Step>
    </Steps>
  )
}

function OutcomeReport({ outcome }: { outcome: Outcome }) {
  if (outcome.kind === 'error') {
    return (
      <p role="alert" className="text-error">
        {outcome.message}
      </p>
    )
  }
  if (outcome.kind === 'failed') {
    return (
      <>
        <p role="alert" className="text-on-surface">
          The upload didn&apos;t pass, so nothing was kept. Fix these and upload it again.
        </p>
        <CheckList report={outcome.report} label="What failed" only={['fail']} inset />
        <CheckList report={outcome.report} label="Flagged for the reviewer" only={['flag']} inset />
      </>
    )
  }
  return (
    <>
      <div className="flex flex-wrap items-center gap-3 rounded-md bg-muted p-4">
        <p className="min-w-0 flex-1 text-body-md text-on-surface">
          <span className="font-mono text-code">
            {outcome.widgetId} {outcome.version}
          </span>{' '}
          is uploaded. {flagSummary(outcome.report)}.
        </p>
        <StatusBadge status={outcome.status} />
      </div>
      <p>
        A person reviews it next, and{' '}
        <Link
          href="/dashboard"
          className="text-on-surface underline decoration-border underline-offset-4 hover:decoration-current"
        >
          your dashboard
        </Link>{' '}
        shows where it is.
      </p>
      <CheckList report={outcome.report} label="Flagged for the reviewer" only={['flag']} inset />
    </>
  )
}
