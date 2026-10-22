'use client'

import { addedPermissions, describePermissions } from '@shiftpane/format'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { CheckList } from '@/components/market/check-list'
import { PermissionList } from '@/components/market/permission-list'
import { SourceViewer } from '@/components/market/source-viewer'
import { StatusBadge } from '@/components/market/status-badge'
import { DefinitionCard, MetaRow } from '@/components/site/list-group'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { PreviewStage } from '@/components/widgets/preview-stage'
import { api, useApi, type VersionDetail } from '@/lib/api'
import { formatDate } from '@/lib/format'
import { versionFiles, widgetOfVersion } from '@/lib/registry/package'

import { ErrorPanel, Placeholder } from './account-gate'

/**
 * One version in front of a reviewer (PLAN, "Reviewer approves"): the automated report, what the
 * permissions add, every file, and a preview from its own sample.json, then a decision.
 */
export function ReviewDetail({ id }: { id: string }) {
  const { data, error, reload } = useApi<VersionDetail>(`/admin/versions/${encodeURIComponent(id)}`)

  return (
    <>
      <Link
        href="/admin"
        className="-ml-1 mb-6 inline-flex items-center gap-1 text-label-lg text-secondary transition-colors hover:text-on-surface"
      >
        <ChevronLeft aria-hidden="true" strokeWidth={1.75} className="size-4" />
        Review queue
      </Link>
      {error ? (
        <ErrorPanel error={error} />
      ) : data ? (
        <Detail detail={data} onDecided={reload} />
      ) : (
        <Placeholder className="h-96" />
      )}
    </>
  )
}

function Detail({ detail, onDecided }: { detail: VersionDetail; onDecided: () => void }) {
  const { version, previous, author, widgetName, icon } = detail
  const added = previous
    ? addedPermissions(previous.permissions, version.permissions)
    : describePermissions(version.permissions)

  return (
    <>
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-headline-lg">
          {widgetName}{' '}
          <span className="font-mono text-headline-sm text-secondary">{version.version}</span>
        </h1>
        <StatusBadge status={version.status} />
      </header>
      {version.notes && (
        <p className="mt-3 max-w-[56ch] text-body-lg text-secondary">{version.notes}</p>
      )}

      <div className="mt-10 grid gap-3 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6">
        <div className="flex min-w-0 flex-col gap-3">
          <CheckList report={version.report} />
          <section className="rounded-lg bg-surface p-6 sm:p-8">
            <h2 className="mb-5 font-sans text-label-sm text-secondary uppercase">
              Every file in {version.version}
            </h2>
            <SourceViewer files={versionFiles(version)} />
          </section>
        </div>

        <aside className="flex flex-col gap-3">
          <Decide detail={detail} onDecided={onDecided} />

          <DefinitionCard label="Version">
            <MetaRow term="Widget">
              <span className="font-mono text-code">{version.widgetId}</span>
            </MetaRow>
            <MetaRow term="Author">
              <a
                href={`https://github.com/${encodeURIComponent(author)}`}
                className="underline decoration-border underline-offset-4 hover:decoration-current"
              >
                {author}
              </a>
            </MetaRow>
            <MetaRow term="Uploaded">{formatDate(version.submittedAt)}</MetaRow>
            <MetaRow term="Live now">{previous?.version ?? 'None, a new widget'}</MetaRow>
            <MetaRow term="Size">{Math.max(1, Math.round(version.size / 1024))} KB</MetaRow>
          </DefinitionCard>

          <DefinitionCard label={previous ? 'Permissions added' : 'Permissions, all new'}>
            {added.length === 0 ? (
              <p className="py-3 text-body-sm text-secondary">
                {previous ? 'None: the same as the live version.' : 'None: it needs nothing.'}
              </p>
            ) : (
              added.map((line) => (
                <p key={`${line.kind}:${line.value}`} className="py-3 text-body-sm">
                  <span className="text-success">+</span> {line.text}
                  {line.asks && <span className="text-secondary"> · asks first</span>}
                </p>
              ))
            )}
          </DefinitionCard>

          <PermissionList permissions={version.permissions} label="All permissions" />

          <PreviewStage
            widget={widgetOfVersion(version, author, icon)}
            stageClassName="h-[280px]"
            caption="Drawn from this version's sample.json."
          />
        </aside>
      </div>
    </>
  )
}

/** Approve, or reject with a note the author reads on their dashboard. */
function Decide({ detail, onDecided }: { detail: VersionDetail; onDecided: () => void }) {
  const { version } = detail
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState<'approve' | 'reject'>()
  const [error, setError] = useState<string>()
  const open = version.status === 'in_review'

  async function decide(decision: 'approve' | 'reject') {
    setBusy(decision)
    setError(undefined)
    try {
      await api(`/admin/versions/${version.id}/${decision}`, { json: { note: note.trim() } })
      onDecided()
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Something went wrong.')
    } finally {
      setBusy(undefined)
    }
  }

  if (!open) {
    return (
      <div className="flex flex-col gap-2 rounded-lg bg-surface p-5 text-body-sm">
        <p className="text-label-lg">Decided</p>
        <p className="text-secondary">
          {version.status === 'approved' &&
            `Approved${version.publishedAt ? ` and listed ${formatDate(version.publishedAt)}` : ''}.`}
          {version.status === 'rejected' && 'Rejected. The author can fix it and upload again.'}
          {version.status === 'yanked' && `Yanked: ${version.yankReason ?? 'no reason given'}.`}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-surface p-5">
      <label htmlFor="review-note" className="text-label-lg">
        Note to the author
      </label>
      <Textarea
        id="review-note"
        rows={4}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        maxLength={2000}
        placeholder="Needed to reject; shown to the author on their dashboard."
      />
      <div className="grid grid-cols-2 gap-2">
        <Button disabled={busy !== undefined} onClick={() => decide('approve')}>
          {busy === 'approve' ? 'Publishing…' : 'Approve'}
        </Button>
        <Button
          variant="destructive"
          className="shadow-[inset_0_0_0_1px_var(--color-border)]"
          disabled={busy !== undefined || !note.trim()}
          onClick={() => decide('reject')}
        >
          {busy === 'reject' ? 'Rejecting…' : 'Reject'}
        </Button>
      </div>
      {error ? (
        <p role="alert" className="text-body-sm text-error">
          {error}
        </p>
      ) : (
        <p className="text-body-sm text-secondary">Approving signs the package and lists it.</p>
      )}
    </div>
  )
}
