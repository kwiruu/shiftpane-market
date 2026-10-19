'use client'

import { ReactLenis } from 'lenis/react'

/**
 * Inertial smooth scrolling for the whole page (DESIGN.md, Motion). Lenis turns itself off for
 * prefers-reduced-motion, lets nested scroll areas (code, tables, the docs sidebar) scroll natively,
 * and smooths in-page anchor links too.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        // Lenis honors each target's scroll-margin-top (set for every [id] in globals.css), so no offset here.
        anchors: true,
        allowNestedScroll: true,
        stopInertiaOnNavigate: true,
      }}
    >
      {children}
    </ReactLenis>
  )
}
