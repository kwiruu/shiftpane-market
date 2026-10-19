import { Badge } from '@/components/ui/badge'
import { statusLabels } from '@/lib/registry/review'
import type { ReviewStatus } from '@/lib/registry/types'

const variants: Record<ReviewStatus, 'success' | 'muted' | 'outline' | 'destructive'> = {
  approved: 'success',
  in_review: 'outline',
  checking: 'muted',
  rejected: 'destructive',
  yanked: 'destructive',
}

/** Where a version is: checking, in review, live, rejected or yanked. Waiting ones get the live dot. */
export function StatusBadge({ status }: { status: ReviewStatus }) {
  return (
    <Badge variant={variants[status]} live={status === 'in_review' || status === 'checking'}>
      {statusLabels[status]}
    </Badge>
  )
}
