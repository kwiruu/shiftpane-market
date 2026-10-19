'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { docGroups } from '@/lib/docs'

/** The docs navigation: small uppercase group labels over plain text links. */
export function DocsSidebar() {
  const pathname = usePathname()

  return (
    <nav aria-label="Documentation" className="flex flex-col gap-6">
      {docGroups.map((group) => (
        <div key={group.title}>
          <h2 className="px-3 pb-2 font-sans text-label-sm text-secondary uppercase">
            {group.title}
          </h2>
          <ul className="flex flex-col gap-0.5">
            {group.docs.map((doc) => (
              <li key={doc.slug}>
                <Link
                  href={`/docs/${doc.slug}`}
                  aria-current={pathname === `/docs/${doc.slug}` ? 'page' : undefined}
                  className="flex min-h-9 items-center rounded-full px-3 text-body-sm text-secondary transition-colors hover:text-on-surface aria-[current=page]:bg-surface aria-[current=page]:text-on-surface"
                >
                  {doc.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
