const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

/** "2026-10-03" → "Oct 3, 2026". Dates are calendar days, so they're read and shown in UTC. */
export function formatDate(day: string): string {
  return dateFormat.format(new Date(`${day}T00:00:00Z`))
}

/** "every 15 minutes", "every 5 seconds". */
export function formatInterval(seconds: number): string {
  const [value, unit] =
    seconds % 3600 === 0
      ? [seconds / 3600, 'hour']
      : seconds % 60 === 0
        ? [seconds / 60, 'minute']
        : [seconds, 'second']
  return value === 1 ? `every ${unit}` : `every ${value} ${unit}s`
}
