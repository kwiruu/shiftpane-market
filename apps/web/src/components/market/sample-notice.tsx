import { Badge } from '@/components/ui/badge'

/** Says plainly that a page shows sample data, until the API it needs exists. */
export function SampleNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-lg bg-surface p-4 sm:flex-row sm:items-center sm:gap-3">
      <Badge variant="muted" live>
        Sample data
      </Badge>
      <p className="text-body-sm text-secondary">{children}</p>
    </div>
  )
}
