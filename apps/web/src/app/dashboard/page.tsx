import { Plus } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { Dashboard } from '@/components/account/dashboard'
import { Button } from '@/components/ui/button'
import { hasApi } from '@/lib/registry/gallery'

export const metadata: Metadata = {
  title: 'Your widgets',
  robots: { index: false, follow: false },
}

/** The author dashboard (PLAN, W4). The page is static; Dashboard reads your uploads from the API. */
export default function DashboardPage() {
  return (
    <div className="frame flex flex-col pt-28 sm:pt-32">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-headline-lg">Your widgets</h1>
          <p className="mt-3 max-w-[44ch] text-body-lg text-secondary">
            Everything you&apos;ve uploaded, and where each version is.
          </p>
        </div>
        <Button asChild>
          <Link href="/upload">
            <Plus aria-hidden="true" strokeWidth={1.75} />
            Upload a version
          </Link>
        </Button>
      </header>

      <div className="mt-8">
        <Dashboard enabled={hasApi} />
      </div>
    </div>
  )
}
