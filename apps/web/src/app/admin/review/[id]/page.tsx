import { addedPermissions, type CheckResult, checks } from '@shiftpane/format'
import { Check, ChevronLeft, CircleAlert, CircleMinus, CircleX, Loader } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PermissionList } from '@/components/market/permission-list'
import { SourceViewer } from '@/components/market/source-viewer'
import { StatusBadge } from '@/components/market/status-badge'
import { DefinitionCard, MetaRow } from '@/components/site/list-group'
import { Button } from '@/components/ui/button'
import { PreviewStage } from '@/components/widgets/preview-stage'
import { formatDate } from '@/lib/format'
import { getWidget } from '@/lib/registry'
import { packageFiles } from '@/lib/registry/package'
import { getSubmission, submissions } from '@/lib/registry/review'

export const dynamicParams = false

export function generateStaticParams() {
  return submissions.map((submission) => ({ id: submission.id }))
}

export async function generateMetadata({ params }: PageProps<'/admin/review/[id]'>) {
  const { id } = await params
  return { title: id }
}

const resultIcon: Record<CheckResult | 'running', React.ReactNode> = {
  pass: <Check aria-hidden="true" strokeWidth={2} className="size-4 text-success" />,
  flag: <CircleAlert aria-hidden="true" strokeWidth={1.75} className="size-4 text-accent" />,
  fail: <CircleX aria-hidden="true" strokeWidth={1.75} className="size-4 text-error" />,
  skip: <CircleMinus aria-hidden="true" strokeWidth={1.75} className="size-4 text-secondary" />,
  running: <Loader aria-hidden="true" strokeWidth={1.75} className="size-4 text-secondary" />,
}

const resultLabel: Record<CheckResult | 'running', string> = {
  pass: 'Passed',
  flag: 'Flagged',
  fail: 'Failed',
  skip: 'Not run',
  running: 'Running',
}

/**
 * One version in front of a reviewer (PLAN, "Reviewer approves"): the automated report, what the
 * permissions add, the source, a preview from sample.json, and the AI's reading, then a decision.
 */
export default async function ReviewPage({ params }: PageProps<'/admin/review/[id]'>) {
  const { id } = await params
  const submission = getSubmission(id)
  const widget = submission && getWidget(submission.widgetId)
  if (!submission || !widget) notFound()

  const current = widget.versions[0]
  const added = current ? addedPermissions(current.permissions, submission.permissions) : []
  const decided = submission.status !== 'in_review'

  return (
    <>
      <Link
        href="/admin"
        className="-ml-1 mb-6 inline-flex items-center gap-1 text-label-lg text-secondary transition-colors hover:text-on-surface"
      >
        <ChevronLeft aria-hidden="true" strokeWidth={1.75} className="size-4" />
        Review queue
      </Link>
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-headline-lg">
          {widget.name}{' '}
          <span className="font-mono text-headline-sm text-secondary">{submission.version}</span>
        </h1>
        <StatusBadge status={submission.status} />
      </header>
      <p className="mt-3 max-w-[56ch] text-body-lg text-secondary">{submission.notes}</p>

      <div className="mt-10 grid gap-3 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6">
        <div className="flex min-w-0 flex-col gap-3">
          <DefinitionCard label="Automated checks">
            {checks.map((check) => {
              const entry = submission.report[check.id]
              const result = entry?.result ?? 'running'
              return (
                <div key={check.id} className="flex items-start gap-3 py-3">
                  <span className="mt-0.5 flex-none">{resultIcon[result]}</span>
                  <span className="min-w-0 flex-1 text-body-sm">
                    {check.title}
                    {entry?.note && (
                      <span className="mt-0.5 block text-secondary">{entry.note}</span>
                    )}
                  </span>
                  <span className="flex-none text-label-md text-secondary">
                    {resultLabel[result]}
                  </span>
                </div>
              )
            })}
          </DefinitionCard>

          {submission.aiSummary && (
            <section className="rounded-lg bg-surface px-5 py-5 sm:px-6">
              <h2 className="font-sans text-label-sm text-secondary uppercase">
                AI review, advice only
              </h2>
              <p className="mt-3 text-body-md">{submission.aiSummary}</p>
            </section>
          )}

          <section className="rounded-lg bg-surface p-6 sm:p-8">
            <h2 className="mb-5 font-sans text-label-sm text-secondary uppercase">
              Source of the live version, {current?.version}
            </h2>
            <SourceViewer files={packageFiles(widget)} />
          </section>
        </div>

        <aside className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 rounded-lg bg-surface p-5">
            <label htmlFor="review-note" className="text-label-lg">
              Note to the author
            </label>
            <textarea
              id="review-note"
              rows={4}
              disabled={decided}
              defaultValue={submission.reviewerNote}
              placeholder="Needed to reject; shown to the author by email."
              className="w-full resize-y rounded-md bg-muted p-3 text-body-sm outline-none placeholder:text-secondary focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-60"
            />
            <div className="grid grid-cols-2 gap-2">
              <Button disabled>Approve</Button>
              <Button
                variant="destructive"
                className="shadow-[inset_0_0_0_1px_var(--color-border)]"
                disabled
              >
                Reject
              </Button>
            </div>
            <p className="text-body-sm text-secondary">Approving signs the package and lists it.</p>
          </div>

          <DefinitionCard label="Version">
            <MetaRow term="Author">{widget.author}</MetaRow>
            <MetaRow term="Uploaded">{formatDate(submission.submittedAt)}</MetaRow>
            <MetaRow term="Live now">{current?.version ?? 'None, new widget'}</MetaRow>
          </DefinitionCard>

          <DefinitionCard label="Permissions added">
            {added.length === 0 ? (
              <p className="py-3 text-body-sm text-secondary">
                None: the same as the live version.
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

          <PermissionList permissions={submission.permissions} label="All permissions" />

          <PreviewStage
            widget={widget}
            stageClassName="h-[280px]"
            caption="The live version's preview."
          />
        </aside>
      </div>
    </>
  )
}
