import createMDX from '@next/mdx'
import { withCn } from 'cn/next'
import type { NextConfig } from 'next'

// React needs eval in development to rebuild server error stacks; production never allows it.
const isDev = process.env.NODE_ENV === 'development'

// Vercel adds its comments toolbar to preview deployments, loaded from vercel.live. Production builds
// never allow those sources, so they never load anything from outside this site.
const isPreview = process.env.VERCEL_ENV === 'preview'
const forToolbar = (...sources: string[]) => (isPreview ? ` ${sources.join(' ')}` : '')

// Without nonces: the pages are prerendered, and a nonce would force each one to render per request.
// 'unsafe-inline' covers Next.js's own bootstrap scripts and next-themes' theme switch. Everything else is
// pinned to this origin, which is what stops injected third-party scripts, framing, plugins, <base>
// hijacking and forms posting elsewhere. The API is reached through the /api rewrite below, so it is
// same-origin too.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}${forToolbar('https://vercel.live')}`,
  `style-src 'self' 'unsafe-inline'${forToolbar('https://vercel.live')}`,
  `img-src 'self' blob: data:${forToolbar('https://vercel.live', 'https://vercel.com')}`,
  `font-src 'self'${forToolbar('https://vercel.live', 'https://assets.vercel.com')}`,
  `connect-src 'self'${forToolbar('https://vercel.live', 'wss://ws-us3.pusher.com')}`,
  `frame-src ${isPreview ? 'https://vercel.live' : "'none'"}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ')

// The API (apps/api, PLAN "Hosting and budget") runs elsewhere and is reached through this rewrite,
// so the browser sees one origin: no CORS, first-party cookies. Unset until the API exists.
const apiOrigin = process.env.SHIFTPANE_API_ORIGIN

const nextConfig: NextConfig = {
  // Docs pages live in src/content/docs as .mdx and are imported by src/app/docs/[slug].
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  poweredByHeader: false,
  async redirects() {
    return [
      { source: '/policy', destination: '/docs/content-policy', permanent: true },
      { source: '/privacy', destination: '/docs/privacy', permanent: true },
    ]
  },
  async rewrites() {
    return apiOrigin ? [{ source: '/api/:path*', destination: `${apiOrigin}/api/:path*` }] : []
  },
  // The pages are same-origin throughout, so these cost nothing and close the usual gaps.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Older browsers that don't read frame-ancestors still read this.
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // The site uses none of these, so nothing it embeds or links can ask for them either.
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
          },
          // Pages opened from here, or that open this site, can't reach back into its window.
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          // A year, without `preload`: that list is hard to leave once a domain is on it.
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ]
  },
}

// Turbopack needs plugins by name, not by import.
const withMDX = createMDX({
  options: {
    remarkPlugins: ['remark-gfm'],
  },
})

// Recompiles src/lib/cn-tables.ts (the class merge tables behind cn in src/lib/utils.ts) on every
// build, and on file changes during `next dev`, fitted to the classes the project uses. The theme in
// cn-theme.mjs is read once at startup, so restart `next dev` after editing it.
export default withCn(withMDX(nextConfig), {
  content: ['src/**/*.{ts,tsx,mdx}'],
  out: 'src/lib/cn-tables.ts',
  config: 'src/lib/cn-theme.mjs',
})
