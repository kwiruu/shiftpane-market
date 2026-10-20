Your PC's load at a glance, laid out like the PC overview in the ShiftPane app: CPU load as the big figure, memory as a ring beside it, and GPU and network speed along the bottom.

This is ShiftPane's built-in PC stats widget, rebuilt as an ordinary package. If the built-in widgets can be made with the SDK, so can yours.

## Sizes

- **Small:** CPU and memory as two figures.
- **Medium:** CPU load and the memory ring, with GPU, download and upload under a hairline.
- **Large:** the same, with the last 48 seconds of CPU load between them.

## Permissions

It reads four system sources and nothing else: `cpu`, `memory`, `gpu` and `network`. None of them say what you're doing, so installing it doesn't ask.
