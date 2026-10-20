GPU load as a ring, refreshed as fast as the board asks for it. The medium size adds the last minute as bars, newest on the right.

## What it shows

- **Small:** the ring and the percentage.
- **Medium:** the ring, and a minute of history beside it.

## How it works

There is no collector. The widget binds the `gpu` system source straight into its view, so it never runs any code on your PC:

```json
{ "type": "ring", "bind": "@gpu/percent" }
```

That also makes it the shortest kind of widget to review, and a good one to copy when you make your own.
