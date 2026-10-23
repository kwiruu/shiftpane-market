import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { runInNewContext } from 'node:vm'
import { describe, expect, it } from 'vitest'

const source = (id: string) =>
  readFileSync(join(import.meta.dirname, '../../../first-party', id, 'collector.js'), 'utf8')
const now = '2026-10-23T15:30:00Z'
function collector(id: string) {
  class Clock extends Date {
    constructor(value: string | number = now) {
      super(value)
    }
    static override now() {
      return Date.parse(now)
    }
  }
  return runInNewContext(
    source(id)
      .replace(/^import[^\n]+\n/, '')
      .replace('export default defineCollector', 'defineCollector'),
    {
      Date: Clock,
      defineCollector: (value: unknown) => value,
    },
  ) as (context: object) => Promise<Record<string, unknown>>
}
const location = JSON.stringify({
  label: 'Manila',
  latitude: 14.6,
  longitude: 120.98,
  timezone: 'Asia/Manila',
})
const payload = () => ({
  current: {
    time: '2026-10-23T23:30',
    temperature_2m: 29.4,
    apparent_temperature: 33.1,
    weather_code: 0,
    is_day: 0,
  },
  hourly: {
    time: ['2026-10-23T23:00', ...Array.from({ length: 6 }, (_, i) => `2026-10-24T0${i}:00`)],
    temperature_2m: [29, 28, 27, 26, 25, 24, 23],
    precipitation_probability: [30, 40, 50, 60, 70, 80, 90],
  },
})
function context(body: unknown = payload(), units = 'celsius', status = 200) {
  const requests: string[] = []
  return {
    requests,
    config: { location, units },
    fetch: async (url: string) => {
      requests.push(url)
      return { ok: status === 200, status, json: async () => body }
    },
  }
}

describe('Weather shipped collector', () => {
  it('uses the selected timezone and the next six hours across midnight', async () => {
    const ctx = context()
    const result = await collector('weather')(ctx)
    expect(result).toMatchObject({
      temperature: '29°C',
      feelsLike: '33°C',
      rain: '30%',
      icon: 'moon',
      condition: 'Clear night',
      updated: '2026-10-23 15:30Z',
    })
    expect(result.hours).toEqual(
      Array.from({ length: 6 }, (_, i) => ({
        time: `0${i}:00`,
        temperature: `${28 - i}°C`,
        rain: `${40 + i * 10}%`,
      })),
    )
    const url = new URL(ctx.requests[0] ?? '')
    expect(url.searchParams.get('timezone')).toBe('Asia/Manila')
  })
  it('asks the provider for Fahrenheit and renders the returned values', async () => {
    const body = payload()
    body.current.temperature_2m = 84.2
    const ctx = context(body, 'fahrenheit')
    expect(await collector('weather')(ctx)).toMatchObject({ temperature: '84°F' })
    expect(new URL(ctx.requests[0] ?? '').searchParams.get('temperature_unit')).toBe('fahrenheit')
  })
  it.each([
    [0, 'sun'],
    [1, 'cloud-sun'],
    [2, 'cloud-sun'],
    [3, 'cloud'],
    [45, 'fog'],
    [48, 'fog'],
    [51, 'rain'],
    [53, 'rain'],
    [55, 'rain'],
    [56, 'rain'],
    [57, 'rain'],
    [61, 'rain'],
    [63, 'rain'],
    [65, 'rain'],
    [66, 'rain'],
    [67, 'rain'],
    [71, 'snow'],
    [73, 'snow'],
    [75, 'snow'],
    [77, 'snow'],
    [80, 'rain'],
    [81, 'rain'],
    [82, 'rain'],
    [85, 'snow'],
    [86, 'snow'],
    [95, 'storm'],
    [96, 'storm'],
    [99, 'storm'],
  ])('maps weather code %s', async (code, icon) => {
    const body = payload()
    body.current.weather_code = code as number
    body.current.is_day = 1
    expect(await collector('weather')(context(body))).toMatchObject({ icon })
  })
  it('maps cloudy nights and unknown conditions; never turns null readings into zero', async () => {
    const body = payload()
    body.current.weather_code = 2
    expect(await collector('weather')(context(body))).toMatchObject({ icon: 'cloud-moon' })
    const missing = {
      ...body,
      current: { time: body.current.time, temperature_2m: null, weather_code: 999 },
      hourly: { time: [] },
    }
    expect(await collector('weather')(context(missing))).toMatchObject({
      temperature: '—',
      feelsLike: '—',
      rain: '—',
      condition: 'Conditions unavailable',
      hours: Array.from({ length: 6 }, () => ({ time: '—', temperature: '—', rain: '—' })),
    })
  })
  it('rejects provider errors and incomplete responses for the existing error flow', async () => {
    await expect(collector('weather')(context({}, 'celsius', 503))).rejects.toThrow('503')
    await expect(collector('weather')(context({}))).rejects.toThrow('incomplete')
  })
})

describe('Countdown shipped collector', () => {
  it.each([
    [1, '1', 'minute'],
    [60_001, '2', 'minutes'],
    [3_600_000, '1', 'hour'],
    [86_400_000, '1', 'day'],
  ])('rounds positive time and chooses its largest unit (%s ms)', async (delta, number, unit) => {
    const result = await collector('countdown')({
      config: { event: 'Launch', target: new Date(Date.parse(now) + Number(delta)).toISOString() },
    })
    expect(result).toMatchObject({ primary: number, unit: `${unit} to go` })
  })
  it('shows all remaining units and the saved target offset', async () => {
    expect(
      await collector('countdown')({
        config: { event: 'Launch', target: '2026-10-25T02:01:00+08:00' },
      }),
    ).toMatchObject({ breakdown: '1d 2h 31m', target: '2026-10-25 02:01 +08:00' })
  })
  it.each([now, '2020-01-01T00:00:00Z'])(
    'remains completed at and after the target',
    async (target) => {
      expect(await collector('countdown')({ config: { event: 'Launch', target } })).toMatchObject({
        primary: 'It’s time',
        breakdown: 'It’s time',
      })
    },
  )
})
