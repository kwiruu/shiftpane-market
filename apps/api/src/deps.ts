import { connect, migrateDb } from '@shiftpane/db'
import { BlobStorage, FsStorage } from '@shiftpane/storage'

import type { Config } from './config.ts'
import type { Deps } from './context.ts'
import { createGitHub } from './github.ts'

/**
 * Opens what the API runs on, from its config. Locally PGlite migrates itself on start; on Heroku the
 * release phase migrates before the dyno starts (see `migrate.ts`).
 */
export async function openDeps(config: Config) {
  const { db, close } = await connect(config.databaseUrl)
  if (config.databaseUrl.startsWith('pglite:')) await migrateDb(db, config.databaseUrl)
  const storage = config.blobToken
    ? new BlobStorage(config.blobToken, config.registryUrl)
    : new FsStorage('.data/registry', config.registryUrl)
  const github = config.github
    ? createGitHub(config.github.clientId, config.github.clientSecret)
    : undefined
  const deps: Deps = { db, storage, config, github }
  return { deps, close }
}
