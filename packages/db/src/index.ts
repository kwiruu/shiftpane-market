import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'

import type { ExtractTablesWithRelations } from 'drizzle-orm'
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core'

import * as schema from './schema.ts'

export * from './schema.ts'
export { schema }

export type Db = PgDatabase<
  PgQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>

export interface Connection {
  db: Db
  close(): Promise<void>
}

/**
 * The SQL migrations drizzle-kit writes. In the API's bundle this file is `dist/server.js`, and the
 * deploy puts the folder beside `dist`, so the same relative path works in both.
 */
export const migrationsFolder = join(import.meta.dirname, '..', 'migrations')

/**
 * Opens the database a URL names: `postgres://…` for Postgres (Heroku's `DATABASE_URL`),
 * `pglite:memory` for an in-memory PGlite, and `pglite:<dir>` for one kept on disk. PGlite is how
 * local dev and the tests run without Docker; production never loads it.
 */
export async function connect(url: string): Promise<Connection> {
  if (url.startsWith('pglite:')) {
    const { PGlite } = await import('@electric-sql/pglite')
    const { drizzle } = await import('drizzle-orm/pglite')
    const target = url.slice('pglite:'.length)
    if (target !== 'memory') await mkdir(target, { recursive: true })
    const client = new PGlite(target === 'memory' ? undefined : target)
    return { db: drizzle(client, { schema }) as unknown as Db, close: () => client.close() }
  }
  const { Pool } = await import('pg')
  const { drizzle } = await import('drizzle-orm/node-postgres')
  const local = /@(localhost|127\.0\.0\.1)(:\d+)?\//.test(url)
  const pool = new Pool({
    connectionString: url,
    // Essential-0 allows 20 connections across the dyno, the release phase and any one-off dyno.
    max: 5,
    // Heroku Postgres requires TLS, with a certificate Node can't verify against a known CA.
    ssl: local ? false : { rejectUnauthorized: false },
  })
  return { db: drizzle(pool, { schema }) as unknown as Db, close: () => pool.end() }
}

/** Brings the schema up to date. Heroku's release phase runs this before a new version starts. */
export async function migrate(url: string, folder = migrationsFolder): Promise<void> {
  if (url.startsWith('pglite:')) throw new Error('Use migrateDb for PGlite')
  const { db, close } = await connect(url)
  try {
    await migrateDb(db, url, folder)
  } finally {
    await close()
  }
}

/** Runs the migrations on an open connection; `url` says which driver it is. */
export async function migrateDb(db: Db, url: string, folder = migrationsFolder): Promise<void> {
  if (url.startsWith('pglite:')) {
    const { migrate: run } = await import('drizzle-orm/pglite/migrator')
    // biome-ignore lint/suspicious/noExplicitAny: the migrator wants its own driver's type
    await run(db as any, { migrationsFolder: folder })
  } else {
    const { migrate: run } = await import('drizzle-orm/node-postgres/migrator')
    // biome-ignore lint/suspicious/noExplicitAny: the migrator wants its own driver's type
    await run(db as any, { migrationsFolder: folder })
  }
}
