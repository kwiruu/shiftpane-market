import type { Accent, BindingContext, ViewNode, Widget, WidgetSize } from '@shiftpane/format'
import {
  configDefaults,
  formatValue,
  interpolate,
  resolveBinding,
  viewFor,
} from '@shiftpane/format'
import { cn } from '@/lib/utils'

import { WidgetIcon } from './widget-icon'

/*
 * The phone's widget board, drawn in the browser from a widget's view.json and sample.json
 * (DESIGN.md, Widget previews). Like the phone, it renders only ShiftPane's own components, so
 * nothing a widget author wrote runs here either.
 *
 * Type, rings, covers and buttons are sized the way the app sizes them (packages/board in the
 * ShiftPane repo): `fluid(min, cqmin, max)` is a share of the card's shorter side kept between two
 * pixel sizes, so a widget reads the same on a thumbnail and on a phone held up to the screen. The
 * older nodes (meter, progress, list, sparkline, icon) and the gaps are a share of `--u`, one board
 * cell: the card's shorter side for small and medium tiles, half of it for large ones.
 *
 * Decorative: whatever contains a preview carries its text description.
 */

const u = (share: number) => `calc(var(--u) * ${share})`

/**
 * The app's `fluid`: a share of the card's shorter side, kept between two pixel sizes. The minimum
 * suits a real phone card (150px and up); a picture of a phone, with cards a fraction of that, sets
 * `--fmin: 0` on its board so everything shrinks in proportion instead.
 */
const fluid = (min: number, cqmin: number, max: number) =>
  `clamp(calc(${min}px * var(--fmin, 1)), ${cqmin}cqmin, ${max}px)`

const accents: Record<Accent, string> = {
  flame: 'var(--color-flame)',
  lime: 'var(--color-lime)',
  mint: 'var(--color-mint)',
  sky: 'var(--color-sky)',
  ink: 'var(--card-ink)',
}

const textSizes = {
  xs: fluid(11, 5.5, 14),
  sm: fluid(12, 6.5, 17),
  md: fluid(14, 8.5, 24),
  lg: fluid(20, 13, 38),
}

const valueSizes = {
  sm: fluid(15, 9, 26),
  md: fluid(22, 17, 52),
  lg: fluid(30, 22, 72),
  xl: fluid(34, 26, 80),
}

const percentOf = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0

const numbers = (value: unknown): (number | null)[] =>
  Array.isArray(value) ? value.map((v) => (typeof v === 'number' ? v : null)) : []

/** Nodes that take the room left over in a row; the rest keep their own size. */
const grows = new Set<ViewNode['type']>([
  'stack',
  'grid',
  'list',
  'history-bars',
  'sparkline',
  'text',
  'progress',
  'meter',
])

/** The shape of a tile, in board cells: small is one, medium two wide, large two by two. */
export const tileAspect: Record<WidgetSize, string> = {
  small: 'aspect-square',
  medium: 'aspect-[2.1/1]',
  large: 'aspect-square',
}

// A tenth of a cell, on each axis. Container units can't round the container itself, so percentages.
const tileRadius: Record<WidgetSize, string> = {
  small: '11%',
  medium: `${11 / 2.1}% / 11%`,
  large: '5.5%',
}

export function WidgetCard({
  widget,
  size,
  className,
}: {
  widget: Widget
  size: WidgetSize
  className?: string
}) {
  const node = viewFor(widget.view, size)
  const context: BindingContext = { sample: widget.sample, config: configDefaults(widget.config) }
  return (
    <div
      aria-hidden="true"
      className={cn(
        widget.tone === 'light' ? 'tone-light' : 'tone-dark',
        'relative isolate overflow-hidden bg-card-bg text-card-ink [container-type:size]',
        tileAspect[size],
        className,
      )}
      style={
        {
          '--u': size === 'large' ? '50cqmin' : '100cqmin',
          borderRadius: tileRadius[size],
        } as React.CSSProperties
      }
    >
      {/* The padding sits inside the container so `--u` refers to this card, not the page. */}
      <div className="absolute inset-0 flex flex-col" style={{ padding: fluid(12, 7.5, 24) }}>
        {node ? <Node node={node} context={context} fill /> : null}
      </div>
    </div>
  )
}

