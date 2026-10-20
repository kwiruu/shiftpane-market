import { defineConfig } from 'drizzle-kit'

// `pnpm --filter @shiftpane/db generate` writes a migration for each change to the schema.
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema.ts',
  out: './migrations',
})
