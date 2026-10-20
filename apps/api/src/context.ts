import type { Db, users } from '@shiftpane/db'
import type { Storage } from '@shiftpane/storage'

import type { Config } from './config.ts'
import type { GitHub } from './github.ts'

export type User = typeof users.$inferSelect

/** What the routes work with. The tests build these around PGlite, files and a fake GitHub. */
export interface Deps {
  db: Db
  storage: Storage
  config: Config
  github?: GitHub
  now?: () => Date
}

export type AppEnv = {
  Variables: {
    user: User | null
    /** How the request signed in: the site's cookie, or a device token from the app or CLI. */
    via: 'cookie' | 'bearer' | null
  }
}
