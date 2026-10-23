import { defineCollector } from '@shiftpane/widget-sdk'

const levels = ['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE', 'THIRD_QUARTILE', 'FOURTH_QUARTILE']
const query = `query Contributions($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    login
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        weeks { contributionDays { date contributionCount contributionLevel } }
      }
    }
  }
}`

export default defineCollector(async ({ config, secrets, fetch, signal }) => {
  const username = typeof config.username === 'string' ? config.username.trim() : ''
  if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username) || username.includes('--')) {
    throw new Error('Enter a valid GitHub username, not an organization or profile URL.')
  }
  if (!secrets.GITHUB_TOKEN?.trim())
    throw new Error('Add a GitHub token in this widget’s settings.')
  const now = new Date()
  const endDate = now.toISOString().slice(0, 10)
  const from = new Date(now)
  const month = from.getUTCMonth()
  from.setUTCFullYear(from.getUTCFullYear() - 1)
  if (from.getUTCMonth() !== month) from.setUTCDate(0)
  const startDate = from.toISOString().slice(0, 10)
  let response
  try {
    response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secrets.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { login: username, from: from.toISOString(), to: now.toISOString() },
      }),
      signal,
    })
  } catch {
    throw new Error('Cannot reach GitHub. Try again later.')
  }
  if (response.status === 401)
    throw new Error('GitHub token is invalid or expired. Update it in widget settings.')
  if (response.status === 403 || response.status === 429)
    throw new Error(
      'GitHub access is restricted or rate limited. Try again later or check token permissions.',
    )
  if (!response.ok) throw new Error(`GitHub request failed (${response.status}). Try again later.`)
  let result
  try {
    result = await response.json()
  } catch {
    throw new Error('GitHub returned an unreadable response.')
  }
  if (Array.isArray(result?.errors) && result.errors.length) {
    if (result.errors.some((error) => error.type === 'NOT_FOUND'))
      throw new Error('GitHub user not found. Check the username.')
    throw new Error(
      'GitHub could not provide contributions. Check token permissions or try again later.',
    )
  }
  const user = result?.data?.user
  if (user === null) throw new Error('GitHub user not found. Check the username.')
  const weeks = user?.contributionsCollection?.contributionCalendar?.weeks
  if (typeof user?.login !== 'string' || !Array.isArray(weeks) || weeks.length > 54)
    throw new Error('GitHub returned an invalid calendar.')
  const days = []
  const dates = new Set()
  for (const week of weeks) {
    if (!Array.isArray(week?.contributionDays) || week.contributionDays.length > 7)
      throw new Error('GitHub returned an invalid calendar.')
    for (const day of week.contributionDays) {
      const date = day?.date
      const count = day?.contributionCount
      const level = levels.indexOf(day?.contributionLevel)
      if (
        typeof date !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        !Number.isFinite(Date.parse(`${date}T00:00:00Z`)) ||
        new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date ||
        !Number.isSafeInteger(count) ||
        count < 0 ||
        level < 0 ||
        dates.has(date)
      ) {
        throw new Error('GitHub returned an invalid calendar.')
      }
      dates.add(date)
      if (date >= startDate && date <= endDate) days.push({ date, count, level })
    }
  }
  days.sort((a, b) => a.date.localeCompare(b.date))
  if (!days.length) throw new Error('GitHub returned an empty calendar. Try again later.')
  return { username: user.login, calendar: { startDate, endDate, days } }
})
