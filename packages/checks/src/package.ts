import { createHash } from 'node:crypto'

import { packageLimits } from '@shiftpane/format'
import { unzipSync, zipSync } from 'fflate'

/**
 * Reading and writing the zip a widget ships as (PLAN, "Widget package format (v1)"): fixed file
 * names, nothing else, at most 1 MB unpacked. Opening never inflates more than the limit allows,
 * so a zip bomb fails on its declared sizes before any of it is unpacked.
 */

export const requiredFiles = ['manifest.json', 'view.json', 'sample.json', 'README.md', 'LICENSE']
const optionalFiles = ['collector.js', 'icon.png']
const screenshotName = /^screenshots\/[a-z0-9][a-z0-9._-]{0,63}\.png$/i

export interface OpenedPackage {
  sha256: string
  /** Bytes of the zip itself. */
  size: number
  /** The allowed files, by name. Empty when the layout check failed before unpacking. */
  files: Map<string, Uint8Array>
  /** Why the layout check failed; empty when it passed. */
  problems: string[]
}

export function openPackage(zip: Uint8Array): OpenedPackage {
  const opened: OpenedPackage = {
    sha256: createHash('sha256').update(zip).digest('hex'),
    size: zip.byteLength,
    files: new Map(),
    problems: [],
  }
  const { problems } = opened
  if (zip.byteLength > packageLimits.totalBytes) {
    problems.push(`The zip is ${kb(zip.byteLength)}; the limit is ${kb(packageLimits.totalBytes)}.`)
    return opened
  }

  const seen = new Set<string>()
  const declared = new Map<string, number>()
  let total = 0
  let entries: Record<string, Uint8Array>
  try {
    entries = unzipSync(zip, {
      filter(file) {
        if (file.name.endsWith('/')) return false
        if (seen.has(file.name)) problems.push(`${file.name} is in the zip twice.`)
        seen.add(file.name)
        if (!isAllowed(file.name)) {
          problems.push(`${file.name} isn't allowed in a package.`)
          return false
        }
        declared.set(file.name, file.originalSize)
        total += file.originalSize
        return total <= packageLimits.totalBytes
      },
    })
  } catch {
    problems.push("The zip can't be read.")
    return opened
  }

  if (total > packageLimits.totalBytes) {
    problems.push(`The files add up to ${kb(total)}; the limit is ${kb(packageLimits.totalBytes)}.`)
  }
  for (const [name, bytes] of Object.entries(entries)) {
    if (bytes.byteLength !== declared.get(name)) problems.push(`${name} isn't the size it says.`)
    opened.files.set(name, bytes)
  }
  for (const name of requiredFiles) {
    if (!seen.has(name)) problems.push(`${name} is missing.`)
  }

  const collector = opened.files.get('collector.js')
  if (collector && collector.byteLength > packageLimits.collectorBytes) {
    problems.push(
      `collector.js is ${kb(collector.byteLength)}; the limit is ${kb(packageLimits.collectorBytes)}.`,
    )
  }
  const sample = opened.files.get('sample.json')
  if (sample && sample.byteLength > packageLimits.sampleBytes) {
    problems.push(
      `sample.json is ${kb(sample.byteLength)}; the limit is ${kb(packageLimits.sampleBytes)}.`,
    )
  }
  const icon = opened.files.get('icon.png')
  if (icon) {
    const size = pngSize(icon)
    const want = packageLimits.iconPixels
    if (!size) problems.push("icon.png isn't a PNG.")
    else if (size.width !== want || size.height !== want) {
      problems.push(`icon.png is ${size.width}×${size.height}; it has to be ${want}×${want}.`)
    }
  }
  const screenshots = [...opened.files.keys()].filter((name) => name.startsWith('screenshots/'))
  if (screenshots.length > packageLimits.screenshots) {
    problems.push(`${screenshots.length} screenshots; the limit is ${packageLimits.screenshots}.`)
  }
  for (const name of screenshots) {
    const bytes = opened.files.get(name)
    if (bytes && !pngSize(bytes)) problems.push(`${name} isn't a PNG.`)
  }
  for (const name of [
    'manifest.json',
    'view.json',
    'sample.json',
    'collector.js',
    'README.md',
    'LICENSE',
  ]) {
    const bytes = opened.files.get(name)
    if (bytes && text(bytes) === undefined) problems.push(`${name} isn't UTF-8 text.`)
  }

  if (problems.length > 0) opened.files.clear()
  return opened
}

/** A file's text, or `undefined` when it is missing or not UTF-8. */
export function readText(opened: OpenedPackage, name: string): string | undefined {
  const bytes = opened.files.get(name)
  return bytes ? text(bytes) : undefined
}

/**
 * The same files always make the same zip: sorted names, a fixed date, no extra fields. The CLI packs
 * this way so a package's sha256 follows from its contents.
 */
export function packPackage(files: Record<string, Uint8Array | string>): Uint8Array {
  const encoder = new TextEncoder()
  const sorted = Object.keys(files).sort()
  const entries: Record<string, [Uint8Array, { level: 9; mtime: Date }]> = {}
  for (const name of sorted) {
    const value = files[name]
    if (value === undefined) continue
    const bytes = typeof value === 'string' ? encoder.encode(value) : value
    entries[name] = [bytes, { level: 9, mtime: new Date('1980-01-01T00:00:00Z') }]
  }
  return zipSync(entries)
}

function isAllowed(name: string): boolean {
  return requiredFiles.includes(name) || optionalFiles.includes(name) || screenshotName.test(name)
}

const decoder = new TextDecoder('utf-8', { fatal: true })

function text(bytes: Uint8Array): string | undefined {
  try {
    return decoder.decode(bytes)
  } catch {
    return undefined
  }
}

/** Width and height from a PNG's IHDR chunk, or `undefined` if the bytes aren't a PNG. */
function pngSize(bytes: Uint8Array): { width: number; height: number } | undefined {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
  if (bytes.byteLength < 24 || signature.some((byte, i) => bytes[i] !== byte)) return undefined
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  return { width: view.getUint32(16), height: view.getUint32(20) }
}

function kb(bytes: number): string {
  return `${Math.ceil(bytes / 1024).toLocaleString('en-US')} KB`
}
