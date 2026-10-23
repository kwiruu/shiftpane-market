import { defineCollector } from '@shiftpane/widget-sdk'

export default defineCollector(({ config }) => {
  const target = Date.parse(config.target)
  if (!Number.isFinite(target)) throw new Error('Choose a valid target date in settings.')
  const remaining = Math.max(0, Math.ceil((target - Date.now()) / 60_000))
  const days = Math.floor(remaining / 1440)
  const hours = Math.floor(remaining / 60) % 24
  const minutes = remaining % 60
  const done = remaining === 0
  const number = days || hours || minutes
  const unit = days ? 'day' : hours ? 'hour' : 'minute'
  return {
    event: String(config.event),
    targetDate: String(config.target).slice(0, 10),
    primary: done ? 'It’s time' : String(number),
    unit: done ? 'The moment is here' : `${unit}${number === 1 ? '' : 's'} to go`,
    breakdown: done ? 'It’s time' : `${days}d ${hours}h ${minutes}m`,
    status: done ? 'The moment is here' : 'Time remaining',
    // The saved ISO offset preserves the target's original timezone offset, even when the PC moves.
    target: String(config.target)
      .replace('T', ' ')
      .replace(/:00(?=[+-]|Z$)/, ' '),
  }
})
