---
version: alpha
name: ShiftPane Minimal
description: >
  A calm, high-contrast Apple-like landing system with soft surfaces, rounded pills, and
  product-led hierarchy. Dev Pane Minimal (itself extracted from the Bendy landing page),
  applied to ShiftPane's docs and widget gallery so the two sites read as one family. Every
  color has a -dark twin for dark mode; the web build pairs them with light-dark() so one
  token serves both appearances.
colors:
  primary: "#111111"
  primary-dark: "#F5F5F5"
  secondary: "#6B6B6B"
  secondary-dark: "#A1A1A1"
  tertiary: "#E5E7EB"
  tertiary-dark: "#2A2A2A"
  neutral: "#F5F5F5"
  neutral-dark: "#000000"
  surface: "#FFFFFF"
  surface-dark: "#161616"
  on-surface: "#111111"
  on-surface-dark: "#F5F5F5"
  error: "#D92D20"
  error-dark: "#F97066"
  accent: "#F59E0B"
  accent-dark: "#F59E0B"
  border: "#E5E7EB"
  border-dark: "#262626"
  muted: "#EFEFEF"
  muted-dark: "#1F1F1F"
  success: "#067647"
  success-dark: "#47CD89"
  board: "#000000"
  flame: "oklch(0.67 0.22 37)"
  lime: "oklch(0.92 0.2 118)"
  mint: "oklch(0.75 0.2 148)"
  sky: "oklch(0.6 0.21 258)"
typography:
  headline-display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', Inter, InterVariable, system-ui, sans-serif"
    fontSize: 40px
    fontWeight: 500
    lineHeight: 44px
    letterSpacing: -1.4px
  headline-lg:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', Inter, InterVariable, system-ui, sans-serif"
    fontSize: 33px
    fontWeight: 500
    lineHeight: 40px
    letterSpacing: 0.26px
  headline-md:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', Inter, InterVariable, system-ui, sans-serif"
    fontSize: 28px
    fontWeight: 500
    lineHeight: 34px
    letterSpacing: 0px
  headline-sm:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', Inter, InterVariable, system-ui, sans-serif"
    fontSize: 23px
    fontWeight: 500
    lineHeight: 28px
    letterSpacing: 0px
  body-lg:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, InterVariable, system-ui, sans-serif"
    fontSize: 19px
    fontWeight: 500
    lineHeight: 26.6px
    letterSpacing: -0.38px
  body-md:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, InterVariable, system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 24px
    letterSpacing: -0.02em
  body-sm:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, InterVariable, system-ui, sans-serif"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 18px
    letterSpacing: -0.01em
  label-lg:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, InterVariable, system-ui, sans-serif"
    fontSize: 13px
    fontWeight: 600
    lineHeight: 18px
    letterSpacing: -0.01em
  label-md:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, InterVariable, system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 600
    lineHeight: 16px
    letterSpacing: 0px
  label-sm:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, InterVariable, system-ui, sans-serif"
    fontSize: 11px
    fontWeight: 600
    lineHeight: 14px
    letterSpacing: 0.02em
  micro:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, InterVariable, system-ui, sans-serif"
    fontSize: 10px
    fontWeight: 500
    lineHeight: 12px
    letterSpacing: 0.02em
  code:
    fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', Menlo, Consolas, monospace"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0px
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 16px
  xl: 24px
  full: 9999px
spacing:
  xs: 6px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 56px
  2xl: 112px
  column: 720px
  showcase: 880px
  stage: 960px
components:
  page:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
  page-dark:
    backgroundColor: "{colors.neutral-dark}"
    textColor: "{colors.on-surface-dark}"
  page-secondary:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.secondary}"
    typography: "{typography.body-lg}"
  page-secondary-dark:
    backgroundColor: "{colors.neutral-dark}"
    textColor: "{colors.secondary-dark}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: "0px 16px"
    height: "40px"
  button-primary-dark:
    backgroundColor: "{colors.primary-dark}"
    textColor: "{colors.surface-dark}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: "0px 16px"
    height: "40px"
  button-secondary-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-surface-dark}"
  button-tertiary:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.none}"
    padding: "0px"
    height: "auto"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  card-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-surface-dark}"
  card-detail:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary}"
    typography: "{typography.body-md}"
  card-detail-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.secondary-dark}"
  card-divider:
    backgroundColor: "{colors.tertiary}"
    height: 1px
  card-divider-dark:
    backgroundColor: "{colors.tertiary-dark}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    padding: "0px 16px"
    height: "40px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    padding: "0px 12px"
    height: "28px"
  chip-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-surface-dark}"
  chip-outline:
    backgroundColor: "{colors.border}"
    height: 1px
  chip-outline-dark:
    backgroundColor: "{colors.border-dark}"
  chip-dot:
    backgroundColor: "{colors.accent}"
    rounded: "{rounded.full}"
    size: 6px
  chip-dot-dark:
    backgroundColor: "{colors.accent-dark}"
  cursor-chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "0px 10px"
    height: "28px"
  code-block:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.on-surface}"
    typography: "{typography.code}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  code-block-dark:
    backgroundColor: "{colors.muted-dark}"
    textColor: "{colors.on-surface-dark}"
  error-text:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.error}"
  error-text-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.error-dark}"
  widget-preview:
    backgroundColor: "{colors.board}"
    rounded: "{rounded.xl}"
    height: "460px"
  widget-tile:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "8px"
  widget-tile-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-surface-dark}"
  status-live:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.success}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
  status-live-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.success-dark}"
