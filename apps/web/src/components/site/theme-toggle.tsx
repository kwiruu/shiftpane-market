'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'

/**
 * Switches between light and dark. The first visit is light; after a click, the choice sticks.
 * Both icons render and CSS shows the right one, so the server and client markup always match.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Toggle dark mode"
      data-cursor="Light or dark"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    >
      <Moon strokeWidth={1.75} className="dark:hidden" />
      <Sun strokeWidth={1.75} className="hidden dark:block" />
    </Button>
  )
}
