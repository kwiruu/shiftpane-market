'use client'

import { Maximize, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

function clock(seconds: number) {
  const s = Math.max(0, Math.floor(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

const button =
  'grid size-9 place-items-center rounded-full text-white transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white'

/**
 * The docs' video player. It starts on its own, muted (browsers only allow that), once it's on
 * screen, and stops when it leaves; people who ask for reduced motion get the poster and press
 * play. The controls are ours so they match the site: click the picture to pause, the speaker to
 * turn the sound on, the bar to seek.
 */
export function DocVideo({ src, poster, label }: { src: string; poster: string; label: string }) {
  const frame = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [ended, setEnded] = useState(false)
  const [muted, setMuted] = useState(true)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  // Set once the person pauses it themselves, so scrolling back doesn't restart it.
  const userPaused = useRef(false)

  useEffect(() => {
    const el = video.current
    const box = frame.current
    if (!el || !box) return
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const watch = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        if (entry.isIntersecting) {
          if (!calm && !userPaused.current && !el.ended) el.play().catch(() => {})
        } else {
          el.pause()
        }
      },
      { threshold: 0.5 },
    )
    watch.observe(box)
    return () => watch.disconnect()
  }, [])

  function toggle() {
    const el = video.current
    if (!el) return
    if (el.paused || el.ended) {
      userPaused.current = false
      el.play().catch(() => {})
    } else {
      userPaused.current = true
      el.pause()
    }
  }

  function seek(event: React.PointerEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) {
    const el = video.current
    if (!el || !duration) return
    if ('key' in event) {
      const step = event.key === 'ArrowRight' ? 5 : event.key === 'ArrowLeft' ? -5 : 0
      if (!step) return
      event.preventDefault()
      el.currentTime = Math.min(duration, Math.max(0, el.currentTime + step))
      return
    }
    const rect = event.currentTarget.getBoundingClientRect()
    const fraction = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
    el.currentTime = fraction * duration
  }

  return (
    <div
      ref={frame}
      className="group/video relative aspect-video w-full overflow-hidden rounded-lg bg-black ring-1 ring-border"
    >
      <video
        ref={video}
        src={src}
        poster={poster}
        muted={muted}
        playsInline
        preload="auto"
        aria-label={label}
        className="size-full cursor-pointer object-contain"
        onClick={toggle}
        onPlay={() => {
          setPlaying(true)
          setEnded(false)
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false)
          setEnded(true)
        }}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
      />

      <button
        type="button"
        onClick={toggle}
        aria-label={ended ? 'Replay' : 'Play'}
        tabIndex={playing ? -1 : 0}
        className={cn(
          'absolute top-1/2 left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-black shadow-lg backdrop-blur transition-all hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
          playing && 'pointer-events-none scale-90 opacity-0',
        )}
      >
        {ended ? (
          <RotateCcw aria-hidden="true" className="size-6" strokeWidth={2} />
        ) : (
          <Play aria-hidden="true" className="ml-0.5 size-6 fill-current" strokeWidth={2} />
        )}
      </button>

      <div
        className={cn(
          'absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-gradient-to-t from-black/75 to-transparent px-3 pt-10 pb-2 transition-opacity focus-within:opacity-100',
          playing ? 'opacity-0 group-hover/video:opacity-100' : 'opacity-100',
        )}
      >
        <div
          role="slider"
          tabIndex={0}
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(time)}
          aria-valuetext={`${clock(time)} of ${clock(duration)}`}
          onPointerDown={seek}
          onKeyDown={seek}
          className="group/bar flex h-4 cursor-pointer items-center focus-visible:outline-none"
        >
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/30 transition-[height] group-hover/bar:h-1.5 group-focus-visible/bar:h-1.5">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: duration ? `${(time / duration) * 100}%` : 0 }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? 'Pause' : ended ? 'Replay' : 'Play'}
            className={button}
          >
            {playing ? (
              <Pause aria-hidden="true" className="size-4.5 fill-current" strokeWidth={2} />
            ) : (
              <Play aria-hidden="true" className="size-4.5 fill-current" strokeWidth={2} />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              if (video.current) video.current.muted = !video.current.muted
            }}
            aria-label={muted ? 'Turn sound on' : 'Mute'}
            className={button}
          >
            {muted ? (
              <VolumeX aria-hidden="true" className="size-4.5" strokeWidth={2} />
            ) : (
              <Volume2 aria-hidden="true" className="size-4.5" strokeWidth={2} />
            )}
          </button>
          <span className="ml-1 font-mono text-label-sm text-white/85 tabular-nums">
            {clock(time)} / {clock(duration)}
          </span>
          <button
            type="button"
            onClick={() => void frame.current?.requestFullscreen?.()}
            aria-label="Full screen"
            className={cn(button, 'ml-auto')}
          >
            <Maximize aria-hidden="true" className="size-4.5" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  )
}
