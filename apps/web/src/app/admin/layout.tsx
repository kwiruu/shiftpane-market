import type { Metadata } from 'next'

import { AdminGate } from '@/components/account/admin-gate'
import { hasApi } from '@/lib/registry/gallery'

import { AdminNav } from './admin-nav'

export const metadata: Metadata = {
  title: { default: 'Review', template: '%s · Review · ShiftPane' },
  robots: { index: false, follow: false },
}

/**
 * The reviewers' pages (PLAN, Marketplace flows and Moderation), behind the reviewer role. They
 * read the queue and reports from the API in the browser; the pages themselves are static.
 */
export default function AdminLayout({ children }: LayoutProps<'/admin'>) {
  return (
    <div className="frame flex flex-col pt-28 sm:pt-32">
      <AdminNav />
      <div className="mt-8">
        <AdminGate enabled={hasApi}>{children}</AdminGate>
      </div>
    </div>
  )
}
