import {
  addedPermissions,
  type CheckReport,
  type CheckResult,
  canSendOffPc,
  checks,
  compareVersions,
  type Manifest,
  manifestSchema,
  osiLicenses,
  type Permissions,
  placeholderBindings,
  placeholderConfigKeys,
  pointer,
  type ReviewStatus,
  reservedIds,
  type SourceName,
  sampleSchema,
  sources,
  textsOf,
  type ViewNode,
  type WidgetView,
  widgetViewSchema,
} from '@shiftpane/format'
import { parse as parseJs } from 'acorn'
import type { z } from 'zod'

import { type OpenedPackage, readText } from './package.ts'
import { entropy, findCredentials, hostBelongsTo, isTracker, secretService } from './scan.ts'

/**
 * The automated checks (PLAN, Moderation), run on an upload before anyone reviews it. A `fail`
 * blocks the upload; a `flag` goes to the reviewer with a note; `skip` means the check didn't run,
 * either because an earlier one failed or because what it needs doesn't exist yet.
 */

export interface CheckContext {
  uploader: {
    login: string
    /** First-party: the ShiftPane project's own widgets may use reserved ids. */
    official?: boolean
    githubCreatedAt?: Date | null
  }
  /** The widget the upload's id names, when that id is already taken. */
  existing?: {
    ownerLogin: string
    versions: { version: string; status: ReviewStatus; permissions: Permissions }[]
  }
  now?: Date
}

export interface CheckedPackage {
  report: CheckReport
  /** No check failed: the upload can wait for review. */
  passed: boolean
  manifest?: Manifest
  view?: WidgetView
  sample?: Record<string, unknown>
  collector?: string
  readme?: string
  license?: string
}

const MAX_VIEW_DEPTH = 8
const MAX_VIEW_NODES = 200
const LONG_LINE = 500

/** The manifest's id, read loosely, so the caller can look the widget up before checking. */
export function manifestIdOf(opened: OpenedPackage): string | undefined {
  const parsed = parseJson(readText(opened, 'manifest.json'))
  const id = parsed.ok && isRecord(parsed.value) ? parsed.value.id : undefined
  return typeof id === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) && id.length <= 64
    ? id
    : undefined
}

export function checkPackage(opened: OpenedPackage, context: CheckContext): CheckedPackage {
  const report: CheckReport = {}
  const set = (id: string, result: CheckResult, note?: string) => {
    report[id] = note ? { result, note } : { result }
  }
  const done = (out: Omit<CheckedPackage, 'report' | 'passed'> = {}): CheckedPackage => {
    for (const check of checks)
      report[check.id] ??= { result: 'skip', note: 'Fix the failures above first.' }
    return {
      ...out,
      report,
      passed: !Object.values(report).some((entry) => entry.result === 'fail'),
    }
  }

  if (opened.problems.length > 0) {
    set('layout', 'fail', opened.problems.join(' '))
    return done()
  }
  set('layout', 'pass')

  const collector = readText(opened, 'collector.js')
  const readme = readText(opened, 'README.md') ?? ''
  const license = readText(opened, 'LICENSE') ?? ''

  // Checks that read only the files.
  const ast = checkCollector(collector, set)
  checkCredentials(opened, set)
  checkObfuscation(collector, ast, set)
  if (collector === undefined) set('sandbox', 'pass')
  else {
    set(
      'sandbox',
      'skip',
      "Collectors run in the sandbox once the app's widget runtime ships. Until then a reviewer reads the code.",
    )
  }
  set('ai', 'skip', 'AI review is off.')
  checkAccount(context, set)

  const manifest = checkManifest(opened, context, set)
  if (!manifest) return done({ collector, readme, license })

  checkVersion(manifest, context, set)
  checkLicense(manifest, license, set)
  const { view, sample } = checkView(opened, manifest, collector !== undefined, set)
  checkPermissions(manifest, context, set)

  return done({ manifest, view, sample, collector, readme, license })
}

type Set = (id: string, result: CheckResult, note?: string) => void

