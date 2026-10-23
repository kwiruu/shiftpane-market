import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { runInNewContext } from 'node:vm'
import { describe, expect, it, vi } from 'vitest'

const source = readFileSync(
  join(import.meta.dirname, '../../../first-party/github-contributions/collector.js'),
  'utf8',
)
// Exercise the shipped source with a fixed clock and a stubbed collector API, never live credentials.
function collector(now = '2026-10-23T12:00:00Z') {
  class Clock extends Date {
    constructor(value: string | number = now) {
      super(value)
    }
  }
  return runInNewContext(
    source
      .replace(/^import[^\n]+\n/, '')
      .replace('export default defineCollector', 'defineCollector'),
    { Date: Clock, defineCollector: (value: unknown) => value },
  ) as (context: object) => Promise<{
    username: string
    calendar: {
      startDate: string
      endDate: string
      days: { date: string; count: number; level: number }[]
    }
  }>
}
const day = (date: string, count = 2, level = 'SECOND_QUARTILE') => ({
  date,
  contributionCount: count,
  contributionLevel: level,
})
const body = (days = [day('2026-10-23')]) => ({
  data: {
    user: {
      login: 'octocat',
      contributionsCollection: { contributionCalendar: { weeks: [{ contributionDays: days }] } },
    },
  },
})
function context(payload: unknown = body(), status = 200) {
  return {
    config: { username: 'octocat' },
    secrets: { GITHUB_TOKEN: 'test-secret-never-echo' },
    signal: {},
    fetch: vi.fn(async () => ({ ok: status === 200, status, json: async () => payload })),
  }
}

describe('GitHub contributions shipped collector', () => {
  it('posts variables to the official API and returns only normalized data', async () => {
    const ctx = context()
    const result = await collector()(ctx)
    expect(result).toEqual({
      username: 'octocat',
      calendar: {
        startDate: '2025-10-23',
        endDate: '2026-10-23',
        days: [{ date: '2026-10-23', count: 2, level: 2 }],
      },
    })
    const call = ctx.fetch.mock.calls[0] as unknown as [string, { method: string; body: string }]
    expect(call[0]).toBe('https://api.github.com/graphql')
    expect(call[1].method).toBe('POST')
    expect(JSON.parse(call[1].body).variables).toEqual({
      login: 'octocat',
      from: '2025-10-23T12:00:00.000Z',
      to: '2026-10-23T12:00:00.000Z',
    })
    expect(JSON.stringify(result)).not.toContain(ctx.secrets.GITHUB_TOKEN)
    expect(Buffer.byteLength(JSON.stringify(result))).toBeLessThan(65536)
  })
  it('accepts zero activity and maps all five levels', async () => {
    const levels = [
      'NONE',
      'FIRST_QUARTILE',
      'SECOND_QUARTILE',
      'THIRD_QUARTILE',
      'FOURTH_QUARTILE',
    ]
    const result = await collector()(
      context(body(levels.map((level, i) => day(`2026-10-${19 + i}`, 0, level)))),
    )
    expect(result.calendar.days.map((d) => d.level)).toEqual([0, 1, 2, 3, 4])
    expect(result.calendar.days.every((d) => d.count === 0)).toBe(true)
  })
  it('sorts dates and excludes future and out-of-range dates', async () => {
    const result = await collector()(
      context(body([day('2026-10-23'), day('2026-10-24'), day('2025-10-22'), day('2026-10-22')])),
    )
    expect(result.calendar.days.map((d) => d.date)).toEqual(['2026-10-22', '2026-10-23'])
  })
  it('clamps leap-year start dates', async () => {
    const result = await collector('2024-02-29T12:00:00Z')(context(body([day('2024-02-29')])))
    expect(result.calendar.startDate).toBe('2023-02-28')
  })
  it('rejects missing tokens and invalid usernames before fetching', async () => {
    const ctx = context()
    await expect(collector()({ ...ctx, secrets: {} })).rejects.toThrow('Add a GitHub token')
    for (const username of ['', 'https://github.com/octocat', 'a--b', '-a'])
      await expect(collector()({ ...ctx, config: { username } })).rejects.toThrow(
        'valid GitHub username',
      )
    expect(ctx.fetch).not.toHaveBeenCalled()
  })
  it.each([401, 403, 429, 500])(
    'handles HTTP %s without echoing credentials or response content',
    async (status) => {
      const ctx = context({ message: 'test-secret-never-echo' }, status)
      await expect(collector()(ctx)).rejects.toThrow(/GitHub/)
      await expect(collector()(ctx)).rejects.not.toThrow(ctx.secrets.GITHUB_TOKEN)
    },
  )
  it('handles GraphQL errors with HTTP 200 and unknown accounts', async () => {
    await expect(collector()(context({ errors: [{ type: 'NOT_FOUND' }] }))).rejects.toThrow(
      'user not found',
    )
    await expect(
      collector()(context({ errors: [{ message: 'test-secret-never-echo' }] })),
    ).rejects.toThrow('could not provide')
    await expect(collector()(context({ data: { user: null } }))).rejects.toThrow('user not found')
  })
  it('rejects malformed and oversized calendars', async () => {
    for (const payload of [
      {},
      body([]),
      body([day('2026-02-30')]),
      body([day('2026-10-23', -1)]),
      body([day('2026-10-23', 1, 'OTHER')]),
      body([day('2026-10-23'), day('2026-10-23')]),
    ])
      await expect(collector()(context(payload))).rejects.toThrow(/calendar/)
    const payload = body()
    payload.data.user.contributionsCollection.contributionCalendar.weeks = Array.from(
      { length: 55 },
      () => ({ contributionDays: [] }),
    )
    await expect(collector()(context(payload))).rejects.toThrow('invalid calendar')
  })
  it('handles network and JSON failures with safe errors', async () => {
    const ctx = context()
    await expect(
      collector()({
        ...ctx,
        fetch: async () => {
          throw new Error(ctx.secrets.GITHUB_TOKEN)
        },
      }),
    ).rejects.toThrow('Cannot reach GitHub')
    await expect(
      collector()({
        ...ctx,
        fetch: async () => ({
          ok: true,
          status: 200,
          json: async () => {
            throw new Error('bad')
          },
        }),
      }),
    ).rejects.toThrow('unreadable response')
  })
})
