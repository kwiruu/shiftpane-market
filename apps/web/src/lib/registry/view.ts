import { sampleSources } from './sources'
import type { ConfigField, SourceName, ValueFormat, WidgetSize, WidgetView } from './types'

/**
 * How a preview reads `view.json` (PLAN, "The view: declarative JSON, not code"): `@name/...` reads
 * a system source, `/...` reads the collector's output as a JSON Pointer, and `{config.key}` in text
 * inserts a config value. Pure functions, so the previews and the review checks agree.
 */

export interface BindingContext {
  /** The collector's output: the widget's `sample.json` in a preview. */
  sample: Record<string, unknown>
  /** System sources by name. Defaults to the sample PC. */
  sources?: Partial<Record<SourceName, unknown>>
  config?: Record<string, unknown>
}

/** JSON Pointer (RFC 6901) lookup. `undefined` when any step is missing. */
export function pointer(root: unknown, path: string): unknown {
  if (path === '' || path === '/') return root
  if (!path.startsWith('/')) return undefined
  let current: unknown = root
  for (const raw of path.slice(1).split('/')) {
    const key = raw.replaceAll('~1', '/').replaceAll('~0', '~')
    if (current === null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return current
}

/** The value a `bind` names, or `undefined` if it doesn't resolve. */
export function resolveBinding(bind: string, context: BindingContext): unknown {
  if (bind.startsWith('@')) {
    const slash = bind.indexOf('/')
    const name = (slash === -1 ? bind.slice(1) : bind.slice(1, slash)) as SourceName
    const source = (context.sources ?? sampleSources)[name]
    return slash === -1 ? source : pointer(source, bind.slice(slash))
  }
  return pointer(context.sample, bind)
}

/** Replaces each `{config.key}` with the config value, or the field's default. */
export function interpolate(text: string, context: BindingContext): string {
  return text.replace(/\{config\.([a-zA-Z][a-zA-Z0-9]*)\}/g, (_, key: string) => {
    const value = context.config?.[key]
    return value === undefined || value === null ? '' : String(value)
  })
}

/** Each config field's default, as the app fills them in before the first run. */
export function configDefaults(fields: ConfigField[]): Record<string, unknown> {
  return Object.fromEntries(
    fields
      .filter((field) => field.default !== undefined)
      .map((field) => [field.key, field.default]),
  )
}

/** Every `bind` and source a view uses, for the review checks and the permission summary. */
export function bindingsOf(view: WidgetView): string[] {
  const found = new Set<string>()
  const walk = (node: unknown) => {
    if (!node || typeof node !== 'object') return
    const record = node as Record<string, unknown>
    if (typeof record.bind === 'string') found.add(record.bind)
    if (Array.isArray(record.children)) record.children.forEach(walk)
  }
  Object.values(view).forEach(walk)
  return [...found]
}

/** The tree for a size, falling back to the nearest size the widget does have. */
export function viewFor(view: WidgetView, size: WidgetSize) {
  const order: Record<WidgetSize, WidgetSize[]> = {
    small: ['small', 'medium', 'large'],
    medium: ['medium', 'small', 'large'],
    large: ['large', 'medium', 'small'],
  }
  for (const candidate of order[size]) {
    const node = view[candidate]
    if (node) return node
  }
  return undefined
}

export interface Formatted {
  value: string
  unit?: string
}

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB']

/** A number as the board shows it: a big figure and a small unit after it. */
export function formatValue(
  input: unknown,
  format: ValueFormat = 'number',
  unit?: string,
): Formatted {
  if (typeof input !== 'number' || !Number.isFinite(input)) {
    return { value: typeof input === 'string' ? input : '—', unit }
  }
  switch (format) {
    case 'percent':
      return { value: String(Math.round(Math.min(100, Math.max(0, input)))), unit: unit ?? '%' }
    case 'celsius':
      return { value: `${Math.round(input)}°`, unit: unit ?? 'C' }
    case 'compact':
      return compact(input, unit)
    case 'bytes':
    case 'rate': {
      let value = Math.abs(input)
      let step = 0
      while (value >= 1024 && step < BYTE_UNITS.length - 1) {
        value /= 1024
        step++
      }
      const digits = value < 10 && step > 0 ? 1 : 0
      const base = BYTE_UNITS[step] ?? 'B'
      return {
        value: (Math.sign(input) * value).toFixed(digits),
        unit: format === 'rate' ? `${base}/s` : base,
      }
    }
    case 'duration': {
      const minutes = Math.round(input / 60)
      if (minutes < 60) return { value: String(minutes), unit: 'm' }
      const hours = Math.floor(minutes / 60)
      if (hours < 48) return { value: `${hours}h ${minutes % 60}`, unit: 'm' }
      return { value: String(Math.floor(hours / 24)), unit: 'd' }
    }
    default:
      return { value: input.toLocaleString('en-US'), unit }
  }
}

function compact(input: number, unit?: string): Formatted {
  const abs = Math.abs(input)
  if (abs < 1000) return { value: String(Math.round(input)), unit }
  const [divisor, suffix] = abs < 1_000_000 ? [1000, 'k'] : [1_000_000, 'M']
  const scaled = input / divisor
  return { value: `${scaled.toFixed(Math.abs(scaled) < 10 ? 1 : 0)}${suffix}`, unit }
}
