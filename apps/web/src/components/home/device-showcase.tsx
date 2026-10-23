import { ScanLine } from 'lucide-react'
import Image from 'next/image'

import appDevices from '@/assets/home/app-devices.png'
import phoneWidgets from '@/assets/home/phone-widgets.jpg'

/*
 * The hero devices (DESIGN.md, Motion): a laptop showing ShiftPane's own window, and a phone
 * beside it. The section is taller than the screen and the devices stick while you scroll through
 * it; a CSS view timeline fades the phone's "Scan to pair" into its widget board and dims the
 * laptop a little. On desktops it's part of the hero stage instead (see hero.tsx). Without
 * scroll-driven animation the phone is simply shown paired.
 *
 * The window and the phone's screen are real screenshots of the app and a paired iPhone
 * (src/assets/home); the laptop and the phone around them are drawn, and sized in container units
 * so they scale as one. To change what they show, replace the screenshots, keeping their shapes.
 */

/** ShiftPane's Devices page, as the laptop shows it: the code to scan and the phone it paired. */
function AppWindow() {
  return (
    <Image
      src={appDevices}
      alt=""
      sizes="(min-width: 1280px) 760px, 90vw"
      priority
      className="absolute top-1/2 left-1/2 w-[66%] -translate-x-1/2 -translate-y-1/2 rounded-[1cqw] shadow-[0_0_0_1px_rgb(0_0_0/0.5),0_2.4cqw_5cqw_-1.6cqw_rgb(0_0_0/0.55)]"
    />
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
              <AppWindow />
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

/** A phone held sideways, 2400 × 1080 like the one in the split view figure. */
function Phone() {
  return (
    <div className="relative w-[37%] flex-none">
      <div className="rounded-[7%/15.5%] bg-[#0d0d0d] p-[1.6%] shadow-device ring-1 ring-black/10 dark:bg-[#1c1c1c] dark:ring-white/10">
        <div className="relative aspect-[2400/1080] overflow-hidden rounded-[5.6%/12.4%] bg-black [container-type:inline-size]">
          {/* The camera, on the left edge */}
          <div className="absolute top-1/2 left-[1.4cqw] h-[10cqw] w-[2cqw] -translate-y-1/2 rounded-full bg-[#0d0d0d]" />

          <div className="board-hint absolute inset-0 flex-col items-center justify-center gap-[2cqw] text-center text-white">
            <ScanLine strokeWidth={1.75} className="size-[9cqw] text-white/80" />
            <span className="rounded-full bg-white/15 px-[3.4cqw] py-[1.2cqw] text-[3.2cqw] font-semibold backdrop-blur-md">
              Scan to pair
            </span>
          </div>

          {/* The board once it's paired: a screenshot, on the black the phone's own board has. */}
          <div className="board-panel absolute inset-0">
            <Image
              src={phoneWidgets}
              alt=""
              sizes="(min-width: 1280px) 640px, 70vw"
              className="size-full object-contain"
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
            className="flex items-end justify-between [container-type:inline-size]"
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
