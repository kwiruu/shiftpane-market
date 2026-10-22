'use client'

import { useLenis } from 'lenis/react'
import { ArrowRight, Menu } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { AccountMenu } from '@/components/account/account-menu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { mainNav, site } from '@/lib/site'

import { GitHubIcon } from './brand-icons'
import { ListRow } from './list-group'
import { LogoMark } from './logo'
import { ThemeToggle } from './theme-toggle'

/** The nav item a path belongs to: the longest matching prefix wins, so "Make a widget" beats "Docs". */
function useActiveHref() {
  const pathname = usePathname()
  const matches = mainNav
    .map((item) => item.href)
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
  return matches.sort((a, b) => b.length - a.length)[0]
}

/**
 * A quiet navigation bar: the name, the platforms, and one notice chip on the left, a few text links
 * and the account on the right. It turns into translucent page color with a hairline once content
 * scrolls under it. `accounts` is false where the site runs without the API.
 */
export function SiteHeader({ accounts }: { accounts: boolean }) {
  const active = useActiveHref()
  const lenis = useLenis()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  function setMenu(open: boolean) {
    setMenuOpen(open)
    // Keep the page still behind the menu; smooth scrolling would otherwise keep reading the wheel.
    if (open) lenis?.stop()
    else lenis?.start()
  }

  return (
    <header
      data-scrolled={scrolled || undefined}
      className="fixed inset-x-0 top-0 z-40 pt-[calc(env(safe-area-inset-top)+var(--spacing-nav-gap))] pb-nav-gap transition-[background-color,box-shadow] duration-300 data-scrolled:glass data-scrolled:shadow-[inset_0_-1px_0_var(--color-border)]"
    >
      <div className="frame flex h-nav items-center gap-3">
        <Link href="/" className="-ml-1 flex items-center gap-2 rounded-md p-1" data-cursor="Home">
          <LogoMark className="size-5" />
          <span className="text-body-md">{site.name}</span>
          <span className="hidden text-body-sm text-secondary lg:inline">{site.platform}</span>
        </Link>

        <Badge asChild live className="hidden transition-colors hover:bg-muted sm:inline-flex">
          <Link href="/docs/install" data-cursor="No release yet, build from source">
            Early development
            <ArrowRight aria-hidden="true" strokeWidth={1.75} />
          </Link>
        </Badge>

        <nav aria-label="Main" className="ml-auto hidden items-center gap-6 md:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active === item.href ? 'page' : undefined}
              className="text-label-lg text-secondary transition-colors hover:text-on-surface aria-[current=page]:text-on-surface"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 md:ml-3">
          <AccountMenu enabled={accounts} />
          <Button
            asChild
            variant="ghost"
            size="icon-sm"
            className="text-secondary hover:text-on-surface"
          >
            <a href={site.repo} aria-label="ShiftPane on GitHub" data-cursor="Source on GitHub">
              <GitHubIcon className="size-[18px]" />
            </a>
          </Button>
          <ThemeToggle />
          <Sheet open={menuOpen} onOpenChange={setMenu}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="md:hidden" aria-label="Menu">
                <Menu strokeWidth={1.75} />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="top"
              className="gap-0 px-5 pt-[calc(env(safe-area-inset-top)+26px)] pb-5"
            >
              <SheetTitle className="flex h-8 items-center gap-2">
                <LogoMark className="size-5" />
                {site.name}
              </SheetTitle>
              <SheetDescription className="sr-only">Site navigation</SheetDescription>
              {/* Links close the menu; the click bubbles up from whichever row was tapped. */}
              {/* biome-ignore lint/a11y/useKeyWithClickEvents: links handle their own keys */}
              <nav
                aria-label="Main"
                className="mt-4 rounded-lg bg-surface px-4 py-1"
                onClick={(event) => {
                  if ((event.target as HTMLElement).closest('a')) setMenu(false)
                }}
              >
                <ListRow href="/docs/install">Install</ListRow>
                {mainNav.map((item) => (
                  <ListRow key={item.href} href={item.href} selected={active === item.href}>
                    {item.label}
                  </ListRow>
                ))}
                <ListRow href={site.repo}>GitHub</ListRow>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only rounded-full bg-primary px-4 py-2 text-label-lg text-surface focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
    >
      Skip to content
    </a>
  )
}
