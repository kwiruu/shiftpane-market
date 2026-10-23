import { ViewWidget } from '@shiftpane/board'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import { laptopBattery } from './laptop-battery'

it('renders battery readings, charging and unavailable states at both sizes', () => {
  for (const size of ['small', 'medium'] as const) {
    for (const [battery, label, caption, fills] of [
      [{ percent: 0, charging: false, minutesLeft: 0 }, '0%', '~ 0 min', 0],
      [{ percent: 52, charging: false, minutesLeft: 120 }, '52%', '~ 2 hours', 3],
      [{ percent: 100, charging: false }, '100%', 'Fully charged', 5],
      [{ percent: 52, charging: true }, '52%', 'Charging', 3],
      [{ percent: 52, charging: false }, '52%', '', 3],
      [{ percent: null, charging: null, minutesLeft: null }, '—%', 'Battery unavailable', 0],
    ] as const) {
      const html = renderToStaticMarkup(
        createElement(ViewWidget, {
          view: laptopBattery.view,
          size,
          context: { sample: {}, sources: { battery } },
        }),
      )
      expect(html).toContain(label)
      if (caption) expect(html).toContain(caption)
      expect(html.match(/<rect /g)).toHaveLength(6 + fills)
      expect(html.includes('<path')).toBe(battery.charging === true)
      expect(html).toContain('#111111')
    }
  }
})
