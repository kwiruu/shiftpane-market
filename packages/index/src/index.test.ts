import type { Permissions } from '@shiftpane/format'
import { describe, expect, it } from 'vitest'

import { buildIndex, buildRevoked, type IndexInput, serialize } from './build.ts'
import { generateKeyPair, publicKeyOf, signBytes, verifyBytes } from './signing.ts'

const gpu: Permissions = { sources: ['gpu'], actions: [], local: [], network: [], secrets: [] }

const widget = (id: string, versions: string[]): IndexInput => ({
  id,
  name: id,
  summary: `${id} summary`,
  author: 'octocat',
  categories: ['system'],
  versions: versions.map((version) => ({
    version,
    sha256: `${id}-${version}`,
    size: 100,
    minAppVersion: '0.5.0',
    permissions: gpu,
  })),
})

describe('buildIndex', () => {
  const now = new Date('2026-10-20T00:00:00Z')
  const index = buildIndex(
    [widget('zeta', ['1.0.0']), widget('alpha', ['1.0.0', '1.10.0', '1.2.0']), widget('empty', [])],
    (sha) => `https://cdn.example/packages/${sha}.zip`,
    now,
  )

  it('lists widgets with versions, by id', () => {
    expect(index.widgets.map((entry) => entry.id)).toEqual(['alpha', 'zeta'])
    expect(index.generatedAt).toBe('2026-10-20T00:00:00.000Z')
  })

  it('picks the highest version as latest and orders versions newest first', () => {
    const alpha = index.widgets[0]
    expect(alpha?.latest).toBe('1.10.0')
    expect(Object.keys(alpha?.versions ?? {})).toEqual(['1.10.0', '1.2.0', '1.0.0'])
    expect(alpha?.versions['1.2.0']?.url).toBe('https://cdn.example/packages/alpha-1.2.0.zip')
  })
})

describe('signatures', () => {
  const keys = generateKeyPair()
  const bytes = serialize(
    buildRevoked([{ id: 'x', version: '1.0.0', reason: 'r', yankedAt: 'now' }]),
  )

  it('verify with the matching public key', () => {
    const signature = signBytes(bytes, keys.privateKey)
    expect(verifyBytes(bytes, signature, [keys.publicKey])).toBe(true)
    expect(publicKeyOf(keys.privateKey)).toBe(keys.publicKey)
  })

  it('accept either of the shipped keys', () => {
    const other = generateKeyPair()
    const signature = signBytes(bytes, keys.privateKey)
    expect(verifyBytes(bytes, signature, [other.publicKey, keys.publicKey])).toBe(true)
    expect(verifyBytes(bytes, signature, [other.publicKey])).toBe(false)
  })

  it('refuse tampered bytes and garbage', () => {
    const signature = signBytes(bytes, keys.privateKey)
    const tampered = bytes.slice()
    tampered[10] = (tampered[10] ?? 0) ^ 1
    expect(verifyBytes(tampered, signature, [keys.publicKey])).toBe(false)
    expect(verifyBytes(bytes, 'not base64!', [keys.publicKey])).toBe(false)
    expect(verifyBytes(bytes, signature, ['not a key'])).toBe(false)
  })
})
