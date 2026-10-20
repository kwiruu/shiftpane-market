import type { CheckResult, Permissions, ReviewStatus } from '@shiftpane/format'

/**
 * Sample submissions and reports for the author dashboard and the review queue. Uploads need the API
 * (PLAN, W3), so until then these pages show what they will look like, and say so. Every entry is an
 * update to one of the seed widgets, so the pages link up.
 */

export interface Submission {
  id: string
  widgetId: string
  version: string
  submittedAt: string
  status: ReviewStatus
  permissions: Permissions
  notes: string
  /** Check id → result, with a note where it didn't pass. Missing while the checks run. */
  report: Record<string, { result: CheckResult; note?: string }>
  /** Advice only: what the AI review read in the code. */
  aiSummary?: string
  reviewerNote?: string
}

const none: Permissions = { sources: [], actions: [], local: [], network: [], secrets: [] }

const passAll = (overrides: Submission['report'] = {}): Submission['report'] => ({
  layout: { result: 'pass' },
  manifest: { result: 'pass' },
  version: { result: 'pass' },
  view: { result: 'pass' },
  license: { result: 'pass' },
  collector: { result: 'pass' },
  credentials: { result: 'pass' },
  obfuscation: { result: 'pass' },
  sandbox: { result: 'pass' },
  secrets: { result: 'pass' },
  flow: { result: 'pass' },
  local: { result: 'pass' },
  trackers: { result: 'pass' },
  added: { result: 'pass' },
  ai: { result: 'pass' },
  ...overrides,
})

export const submissions: Submission[] = [
  {
    id: 'now-playing-1.1.0',
    widgetId: 'now-playing',
    version: '1.1.0',
    submittedAt: '2026-10-17',
    status: 'in_review',
    permissions: {
      ...none,
      sources: ['media'],
      actions: ['media.previous', 'media.play-pause', 'media.next'],
      network: ['lyrics.example.com'],
    },
    notes: 'Shows the current line of the lyrics under the title.',
    report: passAll({
      flow: {
        result: 'flag',
        note: 'Reads media, and can reach lyrics.example.com: what you listen to could leave the PC.',
      },
      added: { result: 'flag', note: 'Adds network access to lyrics.example.com.' },
      ai: {
        result: 'flag',
        note: 'Sends the title and artist of each track to lyrics.example.com.',
      },
    }),
    aiSummary:
      'The collector reads the media source and, when the track changes, requests lyrics from lyrics.example.com with the title and artist in the query string. It returns the current line and nothing else. This matches the description, but it does send what is playing off the PC, which the README does not mention.',
  },
  {
    id: 'pc-stats-1.2.0',
    widgetId: 'pc-stats',
    version: '1.2.0',
    submittedAt: '2026-10-16',
    status: 'in_review',
    permissions: { ...none, sources: ['cpu', 'memory', 'gpu', 'network', 'disks'] },
    notes: 'Adds free space on the system drive to the large size.',
    report: passAll({
      added: { result: 'flag', note: 'Adds the disks source.' },
    }),
    aiSummary:
      'No collector. The view binds five system sources and declares all of them. Nothing leaves the PC.',
  },
  {
    id: 'github-stars-1.2.0',
    widgetId: 'github-stars',
    version: '1.2.0',
    submittedAt: '2026-10-18',
    status: 'checking',
    permissions: { ...none, network: ['api.github.com'], secrets: ['GITHUB_TOKEN'] },
    notes: 'Counts an organization’s repositories as well as a user’s.',
    report: {},
  },
  {
    id: 'hardware-temps-1.0.1',
    widgetId: 'hardware-temps',
    version: '1.0.1',
    submittedAt: '2026-10-15',
    status: 'rejected',
    permissions: { ...none, local: ['0.0.0.0:8085'] },
    notes: 'Works when LibreHardwareMonitor listens on every address.',
    report: passAll({
      local: { result: 'flag', note: 'Can reach 0.0.0.0:8085.' },
      added: { result: 'flag', note: 'Changes local access from 127.0.0.1:8085 to 0.0.0.0:8085.' },
    }),
    reviewerNote:
      '0.0.0.0 isn’t an address to connect to. LibreHardwareMonitor answers on 127.0.0.1 whichever address it listens on, so keep 127.0.0.1:8085.',
  },
]

export interface Report {
  id: string
  widgetId: string
  version?: string
  reason: 'broken' | 'misleading' | 'privacy' | 'malware' | 'policy'
  body: string
  createdAt: string
  status: 'open' | 'resolved'
}

export const reportReasons: Record<Report['reason'], string> = {
  broken: 'Doesn’t work',
  misleading: 'Doesn’t do what it says',
  privacy: 'Privacy',
  malware: 'Harmful',
  policy: 'Breaks the content policy',
}

export const reports: Report[] = [
  {
    id: 'r-2',
    widgetId: 'hardware-temps',
    version: '1.0.0',
    reason: 'broken',
    body: 'The GPU shows a dash on my laptop, which only has integrated graphics.',
    createdAt: '2026-10-16',
    status: 'open',
  },
  {
    id: 'r-1',
    widgetId: 'github-stars',
    version: '1.0.0',
    reason: 'misleading',
    body: 'Says it counts my stars but forks are missing.',
    createdAt: '2026-09-21',
    status: 'resolved',
  },
]

export function getSubmission(id: string): Submission | undefined {
  return submissions.find((submission) => submission.id === id)
}

export const statusLabels: Record<ReviewStatus, string> = {
  checking: 'Checking',
  in_review: 'In review',
  approved: 'Live',
  rejected: 'Rejected',
  yanked: 'Yanked',
}
