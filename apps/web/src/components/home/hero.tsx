import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { WidgetIcon } from '@/components/widgets/widget-icon'
import { site } from '@/lib/site'

import { DeviceShowcase } from './device-showcase'

// The gallery pill's icons: a few of the first widgets, in their own colours.
const glyphs = [
  { name: 'gauge', color: 'var(--color-flame)' },
  { name: 'music', color: 'var(--color-sky)' },
  { name: 'star', color: 'var(--color-lime)' },
  { name: 'thermometer', color: 'var(--color-mint)' },
]

/**
 * The hero stage. From 1280px the text sits on the left and the devices on the right; scrolling
 * fades the text out, glides the devices to the center, then pairs the phone (globals.css, "hero
 * stage"). On narrower screens, and without scroll-driven animation, the text sits above them.
 */
export function Hero() {
  return (
    <section className="hero-stage relative" aria-labelledby="hero-title">
      <div className="hero-sticky">
        <HeroCopy />
        <DeviceShowcase />
      </div>
    </section>
  )
}

function HeroCopy() {
  return (
    <div className="hero-copy column pt-32 pb-14 sm:pt-40">
      <div className="max-w-[34rem]">
        <h1 id="hero-title" className="max-w-[16ch] text-headline-display">
          Your phone is a second monitor now.
        </h1>
        <p className="mt-4 max-w-[44ch] text-body-lg text-secondary">
          Scan a QR code and your phone becomes a monitor shaped exactly like it, with live widgets
          beside it. No cable, no dummy plug, no app store.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {/* The gallery pill: its tag holds a few widget icons, which lift one after another on
              hover. The cursor chip steps aside here so it doesn't cover them. */}
          <Link
            href="/widgets"
            data-cursor-hide
            className="group inline-flex h-11 items-center gap-3 rounded-full bg-primary pr-1.5 pl-5 text-label-lg text-surface transition-[opacity,scale] duration-200 hover:opacity-90 active:scale-[0.98]"
          >
            Browse widgets
            <span
              aria-hidden="true"
              className="flex items-center -space-x-1.5 rounded-full bg-surface/15 p-1"
            >
              {glyphs.map((glyph, index) => (
                <span
                  key={glyph.name}
                  style={{ transitionDelay: `${index * 45}ms` }}
                  className="grid size-7 place-items-center rounded-full bg-white ring-2 ring-primary transition-transform duration-300 ease-out-expo group-hover:-translate-y-[3px] motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
                >
                  <WidgetIcon
                    name={glyph.name}
                    className="size-3.5"
                    style={{ color: glyph.color }}
                  />
                </span>
              ))}
            </span>
          </Link>

          <Button asChild variant="secondary" className="h-11 px-5">
            <a href={site.releases} data-cursor="Installers for Windows, macOS and Linux">
              Download
              <ArrowRight aria-hidden="true" strokeWidth={1.75} />
            </a>
          </Button>
        </div>
        <p className="mt-4 text-body-sm text-secondary">
          Free and open source, for Windows, macOS and Linux.{' '}
          <Link
            href="/docs/install"
            className="text-on-surface underline decoration-border underline-offset-4 hover:decoration-current"
          >
            Install guide
          </Link>
        </p>
      </div>
    </div>
  )
}
