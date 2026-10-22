import { ReviewDetail } from '@/components/account/review-detail'

export const metadata = { title: 'Version' }

/** One uploaded version, by its id. Rendered on request; ReviewDetail reads it from the API. */
export default async function ReviewPage({ params }: PageProps<'/admin/review/[id]'>) {
  const { id } = await params
  return <ReviewDetail id={id} />
}
