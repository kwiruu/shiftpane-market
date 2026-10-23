export const site = {
  name: 'ShiftPane',
  platform: 'Windows · macOS · Linux',
  tagline: 'Your phone as a second monitor, with live widgets beside it',
  description:
    'ShiftPane turns a phone or tablet into a second monitor sized exactly to it, with a live widget board beside it. Documentation and the widget marketplace.',
  // Every link into the app's repository comes from here.
  repo: 'https://github.com/kwiruu/shiftpane',
  /** The newest release, where the installers are. */
  releases: 'https://github.com/kwiruu/shiftpane/releases/latest',
  branch: 'main',
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3000'),
  // Preview deployments serve the same pages on another URL. Leaving them out of search stops them
  // competing with production for the same words. Anywhere that isn't Vercel counts as the real site.
  indexable: process.env.VERCEL_ENV !== 'preview' && process.env.VERCEL_ENV !== 'development',
  year: 2026,
  author: 'Keiru Vent Ortega Cabili',
  license: {
    name: 'MIT License',
    url: 'https://github.com/kwiruu/shiftpane/blob/main/LICENSE',
  },
} as const

/** A file in the ShiftPane repository, such as "README.md". */
export function repoFile(path: string) {
  return `${site.repo}/blob/${site.branch}/${path}`
}

/** The deep link the desktop app registers. Installing always happens in the app, never here. */
export function installLink(id: string) {
  return `shiftpane://install/${encodeURIComponent(id)}`
}

export const mainNav = [
  { href: '/widgets', label: 'Widgets' },
  { href: '/docs', label: 'Docs' },
  { href: '/docs/making-widgets', label: 'Make a widget' },
  { href: '/upload', label: 'Publish' },
] as const
