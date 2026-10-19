import { ImageResponse } from 'next/og'

import { site } from '@/lib/site'

// The picture that shows when a link to the site is pasted somewhere. Drawn at build time, so it
// costs nothing at request time. Plain shapes and system type: this runs in Satori, not a browser.
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = `${site.name} · ${site.tagline}`

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        background: '#f5f5f5',
        color: '#111111',
        padding: 88,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: 640,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              borderRadius: 16,
              background: '#000000',
            }}
          >
            <div style={{ width: 8, height: 26, borderRadius: 4, background: '#d1d1d6' }} />
            <div style={{ width: 22, height: 26, borderRadius: 7, background: '#ffffff' }} />
          </div>
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 600 }}>{site.name}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              display: 'flex',
              fontSize: 72,
              fontWeight: 600,
              letterSpacing: -2.4,
              lineHeight: 1.05,
            }}
          >
            Your phone is a second monitor now.
          </div>
          <div style={{ display: 'flex', fontSize: 30, color: '#6b6b6b', lineHeight: 1.35 }}>
            Docs and free widgets for ShiftPane.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: '#f59e0b' }} />
          <div style={{ display: 'flex', fontSize: 26, color: '#6b6b6b' }}>{site.platform}</div>
        </div>
      </div>

      {/* A phone with its board: two tiles and a wide one. */}
      <div
        style={{
          display: 'flex',
          width: 260,
          height: 454,
          padding: 10,
          borderRadius: 44,
          background: '#0d0d0d',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            width: '100%',
            padding: '48px 14px 14px',
            borderRadius: 36,
            background: '#000000',
          }}
        >
          <div style={{ display: 'flex', gap: 12 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 100,
                height: 100,
                borderRadius: 18,
                background: '#1c1c1f',
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  border: '9px solid #f0592a',
                  borderLeftColor: '#3a3a3f',
                }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                width: 100,
                height: 100,
                padding: 12,
                borderRadius: 18,
                background: '#ffffff',
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              All clear
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 4,
              height: 100,
              padding: 14,
              borderRadius: 18,
              background: '#1c1c1f',
            }}
          >
            {[40, 55, 48, 70, 62, 80, 66, 90, 74, 58, 84, 100].map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${h}%`,
                  borderRadius: 3,
                  background: i === 11 ? '#f0592a' : '#4a4a50',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>,
    size,
  )
}
