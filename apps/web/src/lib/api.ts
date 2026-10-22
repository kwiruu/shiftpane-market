import type {
  CheckReport,
  Manifest,
  Permissions,
  ReviewStatus,
  WidgetView,
} from '@shiftpane/format'
import { useEffect, useState } from 'react'

/**
 * The registry API as the browser sees it: `/api/v1` on this origin, which the site rewrites to
 * the API (next.config.ts), so the session cookie is first-party and there's no CORS. The pages
 * that need an account read through these from client components; the gallery reads on the
 * server (registry/gallery.ts).
 */

export interface Me {
  login: string
  name: string | null
  avatarUrl: string | null
  role: 'author' | 'reviewer' | 'admin'
}

export const isReviewer = (me: Me) => me.role === 'reviewer' || me.role === 'admin'

/** One uploaded version on its author's dashboard. Dates are calendar days. */
export interface Submission {
  id: string
  widgetId: string
  name: string
  icon: string
  version: string
  submittedAt: string
  status: ReviewStatus
  permissions: Permissions
  notes: string
  report: CheckReport
  reviewerNote?: string
  yankReason?: string
}

/** A version as the review pages read it. Dates are timestamps. */
export interface VersionRecord {
  id: string
  widgetId: string
  version: string
  status: ReviewStatus
  manifest: Manifest
  permissions: Permissions
  files: {
    view: WidgetView
    sample: Record<string, unknown>
    collector?: string
    readme: string
    license: string
  }
  sha256: string
  size: number
  notes: string
  report: CheckReport
  submittedAt: string
  publishedAt: string | null
  yankReason: string | null
}

interface WidgetSummary {
  widgetName: string
  icon: string
  widgetStatus: 'live' | 'yanked'
}

export interface QueueEntry extends WidgetSummary {
  version: VersionRecord
  author: string
}

export interface Decision extends WidgetSummary {
  id: string
  version: string
  status: ReviewStatus
  decidedAt: string
}

export interface VersionDetail extends QueueEntry {
  /** The live version, to compare permissions with. */
  previous: VersionRecord | null
}

export type ReportReason = 'broken' | 'misleading' | 'privacy' | 'malware' | 'policy'

export interface Report {
  id: string
  widgetId: string
  widgetName: string
  version: string | null
  reporter: string | null
  reason: ReportReason
  body: string
  status: 'open' | 'resolved'
  createdAt: string
}

export class ApiError extends Error {
  readonly status: number
  /** The whole answer, for the ones that carry more than a message (a failed upload's report). */
  readonly body: unknown

  constructor(status: number, message: string, body: unknown) {
    super(message)
    this.status = status
    this.body = body
  }
}

/** Sends JSON (`json`) or a form (`form`); answers the parsed body, or throws an ApiError. */
export async function api<T>(
  path: string,
  init: { method?: string; json?: unknown; form?: FormData } = {},
): Promise<T> {
  const response = await fetch(`/api/v1${path}`, {
    method: init.method ?? (init.json !== undefined || init.form ? 'POST' : 'GET'),
    headers: init.json !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: init.json !== undefined ? JSON.stringify(init.json) : init.form,
    credentials: 'same-origin',
  }).catch(() => {
    throw new ApiError(0, "Couldn't reach ShiftPane. Check your connection and try again.", null)
  })
  if (response.status === 204) return undefined as T
  const body: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const message =
      body && typeof body === 'object' && 'error' in body && typeof body.error === 'string'
        ? body.error
        : `Something went wrong (${response.status}).`
    throw new ApiError(response.status, message, body)
  }
  return body as T
}

const asApiError = (error: unknown) =>
  error instanceof ApiError ? error : new ApiError(0, 'Something went wrong.', null)

/** Reads `path` once mounted (none while it's null); `reload` reads it again. */
export function useApi<T>(path: string | null) {
  const [state, setState] = useState<{ data?: T; error?: ApiError; loading: boolean }>({
    loading: path !== null,
  })
  const [round, setRound] = useState(0)
  // biome-ignore lint/correctness/useExhaustiveDependencies: `round` is how reload asks again
  useEffect(() => {
    if (path === null) return
    let current = true
    setState((previous) => ({ ...previous, loading: true }))
    api<T>(path).then(
      (data) => current && setState({ data, loading: false }),
      (error: unknown) => current && setState({ error: asApiError(error), loading: false }),
    )
    return () => {
      current = false
    }
  }, [path, round])
  return { ...state, reload: () => setRound((n) => n + 1) }
}

// The API sets this beside the session cookie, readable here, so pages ask who's signed in only
// when someone might be (see SIGNED_IN_COOKIE in apps/api/src/auth.ts).
const HINT = 'sp_signed_in'
const hasHint = () => document.cookie.split('; ').some((pair) => pair.startsWith(`${HINT}=`))
const clearHint = () => {
  // biome-ignore lint/suspicious/noDocumentCookie: the Cookie Store API isn't in every browser yet
  document.cookie = `${HINT}=; Max-Age=0; Path=/`
}

let me: Promise<Me | null> | undefined

/** Who's signed in, asked once per page load and shared by every component that wants it. */
function loadMe(): Promise<Me | null> {
  if (!hasHint()) return Promise.resolve(null)
  me ??= api<{ user: Me }>('/me').then(
    ({ user }) => user,
    (error: unknown) => {
      if (error instanceof ApiError && error.status === 401) clearHint()
      return null
    },
  )
  return me
}

export type Account =
  | { status: 'loading' }
  | { status: 'signed-out' }
  | { status: 'signed-in'; me: Me }

/** The signed-in account. `enabled` is false where the site runs without the API. */
export function useAccount(enabled = true): Account {
  const [account, setAccount] = useState<Account>({ status: enabled ? 'loading' : 'signed-out' })
  useEffect(() => {
    if (!enabled) return
    let current = true
    loadMe().then((user) => {
      if (current) setAccount(user ? { status: 'signed-in', me: user } : { status: 'signed-out' })
    })
    return () => {
      current = false
    }
  }, [enabled])
  return account
}

export async function signOut() {
  await api('/auth/logout', { method: 'POST' }).catch(() => {})
  clearHint()
  window.location.reload()
}

/** GitHub sign-in, coming back to `next` (a path on this site). */
export const signInHref = (next: string) => `/api/v1/auth/github?next=${encodeURIComponent(next)}`

/**
 * `next dev` only: sign in as any login, no GitHub (`devSignIn` in apps/api/src/config.ts; the
 * API refuses it anywhere but a local site).
 */
export const devSignIn = process.env.NODE_ENV === 'development'
