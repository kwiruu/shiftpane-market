# ShiftPane Widget Marketplace: plan

A website and registry where people publish ShiftPane widgets and everyone else installs them from the desktop app.
This file is the brief for a new repository (`shiftpane-market`). It is written so a fresh session that has never
seen the ShiftPane repo can start from it.

## Decisions at a glance

| Question | Decision |
| --- | --- |
| Do we need a new site? | Yes: a website to browse and upload, and a small API the desktop app installs from. Installing happens in the desktop app, because the PC runs the widget's code. |
| Who controls what gets listed? | We do. Anyone signed in can upload; nothing is public until it passes automated checks and a human approves it. |
| Is that still open source? | Yes. Open source is about the code's license, not about who curates a store. The app, SDK and widget format stay MIT; every listed widget ships readable source under an OSI license; the app can sideload widgets from a folder, so the store is the default and not a lock-in. |
| Marketplace code: public or private? | Private while we build it (it holds moderation rules and the admin). We can open it later without changing anything else. |
| Money? | No payments. Free widgets only. |
| What can a community widget do? | v1: fetch JSON from the hosts it declares and render it with ShiftPane's own components. No custom HTML or JavaScript on the phone, no system access on the PC. |

## Context: ShiftPane and its widgets today

ShiftPane (github.com/kwiruu/shiftpane, MIT) turns a phone into a second monitor plus a live widget board.

- **Desktop app** (Electron): pairs with phones, serves the phone app, runs widget collectors on the PC.
- **Phone app** (PWA): shows the widget board. It only ever receives finished data from the PC.
- **`@shiftpane/widget-sdk`**: the widget contract. `manifest.json` schema (zod, with a generated JSON Schema) and
  `defineCollector`.
- **`@shiftpane/board`**: the React widget board and its parts (`Label`, `Value`, `Ring`, `Meter`, `HistoryBars`,
  `Sparkline`), shared by the phone and the desktop.

A widget has two halves:

1. A **collector** that runs on the PC on a timer and returns plain JSON. It gets a `fetch` limited to the hosts in
   `permissions.network`, the secrets in `permissions.secrets`, its config and an abort signal.
2. A **view** that renders that JSON on the phone.

The manifest today:

```jsonc
{
  "id": "github-stars",             // lowercase-kebab, max 64
  "name": "GitHub stars",
  "description": "Stars on one repository",
  "version": "1.0.0",               // semver
  "author": "kwiruu",
  "refreshSeconds": 300,            // omit for phone-only widgets
  "sizes": ["small", "medium"],
  "permissions": { "network": ["api.github.com"], "secrets": ["GITHUB_TOKEN"] },
  "config": [{ "key": "repo", "type": "string", "label": "Repository", "required": true }]
}
```

**The catch:** today every widget is built in. `WidgetKind` in `@shiftpane/protocol` is a fixed enum, the views are
hardcoded React components, and the collectors are hardcoded in the desktop main process. Before a marketplace is
useful, the app has to load and run a widget it did not ship with. That work is milestone M0 below and happens in the
ShiftPane repo, not in this one.

## How it works, end to end

```text
 author                         marketplace                                  user's PC                 phone
 ──────                         ───────────                                  ─────────                 ─────
 shiftpane-widget pack ──zip──▶ upload API ──▶ automated checks ──▶ review queue
                                                                     │ approve
                                                                     ▼
                                signed index.json + immutable package on CDN
                                                                     │
                                website (browse) ── "Install" deep link ──▶ desktop app
                                                                     │ verify signature + sha256
                                                                     │ show permissions, user accepts
                                                                     ▼
                                                    collector in a sandbox ── JSON ──▶ view.json rendered
                                                                                       with board parts
```

## Widget package format (v1)

A widget is a folder, packed into a deterministic zip.

```text
github-stars/
  manifest.json      required
  view.json          required: how the phone draws the data
  sample.json        required: an example of the collector's output; used for previews, review and the demo
  collector.js       optional: one ESM file, default export defineCollector(...); absent for phone-only widgets
  icon.png           optional: 256x256 PNG (no SVG: it can carry script)
  README.md          required
  LICENSE            required
  screenshots/*.png  optional
```

Rules: fixed file names, nothing else in the zip, total at most 1 MB, `collector.js` at most 256 KB and not minified.
The CLI bundles npm dependencies into `collector.js` as readable code, so reviewers read exactly what runs.

Manifest fields to add (in `packages/widget-sdk/src/manifest.ts`, ShiftPane repo):

| Field | Why |
| --- | --- |
| `license` | SPDX id, OSI-approved. Required to list. |
| `repository` | Optional https URL to the source repo. |
| `categories` | Fixed enum: `system`, `dev`, `productivity`, `media`, `finance`, `weather`, `fun`, `other`. |
| `minAppVersion` | Semver. The app hides widgets it cannot run. |

