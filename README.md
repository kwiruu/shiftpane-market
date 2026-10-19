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
| W2, read-only gallery | Gallery home, search, widget pages with live previews, author pages, seeded with six first-party widgets in `apps/web/src/lib/registry/seed.ts`. The signed index and R2 aren't built. |
| W3, uploads and review | The upload page, author dashboard and review queue exist as pages, with sample data and their controls disabled. No API, sign-in or database yet. |
| Deploy | On hold until the Student Pack is approved. Everything runs locally. |

## Run it

Requirements: Node 22.12+ and pnpm 10 (`corepack enable`).

```sh
pnpm install
pnpm dev          # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `pnpm dev` | The site with hot reload |
| `pnpm build` | Production build: type checks and prerenders every page |
| `pnpm lint` / `pnpm format` | Biome over the whole repo, without and with fixes |
| `pnpm typecheck` | Route types, then `tsc` |
| `pnpm test` | Vitest |

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
      content/            Blocks the docs and READMEs render with
      ui/                 shadcn components, restyled to DESIGN.md
    src/lib/registry/     What the site knows about widgets: types, seed, sources, permissions,
                          view bindings, checks, sample submissions. The API replaces seed.ts.
```

The plan's other pieces (`apps/api`, `packages/db`, `packages/checks`, `packages/index`,
`packages/storage`) come with W3 and the signed index.

## Before publishing

- Set `NEXT_PUBLIC_SITE_URL` to the site's address. Canonical URLs, the sitemap, `robots.txt` and the
  JSON-LD are built from it; on Vercel it falls back to the production URL.
- Set `SHIFTPANE_API_ORIGIN` once the API is deployed. The site proxies `/api/*` to it, so the
  browser sees one origin.
- Read the [privacy](apps/web/src/content/docs/privacy.mdx) and
  [content policy](apps/web/src/content/docs/content-policy.mdx) pages as the operator: they
  describe what the plan intends, and you're the one making those promises.
