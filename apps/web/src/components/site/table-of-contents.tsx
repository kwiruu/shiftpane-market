'use client'

import { useEffect, useState } from 'react'

import type { Heading } from '@/lib/toc'
import { cn } from '@/lib/utils'

// A heading counts as the current section once its top passes this far below the window top
// (just under the navigation bar).
const READ_LINE = 120

/**
 * "On this page": floating text beside the doc, like the sidebar. The section being read is
 * highlighted; the links scroll smoothly through Lenis.
 */
export function TableOfContents({ items }: { items: Heading[] }) {
  const [active, setActive] = useState(items[0]?.id)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      let current = items[0]?.id
      for (const item of items) {
        const element = document.getElementById(item.id)
        if (element && element.getBoundingClientRect().top <= READ_LINE) current = item.id
      }
      // At the bottom of the page the last sections can't scroll up to the read line; the last one wins.
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      setActive(atBottom ? items[items.length - 1]?.id : current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [items])

  return (
    <nav aria-label="On this page">
      <p className="pb-2 font-sans text-label-sm text-secondary uppercase">On this page</p>
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li key={item.id} className={cn(item.level === 3 && 'pl-3')}>
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? 'location' : undefined}
              className="block py-1 text-body-sm text-secondary transition-colors hover:text-on-surface aria-[current=location]:text-on-surface"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