### The view: declarative JSON, not code

`view.json` is a tree of ShiftPane's own components bound to the collector's output by JSON Pointer, one tree per
supported size. The phone renders it with `@shiftpane/board`; no third-party code ever runs on the phone.

```json
{
  "small": {
    "type": "stack",
    "children": [
      { "type": "label", "text": "{config.repo}" },
      { "type": "value", "bind": "/stars", "format": "compact", "unit": "stars" },
      { "type": "sparkline", "bind": "/history" }
    ]
  }
}
```

v1 components: `stack`, `row`, `grid`, `label`, `text`, `value` (number formats), `ring`, `meter`, `history-bars`,
`sparkline`, `list` (title, subtitle, value per item), `icon` (a Solar icon name from `@shiftpane/ui`), `progress`.
No remote images in v1: an image URL would make the phone call out and leak its IP.

Why declarative: it is safe by construction, every widget matches the graphite look, it is easy for the local AI
widget generator to produce, and it validates against `sample.json` before anyone runs it. A sandboxed-iframe
"custom view" tier can come later, behind stricter review.

## Security model

The PC side is where the risk is: a collector is code from a stranger running on the user's machine.

**Collector sandbox** (`@shiftpane/widget-runtime`, new package in the ShiftPane repo)

- Runs in QuickJS compiled to WebAssembly (`quickjs-emscripten`), not in Node. No `require`, no filesystem, no
  process, no Electron. It is bundled by electron-vite, so the packaged app still ships no `node_modules`.
- Limits per run: 32 MB memory, 10 s wall clock (interrupt handler), output at most 64 KB of JSON, validated as JSON
  before it goes to the phone.
- `fetch` is a host function implemented by the desktop app:
  - host must match `permissions.network` (`isHostAllowed` already exists in the SDK);
  - https only;
  - resolve DNS first and refuse loopback, private, link-local and CGNAT addresses, so a widget cannot reach the
    user's router, LAN services or `localhost` (and DNS rebinding does not get around it);
  - response size cap (2 MB) and per-widget rate limit.
- Secrets live encrypted on the PC (Electron `safeStorage`) and are passed only to the widget that declared them.
- The same package is used by the desktop app, the CLI's `dev` command and the marketplace's check worker, so a
  widget behaves the same everywhere it runs.

