# ShiftPane 0.7.0 release

## Included

- Built-in Time widget: focus sessions, short/long breaks, timer, and stopwatch. Timing state is saved per card on the viewing device; it is not synchronized between devices.
- Laptop Battery 1.0.0: black card with purple battery segments, charging indicator, and OS-provided remaining time. Requires app 0.7.0 and the battery source; no collector or network access.

GitHub Contributions, Weather, and Countdown already ship with app 0.6.0 support. Their minimum versions remain 0.6.0.

## Release order

1. Merge the app and marketplace 0.7.0 branches after CI passes.
2. Build and publish widget SDK, runtime, and CLI 0.7.0 in that order if publishing the authoring tools.
3. Tag the merged app commit v0.7.0 to build installers. Verify all platform builds and publish the generated draft GitHub Release.
4. Deploy the marketplace website and API with the synced renderer and updated first-party packages.
5. Run `heroku run "node dist/publish-first-party.js" --app shiftpane-api`. This processes all first-party folders, skipping existing published versions.
6. Confirm laptop-battery@1.0.0 is present in the production signed index with minAppVersion 0.7.0. Install on 0.7.0, verify live battery data, and confirm 0.6.0 refuses it. Check Time from the built-in picker, including refresh/reopen persistence and timer completion.

Preparing this branch does not publish npm packages, push a release tag, deploy services, or publish a widget.
