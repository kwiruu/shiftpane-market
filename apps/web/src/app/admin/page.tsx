import { ReviewQueue } from '@/components/account/review-queue'

export const metadata = { title: 'Queue' }

export default function ReviewQueuePage() {
  return (
    <>
      <h1 className="text-headline-lg">Review queue</h1>
      <p className="mt-3 mb-10 max-w-[48ch] text-body-lg text-secondary">
        Every new widget, and every new version, waits here for a person.
      </p>
      <ReviewQueue />
    </>
  )
}
