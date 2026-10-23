import type { BuiltInKind } from './catalog'

/**
 * Collections: widgets that make a good board together, picked by us. A board mixes widgets from
 * the gallery with ones that come with the app, so a collection can name both; gallery widgets
 * that aren't listed (any more) are left out when it's shown.
 */
export interface Collection {
  slug: string
  title: string
  summary: string
  /** Gallery widgets, by id. */
  widgets: string[]
  /** Widgets that come with ShiftPane. */
  builtIn: BuiltInKind[]
}

export const collections: Collection[] = [
  {
    slug: 'know-your-pc',
    title: 'Know your PC',
    summary: 'Load, heat and whether it’s busy, at a glance while you work or play.',
    widgets: ['gpu-ring', 'hardware-temps', 'pc-busy'],
    builtIn: ['pc-stats', 'cpu', 'memory', 'network'],
  },
  {
    slug: 'for-developers',
    title: 'For developers',
    summary: 'Your repositories, and how hard the machine building them is working.',
    widgets: ['github-stars', 'gpu-ring'],
    builtIn: ['cpu', 'memory'],
  },
  {
    slug: 'desk-companion',
    title: 'Desk companion',
    summary: 'The time, the date and what’s playing, on the phone beside your keyboard.',
    widgets: ['pc-busy'],
    builtIn: ['clock', 'analog-clock', 'calendar', 'media'],
  },
]

export function collectionBySlug(slug: string): Collection | undefined {
  return collections.find((collection) => collection.slug === slug)
}
