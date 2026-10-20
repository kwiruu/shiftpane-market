import { serve } from '@hono/node-server'

import { createApp } from './app.ts'
import { loadConfig } from './config.ts'
import { openDeps } from './deps.ts'

const config = loadConfig()
const { deps, close } = await openDeps(config)
const server = serve({ fetch: createApp(deps).fetch, port: config.port }, (info) => {
  console.info(`API on http://localhost:${info.port}/api/v1`)
})

// Heroku sends SIGTERM on every restart and deploy, then waits 30 seconds.
const shutdown = () => {
  server.close(() => {
    close().finally(() => process.exit(0))
  })
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
