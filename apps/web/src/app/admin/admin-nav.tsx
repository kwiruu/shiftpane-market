'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

const items = [
  { href: '/admin', label: 'Review queue' },
  { href: '/admin/reports', label: 'Reports' },
]

/** The reviewers' two views, as a segmented control. A review page belongs to the queue. */
export function AdminNav() {
  const pathname = usePathname()
  const active = pathname.startsWith('/admin/reports') ? '/admin/reports' : '/admin'
  return (
    <nav aria-label="Review" className="inline-flex self-start rounded-full bg-muted p-0.5">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={active === item.href ? 'page' : undefined}
          className={cn(
            'rounded-full px-3 py-1 text-label-md transition-colors',
            active === item.href
              ? 'bg-surface text-on-surface shadow-xs'
              : 'text-secondary hover:text-on-surface',
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
