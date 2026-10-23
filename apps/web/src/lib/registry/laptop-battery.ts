import type { Widget } from '@shiftpane/format'

export const laptopBattery: Widget = {
  id: 'laptop-battery',
  name: 'Laptop Battery',
  author: 'shiftpane',
  license: 'MIT',
  categories: ['system'],
  minAppVersion: '0.7.0',
  sizes: ['small', 'medium'],
  refreshSeconds: 30,
  permissions: {
    sources: ['battery'],
    actions: [],
    local: [],
    network: [],
    secrets: [],
  },
  config: [],
  summary:
    'Your laptop battery in glowing purple segments, with charging status and time remaining.',
  icon: 'bolt',
  tone: 'dark',
  featured: true,
  createdAt: '2026-10-23',
  versions: [
    {
      version: '1.0.0',
      publishedAt: '2026-10-23',
      permissions: {
        sources: ['battery'],
        actions: [],
        local: [],
        network: [],
        secrets: [],
      },
      notes: 'First release. Purple laptop battery with charging status and remaining time.',
    },
  ],
  view: {
    small: {
      type: 'battery-gauge',
      bind: '@battery',
    },
    medium: {
      type: 'battery-gauge',
      bind: '@battery',
    },
  },
  readme:
    '# Laptop Battery\n\nThe host laptop’s battery level, shown in five purple segments on a black card. Supports small and medium cards in ShiftPane 0.7.0 and later.\n\nThe lightning bolt appears while charging. The caption shows Charging, Fully charged, or the approximate remaining time supplied by Windows. Missing time estimates are omitted; a missing battery shows —% and Battery unavailable. No network access, collector, or configuration is required.\n\nThe meter fills proportionally to the actual percentage. Full segments are lavender; a partial segment is magenta. Colors stay purple at every charge level.\n',
  sample: {},
}
