/**
 * Pattern scanners the checks run over a package's text: embedded credentials, and hosts that only
 * exist to track people. Both lists are short on purpose: they catch the common cases, and a
 * reviewer reads everything that passes anyway.
 */

/** Token formats with a fixed, recognizable shape. Never echo the match itself. */
export const credentialPatterns: { name: string; pattern: RegExp }[] = [
  {
    name: 'a GitHub token',
    pattern: /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{60,})\b/,
  },
  { name: 'an AWS access key', pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/ },
  { name: 'a Slack token', pattern: /\bxox[abposr]-[A-Za-z0-9-]{10,}\b/ },
  { name: 'a Google API key', pattern: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { name: 'a Stripe secret key', pattern: /\b[rs]k_live_[0-9A-Za-z]{20,}\b/ },
  { name: 'an Anthropic API key', pattern: /\bsk-ant-[A-Za-z0-9_-]{20,}\b/ },
  { name: 'an OpenAI API key', pattern: /\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}\b/ },
  { name: 'a private key', pattern: /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----/ },
  { name: 'a Discord bot token', pattern: /\b[MN][A-Za-z\d]{23,25}\.[\w-]{6}\.[\w-]{27,}\b/ },
]

export function findCredentials(text: string): string[] {
  return credentialPatterns.filter(({ pattern }) => pattern.test(text)).map(({ name }) => name)
}

/** Analytics, advertising and session-recording hosts. A widget has no reason to call them. */
export const trackerDomains = [
  'analytics.google.com',
  'app-measurement.com',
  'doubleclick.net',
  'google-analytics.com',
  'googleadservices.com',
  'googlesyndication.com',
  'googletagmanager.com',
  'connect.facebook.net',
  'graph.facebook.com',
  'amplitude.com',
  'clarity.ms',
  'fullstory.com',
  'heap.io',
  'heapanalytics.com',
  'hotjar.com',
  'mixpanel.com',
  'mouseflow.com',
  'posthog.com',
  'scorecardresearch.com',
  'segment.com',
  'segment.io',
]

/** Whether a manifest host (`api.example.com` or `*.example.com`) is, or is under, a tracker domain. */
export function isTracker(host: string): boolean {
  const bare = host.startsWith('*.') ? host.slice(2) : host
  return trackerDomains.some((domain) => bare === domain || bare.endsWith(`.${domain}`))
}

/**
 * The service a secret belongs to, from its name: `GITHUB_TOKEN` is GitHub's. Returns the words a
 * host of that service has as a label, or `undefined` when the name doesn't say.
 */
export function secretService(name: string): string[] | undefined {
  const aliases: Record<string, string[]> = {
    GH: ['github'],
    GITHUB: ['github'],
    GITLAB: ['gitlab'],
    OPENAI: ['openai'],
    ANTHROPIC: ['anthropic'],
    CLAUDE: ['anthropic'],
    SPOTIFY: ['spotify'],
    DISCORD: ['discord', 'discordapp'],
    SLACK: ['slack'],
    NOTION: ['notion'],
    LINEAR: ['linear'],
    TODOIST: ['todoist'],
    VERCEL: ['vercel'],
    NETLIFY: ['netlify'],
    CLOUDFLARE: ['cloudflare'],
    STRIPE: ['stripe'],
    TWITCH: ['twitch', 'twitchapps'],
    YOUTUBE: ['googleapis', 'youtube'],
    GOOGLE: ['googleapis', 'google'],
    OPENWEATHER: ['openweathermap'],
    OPENWEATHERMAP: ['openweathermap'],
    COINGECKO: ['coingecko'],
    ALPHAVANTAGE: ['alphavantage'],
    FINNHUB: ['finnhub'],
    STEAM: ['steampowered', 'steamcommunity'],
  }
  const prefix = name.split('_')[0] ?? ''
  return aliases[prefix] ?? (prefix.length >= 4 ? [prefix.toLowerCase()] : undefined)
}

/** Whether `host` has one of `words` as a label: `api.github.com` belongs to `github`. */
export function hostBelongsTo(host: string, words: string[]): boolean {
  const labels = host.replace(/^\*\./, '').split('.')
  return labels.some((label) => words.includes(label))
}

/** Shannon entropy in bits per character. Random tokens sit near 6; English near 4. */
export function entropy(text: string): number {
  if (text.length === 0) return 0
  const counts = new Map<string, number>()
  for (const char of text) counts.set(char, (counts.get(char) ?? 0) + 1)
  let bits = 0
  for (const count of counts.values()) {
    const p = count / text.length
    bits -= p * Math.log2(p)
  }
  return bits
}
