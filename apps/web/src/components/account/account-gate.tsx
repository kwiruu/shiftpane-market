'use client'

import { type ApiError, isReviewer, type Me, useAccount } from '@/lib/api'
import { cn } from '@/lib/utils'

import { SignInOptions } from './sign-in-options'

/**
 * What a page shows until it knows who's there: a placeholder, then a sign-in card, or the page
 * for the signed-in account. `reviewer` pages tell everyone else they can't see them.
 */
export function AccountGate({
  enabled,
  next,
  reviewer = false,
  signInText = 'Sign in with your GitHub account to see this page.',
  children,
}: {
  /** False where the site runs without the API. */
  enabled: boolean
  next: string
  reviewer?: boolean
  signInText?: string
  children: (me: Me) => React.ReactNode
}) {
  const account = useAccount(enabled)
  if (!enabled) return <NoApi />
  if (account.status === 'loading') return <Placeholder />
  if (account.status === 'signed-out') {
    return (
      <Panel>
        <h2 className="text-headline-sm">Sign in</h2>
        <p className="mt-2 mb-6 max-w-[48ch] text-body-md text-secondary">{signInText}</p>
        <SignInOptions next={next} className="max-w-120" />
      </Panel>
    )
  }
  if (reviewer && !isReviewer(account.me)) {
    return (
      <Panel>
        <h2 className="text-headline-sm">Only reviewers can see this</h2>
        <p className="mt-2 max-w-[48ch] text-body-md text-secondary">
          You&apos;re signed in as {account.me.login}, who isn&apos;t a reviewer.
        </p>
      </Panel>
    )
  }
  return children(account.me)
}

/** A white card for a page-sized message. */
export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('rounded-lg bg-surface p-6 sm:p-8', className)}>{children}</div>
}

/** Where content is on its way: a quiet block the size of a card. */
export function Placeholder({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'h-40 animate-pulse rounded-lg bg-surface motion-reduce:animate-none',
        className,
      )}
    />
  )
}

/** An answer from the API that wasn't the one hoped for. */
export function ErrorPanel({ error }: { error: ApiError }) {
  return (
    <Panel>
      <p role="alert" className="text-body-md text-error">
        {error.message}
      </p>
    </Panel>
  )
}

/** Local only: the site was started without `SHIFTPANE_API_ORIGIN`, so there are no accounts. */
function NoApi() {
  return (
    <Panel>
      <h2 className="text-headline-sm">Accounts need the API</h2>
      <p className="mt-2 max-w-[56ch] text-body-md text-secondary">
        This copy of the site runs without the registry API, so nobody can sign in. Start the API
        and set <code className="font-mono text-code">SHIFTPANE_API_ORIGIN</code> (README, Run it).
      </p>
    </Panel>
  )
}
