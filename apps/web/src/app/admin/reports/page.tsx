import { Reports } from '@/components/account/reports'

export const metadata = { title: 'Reports' }

export default function ReportsPage() {
  return (
    <>
      <h1 className="text-headline-lg">Reports</h1>
      <p className="mt-3 mb-10 max-w-[48ch] text-body-lg text-secondary">
        What people reported. Yanking a version puts it on the revocation list, and every app turns
        it off within six hours.
      </p>
      <Reports />
    </>
  )
}
