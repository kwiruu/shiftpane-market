/**
 * The marketplace's view of a widget, shaped after PLAN.md ("Widget package format (v1)" and the
 * `index.json` entry). Shared by the site and the API until the widget SDK publishes its schemas;
 * then the manifest and view types come from `@shiftpane/widget-sdk` and only `Widget` stays here.
 */

export const categories = [
  'system',
  'dev',
  'productivity',
  'media',
  'finance',
  'weather',
  'fun',
  'other',
] as const
export type Category = (typeof categories)[number]

/** PC data the app reads once and shares with every widget that declares it (PLAN, System sources). */
export const sourceNames = [
  'cpu',
  'memory',
  'gpu',
  'network',
  'disks',
  'battery',
  'audio',
  'system',
  'temperatures',
  'media',
  'processes',
  'active-window',
] as const
export type SourceName = (typeof sourceNames)[number]

/** Buttons on the phone that do something on the PC, from the app's fixed list. */
export const actionNames = [
  'media.play-pause',
  'media.next',
  'media.previous',
  'audio.set-volume',
  'audio.toggle-mute',
] as const
export type ActionName = (typeof actionNames)[number]

export const widgetSizes = ['small', 'medium', 'large'] as const
export type WidgetSize = (typeof widgetSizes)[number]

export interface Permissions {
  sources: SourceName[]
  actions: ActionName[]
  /** Apps on this PC or LAN, exact host:port. */
  local: string[]
  /** Internet hosts the collector may fetch. */
  network: string[]
  secrets: string[]
}

interface ConfigFieldBase {
  key: string
  label: string
  help?: string
  required?: boolean
}

export type ConfigField = ConfigFieldBase &
  (
    | { type: 'string'; default?: string }
    | { type: 'number'; default?: number; min?: number; max?: number }
    | { type: 'boolean'; default?: boolean }
    | { type: 'select'; options: { value: string; label: string }[]; default?: string }
  )

export interface Manifest {
  id: string
  name: string
  description: string
  version: string
  author: string
  license: string
  repository?: string
  categories: Category[]
  minAppVersion: string
  sizes: WidgetSize[]
  refreshSeconds?: number
  permissions: Permissions
  config: ConfigField[]
}

/**
 * One node of `view.json`. `bind` is `@source/path` for a system source, `/json/pointer` for the
 * collector's output; `{config.key}` inside text inserts a config value.
 */
export type ViewNode =
  | {
      type: 'stack' | 'row'
      children: ViewNode[]
      gap?: number
      align?: 'start' | 'center' | 'end' | 'between'
    }
  | { type: 'grid'; columns: number; children: ViewNode[]; gap?: number }
  | { type: 'label'; text: string }
  | { type: 'text'; text?: string; bind?: string; size?: 'sm' | 'md' | 'lg'; muted?: boolean }
  | {
      type: 'value'
      bind: string
      format?: ValueFormat
      unit?: string
      size?: 'sm' | 'md' | 'lg' | 'xl'
    }
  | { type: 'ring'; bind: string; label?: string; color?: Accent }
  | { type: 'meter'; bind: string; segments?: number }
  | { type: 'progress'; bind: string; color?: Accent }
  | { type: 'history-bars'; bind: string; max?: number }
  | { type: 'sparkline'; bind: string; color?: Accent }
  | { type: 'list'; bind: string; max?: number }
  | { type: 'icon'; name: string; color?: Accent }
  | { type: 'button'; action: ActionName; icon: string; label: string }

export type ValueFormat =
  | 'percent'
  | 'number'
  | 'compact'
  | 'bytes'
  | 'rate'
  | 'celsius'
  | 'duration'
export type Accent = 'flame' | 'lime' | 'mint' | 'sky'

export type WidgetView = Partial<Record<WidgetSize, ViewNode>>

export type ReviewStatus = 'checking' | 'in_review' | 'approved' | 'rejected' | 'yanked'

export interface Version {
  version: string
  publishedAt: string
  permissions: Permissions
  notes: string
}

export interface Widget {
  id: string
  name: string
  /** One line, for cards and search results. */
  summary: string
  /** The author's login. */
  author: string
  /** Their display name, when the gallery knows it. */
  authorName?: string
  license: string
  repository?: string
  categories: Category[]
  /** A lucide icon name standing in for icon.png until packages carry their own. */
  icon: string
  /** A dark card unless the widget looks better light. */
  tone: 'dark' | 'light'
  featured?: boolean
  minAppVersion: string
  sizes: WidgetSize[]
  refreshSeconds?: number
  createdAt: string
  /** Newest first. */
  versions: Version[]
  permissions: Permissions
  config: ConfigField[]
  view: WidgetView
  /** What the collector returns; the view's `/` bindings resolve in it. */
  sample: Record<string, unknown>
  collector?: string
  readme: string
}

export interface Author {
  login: string
  name: string
  bio: string
  joinedAt: string
  /** First-party: made by the ShiftPane project. */
  official?: boolean
}
