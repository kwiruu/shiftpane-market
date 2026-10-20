import { mkdtemp, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { FsStorage } from './index.ts'

const options = { contentType: 'application/json', cacheSeconds: 60 }

describe('FsStorage', () => {
  it('writes files under its directory and serves them from its base URL', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'storage-'))
    const storage = new FsStorage(dir, 'http://localhost:8787/registry/')
    await storage.put('packages/abc.zip', new Uint8Array([1, 2, 3]), options)
    expect(await readFile(join(dir, 'packages', 'abc.zip'))).toEqual(Buffer.from([1, 2, 3]))
    expect(await storage.read('packages/abc.zip')).toEqual(Buffer.from([1, 2, 3]))
    expect(await storage.read('missing.json')).toBeUndefined()
    expect(storage.url('index.json')).toBe('http://localhost:8787/registry/index.json')
  })

  it('refuses keys that climb out of the directory', async () => {
    const storage = new FsStorage(await mkdtemp(join(tmpdir(), 'storage-')), 'http://x')
    await expect(storage.put('../escape.json', new Uint8Array(), options)).rejects.toThrow(
      'Bad storage key',
    )
    await expect(storage.put('/abs.json', new Uint8Array(), options)).rejects.toThrow(
      'Bad storage key',
    )
  })
})
