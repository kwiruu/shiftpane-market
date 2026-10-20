'use client'

import { usePathname } from 'next/navigation'

import { AccountGate } from './account-gate'

/** The review pages are for reviewers and admins; everyone else gets a sign-in card or a no. */
export function AdminGate({ enabled, children }: { enabled: boolean; children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <AccountGate
      enabled={enabled}
      next={pathname}
      reviewer
      signInText="Sign in with a reviewer's GitHub account to see the queue."
    >
      {() => children}
    </AccountGate>
  )
}
