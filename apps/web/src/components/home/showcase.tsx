import { WIDGET_KINDS } from '@shiftpane/board/model'
import { sampleSources } from '@shiftpane/format'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { PreviewStage } from '@/components/widgets/preview-stage'
import { sampleWidget } from '@/lib/registry'

type Featured = { cursor: string; caption: string } & (
  | { id: string; builtIn?: never }
  | { builtIn: keyof typeof WIDGET_KINDS; id?: never }
)

const featured: Featured[] = [
  {
    id: 'gpu-ring',
    cursor: 'Bindings only, no code',
    caption:
      'GPU load as a ring, with the last minute beside it, bound straight to the GPU source. No code.',
  },
  {
    builtIn: 'calendar',
    cursor: 'Comes with ShiftPane',
    caption: 'Today, this week or the month, from the PC. It comes with the app, no setup.',
  },
  {
    id: 'github-contributions',
    cursor: 'Can reach api.github.com, nothing else',
    caption:
      'Big green squares for your commits, with a full year on large. Its collector may call GitHub and no other host.',
  },
]

// Wider than the story column, so a widget sits on its patch of board at the size a phone draws it.
export function Showcase() {
  return (
    <div className="mx-auto flex w-full max-w-[calc(var(--container-showcase)+2*var(--gutter))] flex-col gap-14 px-[max(var(--gutter),env(safe-area-inset-left))]">
      {featured.map((entry) => {
        const widget = entry.id ? sampleWidget(entry.id) : undefined
        if (entry.id && !widget) return null
        const name = widget?.name ?? (entry.builtIn ? WIDGET_KINDS[entry.builtIn].name : '')
        const href = entry.builtIn ? `/widgets/built-in/${entry.builtIn}` : `/widgets/${widget?.id}`
        return (
          <div key={entry.id ?? entry.builtIn} data-cursor={entry.cursor}>
            <PreviewStage
              widget={widget}
              builtIn={entry.builtIn}
              wallpaper
              caption={
                <>
                  {entry.caption}{' '}
                  <Link
                    href={href}
                    className="inline-flex items-center gap-0.5 whitespace-nowrap text-on-surface underline decoration-border underline-offset-4 hover:decoration-current"
                  >
                    {name}
                    <ArrowRight aria-hidden="true" strokeWidth={1.75} className="size-3.5" />
                  </Link>
                </>
              }
            />
          </div>
        )
      })}
    </div>
  )
}

const chips = [
  { text: `GPU at ${sampleSources.gpu.percent}%`, top: '4%', drift: '-180px' },
  { text: 'Paired over Wi-Fi', top: '30%', drift: '-320px' },
  { text: '1920 × 1200 monitor', top: '74%', drift: '-260px' },
]

/**
 * The rail beside the column on the widest screens: a few status chips, each drifting at its own
 * pace as the page scrolls (DESIGN.md, Layout). It starts clear of the showcase, the widest thing
 * beside it, so the chips never sit over a widget. Decorative.
 */
export function Rail() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-[calc(50%+440px+32px)] hidden w-52 min-[1440px]:block"
    >
      {chips.map((chip) => (
        <div
          key={chip.text}
          style={{ top: chip.top, '--drift': chip.drift } as React.CSSProperties}
          className="drift absolute left-6"
        >
          <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-surface px-2.5 text-label-md shadow-[0_0_0_1px_var(--color-border)]">
            <span className="size-1.5 rounded-full bg-accent" />
            {chip.text}
          </span>
        </div>
      ))}
    </div>
  )
}
