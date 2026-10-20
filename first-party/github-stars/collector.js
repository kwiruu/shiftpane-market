import { defineCollector } from '@shiftpane/widget-sdk'

// Counts the stars on an account's public repositories. GitHub allows 60 requests an hour without a
// token and 5,000 with one, so the token is optional; it never leaves this widget's requests to
// api.github.com, the only host the manifest allows.
export default defineCollector(async ({ config, secrets, fetch, signal }) => {
  const headers = { Accept: 'application/vnd.github+json' }
  if (secrets.GITHUB_TOKEN) headers.Authorization = `Bearer ${secrets.GITHUB_TOKEN}`

  const repos = []
  for (let page = 1; page <= 5; page++) {
    const url = `https://api.github.com/users/${encodeURIComponent(config.owner)}/repos?per_page=100&page=${page}`
    const response = await fetch(url, { headers, signal })
    if (!response.ok) throw new Error(`GitHub answered ${response.status}`)
    const batch = await response.json()
    repos.push(...batch.filter((repo) => !repo.fork))
    if (batch.length < 100) break
  }

  repos.sort((a, b) => b.stargazers_count - a.stargazers_count)
  return {
    total: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
    spread: repos.slice(0, 10).map((repo) => repo.stargazers_count),
    repos: repos.slice(0, config.top).map((repo) => ({
      title: repo.name,
      subtitle: repo.language ?? '',
      value: String(repo.stargazers_count),
    })),
  }
})