function checkManifest(opened: OpenedPackage, context: CheckContext, set: Set) {
  const json = parseJson(readText(opened, 'manifest.json'))
  if (!json.ok) {
    set('manifest', 'fail', `manifest.json isn't valid JSON: ${json.error}`)
    return undefined
  }
  const parsed = manifestSchema.safeParse(json.value)
  if (!parsed.success) {
    set('manifest', 'fail', `manifest.json: ${issues(parsed.error)}`)
    return undefined
  }
  const manifest = parsed.data
  const { uploader, existing } = context
  if (reservedIds.includes(manifest.id) && !uploader.official) {
    set('manifest', 'fail', `The id ${manifest.id} is reserved for ShiftPane's own widgets.`)
  } else if (existing && existing.ownerLogin !== uploader.login) {
    set('manifest', 'fail', `The id ${manifest.id} belongs to another author. Pick another id.`)
  } else if (manifest.author !== uploader.login) {
    set('manifest', 'fail', `"author" has to be your GitHub login, ${uploader.login}.`)
  } else {
    set('manifest', 'pass')
  }
  return manifest
}

function checkVersion(manifest: Manifest, context: CheckContext, set: Set) {
  const others = (context.existing?.versions ?? []).filter((v) => v.status !== 'rejected')
  if (others.some((v) => v.version === manifest.version)) {
    set('version', 'fail', `${manifest.version} is already uploaded. Raise the version.`)
    return
  }
  const highest = others
    .map((v) => v.version)
    .sort(compareVersions)
    .at(-1)
  if (highest && compareVersions(manifest.version, highest) <= 0) {
    set('version', 'fail', `${manifest.version} has to be higher than ${highest}.`)
    return
  }
  set('version', 'pass')
}

function checkLicense(manifest: Manifest, license: string, set: Set) {
  if (!osiLicenses.includes(manifest.license)) {
    set(
      'license',
      'fail',
      `${manifest.license} isn't an OSI-approved SPDX id. Use one such as MIT or Apache-2.0.`,
    )
  } else if (license.trim().length === 0) {
    set('license', 'fail', 'LICENSE is empty.')
  } else {
    set('license', 'pass')
  }
}

function checkView(opened: OpenedPackage, manifest: Manifest, hasCollector: boolean, set: Set) {
  const sampleJson = parseJson(readText(opened, 'sample.json'))
  const sampleParsed = sampleJson.ok ? sampleSchema.safeParse(sampleJson.value) : undefined
  if (!sampleJson.ok || !sampleParsed?.success) {
    set(
      'view',
      'fail',
      "sample.json has to be a JSON object: an example of the collector's output.",
    )
    return {}
  }
  const sample = sampleParsed.data
  const viewJson = parseJson(readText(opened, 'view.json'))
  if (!viewJson.ok) {
    set('view', 'fail', `view.json isn't valid JSON: ${viewJson.error}`)
    return { sample }
  }
  const parsed = widgetViewSchema.safeParse(viewJson.value)
  if (!parsed.success) {
    set('view', 'fail', `view.json: ${issues(parsed.error)}`)
    return { sample }
  }
  const view = parsed.data

  const problems: string[] = []
  for (const size of Object.keys(view)) {
    if (!(manifest.sizes as string[]).includes(size)) {
      problems.push(`view.json has a ${size} tree, but the manifest doesn't list ${size}.`)
    }
  }
  for (const size of manifest.sizes) {
    if (!view[size]) problems.push(`The manifest lists ${size}, but view.json has no tree for it.`)
  }

  const declared = new Set<string>(manifest.permissions.sources)
  const actions = new Set<string>(manifest.permissions.actions)
  const configKeys = new Set(manifest.config.map((field) => field.key))
  let nodes = 0
  let deepest = 0
  const visit = (node: ViewNode, depth: number) => {
    nodes++
    deepest = Math.max(deepest, depth)
    const texts = textsOf(node)
    const binds = [
      ...('bind' in node && node.bind ? [node.bind] : []),
      ...texts.flatMap(placeholderBindings),
    ]
    for (const bind of binds) {
      if (bind.startsWith('@')) {
        const name = bind.slice(1).split('/')[0] ?? ''
        if (!(name in sources)) problems.push(`${bind}: there's no ${name} source.`)
        else if (!declared.has(name)) {
          problems.push(`${bind} reads the ${name} source, which permissions.sources doesn't list.`)
        }
      } else if (!hasCollector) {
        problems.push(`${bind} reads the collector's output, but the package has no collector.js.`)
      } else if (pointer(sample, bind) === undefined) {
        problems.push(`${bind} isn't in sample.json.`)
      }
    }
    if (node.type === 'button' && !actions.has(node.action)) {
      problems.push(`A button presses ${node.action}, which permissions.actions doesn't list.`)
    }
    for (const key of texts.flatMap(placeholderConfigKeys)) {
      if (!configKeys.has(key)) problems.push(`{config.${key}} isn't a config field.`)
    }
    if ('children' in node) for (const child of node.children) visit(child, depth + 1)
  }
  for (const tree of Object.values(view)) if (tree) visit(tree, 1)
  if (deepest > MAX_VIEW_DEPTH)
    problems.push(`The view nests ${deepest} deep; the limit is ${MAX_VIEW_DEPTH}.`)
  if (nodes > MAX_VIEW_NODES)
    problems.push(`The view has ${nodes} parts; the limit is ${MAX_VIEW_NODES}.`)

  const unique = [...new Set(problems)]
  if (unique.length > 0) set('view', 'fail', summarize(unique))
  else set('view', 'pass')
  return { view, sample }
}

