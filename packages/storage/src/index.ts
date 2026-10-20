import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join, resolve, sep } from 'node:path'

import { put } from '@vercel/blob'

/**
 * Where the registry's public files live (PLAN, "Package storage"): `index.json`, `revoked.json`,
 * their signatures and the packages. One interface, two adapters: the filesystem for local dev and
 * tests, Vercel Blob in production. Nothing reads these through the API; the app fetches them from
 * `url(key)`, which is the site's `/registry` path in production so storage can move without the
 * app noticing.
 */

export interface PutOptions {
  contentType: string
  /** How long browsers, CDNs and the app may keep the file. */
  cacheSeconds: number
}

export interface Storage {
  put(key: string, bytes: Uint8Array, options: PutOptions): Promise<void>
  /** The public URL a file is served from. */
  url(key: string): string
}

/** Keys are plain relative paths: `index.json`, `packages/<sha256>.zip`. */
export function assertKey(key: string) {
  if (!/^[a-z0-9][a-z0-9._-]*(?:\/[a-z0-9][a-z0-9._-]*)*$/i.test(key) || key.includes('..')) {
    throw new Error(`Bad storage key: ${key}`)
  }
}

export class FsStorage implements Storage {
  readonly dir: string
  private readonly publicBase: string

  constructor(dir: string, publicBase: string) {
    this.dir = resolve(dir)
    this.publicBase = publicBase
  }

  /** Local files have no cache headers, so the options don't apply. */
  async put(key: string, bytes: Uint8Array, _options?: PutOptions) {
    const path = this.path(key)
    await mkdir(dirname(path), { recursive: true })
    // Write then rename, so a reader never sees half a file.
    const temporary = `${path}.${process.pid}.tmp`
    await writeFile(temporary, bytes)
    await rename(temporary, path)
  }

  async read(key: string): Promise<Uint8Array | undefined> {
    try {
      return await readFile(this.path(key))
    } catch {
      return undefined
    }
  }

  url(key: string) {
    return `${this.publicBase.replace(/\/$/, '')}/${key}`
  }

  private path(key: string) {
    assertKey(key)
    const path = join(this.dir, ...key.split('/'))
    if (!path.startsWith(this.dir + sep)) throw new Error(`Bad storage key: ${key}`)
    return path
  }
}

export class BlobStorage implements Storage {
  private readonly token: string
  private readonly publicBase: string

  constructor(token: string, publicBase: string) {
    this.token = token
    this.publicBase = publicBase
  }

  async put(key: string, bytes: Uint8Array, options: PutOptions) {
    assertKey(key)
    await put(key, Buffer.from(bytes), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: options.contentType,
      // Blob's minimum is a minute.
      cacheControlMaxAge: Math.max(60, options.cacheSeconds),
      token: this.token,
    })
  }

  url(key: string) {
    return `${this.publicBase.replace(/\/$/, '')}/${key}`
  }
}
