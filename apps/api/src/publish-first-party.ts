import { existsSync } from 'node:fs'

import { loadConfig } from './config.ts'
import { openDeps } from './deps.ts'
import { publishFirstParty } from './first-party.ts'

// `node dist/publish-first-party.js` on Heroku (the deploy ships first-party/ beside dist/), or
// `pnpm --filter @shiftpane/api first-party` locally.
const dir = process.argv[2] ?? (existsSync('first-party') ? 'first-party' : '../../first-party')
const { deps, close } = await openDeps(loadConfig())
try {
  const published = await publishFirstParty(deps, dir)
  console.info(
    published.length > 0 ? `Published ${published.join(', ')}` : 'Nothing new to publish.',
  )
} finally {
  await close()
}