type JsNode = { type: string; [key: string]: unknown }

function checkCollector(collector: string | undefined, set: Set): JsNode | undefined {
  if (collector === undefined) {
    set('collector', 'pass')
    return undefined
  }
  let ast: JsNode
  try {
    ast = parseJs(collector, { ecmaVersion: 'latest', sourceType: 'module' }) as unknown as JsNode
  } catch (error) {
    set('collector', 'fail', `collector.js doesn't parse: ${(error as Error).message}`)
    return undefined
  }
  const problems: string[] = []
  let hasDefault = false
  walk(ast, (node) => {
    if (node.type === 'ImportDeclaration') {
      const source = (node.source as { value: unknown }).value
      const specifiers = node.specifiers as { type: string; imported?: { name?: string } }[]
      const onlyDefine = specifiers.every(
        (s) => s.type === 'ImportSpecifier' && s.imported?.name === 'defineCollector',
      )
      if (source !== '@shiftpane/widget-sdk' || !onlyDefine) {
        problems.push(
          `It imports from ${String(source)}. Only defineCollector from @shiftpane/widget-sdk is provided; bundle anything else into collector.js.`,
        )
      }
    } else if (node.type === 'ImportExpression') {
      problems.push('It loads code with import(); everything it runs has to be in collector.js.')
    } else if (node.type === 'ExportDefaultDeclaration') {
      hasDefault = true
    }
  })
  if (!hasDefault) problems.push('It needs a default export: export default defineCollector(...).')
  if (problems.length > 0) set('collector', 'fail', summarize([...new Set(problems)]))
  else set('collector', 'pass')
  return ast
}

function checkCredentials(opened: OpenedPackage, set: Set) {
  const found: string[] = []
  for (const name of ['manifest.json', 'view.json', 'sample.json', 'collector.js', 'README.md']) {
    const text = readText(opened, name)
    if (text === undefined) continue
    for (const kind of findCredentials(text))
      found.push(`${name} contains what looks like ${kind}.`)
  }
  if (found.length > 0) {
    set('credentials', 'fail', `${summarize(found)} Remove it, and revoke it if it's real.`)
  } else {
    set('credentials', 'pass')
  }
}

function checkObfuscation(collector: string | undefined, ast: JsNode | undefined, set: Set) {
  if (collector === undefined) {
    set('obfuscation', 'pass')
    return
  }
  const notes: string[] = []
  const lines = collector.split('\n')
  const longest = lines.reduce(
    (best, line, index) => (line.length > best.length ? { length: line.length, index } : best),
    { length: 0, index: 0 },
  )
  if (longest.length > LONG_LINE) {
    notes.push(
      `Line ${longest.index + 1} is ${longest.length.toLocaleString('en-US')} characters long.`,
    )
  }
  if (ast) {
    walk(ast, (node) => {
      const callee = node.callee as JsNode | undefined
      const name = callee?.type === 'Identifier' ? (callee.name as string) : undefined
      if (
        (node.type === 'CallExpression' || node.type === 'NewExpression') &&
        name === 'Function'
      ) {
        notes.push('It builds code from a string with Function.')
      }
      if (node.type === 'CallExpression' && name === 'eval') notes.push('It calls eval.')
      if (node.type === 'Literal' && typeof node.value === 'string') {
        const value = node.value
        if (value.length > 256 && entropy(value) > 4.8) {
          notes.push(`A ${value.length.toLocaleString('en-US')}-character string looks encoded.`)
        }
      }
    })
  }
  const unique = [...new Set(notes)]
  if (unique.length > 0) set('obfuscation', 'flag', summarize(unique))
  else set('obfuscation', 'pass')
}

