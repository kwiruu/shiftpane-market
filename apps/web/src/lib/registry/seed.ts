import type { Author, Permissions, Widget } from '@shiftpane/format'
import { countdown } from './countdown'
import { githubContributions } from './github-contributions'
import { laptopBattery } from './laptop-battery'
import { weather } from './weather'

/**
 * The gallery's first widgets (PLAN, W2: "seeded with 3 to 5 first-party widgets"). They are the
 * examples the docs walk through, and each shows one way in: bindings only, a collector with
 * `fetch` and a secret, a collector over sources, an app on this PC. Until the registry API exists
 * (W3) the site reads them from here; afterwards they are ordinary packages in the index.
 */

const none: Permissions = { sources: [], actions: [], local: [], network: [], secrets: [] }

export const authors: Author[] = [
  {
    login: 'shiftpane',
    name: 'ShiftPane',
    bio: 'First-party widgets, made alongside the app. Each one doubles as an example of what the widget SDK can do.',
    joinedAt: '2026-08-20',
    official: true,
  },
]

const gpuRing: Widget = {
  id: 'gpu-ring',
  name: 'GPU ring',
  summary: 'GPU load as a ring, with the last minute below it.',
  author: 'shiftpane',
  license: 'MIT',
  categories: ['system'],
  icon: 'gauge',
  tone: 'dark',
  featured: true,
  minAppVersion: '0.5.0',
  sizes: ['small', 'medium'],
  createdAt: '2026-09-02',
  permissions: { ...none, sources: ['gpu'] },
  config: [],
  versions: [
    {
      version: '1.1.0',
      publishedAt: '2026-10-03',
      permissions: { ...none, sources: ['gpu'] },
      notes: 'Adds the medium size, with the ring beside a minute of history.',
    },
    {
      version: '1.0.0',
      publishedAt: '2026-09-02',
      permissions: { ...none, sources: ['gpu'] },
      notes: 'First release.',
    },
  ],
  view: {
    small: {
      type: 'stack',
      align: 'between',
      children: [
        { type: 'label', text: 'GPU' },
        { type: 'ring', bind: '@gpu/percent', color: 'flame' },
      ],
    },
    medium: {
      type: 'row',
      gap: 5,
      children: [
        { type: 'ring', bind: '@gpu/percent', label: 'GPU', color: 'flame' },
        {
          type: 'stack',
          align: 'between',
          children: [
            { type: 'label', text: 'Last minute' },
            { type: 'history-bars', bind: '@gpu/history' },
          ],
        },
      ],
    },
  },
  sample: {},
  readme: `GPU load as a ring, refreshed as fast as the board asks for it. The medium size adds the last minute as bars, newest on the right.

## What it shows

- **Small:** the ring and the percentage.
- **Medium:** the ring, and a minute of history beside it.

## How it works

There is no collector. The widget binds the \`gpu\` system source straight into its view, so it never runs any code on your PC:

\`\`\`json
{ "type": "ring", "bind": "@gpu/percent" }
\`\`\`

That also makes it the shortest kind of widget to review, and a good one to copy when you make your own.
`,
}

