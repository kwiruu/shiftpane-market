import type { ReviewStatus } from '@shiftpane/format'

import type { ReportReason } from '@/lib/api'

/** Words for where a version is, and why someone reported a widget. */

export const statusLabels: Record<ReviewStatus, string> = {
  checking: 'Checking',
  in_review: 'In review',
  approved: 'Live',
  rejected: 'Rejected',
  yanked: 'Yanked',
}

export const reportReasons: Record<ReportReason, string> = {
  broken: 'Doesn’t work',
  misleading: 'Doesn’t do what it says',
  privacy: 'Privacy',
  malware: 'Harmful',
  policy: 'Breaks the content policy',
}