function checkAccount(context: CheckContext, set: Set) {
  const { uploader, now = new Date() } = context
  if (uploader.official) {
    set('account', 'pass')
    return
  }
  if (!uploader.githubCreatedAt) {
    set('account', 'flag', "The GitHub account's age is unknown.")
    return
  }
  const days = Math.floor((now.getTime() - uploader.githubCreatedAt.getTime()) / 86_400_000)
  if (days < 30) set('account', 'flag', `The GitHub account is ${days} days old.`)
  else set('account', 'pass')
}

function checkPermissions(manifest: Manifest, context: CheckContext, set: Set) {
  const { permissions } = manifest

  if (permissions.secrets.length === 0 || permissions.network.length === 0) set('secrets', 'pass')
  else {
    const notes: string[] = []
    const services = permissions.secrets.map((name) => ({ name, words: secretService(name) }))
    for (const { name, words } of services) {
      if (!words) notes.push(`Can't tell which service issues ${name}.`)
    }
    const known = services.flatMap(({ words }) => words ?? [])
    for (const host of permissions.network) {
      if (!hostBelongsTo(host, known)) {
        notes.push(
          `${permissions.secrets.join(', ')} could be sent to ${host}, which doesn't look like it belongs to the same service.`,
        )
      }
    }
    if (notes.length > 0) set('secrets', 'flag', summarize(notes))
    else set('secrets', 'pass')
  }

  if (canSendOffPc(permissions)) {
    const reveals = permissions.sources.filter((name: SourceName) => sources[name].asks)
    const reach = [...permissions.network, ...permissions.local]
    set(
      'flow',
      'flag',
      `Reads ${reveals.join(', ')}, and can reach ${reach.join(', ')}: what it reads could leave the PC.`,
    )
  } else {
    set('flow', 'pass')
  }

  if (permissions.local.length > 0) {
    const wildcard = permissions.local.filter((hostPort) => hostPort.startsWith('0.0.0.0:'))
    set(
      'local',
      'flag',
      `Can reach ${permissions.local.join(', ')}.${wildcard.length > 0 ? " 0.0.0.0 isn't an address to connect to." : ''}`,
    )
  } else {
    set('local', 'pass')
  }

  const trackers = permissions.network.filter(isTracker)
  if (trackers.length > 0) set('trackers', 'flag', `${trackers.join(', ')} tracks people.`)
  else set('trackers', 'pass')

  const previous = (context.existing?.versions ?? [])
    .filter((v) => v.status === 'approved')
    .sort((a, b) => compareVersions(a.version, b.version))
    .at(-1)
  const added = previous ? addedPermissions(previous.permissions, permissions) : []
  if (added.length > 0) {
    set(
      'added',
      'flag',
      `Since ${previous?.version}: ${added.map((line) => line.text).join('; ')}.`,
    )
  } else {
    set('added', 'pass')
  }
}

function walk(node: JsNode, visit: (node: JsNode) => void) {
  visit(node)
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      for (const child of value) if (isNode(child)) walk(child, visit)
    } else if (isNode(value)) {
      walk(value, visit)
    }
  }
}

const isNode = (value: unknown): value is JsNode =>
  isRecord(value) && typeof (value as { type?: unknown }).type === 'string'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

function parseJson(
  text: string | undefined,
): { ok: true; value: unknown } | { ok: false; error: string } {
  if (text === undefined) return { ok: false, error: 'the file is missing' }
  try {
    return { ok: true, value: JSON.parse(text) }
  } catch (error) {
    return { ok: false, error: (error as Error).message }
  }
}

/** The first few zod issues as `path: message`. */
function issues(error: z.ZodError): string {
  return summarize(
    error.issues.map((issue) =>
      issue.path.length > 0 ? `${issue.path.join('.')}: ${issue.message}` : issue.message,
    ),
  )
}

/** At most four notes, and how many more there are. */
function summarize(notes: string[]): string {
  const shown = notes.slice(0, 4).map((note) => (/[.!?]$/.test(note) ? note : `${note}.`))
  const more = notes.length - shown.length
  return more > 0 ? `${shown.join(' ')} And ${more} more.` : shown.join(' ')
}
