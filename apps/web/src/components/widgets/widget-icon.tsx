import {
  Activity,
  Circle,
  Coffee,
  Cpu,
  Gauge,
  type LucideIcon,
  MemoryStick,
  Music,
  Network,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Star,
  Thermometer,
} from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * Icons by name, for a widget's `icon` and the `icon` and `button` nodes in its view. The app draws
 * these from Solar (`@shiftpane/ui/icons`); the site stands in with lucide, its own icon set, until
 * the SDK publishes the list of names. Unknown names draw a dot rather than failing.
 */
const icons: Record<string, LucideIcon> = {
  activity: Activity,
  coffee: Coffee,
  cpu: Cpu,
  gauge: Gauge,
  memory: MemoryStick,
  music: Music,
  network: Network,
  pause: Pause,
  play: Play,
  'skip-back': SkipBack,
  'skip-forward': SkipForward,
  star: Star,
  thermometer: Thermometer,
}

export function WidgetIcon({
  name,
  className,
  strokeWidth = 1.75,
  style,
}: {
  name: string
  className?: string
  strokeWidth?: number
  style?: React.CSSProperties
}) {
  const Icon = icons[name] ?? Circle
  return (
    <Icon
      aria-hidden="true"
      strokeWidth={strokeWidth}
      className={cn('flex-none', className)}
      style={style}
    />
  )
}

/** A widget's icon on a black tile, the way the app lists it. */
export function WidgetGlyph({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid size-10 flex-none place-items-center rounded-md bg-black text-white dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12)]',
        className,
      )}
    >
      <WidgetIcon name={name} className="size-[45%]" />
    </span>
  )
}
