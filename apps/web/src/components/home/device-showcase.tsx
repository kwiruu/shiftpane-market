import Image from 'next/image'
import { Check, Smartphone, Zap, SwitchCamera } from 'lucide-react'
import { LogoMark } from '@/components/site/logo'
import { type BoardItem, PhoneBoard } from '@/components/widgets/phone-board'
import { sampleWidget } from '@/lib/registry'

/*
 * The hero devices (DESIGN.md, Motion): a laptop showing ShiftPane's pairing code, and a phone
 * beside it. The section is taller than the screen and the devices stick while you scroll through
 * it; a CSS view timeline swaps the code for "Connected", dims the laptop a little, and fills the
 * phone with its widget board. On desktops it's part of the hero stage instead (see hero.tsx).
 * Without scroll-driven animation the phone is simply shown paired.
 *
 * Both devices are drawn, not photographed, and sized in container units so they scale as one.
 */

/** A made-up but plausible QR code: three finder patterns and a fixed scatter of modules. */
function QrCode({ className }: { className?: string }) {
  const n = 25
  const finder = (x: number, y: number) =>
    `M${x},${y}h7v7h-7zM${x + 1},${y + 1}v5h5v-5zM${x + 2},${y + 2}h3v3h-3z`
  const inFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8)
  let modules = ''
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (inFinder(x, y)) continue
      // A small integer hash: deterministic, so the server and the browser draw the same code.
      const h = (x * 73_856_093) ^ (y * 19_349_663) ^ 0x5bd1e995
      if ((h >>> 3) % 7 < 3) modules += `M${x},${y}h1v1h-1z`
    }
  }
  return (
    <svg
      aria-hidden="true"
      viewBox={`-2 -2 ${n + 4} ${n + 4}`}
      className={className}
      shapeRendering="crispEdges"
    >
      <rect x="-2" y="-2" width={n + 4} height={n + 4} fill="#fff" />
      <path
        d={`${finder(0, 0)}${finder(n - 7, 0)}${finder(0, n - 7)}${modules}`}
        fill="#111"
        fillRule="evenodd"
      />
    </svg>
  )
}

/** ShiftPane's Devices page as the laptop shows it: the code to scan, then the phone it paired. */
function DevicesWindow() {
  return (
    <div className="absolute top-1/2 left-1/2 w-[48%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[1.4cqw] bg-[#18181b] text-[#f4f4f5] shadow-[0_0_0_1px_rgb(0_0_0/0.5),0_2.4cqw_5cqw_-1.6cqw_rgb(0_0_0/0.55)]">
      <div className="flex items-center gap-[0.8cqw] border-b border-[#27272b] px-[1.4cqw] py-[1cqw]">
        <LogoMark className="size-[2cqw]" />
        <span className="text-[1.25cqw] font-semibold">ShiftPane</span>
        <span className="ml-auto flex gap-[0.6cqw]">
          {[0, 1, 2].map((dot) => (
            <span key={dot} className="size-[0.8cqw] rounded-full bg-[#36363c]" />
          ))}
        </span>
      </div>
      <div className="relative aspect-[16/10]">
        <div className="pair-qr absolute inset-0 grid-cols-[auto_1fr] items-center gap-[2.2cqw] px-[2.6cqw]">
          <QrCode className="w-[14cqw] rounded-[0.6cqw]" />
          <div>
            <p className="text-[1.9cqw] leading-tight font-semibold">Connect a phone</p>
            <p className="mt-[0.6cqw] text-[1.2cqw] leading-snug text-[#85858e]">
              Scan the code with the phone&apos;s camera, on the same Wi-Fi.
            </p>
            <p className="mt-[1.4cqw] text-[1.1cqw] text-[#85858e]">
              Or type this code in the phone app
            </p>
            <p className="mt-[0.3cqw] font-mono text-[2.2cqw] tracking-[0.18em]">482 913</p>
          </div>
        </div>
        <div className="pair-done absolute inset-0 flex flex-col items-center justify-center gap-[1cqw] text-center">
          <span className="grid size-[5.6cqw] place-items-center rounded-full bg-[oklch(0.76_0.15_155/0.16)] text-[oklch(0.76_0.15_155)]">
            <Check strokeWidth={2.4} className="size-[2.8cqw]" />
          </span>
          <p className="text-[1.9cqw] font-semibold">Connected</p>
          <p className="flex items-center gap-[0.5cqw] text-[1.2cqw] text-[#85858e]">
            <Smartphone strokeWidth={2} className="size-[1.4cqw]" />
            Your phone · widget board
          </p>
        </div>
      </div>
    </div>
  )
}

