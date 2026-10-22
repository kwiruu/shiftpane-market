# ShiftPane web

The website for [ShiftPane](https://github.com/kwiruu/shiftpane): its documentation, and the widget
gallery people publish to and install from. The plan it follows is
[marketplace-plan.md](marketplace-plan.md).

It looks like the [Dev Pane site](https://github.com/kwiruu/devpane-web-app) on purpose: the same
tokens, type, pills, definition cards and motion, described in
[apps/web/DESIGN.md](apps/web/DESIGN.md).

## Status

| Plan milestone | State |
| --- | --- |
| W1, docs site | Landing page and 20 docs pages, written from the ShiftPane README and the plan. Pages about features the app doesn't have yet say so. |
| W2, read-only gallery | Gallery home, search, widget pages with live previews, author pages. The six first-party widgets in `first-party/` are published through the API, which signs `index.json` and stores packages in Vercel Blob. |
| W3, uploads and review | GitHub sign-in, uploads with the automated checks, the author dashboard, the review queue with approve and reject, yanking, reports and takedowns, on the site and the API. |
| Deploy | Live: the site at [shiftpane.vercel.app](https://shiftpane.vercel.app) (Vercel project `shiftpane`, Blob store `shiftpane-registry`), the API on the Heroku app `shiftpane-api` with Postgres. See [Deploying](#deploying). |

## Run it

Requirements: Node 22.12+ and pnpm 10 (`corepack enable`).

```sh
pnpm install
pnpm dev          # the site on http://localhost:3000, the API on http://localhost:8787
```

The site shows the seed (`apps/web/src/lib/registry/seed.ts`) unless `SHIFTPANE_API_ORIGIN` is set.
To run it against the local API, publish the first-party widgets once, then start both:

```sh
pnpm --filter @shiftpane/api first-party        # PGlite allows one process: run it with the API stopped
SHIFTPANE_API_ORIGIN=http://localhost:8787 pnpm dev
```

The API keeps its database (PGlite) and files under `apps/api/.data`; delete the folder to start over.

**Trying it as different people.** Run against the local API as above and the sign-in prompts offer
a local test account under the GitHub button: type any login and pick a role (author, reviewer or
admin). Upload as `alice` (the manifest's `author` has to be `alice`), sign out, sign in as `keiru`
with the admin role, approve it at `/admin`, then sign back in as `alice` to see it live on
`/dashboard`. GitHub sign-in works locally too once `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`
are set for the API, from an OAuth app whose callback is
`http://localhost:3000/api/v1/auth/github/callback`. Test accounts exist only while the API runs
outside production for a site on localhost.

| Command | What it does |
| --- | --- |
| `pnpm dev` | The site and the API with reload |
| `pnpm build` | Production builds: the site prerenders every page, the API bundles into `apps/api/dist` |
| `pnpm lint` / `pnpm format` | Biome over the whole repo, without and with fixes |
| `pnpm typecheck` | Route types, then `tsc`, in every package |
| `pnpm test` | Vitest; the API's tests run the whole upload-to-index flow on PGlite |
| `pnpm --filter @shiftpane/db generate` | A migration for each change to `packages/db/src/schema.ts` |

## Layout

```text
apps/
  web/                    Next.js 16 on Vercel: landing, docs, gallery, upload, dashboard, review
    DESIGN.md             The design system: tokens (YAML) and rules (prose)
    src/app/              Routes
    src/content/docs/     One .mdx file per docs page; the sidebar order is src/lib/docs.ts
    src/components/
      site/               Header, footer, cursor chip, code blocks, definition cards, docs navigation
      home/               The landing page: hero devices, widget showcase, split view, spec cards
      widgets/            The preview renderer: view.json + sample.json drawn like the phone
      market/             Gallery tiles, search, permissions, source viewer, status badges
      account/            Sign-in, the upload panel, the dashboard and the review pages
      content/            Blocks the docs and READMEs render with
      ui/                 shadcn components, restyled to DESIGN.md
    src/lib/api.ts        The API from the browser: fetch helpers, the signed-in account, types
    src/lib/registry/     The gallery (gallery.ts: the API, or the seed) and helpers over it
  api/                    Hono on Heroku: sign-in, uploads, checks, review, publishing the index
    scripts/              build.ts bundles it; deploy.ts ships the bundle to Heroku
packages/
  format/                 The widget package format: types, zod schemas, sources, permission wording
  checks/                 Opens an uploaded zip and runs the automated checks
  index/                  Builds and Ed25519-signs index.json and revoked.json; keys.ts has the public key
  storage/                The registry's public files: the filesystem locally, Vercel Blob in production
  db/                     Drizzle schema and migrations; Postgres in production, PGlite locally
first-party/              The first-party widgets as package folders, and how the gallery shows them
```

## Deploying

**API (Heroku).** One Basic dyno and Heroku Postgres Essential-0, $12 a month, covered by the
Student Pack credit. Anything more is charged to the card on the account, so keep it to those two.

```sh
HEROKU_API_KEY=… HEROKU_APP=… pnpm --filter @shiftpane/api deploy:heroku
```

That bundles the API, uploads it with the migrations and `first-party/` through Heroku's Build API,
and Heroku's release phase runs the migrations before the new version starts. After adding or
changing a first-party widget (raise its version), run `node dist/publish-first-party.js` on a
one-off dyno.

| Config var | What it is |
| --- | --- |
| `DATABASE_URL` | Set by Heroku Postgres |
| `NODE_ENV` | `production` |
| `SITE_ORIGIN` | The site's origin. Sign-in returns there, and cookie-signed writes must come from it |
| `REGISTRY_URL` | The site's origin + `/registry`: the base of every package URL in the index |
| `BLOB_READ_WRITE_TOKEN` | The Vercel Blob store's read-write token |
| `SIGNING_KEY` | The Ed25519 private key that signs the index. Its public half is `packages/index/src/keys.ts` |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | The GitHub OAuth app. Sign-in answers 503 until both are set |
| `ADMIN_LOGINS` | GitHub logins that become admins when they sign in, comma-separated |

**Site (Vercel).** The project's root directory is `apps/web`.

| Environment variable | What it is |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | The site's address. Canonical URLs, the sitemap, `robots.txt` and the JSON-LD are built from it; on Vercel it falls back to the production URL |
| `SHIFTPANE_API_ORIGIN` | The Heroku app's URL. The site reads the gallery from it and proxies `/api/*` to it |
| `SHIFTPANE_REGISTRY_ORIGIN` | The Blob store's public URL. The site proxies `/registry/*` to it |

Before going public, read the [privacy](apps/web/src/content/docs/privacy.mdx) and
[content policy](apps/web/src/content/docs/content-policy.mdx) pages as the operator: they
describe what the plan intends, and you're the one making those promises.
