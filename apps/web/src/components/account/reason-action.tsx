'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

/**
 * A destructive button that asks why before it acts: yanking a version, taking a widget down. The
 * reason is shown to people (the app shows it beside the disabled widget), so it can't be empty.
 */
export function ReasonAction({
  label,
  confirmLabel = label,
  placeholder,
  onConfirm,
}: {
  label: string
  confirmLabel?: string
  placeholder: string
  onConfirm: (reason: string) => Promise<unknown>
}) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()

  if (!open) {
    return (
      <Button
        variant="destructive"
        size="sm"
        className="shadow-[inset_0_0_0_1px_var(--color-border)]"
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
    )
  }

  async function confirm(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(undefined)
    try {
      await onConfirm(reason.trim())
      setOpen(false)
      setReason('')
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={confirm} className="flex w-full flex-col gap-2">
      <Input
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder={placeholder}
        aria-label="Reason"
        maxLength={500}
        required
        // The field appears because its button was just pressed, so that's where typing goes.
        autoFocus
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          variant="destructive"
          size="sm"
          className="shadow-[inset_0_0_0_1px_var(--color-border)]"
          disabled={busy || !reason.trim()}
        >
          {busy ? 'Working…' : confirmLabel}
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