function Laptop() {
  return (
    <div className="relative w-[60%] flex-none">
      {/* Lid */}
      <div className="rounded-[clamp(10px,2.6cqw,28px)] bg-[#0d0d0d] p-[1.3%] shadow-device dark:bg-[#1c1c1c]">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[clamp(6px,1.7cqw,18px)] [container-type:inline-size]">
          {/* A Windows 11 desktop: the window centered above the taskbar (globals.css, .wallpaper) */}
          <div className="board-desk wallpaper absolute inset-0 flex flex-col">
            <div className="relative flex-1">
              <DevicesWindow />
            </div>
            <div className="taskbar flex-none" />
          </div>
        </div>
      </div>
      {/* Base */}
      <div className="relative mx-auto h-[clamp(7px,1.6cqw,14px)] w-[104%] -translate-x-[1.9%] rounded-t-[3px] rounded-b-[clamp(7px,1.8cqw,16px)] bg-[#8e8e8e]">
        <div className="absolute top-0 left-1/2 h-[45%] w-[17%] -translate-x-1/2 rounded-b-[6px] bg-[#6f6f6f]" />
      </div>
    </div>
  )
}

/** The landscape shell rotates upright while the camera is waiting to pair. */
function Phone() {
  return (
    <div className="hero-phone relative w-[31%] flex-none">
      <div className="rounded-[10%/21%] bg-[#0d0d0d] p-[1.6%] shadow-device ring-1 ring-black/10 dark:bg-[#1c1c1c] dark:ring-white/10">
        <div className="relative aspect-[764/363] overflow-hidden rounded-[8.5%/17.9%] bg-black [container-type:inline-size]">
          <div className="board-hint absolute inset-0 items-center justify-center text-white">
            <div className="phone-scanner relative flex h-[100cqw] w-[47.5cqw] flex-none flex-col overflow-hidden bg-[#111216]">
              <div className="flex items-center justify-between px-[5cqw] pt-[5cqw] pb-[3cqw]">
                <Zap className="size-[4cqw]" strokeWidth={1.5} />
                <span className="h-[2cqw] w-[7cqw] rounded-full bg-white/20" />
                <span className="rounded-full border border-white/60 px-[1.5cqw] text-[2.6cqw]">
                  4:3
                </span>
              </div>
              <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#668b9a,#274659_50%,#182c42)]">
                <div className="absolute inset-[8%] rotate-[-8deg] rounded-[2cqw] border-[1cqw] border-[#101218] bg-[#20232b] shadow-xl" />
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-15">
                  {Array.from({ length: 9 }, (_, i) => (
                    <span key={i} className="border border-white/50" />
                  ))}
                </div>
                <div className="relative rounded-[2cqw] border border-[#f8d779]/80 p-[2cqw]">
                  <QrCode className="w-[21cqw] rounded-[0.6cqw]" />
                </div>
                <span className="absolute bottom-[3cqw] rounded-full bg-black/60 px-[2.4cqw] py-[1cqw] text-[2.7cqw] text-[#f8d779]">
                  ShiftPane · Connect
                </span>
              </div>
              <div className="flex justify-center gap-[3cqw] pt-[3cqw] text-[2.5cqw] font-medium tracking-widest text-white/50">
                <span>VIDEO</span>
                <span className="text-[#f8d779]">PHOTO</span>
                <span>PORTRAIT</span>
              </div>
              <div className="flex items-center justify-between px-[5cqw] py-[3cqw]">
                <span className="size-[6cqw] rounded-[1cqw] border border-white/30 bg-[#274659]" />
                <span className="grid size-[11cqw] place-items-center rounded-full border border-white">
                  <span className="size-[9cqw] rounded-full bg-white" />
                </span>
                <SwitchCamera className="size-[5cqw]" strokeWidth={1.5} />
              </div>
              <span className="mx-auto mb-[2cqw] h-[0.8cqw] w-[14cqw] rounded-full bg-white/70" />
            </div>
          </div>
          <div className="board-panel absolute inset-0">
            <Image
              src="/images/hero-widget-board.png"
              alt="October calendar and CPU load widgets"
              fill
              unoptimized
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
export function DeviceShowcase() {
  return (
    // biome-ignore lint/a11y/useSemanticElements: a group of pictures with one name, not a form's fieldset
    <div
      role="group"
      aria-label="ShiftPane on a laptop, pairing a phone that then shows a widget board"
      data-cursor="Scroll to pair the phone"
      className="board-stage relative overflow-x-clip"
    >
      <div className="board-sticky">
        {/* As wide as the stage, but never taller than the screen can show with its caption. */}
        <figure className="hero-device mx-auto w-full max-w-[min(calc(var(--container-stage)+2*var(--gutter)),calc((100svh-150px)*1.9))] px-[max(var(--gutter),env(safe-area-inset-left))]">
          <div
            aria-hidden="true"
            className="flex items-center justify-between [container-type:inline-size]"
          >
            <Laptop />
            <Phone />
          </div>
          <figcaption className="hero-caption mx-auto mt-6 max-w-80 text-center text-body-sm text-secondary">
            Scroll. The phone pairs with a scan, and its screen becomes a board of live widgets from
            the PC.
          </figcaption>
        </figure>
      </div>
    </div>
  )
}
