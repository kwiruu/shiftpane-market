import { describe, expect, it } from 'vitest'

import { openPackage, packPackage } from './package.ts'

/** Rewrites every uncompressed-size field in a zip to `size`, the way a zip bomb lies. */
function lieAboutSizes(zip: Uint8Array, size: number): Uint8Array {
  const out = zip.slice()
  const view = new DataView(out.buffer)
  for (let i = 0; i + 4 <= out.length; i++) {
    const signature = view.getUint32(i, true)
    if (signature === 0x04034b50) view.setUint32(i + 22, size, true) // local file header
    if (signature === 0x02014b50) view.setUint32(i + 24, size, true) // central directory
  }
  return out
}

describe('a zip that lies about its sizes', () => {
  it('never unpacks more than it declared', () => {
    const zip = lieAboutSizes(packPackage({ 'README.md': '\0'.repeat(8 * 1024 * 1024) }), 16)
    expect(zip.byteLength).toBeLessThan(64 * 1024)
    const opened = openPackage(zip)
    expect(opened.problems.length).toBeGreaterThan(0)
    expect(opened.files.size).toBe(0)
  })
})
