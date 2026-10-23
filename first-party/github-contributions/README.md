GitHub contributions as large green squares. Small shows 8 recent calendar weeks and medium shows 12, with no visible text. Large shows the trailing year in two stacked grids, with username, month labels, and total. Weeks run Sunday–Saturday; missing and future dates stay blank.

## Setup

1. Install the widget in ShiftPane 0.6.0 or later.
2. Enter your GitHub.com username in widget settings. Organizations and Enterprise servers are not supported.
3. Create a fine-grained personal access token in GitHub Settings → Developer settings → Personal access tokens. Public repository read access is included; do not grant write access for this widget. Follow GitHub's [GraphQL authentication guidance](https://docs.github.com/en/graphql/guides/forming-calls-with-graphql).
4. Add the token as **GITHUB_TOKEN** in this widget's Secrets settings on your PC. This is separate from signing in to the marketplace.

## What it shows

The calendar refreshes every 30 minutes while active. GitHub supplies the dates and five activity levels; the widget uses a fixed green palette. Dates are displayed as GitHub returns them, without shifting to the phone's timezone. Activity reflects what GitHub exposes to your token. Private contribution counts depend on GitHub profile visibility and token permissions; this widget never queries repository names or private contribution details.

If a refresh fails, existing data stays visible until a successful refresh. Missing or expired tokens, invalid usernames, restricted access, rate limits, and malformed responses produce concise errors in the app's existing collector diagnostics. Before the first successful load, the widget waits for data. Gallery previews use fictional, fixed sample activity; installed widgets never use that sample as real activity.

## Permissions

- **Can reach api.github.com** only, to read GitHub's contribution calendar using GraphQL.
- **Needs GITHUB_TOKEN.** ShiftPane encrypts it on your PC. It goes only to GitHub, never into the calendar data sent to the phone or marketplace.
- No PC data, local network access, or actions.

## Release compatibility

This package introduces the contribution-calendar view node and requires ShiftPane 0.6.0. Release the compatible app and SDK before publishing this widget through the first-party workflow. Version 0.5.0 cannot render it.
