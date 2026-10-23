# GitHub contributions 1.0.0 release

The package is ready under `first-party/github-contributions`. The shared renderer and view contract live in the adjacent ShiftPane repository and have been synced into `vendor/shiftpane`.

## Compatibility and release order

1. Merge the contribution-calendar app changes. The desktop, SDK, runtime, and CLI are prepared as version 0.6.0. Preserve other widget work in that checkout.
2. Sign in to npm, then build and publish `@shiftpane/widget-sdk`, `@shiftpane/widget-runtime`, and `shiftpane-widget` in that order from their package folders. The CLI needs rebuilding against the new SDK so validation recognizes `contribution-calendar`.
3. Release the compatible desktop app as v0.6.0 through `.github/workflows/release.yml`. Its workflow creates a draft; check the installers and publish the release before making this widget available.
4. Deploy the updated marketplace renderer and API checks. The production first-party command is `node dist/publish-first-party.js` in the API deployment; use the existing deployment credentials and signing key. The local equivalent uses the source script and development storage, not production.
5. Verify the production signed index includes `github-contributions@1.0.0` with `minAppVersion: 0.6.0`, then install through the listing on a released compatible app. Do not lower the minimum to 0.5.0.

## View contract

The new node is `{ "type": "contribution-calendar", "bind": "/calendar", "weeks": 26, "split": false }`. `weeks` is an optional integer from 1 to 54 (default 54); `split` defaults to false. The binding resolves to `{ startDate, endDate, days }`, where dates are real ISO `YYYY-MM-DD` calendar dates and each day is `{ date, count, level }` with a nonnegative integer count and integer level 0–4. The renderer bounds input at 378 entries and 54 weeks, ignores invalid entries, and computes its total from visible days. `split` divides weeks chronologically into two stacked grids.

## Verification

The package is covered by marketplace package checks, collector fixtures, preview/source parity tests, renderer date/layout tests, signed first-party pipeline tests, and compatible/older app installation tests. A live sandbox run against GitHub succeeded with 366 days and roughly 15.5 KB of normalized data. The preview uses fictional sample activity.

At implementation time, npm returned E401 for `npm whoami`. No production app, npm package, or widget release has been published by this change. Complete authentication and the ordered release steps above before claiming public availability.

