import { describe, expect, it } from 'vitest'

import { formatDate, formatInterval } from './format'

describe('formatDate', () => {
  it('shows the calendar day whatever the time zone', () => {
    expect(formatDate('2026-10-03')).toBe('Oct 3, 2026')
  })
})

describe('formatInterval', () => {
  it('uses the largest whole unit', () => {
    expect(formatInterval(900)).toBe('every 15 minutes')
    expect(formatInterval(3600)).toBe('every hour')
    expect(formatInterval(5)).toBe('every 5 seconds')
    expect(formatInterval(90)).toBe('every 90 seconds')
  })
})