---

# ShiftPane Minimal

## Overview

The ShiftPane site is the docs and the widget gallery for ShiftPane, and it looks like its
sibling, the Dev Pane site, on purpose: the same tokens, the same type, the same pills and
definition cards, the same three kinds of motion. A reader who knows one knows the other.

It feels light, friendly and product-led, with an Apple-adjacent polish rather than a loud
startup aesthetic: a lot of open space, a single centered column for the story, soft rounded
controls. The product details make it slightly playful: a gallery pill whose widget icons lift
on hover, a cursor chip that trails the pointer, and a laptop and a phone that pair as you
scroll.

The token block above is Dev Pane Minimal's, unchanged, plus `success` for review statuses and
the phone board's own colors (`board`, `flame`, `lime`, `mint`, `sky`), which only widget
previews use.

## Colors

The page colors are Dev Pane's, in the same roles:

- **Primary (#111111):** ink for the most important text, button fills and strong contrast.
- **Secondary (#6B6B6B):** supporting copy and secondary UI text (4.9:1 on `neutral`).
- **Tertiary (#E5E7EB):** dividing lines inside cards.
- **Neutral (#F5F5F5):** the page background.
- **Surface (#FFFFFF):** pills, cards and elevated fragments.
- **Accent (#F59E0B):** used sparingly: the live dot on chips, and a flagged check in review.
  Never for text.
- **Border (#E5E7EB):** hairlines around chips, outlined controls and fields.
- **Muted (#EFEFEF):** code wells, segmented controls, inactive states, hover fills.
- **Error (#D92D20):** a failed check, a rejected version, a destructive action.
- **Success (#067647):** a passed check, a live version. Text only, on `surface`.

### Dark mode

As on Dev Pane: the site opens light, and the toggle in the navigation remembers the reader's
choice. Ink becomes near white, the page pure black, surfaces `#161616`.

### The phone board

Widget previews are pictures of the phone, not page components, so they keep the phone's own
colors in both appearances: a black board, graphite cards (`.tone-dark`) or white ones
(`.tone-light`), and four loud accents for rings, bars and lines. This is the one place the page
uses saturated color, and it's on black, framed like a screen. The landing page swaps the black
for the desktop wallpaper (see the hero devices).

## Typography

Dev Pane's: the Apple system stack, with Inter self-hosted by `next/font` everywhere else.
Medium weight for headings and body, tight tracking at the display size, sentence case
throughout. The one exception is the small `label-sm` uppercase heading on definition cards and
sections ("WHAT IT CAN DO"). Every style follows the reader's text size through `--dt`.

## Layout

The landing page is one centered column (`column`, 720px) with product imagery wider than the
text: widget previews at `showcase` (880px), the devices at `stage` (960px, or less when the
screen is short). From 1280px the hero is a split, text on the left and the devices on the right
at 62%, and scrolling brings the devices to the center.

The gallery, widget pages, docs and dashboards use the wider `frame` (1216px). The gallery grid
is four tiles across on desktops, two on tablets, one on phones. A widget page is a main column
(preview, README, source) beside a 340px aside (install, permissions, details, versions) that
sticks under the navigation.

Spacing follows the scale: `xs` and `sm` for text and icon pairs, `md` and `lg` inside cards,
`xl` (56px) between media blocks and page sections, `2xl` (112px) between major landing sections.

## Elevation & Depth

Flat, as on Dev Pane. White cards sit on the neutral page with no border and no shadow. The
devices gain presence from their dark bezels and one soft `shadow-device`. The navigation turns
translucent with a hairline once content scrolls under it; menus get `shadow-menu`.

## Shapes

Pills (`rounded.full`) for every control: buttons, chips, fields, segmented controls. Cards
`rounded.lg`, widget previews and the devices' screens `rounded.xl`, code wells `rounded.md`.
Widget tiles inside previews round to a tenth of a board cell, like the phone draws them.

## Components

Everything Dev Pane has keeps its rules: primary, secondary and tertiary **buttons**, **chips**
with the accent dot, **definition cards** with uppercase labels and hairline rows, the **cursor
chip**, **keycaps**, **code blocks** with a text-only Copy, and the **docs navigation**.

**The gallery pill** is the hero's call to action: a primary pill, 44px, reading "Browse
widgets", holding a nested translucent pill of four widget icons on black circles, in their own
accent colors. On hover they lift one after another. Beside it, "Get started" is a secondary
pill.

**The hero devices** are drawn, not photographed: a laptop showing ShiftPane's Devices page with
its pairing code, and a phone beside it. The laptop's screen is a Windows 11 desktop: a wallpaper
and a taskbar, which are the only pictures in it, one pair for each appearance (`.wallpaper` and
`.taskbar` in `globals.css`, files in `src/assets/desktop`). Scrolling swaps the code for
"Connected", dims the laptop a little and fills the phone with its widget board. Everything
inside them is sized in container units, so they scale as one picture.

**Widget previews** draw a widget from its `view.json` and `sample.json`, the way the phone
does, on a black stage as tall as the widget's largest size, so the size switch under it never
moves the page. The landing page's stages sit on the same desktop wallpaper as the hero laptop;
the widget pages and review keep the black. Every length is a share of one board cell, so a preview reads the same as a
thumbnail and as a hero. They render only ShiftPane's own components, so nothing an author wrote
runs here either.

**Widget tiles** carry the gallery: a white card with a small preview stage on top, then the
name in `body-md`, a two-line summary in `body-sm` `secondary`, and the author and category in
`label-md`. The whole tile is the link; hover fills it `muted` and grows the preview slightly.

**Permissions** are a definition card of plain-words lines, each with a lucide icon for its
kind ("Reads your GPU load", "Can reach api.github.com"), and "Asks first" on the right for the
ones that prompt before installing. They say exactly what the app's install prompt will say.

**The split view** is a phone held sideways, part desktop and part widget board, with the app's
four split presets under it as a segmented control. The caption reads out the monitor the PC
would add, worked out the way the app does.

**The source viewer** shows a package's files as tabs in a segmented control over a code well
that scrolls on its own past a screenful.

**Status badges** are chips: "Live" in `success`, "In review" and "Checking" with the live dot,
"Rejected" and "Yanked" in `error`.

**Account pages** (upload, dashboard, review) show a white card asking to sign in until someone
has, and a quiet card-sized block while they load. Controls that need an account are shown
disabled rather than hidden, so the page shows its real shape. Errors are one line in `error`.

**Icons** are lucide, stroke 1.75, monochrome, as on Dev Pane. The GitHub mark is drawn to match
(`brand-icons.tsx`) and appears only to link to GitHub or to sign in with it. Widget icons are
lucide stand-ins until packages carry their own `icon.png`.

## Do's and Don'ts

- Do keep the page spacious and centered, letting the devices and previews dominate.
- Do keep the phone's colors inside the phone: on black, in previews, never on page UI.
- Do say when something is planned. Never present a planned feature as shipped.
- Do use lucide icons, monochrome, so every glyph shares one stroke.
- Don't introduce gradients or saturated color on page surfaces.
- Don't use sharp, boxy controls when a pill fits.
- Don't animate anything that isn't tied to scroll or the pointer, and turn it all off for
  `prefers-reduced-motion`.

## Motion

Dev Pane's three kinds, and nothing else moves:

| Motion | How | Reduced motion |
|---|---|---|
| Smooth scrolling | Lenis, anchors included | Native scrolling |
| The hero stage (1280px and up) | Text left, devices right at 62%. Scrolling fades the text, glides the devices to the center at full size, then pairs the phone. CSS scroll-driven animation on one tall section with a sticky frame | Text above the devices, phone shown paired |
| Pairing (narrower screens) | The same, without the glide | Phone shown paired |
| Parallax rail and the cursor chip | Scroll-driven transforms; a `requestAnimationFrame` lerp for the chip | Rail static, chip hidden |

Browsers without scroll-driven animations show the phone paired and the rail still.

## Implementation

Next.js 16 (App Router, every page prerendered), Tailwind CSS v4, shadcn/ui on Radix, as on Dev
Pane. Tokens live in `src/app/globals.css` as Tailwind theme variables with the same names
(`--color-primary: light-dark(#111111, #F5F5F5)` → `bg-primary`, `--text-body-md` →
`text-body-md`, `--radius-lg` → `rounded-lg`, `--spacing: 4px`). The phone board's colors are
`--color-flame` and friends; a card's own colors come from `.tone-dark` and `.tone-light` as
`bg-card-bg`, `text-card-ink`, `text-card-muted`, `bg-card-soft`.

shadcn's names point at these tokens exactly as on Dev Pane. Import `cn` from `@/lib/utils`,
which knows the custom text sizes.
