import { migrate } from '@shiftpane/db'

// Heroku's release phase: runs once per deploy, before the new dyno takes traffic. A failure here
// stops the deploy and leaves the running version alone.
const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL is not set')
await migrate(url)
console.info('Migrations are up to date.')
