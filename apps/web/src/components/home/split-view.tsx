'use client'

import type { Widget } from '@shiftpane/format'
import { useState } from 'react'
import { WidgetCard } from '@/components/widgets/widget-view'
import { monitorArea, pickMonitorSize } from '@/lib/split'
import { cn } from '@/lib/utils'

// The app's own presets (packages/layout, SPLIT_PRESETS), as a share of the long side for the monitor.
const presets = [
  { label: 'Monitor', fraction: 1 },
  { label: '70 / 30', fraction: 0.7 },
  { label: '50 / 50', fraction: 0.5 },
  { label: 'Widgets', fraction: 0 },
] as const

// A common phone, held sideways: 2400 × 1080 physical pixels.
const PHONE = { width: 2400, height: 1080 }

/**
 * Split view (DESIGN.md, Components): a phone held sideways, part monitor and part widget board.
 * Picking a split changes the monitor the PC adds, so the caption reads out its resolution, worked
 * out the way the app does: the area the split leaves, matched to the nearest of its fixed sizes.
 */
export function SplitView({ widgets }: { widgets: Widget[] }) {
  const [fraction, setFraction] = useState<number>(0.7)
  const area = monitorArea(PHONE, fraction)
  const size = area && pickMonitorSize(area)

  return (
    <figure data-cursor="The split is the resolution">
      <div
        role="img"
        aria-label={
          size
            ? `A phone in split view: a ${size.width} by ${size.height} monitor on the left, widgets on the right`
            : 'A phone showing only its widget board'
        }
        className="mx-auto w-full max-w-[720px]"
      >
        <div
          aria-hidden="true"
          className="rounded-[7%/15.5%] bg-[#0d0d0d] p-[1.6%] shadow-device ring-1 ring-black/10 dark:bg-[#1c1c1c] dark:ring-white/10"
        >
          <div className="relative flex aspect-[2400/1080] overflow-hidden rounded-[5.6%/12.4%] bg-black [container-type:inline-size]">
            {/* The monitor: a slice of a desktop, as wide as the split gives it */}
            <div
              className="relative h-full overflow-hidden transition-[width] duration-500 ease-out-expo motion-reduce:transition-none"
              style={{ width: `${fraction * 100}%` }}
            >
              <div className="absolute inset-y-0 left-0 w-[100cqw] bg-[radial-gradient(120%_90%_at_20%_10%,#e9eef5_0%,#c8d3e1_45%,#a9b8cb_100%)] dark:bg-[radial-gradient(120%_90%_at_20%_10%,#27303f_0%,#141a25_50%,#080b11_100%)]">
                <div className="absolute top-[12%] left-[6%] h-[64%] w-[46%] rounded-[1cqw] bg-white/90 shadow-[0_1cqw_3cqw_rgb(0_0_0/0.18)] dark:bg-[#1f2430]">
                  <div className="flex gap-[0.6cqw] border-b border-black/5 p-[1.2cqw] dark:border-white/5">
                    {[0, 1, 2].map((dot) => (
                      <span
                        key={dot}
                        className="size-[1cqw] rounded-full bg-black/15 dark:bg-white/20"
                      />
                    ))}
                  </div>
                  <div className="space-y-[1.2cqw] p-[2cqw]">
                    {[86, 64, 72, 40].map((width) => (
                      <div
                        key={width}
                        className="h-[1.2cqw] rounded-full bg-black/10 dark:bg-white/12"
                        style={{ width: `${width}%` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="absolute top-[30%] left-[56%] h-[52%] w-[34%] rounded-[1cqw] bg-white/70 shadow-[0_1cqw_3cqw_rgb(0_0_0/0.14)] dark:bg-[#252b38]" />
              </div>
            </div>

            {/* The widget panel: the rest of the screen */}
            <div className="board flex min-w-0 flex-1 items-center justify-center overflow-hidden">
              <div
                className={cn(
                  'grid w-full gap-[1.6cqw] p-[2.4cqw] transition-opacity duration-300',
                  fraction === 0 && 'max-w-[86cqw] grid-cols-4',
                  fraction > 0 && fraction <= 0.6 && 'max-w-[42cqw] grid-cols-2',
                  fraction > 0.6 && 'max-w-[22cqw] grid-cols-1',
                  fraction === 1 && 'opacity-0',
                )}
              >
                {/* As many as fit the panel's height: one column of two, or two by two, or a row of four. */}
                {widgets.slice(0, fraction > 0.6 ? 2 : 4).map((widget) => (
                  <WidgetCard
                    key={widget.id}
                    widget={widget}
                    size="small"
                    className="mx-auto w-full max-w-[18cqw]"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        {/* biome-ignore lint/a11y/useSemanticElements: a set of toggle buttons, not a form's fieldset */}
        <div className="inline-flex rounded-full bg-muted p-0.5" role="group" aria-label="Split">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              aria-pressed={fraction === preset.fraction}
              onClick={() => setFraction(preset.fraction)}
              className={cn(
                'rounded-full px-3 py-1 text-label-md transition-colors',
                fraction === preset.fraction
                  ? 'bg-surface text-on-surface shadow-xs'
                  : 'text-secondary hover:text-on-surface',
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <figcaption aria-live="polite" className="max-w-80 text-center text-body-sm text-secondary">
          {size ? (
            <>
              The PC adds a{' '}
              <span className="text-on-surface tabular-nums">
                {size.width} × {size.height}
              </span>{' '}
              monitor, the nearest of its fixed sizes
              {fraction < 1
                ? ', and the rest of the phone shows widgets.'
                : ', across the whole phone.'}
            </>
          ) : (
            'No monitor at all: the phone is a widget board.'
          )}
        </figcaption>
      </div>
    </figure>
  )
}
