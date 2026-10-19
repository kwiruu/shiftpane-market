'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const DEFAULT_LABEL = 'Early development · Free widgets'

// How much of the gap to the pointer the chip closes each frame. Lower is lazier.
const FOLLOW = 0.18

/**
 * The cursor chip (DESIGN.md, Components): a white pill that trails the mouse with a soft lag.
 * Its label comes from the nearest [data-cursor] under the pointer. Mouse only, off when the reader
 * prefers reduced motion, and only on the landing page and the gallery: in the docs, forms and the
 * dashboards it would only get in the way.
 */
export function CursorChip() {
  const pathname = usePathname()
  const shown = pathname === '/' || pathname.startsWith('/widgets')
  return shown ? <Chip /> : null
}

function Chip() {
  const ref = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState(DEFAULT_LABEL)

  useEffect(() => {
    const chip = ref.current
    const allowed = window.matchMedia(
      '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    )
    if (!chip || !allowed.matches) return

    let x = 0
    let y = 0
    let targetX = 0
    let targetY = 0
    let frame = 0
    let shown = false

    const draw = () => {
      x += (targetX - x) * FOLLOW
      y += (targetY - y) * FOLLOW
      chip.style.transform = `translate3d(${x + 16}px, ${y - 14}px, 0)`
      // Stop the loop once the chip has caught up; the next move starts it again.
      frame = Math.abs(targetX - x) + Math.abs(targetY - y) > 0.1 ? requestAnimationFrame(draw) : 0
    }

    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      targetX = event.clientX
      targetY = event.clientY
      if (!shown) {
        x = targetX
        y = targetY
        shown = true
        chip.dataset.shown = ''
      }
      const target = event.target as Element | null
      // Elements that are their own feedback (like the gallery pill) opt out with data-cursor-hide.
      if (target?.closest?.('[data-cursor-hide]')) delete chip.dataset.shown
      else if (shown) chip.dataset.shown = ''
      const next = target?.closest?.('[data-cursor]')?.getAttribute('data-cursor') || DEFAULT_LABEL
      setLabel((current) => (current === next ? current : next))
      if (!frame) frame = requestAnimationFrame(draw)
    }

    const hide = () => {
      shown = false
      delete chip.dataset.shown
    }

    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', hide)
    window.addEventListener('blur', hide)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', hide)
      window.removeEventListener('blur', hide)
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[60] hidden h-7 items-center gap-1.5 rounded-full bg-surface px-2.5 text-label-md whitespace-nowrap text-on-surface opacity-0 shadow-[0_0_0_1px_var(--color-border),0_4px_12px_rgb(0_0_0/0.06)] transition-opacity duration-300 will-change-transform data-shown:opacity-100 pointer-fine:flex"
    >
      <span className="size-1.5 rounded-full bg-accent" />
      {label}
    </div>
  )
}