const githubStars: Widget = {
  id: 'github-stars',
  name: 'GitHub stars',
  summary: 'Stars across your repositories, and the ones with the most.',
  author: 'shiftpane',
  license: 'MIT',
  categories: ['dev'],
  icon: 'star',
  tone: 'dark',
  featured: true,
  minAppVersion: '0.5.0',
  sizes: ['small', 'medium', 'large'],
  refreshSeconds: 900,
  createdAt: '2026-09-16',
  permissions: { ...none, network: ['api.github.com'], secrets: ['GITHUB_TOKEN'] },
  config: [
    {
      key: 'owner',
      label: 'User or organization',
      type: 'string',
      required: true,
      help: 'Whose public repositories to count.',
    },
    { key: 'top', label: 'Repositories to list', type: 'number', default: 3 },
  ],
  versions: [
    {
      version: '1.1.1',
      publishedAt: '2026-10-20',
      permissions: { ...none, network: ['api.github.com'], secrets: ['GITHUB_TOKEN'] },
      notes: 'The large size shows four repositories and fits its card.',
    },
    {
      version: '1.1.0',
      publishedAt: '2026-10-08',
      permissions: { ...none, network: ['api.github.com'], secrets: ['GITHUB_TOKEN'] },
      notes:
        'Uses a token when you give it one, for GitHubâ€™s higher rate limit. Adds the large size.',
    },
    {
      version: '1.0.0',
      publishedAt: '2026-09-16',
      permissions: { ...none, network: ['api.github.com'] },
      notes: 'First release.',
    },
  ],
  view: {
    small: {
      type: 'stack',
      align: 'between',
      children: [
        {
          type: 'row',
          align: 'between',
          children: [
            { type: 'label', text: 'GitHub' },
            { type: 'icon', name: 'star', color: 'lime' },
          ],
        },
        {
          type: 'stack',
          gap: 0.5,
          children: [
            { type: 'value', bind: '/total', format: 'compact', size: 'xl' },
            { type: 'label', text: 'stars' },
          ],
        },
      ],
    },
    medium: {
      type: 'row',
      gap: 5,
      children: [
        {
          type: 'stack',
          align: 'between',
          children: [
            { type: 'icon', name: 'star', color: 'lime' },
            {
              type: 'stack',
              gap: 0.5,
              children: [
                { type: 'value', bind: '/total', format: 'compact', size: 'xl' },
                { type: 'label', text: 'stars' },
              ],
            },
          ],
        },
        { type: 'list', bind: '/repos', max: 3 },
      ],
    },
    large: {
      type: 'stack',
      align: 'between',
      children: [
        {
          type: 'row',
          align: 'between',
          children: [
            {
              type: 'stack',
              gap: 0.5,
              children: [
                { type: 'value', bind: '/total', format: 'compact', size: 'lg' },
                { type: 'label', text: 'stars' },
              ],
            },
            { type: 'icon', name: 'star', color: 'lime' },
          ],
        },
        { type: 'history-bars', bind: '/spread' },
        { type: 'list', bind: '/repos', max: 4 },
      ],
    },
  },
  sample: {
    total: 2481,
    spread: [910, 640, 402, 233, 118, 74, 52, 31, 12, 9],
    repos: [
      { title: 'website', subtitle: 'TypeScript', value: '910' },
      { title: 'cli-tools', subtitle: 'Rust', value: '640' },
      { title: 'dotfiles', subtitle: 'Shell', value: '402' },
      { title: 'notes', subtitle: 'Markdown', value: '233' },
      { title: 'game-jam', subtitle: 'C#', value: '118' },
    ],
  },
  collector: `import { defineCollector } from '@shiftpane/widget-sdk'

// Counts the stars on an account's public repositories. GitHub allows 60 requests an hour without a
// token and 5,000 with one, so the token is optional; it never leaves this widget's requests to
// api.github.com, the only host the manifest allows.
export default defineCollector(async ({ config, secrets, fetch, signal }) => {
  const headers = { Accept: 'application/vnd.github+json' }
  if (secrets.GITHUB_TOKEN) headers.Authorization = \`Bearer \${secrets.GITHUB_TOKEN}\`

  const repos = []
  for (let page = 1; page <= 5; page++) {
    const url = \`https://api.github.com/users/\${encodeURIComponent(config.owner)}/repos?per_page=100&page=\${page}\`
    const response = await fetch(url, { headers, signal })
    if (!response.ok) throw new Error(\`GitHub answered \${response.status}\`)
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
`,
  readme: `Adds up the stars on an account's public repositories every 15 minutes and lists the ones with the most. Forks don't count.

## Settings

- **User or organization:** whose repositories to count.
- **Repositories to list:** how many the list shows. The large size shows up to four.

## Permissions

- **Can reach api.github.com,** and only that host. The app refuses any other address the collector asks for.
- **Needs your GITHUB_TOKEN,** if you have one. Without it GitHub allows 60 requests an hour, which is enough for one account; with it, 5,000. A token with no scopes is all it needs, since it reads public data only. The token is kept encrypted on your PC and only goes to api.github.com.
`,
}

const pcBusy: Widget = {
  id: 'pc-busy',
  name: 'Is my PC busy?',
  summary: 'One word from your CPU and memory, for the person at the door.',
  author: 'shiftpane',
  license: 'MIT',
  categories: ['productivity', 'fun'],
  icon: 'coffee',
  tone: 'light',
  minAppVersion: '0.5.0',
  sizes: ['small'],
  refreshSeconds: 5,
  createdAt: '2026-10-01',
  permissions: { ...none, sources: ['cpu', 'memory'] },
  config: [
    {
      key: 'threshold',
      label: 'Busy above',
      type: 'number',
      default: 80,
      help: 'CPU or memory percent that counts as busy.',
    },
  ],
  versions: [
    {
      version: '1.0.0',
      publishedAt: '2026-10-01',
      permissions: { ...none, sources: ['cpu', 'memory'] },
      notes: 'First release.',
    },
  ],
  view: {
    small: {
      type: 'stack',
      align: 'between',
      children: [
        { type: 'label', text: 'Busy above {config.threshold}%' },
        { type: 'text', bind: '/status', size: 'lg' },
        { type: 'progress', bind: '/load', color: 'flame' },
      ],
    },
  },
  sample: { busy: false, status: 'All clear', load: 61, cpu: 34, memory: 61 },
  collector: `import { defineCollector } from '@shiftpane/widget-sdk'

// "Is my PC busy?", from two sources and one config value.
export default defineCollector(({ sources, config }) => {
  const cpu = sources.cpu.percent ?? 0
  const memory = sources.memory.percent ?? 0
  const busy = cpu > config.threshold || memory > config.threshold
  return { busy, status: busy ? 'Busy' : 'All clear', load: Math.max(cpu, memory), cpu, memory }
})
`,
  readme: `Turns your CPU and memory into one word: **Busy** or **All clear**, with a bar for whichever is higher. Prop the phone up by the door during a render and nobody has to ask.

## Settings

- **Busy above:** the CPU or memory percent that counts as busy. 80 by default.

## How it works

A five-line collector reads the \`cpu\` and \`memory\` sources and compares them with your setting. It's the example the widget docs start with.
`,
}

