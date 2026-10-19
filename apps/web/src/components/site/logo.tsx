import { cn } from '@/lib/utils'

/**
 * The ShiftPane mark: a black tile with a narrow gray pane and a wide white one, redrawn from the
 * app's icon (apps/phone/public/icon.svg). On dark backgrounds a faint ring keeps the tile's edge
 * visible.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn('size-7 flex-none', className)}>
      <rect
        x="0.5"
        y="0.5"
        width="31"
        height="31"
        rx="7"
        fill="#000"
        className="stroke-transparent dark:stroke-white/20"
        strokeWidth="1"
      />
      <rect x="7" y="8.5" width="4.25" height="15" rx="2.125" fill="#d1d1d6" />
      <rect x="12.5" y="8.5" width="13" height="15" rx="3.5" fill="#fff" />
    </svg>
  )
}
