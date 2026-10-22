import { build } from 'esbuild'

/**
 * Bundles the API into `dist/`, with every dependency inside, so the dyno needs no node_modules.
 * PGlite is only for local dev and tests, so it stays out; splitting keeps the code that loads it in
 * its own chunk, which production never imports.
 */
export async function bundle() {
  await build({
    entryPoints: {
      server: 'src/server.ts',
      migrate: 'src/migrate.ts',
      'publish-first-party': 'src/publish-first-party.ts',
      'yank-widget': 'src/yank-widget.ts',
    },
    outdir: 'dist',
    bundle: true,
    splitting: true,
    format: 'esm',
    platform: 'node',
    target: 'node22',
    sourcemap: true,
    legalComments: 'none',
    external: [
      '@electric-sql/pglite',
      'drizzle-orm/pglite',
      'drizzle-orm/pglite/migrator',
      'pg-native',
    ],
    // pg is CommonJS and requires Node's built-ins; an ES module has no `require` of its own.
    banner: {
      js: "import { createRequire as __createRequire } from 'node:module'; const require = __createRequire(import.meta.url);",
    },
    logLevel: 'warning',
  })
}

if (import.meta.main) await bundle()
