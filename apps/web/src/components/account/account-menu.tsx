'use client'

import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { devSignIn, isReviewer, signInHref, signOut, useAccount } from '@/lib/api'

import { SignInOptions } from './sign-in-options'

const roleLabels = { author: 'Author', reviewer: 'Reviewer', admin: 'Admin' } as const

/**
 * The header's account control: "Sign in" for visitors, and for a signed-in author a round
 * initial that opens their pages. Avatars would load from GitHub, which the CSP keeps out.
 */
export function AccountMenu({ enabled }: { enabled: boolean }) {
  const account = useAccount(enabled)
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  if (!enabled || account.status === 'loading') return null

  if (account.status === 'signed-out') {
    const link = 'mr-2 text-label-lg text-secondary transition-colors hover:text-on-surface'
    if (!devSignIn) {
      return (
        <a href={signInHref(pathname)} className={link}>
          Sign in
        </a>
      )
    }
    return (
      <Popover>
        <PopoverTrigger className={link}>Sign in</PopoverTrigger>
        <PopoverContent align="end" className="w-96">
          <SignInOptions next={pathname} />
        </PopoverContent>
      </Popover>
    )
  }

  const { me } = account
  const items = [
    { href: '/dashboard', label: 'Your widgets' },
    { href: '/upload', label: 'Publish a widget' },
    ...(isReviewer(me) ? [{ href: '/admin', label: 'Review queue' }] : []),
  ]
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Account, signed in as ${me.login}`}>
          <span className="grid size-7 place-items-center rounded-full bg-primary text-label-md text-surface uppercase">
            {me.login.slice(0, 1)}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 gap-0 p-2">
        <div className="px-2 pt-1.5 pb-2">
          <p className="truncate text-body-md">{me.name ?? me.login}</p>
          <p className="truncate text-body-sm text-secondary">
            {me.login} · {roleLabels[me.role]}
          </p>
        </div>
        <nav aria-label="Account" className="flex flex-col border-t border-tertiary pt-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="group/row flex min-h-10 items-center justify-between rounded-md px-2 text-body-sm transition-colors hover:bg-muted"
            >
              {item.label}
              <ChevronRight
                aria-hidden="true"
                strokeWidth={1.75}
                className="size-4 text-secondary transition-transform group-hover/row:translate-x-0.5"
              />
            </Link>
          ))}
          <button
            type="button"
            onClick={() => signOut()}
            className="flex min-h-10 items-center rounded-md px-2 text-left text-body-sm text-secondary transition-colors hover:bg-muted hover:text-on-surface"
          >
            Sign out
          </button>
        </nav>
      </PopoverContent>
    </Popover>
  )
}
