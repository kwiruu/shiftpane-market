import { cn } from '@/lib/utils'

import { CopyButton } from './copy-button'

/** A code well (DESIGN.md, Code blocks): muted, rounded-md, code type, and a text-only Copy action. */
export function CodeBlock({
  code,
  label,
  className,
}: {
  code: string
  /** Shown above the code, such as "PowerShell". */
  label?: string
  className?: string
}) {
  const text = code.replace(/\n$/, '')

  return (
    <div
      data-cursor="Copy, paste, run"
      className={cn('relative rounded-md bg-muted text-on-surface', className)}
    >
      <div className="flex items-center justify-between gap-3 px-4 pt-3">
        <span className="text-label-sm text-secondary">{label ?? ''}</span>
        <CopyButton text={text} />
      </div>
      <pre className="px-4 pt-2 pb-4 text-code whitespace-pre-wrap break-words">
        <code>{text}</code>
      </pre>
    </div>
  )
}
