import type { Metadata } from 'next'

import { SampleNotice } from '@/components/market/sample-notice'

import { AdminNav } from './admin-nav'

export const metadata: Metadata = {
  title: { default: 'Review', template: '%s · Review · ShiftPane' },
  robots: { index: false, follow: false },
}

/**
 * The reviewers' pages (PLAN, Marketplace flows and Moderation). They'll sit behind the reviewer
 * role once sign-in exists; until then they show the sample submissions, and say so.
 */
export default function AdminLayout({ children }: LayoutProps<'/admin'>) {
  return (
    <div className="frame flex flex-col pt-28 sm:pt-32">
      <AdminNav />
      <div className="mt-6">
        <SampleNotice>
          Reviewing needs sign-in and the API. Until then these pages show sample uploads, and their
          buttons do nothing.
        </SampleNotice>
      </div>
      <div className="mt-8">{children}</div>
    </div>
  )
}
