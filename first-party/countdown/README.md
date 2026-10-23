# Countdown

One event, counted down to the minute on a soft violet gradient. Requires ShiftPane 0.6.0.

Set an event name and date in widget settings. Time is optional: leaving it blank targets midnight at the start of that date. The picker shows the PC’s timezone and resolved UTC offset before saving. Invalid local times (including daylight-saving gaps) are rejected; when a time occurs twice, the earlier occurrence is used.

The saved timestamp is absolute: changing the PC’s timezone does not move your event. The target retains its saved UTC offset; medium and large cards show its date. Every size shows one oversized number for the largest remaining unit, with the event name above and a small “days to go”, “hours to go” or “minutes to go” label below. Medium and large also show the target date. Positive fractions round up to a minute. At the target, “It’s time” replaces the countdown and remains until you choose another target.

Runs offline every minute while displayed, and immediately after settings changes or reconnection. Completion can lag by up to one minute. No notifications, recurrence or seconds display. Repeated cards share the installed widget’s event.

Widget code: MIT. No system sources, network access, actions or secrets.