function Node({
  node,
  context,
  fill = false,
}: {
  node: ViewNode
  context: BindingContext
  fill?: boolean
}) {
  switch (node.type) {
    case 'stack':
    case 'row': {
      const justify = {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
      }[node.align ?? 'start']
      return (
        <div
          // The root is positioned so a glow can bleed off its corner.
          className={cn(
            'flex min-w-0',
            node.type === 'stack' ? 'flex-col' : 'flex-row items-center',
            justify,
            fill && 'relative min-h-0 flex-1',
          )}
          style={{
            gap: u(0.03 * (node.gap ?? 2)),
            ...(node.type === 'row' && node.inset ? { paddingInline: fluid(4, 8, 48) } : {}),
          }}
        >
          {node.children.map((child, index) => (
            <Child key={index} node={child} context={context} inRow={node.type === 'row'} />
          ))}
        </div>
      )
    }
    case 'grid':
      return (
        <div
          className={cn('grid min-w-0 items-center', fill && 'min-h-0 flex-1')}
          style={{
            gridTemplateColumns: `repeat(${node.columns}, minmax(0, 1fr))`,
            gap: u(0.03 * (node.gap ?? 2)),
          }}
        >
          {node.children.map((child, index) => (
            <Child key={index} node={child} context={context} />
          ))}
        </div>
      )
    case 'label':
      return (
        <p
          className="truncate text-card-muted"
          style={{ fontSize: fluid(11, 6.4, 15), lineHeight: 1.25 }}
        >
          {interpolate(node.text, context)}
        </p>
      )
    case 'text': {
      const raw = node.bind ? resolveBinding(node.bind, context) : node.text
      const text =
        typeof raw === 'string' ? interpolate(raw, context) : raw == null ? '—' : String(raw)
      return (
        <p
          className={cn(
            'truncate',
            node.muted ? 'text-card-muted' : 'font-semibold tracking-tight',
          )}
          style={{ fontSize: textSizes[node.size ?? 'md'], lineHeight: 1.2 }}
        >
          {text}
        </p>
      )
    }
    case 'value': {
      const { value, unit } = formatValue(
        resolveBinding(node.bind, context),
        node.format,
        node.unit,
      )
      return (
        <p
          className="font-semibold whitespace-nowrap tabular-nums"
          style={{
            fontSize: valueSizes[node.size ?? 'md'],
            lineHeight: 1,
            letterSpacing: '-0.025em',
          }}
        >
          {value}
          {unit && (
            <span className="ml-[0.06em] text-[0.45em] font-medium tracking-normal">{unit}</span>
          )}
        </p>
      )
    }
    case 'ring':
      return (
        <Ring
          percent={percentOf(resolveBinding(node.bind, context))}
          label={node.label ? interpolate(node.label, context) : undefined}
          color={node.color}
          small={node.size === 'sm'}
          unit={node.unit ?? true}
        />
      )
    case 'meter':
      return (
        <Meter percent={percentOf(resolveBinding(node.bind, context))} segments={node.segments} />
      )
    case 'progress':
      return (
        <div
          className="w-full overflow-hidden rounded-full bg-card-soft"
          style={{ height: u(0.07) }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${percentOf(resolveBinding(node.bind, context))}%`,
              background: accents[node.color ?? 'flame'],
            }}
          />
        </div>
      )
    case 'history-bars':
      return (
        <HistoryBars
          values={numbers(resolveBinding(node.bind, context))}
          max={node.max}
          count={node.count}
        />
      )
    case 'sparkline':
      return (
        <Sparkline
          values={numbers(resolveBinding(node.bind, context))}
          color={accents[node.color ?? 'flame']}
        />
      )
    case 'list':
      return <List items={resolveBinding(node.bind, context)} max={node.max} />
    case 'icon':
      return (
        <WidgetIcon
          name={node.name}
          strokeWidth={2}
          style={{
            width: u(0.17),
            height: u(0.17),
            color: node.color ? accents[node.color] : undefined,
          }}
        />
      )
    case 'button':
      return <Button icon={node.icon} primary={node.action === 'media.play-pause'} />
    case 'divider':
      return <div className="w-full flex-none border-t border-card-line" />
    case 'cover': {
      const title = node.bind ? resolveBinding(node.bind, context) : undefined
      return (
        <Cover title={typeof title === 'string' ? title : ''} icon={node.icon} size={node.size} />
      )
    }
    case 'equalizer':
      return <Equalizer />
    case 'glow':
      return <Glow color={node.color} corner={node.corner} />
  }
}

function Child({
  node,
  context,
  inRow = false,
}: {
  node: ViewNode
  context: BindingContext
  inRow?: boolean
}) {
  // In a row, flexible nodes share the room; fixed ones (rings, values, icons, buttons) keep their size.
  if (inRow && grows.has(node.type)) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col self-stretch justify-center">
        <Node node={node} context={context} fill />
      </div>
    )
  }
  return (
    <Node
      node={node}
      context={context}
      fill={node.type === 'history-bars' || node.type === 'sparkline'}
    />
  )
}

function Ring({
  percent,
  label,
  color = 'flame',
  small = false,
  unit = true,
}: {
  percent: number
  label?: string
  color?: Accent
  /** The small gauge beside a figure, like the RAM ring on the PC overview. */
  small?: boolean
  unit?: boolean
}) {
  const thickness = small ? 7 : 10
  const r = 50 - thickness / 2
  return (
    <div
      className="relative grid aspect-square flex-none place-items-center self-center"
      style={{ width: small ? fluid(54, 30, 96) : `min(100%, ${u(0.66)})` }}
    >
      <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="var(--card-line)"
          strokeWidth={thickness}
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={accents[color]}
          strokeWidth={thickness}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${percent} 100`}
        />
      </svg>
      <div className="relative text-center leading-none">
        <p
          className="font-semibold tabular-nums"
          style={{ fontSize: small ? fluid(13, 7.5, 22) : u(0.16) }}
        >
          {Math.round(percent)}
          {unit && <span className="text-[0.55em]">%</span>}
        </p>
        {label && (
          <p
            className={cn('text-card-muted', small ? 'mt-0.5' : 'mt-[0.2em]')}
            style={{ fontSize: small ? fluid(9, 4.5, 12) : u(0.08) }}
          >
            {label}
          </p>
        )}
      </div>
    </div>
  )
}

function Meter({ percent, segments = 5 }: { percent: number; segments?: number }) {
  const filled = (percent / 100) * segments
  return (
    <div className="flex w-full items-end" style={{ gap: u(0.025), height: u(0.12) }}>
      {Array.from({ length: segments }, (_, i) => {
        const fill = Math.min(1, Math.max(0, filled - i))
        return (
          <div
            key={i}
            className="relative h-full flex-1 overflow-hidden bg-card-soft"
            style={{ borderRadius: u(0.035) }}
          >
            <div
              className="absolute inset-y-0 left-0 bg-flame"
              style={{ width: `${fill * 100}%`, borderRadius: u(0.035) }}
            />
          </div>
        )
      })}
    </div>
  )
}

/** Recent values as thin bars around a middle line, newest on the right in the accent colour. */
function HistoryBars({
  values,
  max,
  count,
}: {
  values: (number | null)[]
  max?: number
  count?: number
}) {
  const shown = count ? values.slice(-count) : values
  const top = max ?? Math.max(1, ...shown.filter((v): v is number => v !== null))
  return (
    <div
      className="flex min-h-[calc(var(--u)*0.2)] w-full flex-1 items-center justify-between"
      style={{ gap: fluid(2, 1.1, 4) }}
    >
      {shown.map((value, i) => {
        const height = value === null ? 0 : Math.max(6, Math.min(100, (value / top) * 100))
        return (
          <span
            key={i}
            className={cn(
              'min-w-px flex-1 rounded-full',
              i === shown.length - 1 ? 'bg-flame' : 'bg-card-ink/25',
            )}
            // A handful of values stay slim bars rather than swelling into blobs.
            style={{ height: `${height}%`, maxWidth: fluid(3, 2, 8) }}
          />
        )
      })}
    </div>
  )
}

function Sparkline({ values, color }: { values: (number | null)[]; color: string }) {
  const known = values.filter((v): v is number => v !== null)
  const top = Math.max(1, ...known) * 1.15
  const points = values.map(
    (value, i) =>
      `${(i / Math.max(1, values.length - 1)) * 100},${100 - ((value ?? 0) / top) * 100}`,
  )
  return (
    <div className="min-h-[calc(var(--u)*0.3)] w-full flex-1">
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="size-full overflow-visible"
      >
        {values.length > 1 && (
          <>
            <path d={`M0,100 L${points.join(' L')} L100,100 Z`} fill={color} fillOpacity={0.16} />
            <polyline
              points={points.join(' ')}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </>
        )}
      </svg>
    </div>
  )
}

function List({ items, max = 3 }: { items: unknown; max?: number }) {
  const rows = (Array.isArray(items) ? items : []).slice(0, max) as {
    title?: unknown
    subtitle?: unknown
    value?: unknown
  }[]
  return (
    <div className="flex w-full min-w-0 flex-col justify-center" style={{ gap: u(0.025) }}>
      {rows.map((row, i) => (
        <div
          key={i}
          className="flex min-w-0 items-baseline justify-between border-card-line not-first:border-t"
          style={{ gap: u(0.04), paddingTop: i ? u(0.025) : 0 }}
        >
          <div className="min-w-0">
            <p className="truncate font-semibold" style={{ fontSize: u(0.092), lineHeight: 1.2 }}>
              {String(row.title ?? '')}
            </p>
            {row.subtitle ? (
              <p
                className="truncate text-card-muted"
                style={{ fontSize: u(0.072), lineHeight: 1.2 }}
              >
                {String(row.subtitle)}
              </p>
            ) : null}
          </div>
          <p className="flex-none font-semibold tabular-nums" style={{ fontSize: u(0.092) }}>
            {String(row.value ?? '')}
          </p>
        </div>
      ))}
    </div>
  )
}

function Button({ icon, primary }: { icon: string; primary: boolean }) {
  const size = primary ? fluid(40, 24, 64) : fluid(34, 18, 52)
  return (
    <span
      className={cn(
        'grid flex-none place-items-center rounded-full',
        primary ? 'bg-card-ink text-card-bg' : 'text-card-ink',
      )}
      style={{ width: size, height: size }}
    >
      <WidgetIcon name={icon} filled className={primary ? 'size-[46%]' : 'size-[62%]'} />
    </span>
  )
}

/** Two hues picked from a title, so each track gets its own cover (the app does the same). */
function hues(text: string): [number, number] {
  let hash = 0
  for (const char of text) hash = (hash * 31 + (char.codePointAt(0) ?? 0)) >>> 0
  const first = hash % 360
  return [first, (first + 40 + ((hash >> 9) % 80)) % 360]
}

/** A gradient tile with an icon on it, standing in for cover art. */
function Cover({ title, icon, size = 'md' }: { title: string; icon: string; size?: 'sm' | 'md' }) {
  const [a, b] = hues(title)
  const side = size === 'sm' ? fluid(44, 24, 96) : fluid(44, 30, 120)
  return (
    <div
      className="grid flex-none place-items-center text-white/85 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12)]"
      style={{
        width: side,
        height: side,
        borderRadius: `calc(${side} * 0.24)`,
        background: `linear-gradient(140deg, oklch(0.74 0.16 ${a}), oklch(0.5 0.19 ${b}))`,
      }}
    >
      <WidgetIcon name={icon} filled className="size-[42%]" />
    </div>
  )
}

function Equalizer() {
  return (
    <span
      className="equalizer inline-flex h-[0.9em] flex-none items-end gap-[2px]"
      style={{ fontSize: textSizes.xs }}
      aria-hidden="true"
    >
      <span className="h-full w-[3px] rounded-full bg-mint" />
      <span className="h-full w-[3px] rounded-full bg-mint" />
      <span className="h-full w-[3px] rounded-full bg-mint" />
    </span>
  )
}

/** A soft colored light behind the content, bleeding off a corner. Behind it all, so it never covers text. */
function Glow({
  color = 'flame',
  corner = 'top-right',
}: {
  color?: Accent
  corner?: 'top-right' | 'bottom-right'
}) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -z-10 size-[75%] rounded-full opacity-30 blur-3xl"
      style={{
        background: accents[color],
        ...(corner === 'top-right'
          ? { right: '-20%', top: '-45%' }
          : { right: '-25%', bottom: '-40%' }),
      }}
    />
  )
}
