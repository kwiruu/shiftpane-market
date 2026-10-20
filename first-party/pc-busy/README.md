Turns your CPU and memory into one word: **Busy** or **All clear**, with a bar for whichever is higher. Prop the phone up by the door during a render and nobody has to ask.

## Settings

- **Busy above:** the CPU or memory percent that counts as busy. 80 by default.

## How it works

A five-line collector reads the `cpu` and `memory` sources and compares them with your setting. It's the example the widget docs start with.
