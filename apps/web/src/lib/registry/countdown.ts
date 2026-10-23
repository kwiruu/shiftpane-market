import type { Widget } from '@shiftpane/format'

export const countdown: Widget = {
  id: 'countdown',
  name: 'Countdown',
  author: 'shiftpane',
  license: 'MIT',
  categories: ['productivity'],
  minAppVersion: '0.6.0',
  sizes: ['small', 'medium', 'large'],
  refreshSeconds: 60,
  permissions: {
    sources: [],
    actions: [],
    local: [],
    network: [],
    secrets: [],
  },
  config: [
    {
      key: 'event',
      label: 'Event name',
      type: 'string',
      required: true,
    },
    {
      key: 'target',
      label: 'Target date',
      type: 'datetime',
      required: true,
    },
  ],
  summary: 'Days, hours and minutes until something you look forward to.',
  icon: 'calendar',
  tone: 'dark',
  featured: true,
  createdAt: '2026-10-23',
  versions: [
    {
      version: '1.0.0',
      publishedAt: '2026-10-23',
      permissions: {
        sources: [],
        actions: [],
        local: [],
        network: [],
        secrets: [],
      },
      notes: 'First release. One event, counted down to the minute.',
    },
  ],
  view: {
    small: {
      type: 'stack',
      gap: 2,
      align: 'start',
      children: [
        {
          type: 'stack',
          gap: 0.5,
          align: 'start',
          children: [
            {
              type: 'text',
              text: '{/event}',
              size: 'md',
              muted: false,
            },
          ],
        },
        {
          type: 'stack',
          gap: 0.5,
          align: 'start',
          children: [
            {
              type: 'value',
              bind: '/primary',
              size: 'hero',
            },
            {
              type: 'text',
              text: '{/unit}',
              size: 'sm',
              muted: true,
            },
          ],
        },
      ],
      surface: 'violet',
    },
    medium: {
      type: 'stack',
      gap: 2,
      align: 'start',
      children: [
        {
          type: 'stack',
          gap: 0.5,
          align: 'start',
          children: [
            {
              type: 'text',
              text: '{/event}',
              size: 'md',
              muted: false,
            },
            {
              type: 'text',
              text: '{/targetDate}',
              size: 'xs',
              muted: true,
            },
          ],
        },
        {
          type: 'stack',
          gap: 0.5,
          align: 'start',
          children: [
            {
              type: 'value',
              bind: '/primary',
              size: 'hero',
            },
            {
              type: 'text',
              text: '{/unit}',
              size: 'sm',
              muted: true,
            },
          ],
        },
      ],
      surface: 'violet',
    },
    large: {
      type: 'stack',
      gap: 2,
      align: 'start',
      children: [
        {
          type: 'stack',
          gap: 0.5,
          align: 'start',
          children: [
            {
              type: 'text',
              text: '{/event}',
              size: 'md',
              muted: false,
            },
            {
              type: 'text',
              text: '{/targetDate}',
              size: 'xs',
              muted: true,
            },
          ],
        },
        {
          type: 'stack',
          gap: 0.5,
          align: 'start',
          children: [
            {
              type: 'value',
              bind: '/primary',
              size: 'hero',
            },
            {
              type: 'text',
              text: '{/unit}',
              size: 'sm',
              muted: true,
            },
          ],
        },
      ],
      surface: 'violet',
    },
  },
  sample: {
    event: 'Launch day',
    primary: '12',
    unit: 'days to go',
    breakdown: '12d 4h 32m',
    status: 'Time remaining',
    target: '2026-11-05 09:00 +08:00',
    targetDate: '2026-11-05',
  },
  collector:
    // biome-ignore lint/suspicious/noTemplateCurlyInString: This string is the shipped collector source.
    "import { defineCollector } from '@shiftpane/widget-sdk'\n\nexport default defineCollector(({ config }) => {\n  const target = Date.parse(config.target)\n  if (!Number.isFinite(target)) throw new Error('Choose a valid target date in settings.')\n  const remaining = Math.max(0, Math.ceil((target - Date.now()) / 60_000))\n  const days = Math.floor(remaining / 1440)\n  const hours = Math.floor(remaining / 60) % 24\n  const minutes = remaining % 60\n  const done = remaining === 0\n  const number = days || hours || minutes\n  const unit = days ? 'day' : hours ? 'hour' : 'minute'\n  return {\n    event: String(config.event),\n    targetDate: String(config.target).slice(0, 10),\n    primary: done ? 'It’s time' : String(number),\n    unit: done ? 'The moment is here' : `${unit}${number === 1 ? '' : 's'} to go`,\n    breakdown: done ? 'It’s time' : `${days}d ${hours}h ${minutes}m`,\n    status: done ? 'The moment is here' : 'Time remaining',\n    // The saved ISO offset preserves the target's original timezone offset, even when the PC moves.\n    target: String(config.target)\n      .replace('T', ' ')\n      .replace(/:00(?=[+-]|Z$)/, ' '),\n  }\n})\n",
  readme:
    '# Countdown\n\nOne event, counted down to the minute on a soft violet gradient. Requires ShiftPane 0.6.0.\n\nSet an event name and date in widget settings. Time is optional: leaving it blank targets midnight at the start of that date. The picker shows the PC’s timezone and resolved UTC offset before saving. Invalid local times (including daylight-saving gaps) are rejected; when a time occurs twice, the earlier occurrence is used.\n\nThe saved timestamp is absolute: changing the PC’s timezone does not move your event. The target retains its saved UTC offset; medium and large cards show its date. Every size shows one oversized number for the largest remaining unit, with the event name above and a small “days to go”, “hours to go” or “minutes to go” label below. Medium and large also show the target date. Positive fractions round up to a minute. At the target, “It’s time” replaces the countdown and remains until you choose another target.\n\nRuns offline every minute while displayed, and immediately after settings changes or reconnection. Completion can lag by up to one minute. No notifications, recurrence or seconds display. Repeated cards share the installed widget’s event.\n\nWidget code: MIT. No system sources, network access, actions or secrets.\n',
}
