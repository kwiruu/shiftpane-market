import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

import { CursorChip } from '@/components/site/cursor-chip'
import { SiteFooter } from '@/components/site/site-footer'
import { SiteHeader, SkipLink } from '@/components/site/site-header'
import { SmoothScroll } from '@/components/site/smooth-scroll'
import { ThemeProvider } from '@/components/site/theme-provider'
import { hasApi } from '@/lib/registry/gallery'
import { site } from '@/lib/site'

import './globals.css'

// Inter for everyone who doesn't have SF Pro (Windows included). Self-hosted by next/font at build
// time; the font stack in globals.css puts -apple-system first.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.author, url: site.repo }],
  creator: site.author,
  publisher: site.author,
  category: 'technology',
  // Canonical URLs are set per page, not here: inheriting one would point every page at the home page.
  robots: site.indexable
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
          'max-video-preview': -1,
        },
      }
    : { index: false, follow: false },
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: `${site.name} · ${site.tagline}`,
    description: site.description,
    locale: 'en_US',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} · ${site.tagline}`,
    description: site.description,
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5f5' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    // next-themes sets the theme class on <html> before React hydrates.
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col">
        <ThemeProvider>
          <SmoothScroll>
            <SkipLink />
            <SiteHeader accounts={hasApi} />
            <main id="main" className="flex flex-1 flex-col">
              {children}
            </main>
            <SiteFooter />
            <CursorChip />
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  )
}