const temperatures: Widget = {
  id: 'hardware-temps',
  name: 'Temperatures',
  summary: 'CPU and GPU temperatures from LibreHardwareMonitor.',
  author: 'shiftpane',
  license: 'MIT',
  categories: ['system'],
  icon: 'thermometer',
  tone: 'dark',
  minAppVersion: '0.5.0',
  sizes: ['small', 'medium'],
  refreshSeconds: 3,
  createdAt: '2026-10-11',
  permissions: { ...none, local: ['127.0.0.1:8085'] },
  config: [],
  versions: [
    {
      version: '1.0.0',
      publishedAt: '2026-10-14',
      permissions: { ...none, local: ['127.0.0.1:8085'] },
      notes: 'Reads the GPU hot spot when there is one.',
    },
    {
      version: '0.9.0',
      publishedAt: '2026-10-11',
      permissions: { ...none, local: ['127.0.0.1:8085'] },
      notes: 'First release.',
    },
  ],
  view: {
    small: {
      type: 'stack',
      align: 'between',
      children: [
        {
          type: 'row',
          align: 'between',
          children: [
            { type: 'label', text: 'CPU' },
            { type: 'value', bind: '/cpu', format: 'celsius', size: 'md' },
          ],
        },
        { type: 'meter', bind: '/cpu' },
        {
          type: 'row',
          align: 'between',
          children: [
            { type: 'label', text: 'GPU' },
            { type: 'value', bind: '/gpu', format: 'celsius', size: 'md' },
          ],
        },
        { type: 'meter', bind: '/gpu' },
      ],
    },
    medium: {
      type: 'stack',
      align: 'between',
      children: [
        {
          type: 'row',
          align: 'between',
          children: [
            { type: 'label', text: 'Temperatures' },
            { type: 'icon', name: 'thermometer', color: 'flame' },
          ],
        },
        {
          type: 'grid',
          columns: 2,
          children: [
            {
              type: 'stack',
              children: [
                { type: 'value', bind: '/cpu', format: 'celsius', size: 'xl' },
                { type: 'label', text: 'CPU package' },
                { type: 'meter', bind: '/cpu' },
              ],
            },
            {
              type: 'stack',
              children: [
                { type: 'value', bind: '/gpu', format: 'celsius', size: 'xl' },
                { type: 'label', text: 'GPU core' },
                { type: 'meter', bind: '/gpu' },
              ],
            },
          ],
        },
      ],
    },
  },
  sample: { cpu: 61, gpu: 67 },
  collector: `import { defineCollector } from '@shiftpane/widget-sdk'

// LibreHardwareMonitor serves its sensor tree as JSON when its remote web server is on
// (Options â†’ Remote Web Server â†’ Run). Sensors are nested nodes with a Text and a Value like "61.0 Â°C".
const celsius = (node) => {
  const match = /(-?\\d+(?:\\.\\d+)?)\\s*Â°C/.exec(node?.Value ?? '')
  return match ? Number(match[1]) : null
}

function find(node, pattern) {
  if (pattern.test(node.Text ?? '') && celsius(node) !== null) return celsius(node)
  for (const child of node.Children ?? []) {
    const found = find(child, pattern)
    if (found !== null) return found
  }
  return null
}

export default defineCollector(async ({ fetch, signal }) => {
  const response = await fetch('http://127.0.0.1:8085/data.json', { signal })
  if (!response.ok) throw new Error(\`LibreHardwareMonitor answered \${response.status}\`)
  const tree = await response.json()
  return {
    cpu: find(tree, /^(CPU Package|Core \\(Tctl\\/Tdie\\))$/),
    gpu: find(tree, /^GPU (Hot Spot|Core)$/),
  }
})
`,
  readme: `CPU and GPU temperatures, read from [LibreHardwareMonitor](https://github.com/LibreHardwareMonitor/LibreHardwareMonitor) running on the same PC.

ShiftPane's own \`temperatures\` source will cover GPUs through their vendors' APIs, but reading a CPU's temperature on Windows takes a kernel driver, which ShiftPane doesn't ship. LibreHardwareMonitor does, and it can share what it reads over a small local web server. This widget reads that.

## Setup

1. Install and run LibreHardwareMonitor.
2. Turn on **Options â†’ Remote Web Server â†’ Run**. It listens on port 8085.
3. Install this widget and allow it to reach \`127.0.0.1:8085\` when ShiftPane asks.

## Permissions

- **Can reach 127.0.0.1:8085 on your PC,** and nothing else. Talking to an app on your PC always asks first, and the address has to match exactly.
`,
}

export const widgets: Widget[] = [
  laptopBattery,
  gpuRing,
  githubStars,
  pcBusy,
  temperatures,
  githubContributions,
  weather,
  countdown,
]
