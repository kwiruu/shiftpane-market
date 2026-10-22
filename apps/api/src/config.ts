import { generateKeyPair } from '@shiftpane/index'

/**
 * Everything the API reads from its environment. Heroku sets `PORT` and `DATABASE_URL`; the rest are
 * config vars (see README "Deploying the API"). Locally every one has a default, so `pnpm dev` runs
 * with nothing set: PGlite on disk, files under `.data/registry`, and a throwaway signing key.
 */
export interface Config {
  port: number
  production: boolean
  databaseUrl: string
  /** The site's origin. Sign-in redirects there, and cookie-authenticated writes must come from it. */
  siteOrigin: string
  /** Where the app fetches the registry's files: the site's `/registry` path in production. */
  registryUrl: string
  /** Vercel Blob's read-write token; without it files go to `.data/registry`. */
  blobToken?: string
  /** Base64 PKCS#8 Ed25519 key that signs index.json and revoked.json. */
  signingKey: string
  github?: { clientId: string; clientSecret: string }
  /** GitHub logins that become admins when they sign in. */
  adminLogins: string[]
  /**
   * Sign in as anyone, no GitHub, for trying the site locally as different people. Only outside
   * production, and only while the site is on this machine.
   */
  devSignIn: boolean
}

const localOrigin = /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const production = env.NODE_ENV === 'production'
  const port = Number(env.PORT ?? 8787)
  const required = (name: string, fallback: string) => {
    const value = env[name]
    if (value) return value
    if (production) throw new Error(`${name} is not set`)
    return fallback
  }

  let signingKey = env.SIGNING_KEY
  if (!signingKey) {
    if (production) throw new Error('SIGNING_KEY is not set')
    signingKey = generateKeyPair().privateKey
    console.warn('SIGNING_KEY is not set: signing with a throwaway key until the API restarts.')
  }

  const clientId = env.GITHUB_CLIENT_ID
  const clientSecret = env.GITHUB_CLIENT_SECRET
  const siteOrigin = required('SITE_ORIGIN', 'http://localhost:3000').replace(/\/$/, '')
  return {
    port,
    production,
    databaseUrl: required('DATABASE_URL', 'pglite:.data/db'),
    siteOrigin,
    registryUrl: required('REGISTRY_URL', `http://localhost:${port}/registry`).replace(/\/$/, ''),
    // A dyno's disk is wiped on every restart, so production has to store files in Blob.
    blobToken: production
      ? required('BLOB_READ_WRITE_TOKEN', '')
      : env.BLOB_READ_WRITE_TOKEN || undefined,
    signingKey,
    github: clientId && clientSecret ? { clientId, clientSecret } : undefined,
    adminLogins: (env.ADMIN_LOGINS ?? '')
      .split(',')
      .map((login) => login.trim().toLowerCase())
      .filter(Boolean),
    devSignIn: !production && localOrigin.test(siteOrigin),
  }
}
