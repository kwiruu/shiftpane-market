import { describe, expect, it } from 'vitest'

import { monitorArea, pickMonitorSize } from './split'

const phone = { width: 2400, height: 1080 }

describe('monitorArea', () => {
  it('gives the monitor its share of the long side', () => {
    expect(monitorArea(phone, 0.7)).toEqual({ width: 1680, height: 1080 })
    expect(monitorArea(phone, 1)).toEqual(phone)
  })

  it('has no monitor on the widgets-only split', () => {
    expect(monitorArea(phone, 0)).toBeNull()
  })
})

describe('pickMonitorSize', () => {
  it('picks the closest shape with enough pixels', () => {
    expect(pickMonitorSize({ width: 1680, height: 1080 })).toEqual({ width: 1920, height: 1200 })
    expect(pickMonitorSize({ width: 1200, height: 1080 })).toEqual({ width: 1080, height: 1080 })
  })

  it('picks the closer pixel count between sizes of the same shape', () => {
    expect(pickMonitorSize(phone)).toEqual({ width: 1920, height: 1080 })
  })

  it('uses an exact catalogue size as it is', () => {
    expect(pickMonitorSize({ width: 1440, height: 1080 })).toEqual({ width: 1440, height: 1080 })
  })
})
