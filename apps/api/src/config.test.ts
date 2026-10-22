import { describe, expect, it } from 'vitest'

import { loadConfig } from './config.ts'

describe('loadConfig', () => {
  it('runs locally with nothing set', () => {
    const config = loadConfig({})
    expect(config).toMatchObject({
      production: false,
      databaseUrl: 'pglite:.data/db',
      siteOrigin: 'http://localhost:3000',
      registryUrl: 'http://localhost:8787/registry',
      github: undefined,
    })
    expect(config.signingKey).toBeTruthy()
  })

  it('refuses to start in production without what it needs', () => {
    expect(() => loadConfig({ NODE_ENV: 'production' })).toThrow('SIGNING_KEY')
    const almost = {
      NODE_ENV: 'production',
      SIGNING_KEY: 'k',
      DATABASE_URL: 'postgres://x',
      SITE_ORIGIN: 'https://s',
      REGISTRY_URL: 'https://s/registry',
    }
    expect(() => loadConfig(almost)).toThrow('BLOB_READ_WRITE_TOKEN')
  })

  it('turns on sign-in only with both GitHub values, and lowercases admins', () => {
    expect(loadConfig({ GITHUB_CLIENT_ID: 'id' }).github).toBeUndefined()
    const config = loadConfig({
      GITHUB_CLIENT_ID: 'id',
      GITHUB_CLIENT_SECRET: 's',
      ADMIN_LOGINS: 'Kwiruu, mona,',
    })
    expect(config.github).toEqual({ clientId: 'id', clientSecret: 's' })
    expect(config.adminLogins).toEqual(['kwiruu', 'mona'])
  })

  it('allows local sign-in only for a site on this machine, never in production', () => {
    expect(loadConfig({}).devSignIn).toBe(true)
    expect(loadConfig({ SITE_ORIGIN: 'http://127.0.0.1:3000' }).devSignIn).toBe(true)
    expect(loadConfig({ SITE_ORIGIN: 'https://shiftpane.vercel.app' }).devSignIn).toBe(false)
    expect(loadConfig({ SITE_ORIGIN: 'http://localhost.evil.example' }).devSignIn).toBe(false)
    const production = loadConfig({
      NODE_ENV: 'production',
      SIGNING_KEY: 'k',
      DATABASE_URL: 'postgres://x',
      SITE_ORIGIN: 'http://localhost:3000',
      REGISTRY_URL: 'https://s/registry',
      BLOB_READ_WRITE_TOKEN: 't',
    })
    expect(production.devSignIn).toBe(false)
  })
})
