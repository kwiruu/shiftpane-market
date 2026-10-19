import Link from 'next/link'

import { site } from '@/lib/site'

const links = [
  { href: '/widgets', label: 'Widgets' },
  { href: '/docs', label: 'Docs' },
  { href: '/upload', label: 'Publish' },
  { href: '/docs/content-policy', label: 'Content policy' },
  { href: '/docs/privacy', label: 'Privacy' },
  { href: site.repo, label: 'GitHub' },
]

/** One quiet row, the width of the story column. */
export function SiteFooter() {
  return (
    <footer className="column pt-28 pb-10" data-cursor="Thanks for scrolling">
      <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-body-sm text-secondary">
          © {site.year} {site.name}
        </p>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {links.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-body-sm text-secondary transition-colors hover:text-on-surface"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p className="mt-6 text-micro text-secondary">
        ShiftPane is open source under the{' '}
        <a href={site.license.url} className="underline underline-offset-2 hover:text-on-surface">
          {site.license.name}
        </a>
        . Every listed widget ships readable source under its own OSI-approved license, and the app
        can load widgets from a folder, so this gallery is a default, not a lock-in.
      </p>
    </footer>
  )
}