**Install-time permissions.** Installing shows what the widget can do in plain words ("Can reach api.github.com.
Needs your GITHUB_TOKEN. Refreshes every 5 minutes."). An update that adds a host or a secret asks again; an update
that does not is applied silently.

**Signed distribution.**

- The registry signs `index.json` and `revoked.json` with an Ed25519 key (detached `.sig` files). The app ships the
  public key, plus a second "next" key so we can rotate.
- Each version in the index carries its package's sha256. Packages are immutable and content-addressed on the CDN.
- The app refuses a package whose hash or index signature does not check out. A compromised CDN cannot push code.

**Kill switch.** The app reads `revoked.json` at start and every 6 hours and disables any revoked widget version at
once, with the reason shown.

**Secret exfiltration** is the subtle case: a widget that declares `GITHUB_TOKEN` and also `evil.example` can send the
token there. Review rule: a widget with secrets may only declare hosts that belong to the service that issued them.
Automated checks flag any mismatch.

## Flows

**Author publishes**

1. `npx create-shiftpane-widget` scaffolds a folder; `shiftpane-widget dev` runs it against the local desktop app;
   `shiftpane-widget validate` runs the same checks the server runs; `shiftpane-widget pack` makes the zip.
2. Signs in to the site with GitHub, uploads the zip (later: `shiftpane-widget publish` with an API token, or
   "Share" straight from the desktop app's AI generator).
3. Sees the automated report at once; the version waits in the review queue.
4. Gets an email when it is approved or rejected, with the reviewer's note.

**Reviewer approves**

Admin queue shows the automated report, the permission list, a diff against the previous version, the collector
source, the rendered preview from `sample.json` and an AI summary. Approve signs and publishes; reject needs a note.

**User installs**

Browse in the desktop app's "Get widgets" page (reads the index directly), or on the website and click Install,
which opens `shiftpane://install/<id>`. The app downloads, verifies, shows permissions, installs to
`userData/widgets/<id>/<version>/`, and the widget appears in the layout editor's picker.

**Takedown**

Anyone can report a widget. An admin can yank one version or the whole widget; it lands in `revoked.json` and every
app disables it within 6 hours.

## Moderation

**Automated checks.** *Fail* blocks the upload; *flag* goes to the reviewer.

| Check | Result |
| --- | --- |
| Zip layout, file allowlist, size limits | fail |
| `manifest.json` parses with `@shiftpane/widget-sdk`; id not taken by another owner or reserved (`pc-stats`, `media`, `clock`, ...) | fail |
| Version is higher than the last published one | fail |
| `view.json` parses and every binding resolves against `sample.json` | fail |
| `license` is OSI-approved and `LICENSE` exists | fail |
| `collector.js` parses as one ESM module with no imports | fail |
| Minified or obfuscated code (long lines, entropy, `eval`, `Function`, `atob` of big blobs) | flag |
| Embedded credentials (secret-scanner patterns) | fail |
| Collector runs in the sandbox with the default config and returns JSON within limits (network mocked) | flag on error |
| Secrets declared together with hosts that do not belong to the secret's service | flag |
| Hosts on a tracking or analytics blocklist | flag |
| Permissions added since the previous version | flag, always human review |
| AI review (Claude, `claude-sonnet-5-5`): "what does this code do, and does it match the description and permissions?" | flag, advice only |

**Human review.** Every new widget and every version that changes permissions. Later, authors with a track record
can get a fast lane where versions without permission changes publish after automated checks.

**Content policy** (on the site, linked from upload): no obfuscated code, only the hosts the widget needs, secrets go
only to their issuer, no tracking or ads, no impersonating brands or other authors, nothing adult or hateful, an
OSI license, and we may remove anything at any time.

**Abuse limits.** Uploads per account per day, GitHub accounts younger than 30 days flagged, everything logged.

## Architecture and stack

Same tooling as ShiftPane so both repos feel the same: pnpm workspaces + Turborepo, TypeScript, Biome, Vitest, zod.

| Piece | Choice | Why |
| --- | --- | --- |
| Site + API | Next.js (App Router) on Vercel | One deploy for pages and API routes; preview deploys per PR |
| Database | Postgres (Neon) via Drizzle | Relational data, migrations in TS |
| Package storage | Cloudflare R2 behind `cdn.` subdomain | S3 API, free egress for downloads |
| Auth | Auth.js with GitHub | Authors are developers; GitHub gives a stable identity and an abuse signal |
| Check worker | Small Node service on Render or Fly, pulling jobs from a Postgres table (`FOR UPDATE SKIP LOCKED`) | Heavy checks (sandbox run, previews, AI review) do not fit in serverless functions; no queue service needed |
| Signing | Ed25519 key as a server secret, used only by the publish step | Small, fast, built into Node's `crypto` |
| Email | Resend | Approve and reject notices |

Shared code comes from the ShiftPane repo as npm packages: `@shiftpane/widget-sdk` (manifest and view schemas,
validators) and `@shiftpane/widget-runtime` (sandbox). Until they are published, vendor the SDK's `src/` into
`packages/vendor-sdk` with a CI job that fails when it drifts from the ShiftPane repo. (A pnpm git dependency,
`github:kwiruu/shiftpane#path:/packages/widget-sdk`, is tidier but may not resolve the SDK's `catalog:` versions
outside its own workspace; try it first.)

### Repository layout

```text
apps/
  web/          Next.js: gallery, widget pages, upload, author dashboard, admin, API routes
  worker/       Check worker: sandbox smoke run, previews, AI review, writes reports
packages/
  db/           Drizzle schema, migrations, queries
  checks/       Pure check functions (zip layout, manifest, view bindings, scanners); used by web, worker and tests
  index/        Builds, signs and verifies index.json and revoked.json; the verify half is what the app uses
  ui/           Site components (reuse ShiftPane's graphite tokens)
```

### Data model

```text
users        id, github_id, login, avatar, role (author | reviewer | admin), created_at, banned_at
widgets      id (the manifest id, unique), owner_id, name, summary, categories, status (live | yanked), created_at
versions     id, widget_id, version, manifest (jsonb), permissions (jsonb), sha256, size, storage_key,
             status (checking | in_review | approved | rejected | yanked), report (jsonb), submitted_at, published_at
reviews      id, version_id, reviewer_id, decision, note, created_at
reports      id, widget_id, version_id?, reporter_id?, reason, body, status, created_at
jobs         id, kind, version_id, state, attempts, run_after, error
downloads    widget_id, version, day, count          (aggregate only; no per-user data)
api_tokens   id, user_id, hash, name, last_used_at, revoked_at
```

### API

Public, cacheable, what the desktop app uses:

```text
GET  /v1/index.json                    every live widget and its versions; plus /v1/index.json.sig
GET  /v1/revoked.json                  yanked versions; plus .sig
GET  /v1/widgets/:id                   detail for the site and the app
GET  /v1/widgets/:id/:version/download counts the download, redirects to cdn.../<sha256>.zip
```

Authenticated:

```text
POST /v1/uploads                       multipart zip -> version in "checking"; returns the static check report
GET  /v1/me/widgets                    author dashboard data
POST /v1/widgets/:id/versions/:v/yank  owner or admin
POST /v1/reports                       anyone signed in
POST /v1/admin/versions/:id/approve    reviewer; signs and republishes the index
POST /v1/admin/versions/:id/reject     reviewer; note required
```

`index.json` entry:

```json
{
  "id": "github-stars",
  "name": "GitHub stars",
  "summary": "Stars on one repository",
  "author": { "login": "octocat" },
  "categories": ["dev"],
  "latest": "1.2.0",
  "versions": {
    "1.2.0": {
      "sha256": "…",
      "size": 18342,
      "url": "https://cdn.example/packages/….zip",
      "minAppVersion": "0.4.0",
      "permissions": { "network": ["api.github.com"], "secrets": ["GITHUB_TOKEN"] }
    }
  }
}
```

The app never sends anything to the marketplace except the download request. No telemetry.

### Site pages

Home (featured, new, categories) · search · widget page (README, permissions in plain words, screenshots, versions,
source viewer, Install button) · author profile · upload · author dashboard (versions, status, reports) · admin
review queue · admin reports · content policy · docs for authors (or link to the ShiftPane docs once they exist).

## Milestones

### M0: run third-party widgets (ShiftPane repo, prerequisite)

- Manifest additions above; `view.json` and `sample.json` schemas in `@shiftpane/widget-sdk`; regenerate the JSON
  Schemas.
- View renderer in `@shiftpane/board` built from the existing parts.
- Board protocol refers to installed widgets by id, not only the `WidgetKind` enum; the PC sends each installed
  widget's validated view to the phone.
- `@shiftpane/widget-runtime`: QuickJS sandbox with the guarded `fetch` and limits.
- Desktop: installed-widget store, permission prompt, secrets UI, sideload a folder in developer mode.
- Publish `@shiftpane/widget-sdk` and `@shiftpane/widget-runtime` to npm (they need a build step, unlike the
  internal packages); add `create-shiftpane-widget` and the `shiftpane-widget` CLI.

Done when: a widget folder that is not in the app (say GitHub stars) can be sideloaded, asks for its permissions,
fetches from its declared host only, and shows on a paired phone.

### M1: read-only gallery (this repo)

- Site with home, widget pages and search, seeded with 3 to 5 first-party widgets we wrote and published ourselves.
- `packages/index` builds and signs the index; packages on R2.
- Desktop "Get widgets" page and the `shiftpane://install` deep link, verifying signatures (ShiftPane repo).

Done when: a user installs a widget from the site into the desktop app and a tampered package or index is refused.
This can be built alongside M0 from the vendored SDK; only the last step needs M0.

### M2: uploads and review

- GitHub sign-in, upload, static checks in the API, check worker, review queue, approve and reject, emails,
  content policy page.

Done when: a stranger's upload goes through checks, waits for review, and once approved shows in the app.

### M3: updates and safety

- Versions and the permission diff, yank and `revoked.json`, reports, author dashboard, live previews on the site
  rendered from `sample.json`.

Done when: a yanked version is disabled in a running app within one refresh, and an update that adds a host asks the
user again.

### M4: growth

- API tokens and `shiftpane-widget publish`, "Share" from the desktop app's AI generator (OAuth device flow), download
  counts, collections, verified authors, trusted-author fast lane.

## Not in scope

Payments, ratings and comments (until there is enough traffic to moderate them), custom HTML or JS views on the
phone, widgets with system access (files, processes, the native helper), self-hosted registries (sideloading covers
the "no lock-in" need for now).

## Open questions

| Question | Recommendation |
| --- | --- |
| Name and domain | `widgets.shiftpane.dev` or similar, decided with the docs site |
| Same Vercel project as the future docs site? | Separate project, same domain family |
| Allow AI-generated widgets? | Yes, through the same review; label them "made with the generator" |
| Who reviews? | You, at first. Add reviewers by role when the queue grows |
| Open-source the marketplace code later? | Possible any time; nothing in the design depends on it being private |
| Update the ShiftPane README? | Yes: it says widgets are "submitted by pull request"; change to "published to the gallery" once M2 ships |

## Starting the cloud project

1. Create an empty GitHub repo, `kwiruu/shiftpane-market` (private).
2. Commit this file as `PLAN.md`.
3. Start a cloud session on that repo: "Read PLAN.md. Set up the monorepo and do M1, vendoring the widget SDK from the
   ShiftPane repo."
4. Run M0 in the ShiftPane repo in parallel.
