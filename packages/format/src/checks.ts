/**
 * The marketplace's automated checks (PLAN, Moderation). A `fail` blocks the upload; a `flag` goes
 * to the reviewer. The docs, the upload page and the review queue all read this one list.
 */

/** `skip`: the check didn't run, such as the sandbox run before the app's widget runtime exists. */
export type CheckResult = 'pass' | 'flag' | 'fail' | 'skip'

/** Check id → result, with a note where it didn't pass. */
export type CheckReport = Record<string, { result: CheckResult; note?: string }>

export interface Check {
  id: string
  title: string
  /** What happens when the check doesn't pass. */
  outcome: 'fail' | 'flag'
  /** Always goes to a person, even when everything else passes. */
  alwaysHuman?: boolean
}

export const checks: Check[] = [
  { id: 'layout', title: 'Zip layout, allowed files and size limits', outcome: 'fail' },
  {
    id: 'manifest',
    title: 'manifest.json is valid, and the id is yours and not reserved',
    outcome: 'fail',
  },
  { id: 'version', title: 'The version is higher than the last one published', outcome: 'fail' },
  {
    id: 'view',
    title: 'view.json is valid, and every binding, source and button is declared',
    outcome: 'fail',
  },
  { id: 'license', title: 'An OSI-approved license, with a LICENSE file', outcome: 'fail' },
  { id: 'collector', title: 'collector.js is one ES module with no imports', outcome: 'fail' },
  { id: 'credentials', title: 'No credentials embedded in the code', outcome: 'fail' },
  { id: 'obfuscation', title: 'No minified or obfuscated code', outcome: 'flag' },
  {
    id: 'sandbox',
    title: 'The collector runs in the sandbox with sample data, within its limits',
    outcome: 'flag',
  },
  {
    id: 'secrets',
    title: 'Secrets only go to hosts of the service that issued them',
    outcome: 'flag',
  },
  {
    id: 'flow',
    title: 'Revealing sources together with network or local access',
    outcome: 'flag',
    alwaysHuman: true,
  },
  { id: 'local', title: 'Access to apps on this PC or network', outcome: 'flag' },
  { id: 'trackers', title: 'No hosts on tracking or analytics blocklists', outcome: 'flag' },
  { id: 'account', title: 'The GitHub account is at least 30 days old', outcome: 'flag' },
  {
    id: 'added',
    title: 'Permissions added since the previous version',
    outcome: 'flag',
    alwaysHuman: true,
  },
  {
    id: 'ai',
    title: 'AI review: does the code do what the description and permissions say?',
    outcome: 'flag',
  },
]

export const reservedIds = ['pc-stats', 'media', 'clock', 'calendar', 'cpu', 'memory', 'network']

/** Limits on a package (PLAN, Widget package format). */
export const packageLimits = {
  totalBytes: 1024 * 1024,
  collectorBytes: 256 * 1024,
  iconPixels: 256,
  screenshots: 6,
  /** The collector's output is capped at 64 KB, so its example is too. */
  sampleBytes: 64 * 1024,
}

/** OSI-approved licenses by SPDX id, the ones a widget is likely to use. The license check reads this. */
export const osiLicenses = [
  '0BSD',
  'AFL-3.0',
  'AGPL-3.0-only',
  'AGPL-3.0-or-later',
  'Apache-2.0',
  'Artistic-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'BSL-1.0',
  'CDDL-1.0',
  'ECL-2.0',
  'EPL-2.0',
  'EUPL-1.2',
  'GPL-2.0-only',
  'GPL-2.0-or-later',
  'GPL-3.0-only',
  'GPL-3.0-or-later',
  'ISC',
  'LGPL-2.1-only',
  'LGPL-2.1-or-later',
  'LGPL-3.0-only',
  'LGPL-3.0-or-later',
  'MIT',
  'MIT-0',
  'MPL-2.0',
  'MS-PL',
  'NCSA',
  'OSL-3.0',
  'PostgreSQL',
  'UPL-1.0',
  'Unlicense',
  'Zlib',
]
