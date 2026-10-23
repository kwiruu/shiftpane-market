/**
 * The gallery's own types: a widget as the site and the API show it, with its versions and
 * author. The package format itself (manifest, view, sources, permissions) is the app's, from
 * `@shiftpane/widget-sdk`.
 */
import type {
  Category,
  ConfigField,
  Permissions,
  WidgetSize,
  WidgetView,
} from '@shiftpane/widget-sdk'

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
  /** First installs from the marketplace, as the desktop app reports them. */
  installs?: number
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
  /** An admin vouches for them. */
  verified?: boolean
}
