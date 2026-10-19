/**
 * Split view's numbers, ported from ShiftPane's `packages/layout` (split.ts and catalogue.ts) so the
 * landing page says what the app does. Keep the two in step: the app is the source of truth.
 */

export interface Size {
  width: number
  height: number
}

/** The fixed monitor sizes the app ever asks the virtual display driver for (catalogue.ts). */
export const MONITOR_SIZES: readonly Readonly<Size>[] = [
  { width: 1280, height: 720 },
  { width: 1366, height: 768 },
  { width: 1920, height: 1080 },
  { width: 2560, height: 1440 },
  { width: 3840, height: 2160 },
  { width: 1280, height: 800 },
  { width: 1920, height: 1200 },
  { width: 800, height: 600 },
  { width: 1024, height: 768 },
  { width: 1440, height: 1080 },
  { width: 1080, height: 1080 },
  { width: 800, height: 1280 },
  { width: 1080, height: 1440 },
  { width: 1080, height: 1920 },
]

const MIN_PIXEL_SHARE = 0.6
const SHAPE_STEP = 0.02
const area = (size: Size) => size.width * size.height

/**
 * The catalogue size for a monitor area: the closest shape among sizes with enough pixels, then
 * the closest pixel count. The phone letterboxes whatever difference is left.
 */
export function pickMonitorSize(target: Size, catalogue = MONITOR_SIZES): Size {
  const wantedArea = area(target)
  const wantedShape = target.width / target.height
  const shapeBucket = (size: Size) =>
    Math.floor(Math.abs(Math.log(size.width / size.height / wantedShape)) / SHAPE_STEP)
  const areaGap = (size: Size) => Math.abs(Math.log(area(size) / wantedArea))
  const sharp = catalogue.filter((size) => area(size) >= wantedArea * MIN_PIXEL_SHARE)
  const pool = sharp.length > 0 ? sharp : [catalogue.reduce((a, b) => (area(b) > area(a) ? b : a))]

  let best = pool[0] as Size
  for (const size of pool) {
    const better =
      shapeBucket(size) < shapeBucket(best) ||
      (shapeBucket(size) === shapeBucket(best) && areaGap(size) < areaGap(best))
    if (better) best = size
  }
  return { width: best.width, height: best.height }
}

/** The monitor area a split leaves on a landscape phone, on even pixels for the encoder. */
export function monitorArea(phone: Size, fraction: number): Size | null {
  if (fraction <= 0) return null
  return { width: Math.floor((phone.width * fraction) / 2) * 2, height: phone.height }
}
