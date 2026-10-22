import { loadConfig } from './config.ts'
import { openDeps } from './deps.ts'
import { widgetOwner, yank } from './registry.ts'

// Takes a whole widget down, as /admin's "Take it down" does: every live version is yanked, the
// index and revoked.json are signed again, and the app turns off copies people have, showing them
// the reason. On Heroku:
//   heroku run --app shiftpane-api -- node dist/yank-widget.js <widget id> "<reason>"
const [id, reason] = process.argv.slice(2)
if (!id || !reason?.trim()) {
  console.error('Usage: node dist/yank-widget.js <widget id> "<reason, shown in the app>"')
  process.exit(1)
}
const { deps, close } = await openDeps(loadConfig())
try {
  if ((await widgetOwner(deps, id)) === undefined) throw new Error(`There is no widget "${id}".`)
  const versions = await yank(deps, id, reason, { wholeWidget: true })
  console.info(
    `Took ${id} down${versions.length > 0 ? ` (${versions.join(', ')})` : ''}; the index and revoked.json are republished.`,
  )
} finally {
  await close()
}
