'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

// next-themes puts .light or .dark on <html> and sets color-scheme, which drives every
// light-dark() token in globals.css. The site opens light rather than following the OS, since the
// page is designed light first; the toggle then remembers whatever the reader picks.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
