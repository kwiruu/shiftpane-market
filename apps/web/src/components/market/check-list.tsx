import { type CheckReport, type CheckResult, checks } from '@shiftpane/format'
import { Check, CircleAlert, CircleMinus, CircleX } from 'lucide-react'

import { DefinitionCard } from '@/components/site/list-group'

const resultIcon: Record<CheckResult, React.ReactNode> = {
  pass: <Check aria-hidden="true" strokeWidth={2} className="size-4 text-success" />,
  flag: <CircleAlert aria-hidden="true" strokeWidth={1.75} className="size-4 text-accent" />,
  fail: <CircleX aria-hidden="true" strokeWidth={1.75} className="size-4 text-error" />,
  skip: <CircleMinus aria-hidden="true" strokeWidth={1.75} className="size-4 text-secondary" />,
}

const resultLabel: Record<CheckResult, string> = {
  pass: 'Passed',
  flag: 'Flagged',
  fail: 'Failed',
  skip: 'Not run',
}

/**
 * An upload's automated checks, in the order the docs list them, each with its result and the
 * note it left. `only` keeps the rows with those results, such as just the failures.
 */
export function CheckList({
  report,
  label = 'Automated checks',
  only,
  inset,
}: {
  report: CheckReport
  label?: string
  only?: CheckResult[]
  /** A muted well, inside another white card. */
  inset?: boolean
}) {
  const rows = checks
    .map((check) => ({ check, entry: report[check.id] ?? { result: 'skip' as const } }))
    .filter(({ entry }) => !only || only.includes(entry.result))
  if (rows.length === 0) return null
  return (
    <DefinitionCard label={label} inset={inset} className={inset ? 'my-0' : undefined}>
      {rows.map(({ check, entry }) => (
        <div key={check.id} className="flex items-start gap-3 py-3">
          <span className="mt-0.5 flex-none">{resultIcon[entry.result]}</span>
          <span className="min-w-0 flex-1 text-body-sm text-on-surface">
            {check.title}
            {entry.note && <span className="mt-0.5 block text-secondary">{entry.note}</span>}
          </span>
          <span className="flex-none text-label-md text-secondary">
            {resultLabel[entry.result]}
          </span>
        </div>
      ))}
    </DefinitionCard>
  )
}

/** "Every check passed", or how many were flagged for the reviewer. */
export function flagSummary(report: CheckReport) {
  const flags = Object.values(report).filter((entry) => entry.result === 'flag').length
  return flags === 0
    ? 'Every check passed'
    : `${flags} ${flags === 1 ? 'check' : 'checks'} flagged for the reviewer`
}
