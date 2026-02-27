import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Stayli - Gestion Locative'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#1e3a2f',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* House icon */}
        <svg
          width="100"
          height="100"
          viewBox="0 0 32 32"
          style={{ marginBottom: 32 }}
        >
          <rect width="32" height="32" rx="7" fill="#2d5a47" />
          <path
            d="M16 7 L5.5 17 L9.5 17 L9.5 25 L13.5 25 L13.5 20 L18.5 20 L18.5 25 L22.5 25 L22.5 17 L26.5 17 Z"
            fill="white"
          />
        </svg>

        {/* Title */}
        <div
          style={{
            fontSize: 88,
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-2px',
            lineHeight: 1,
          }}
        >
          Stayli
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 32,
            color: '#4a9e7a',
            marginTop: 20,
            letterSpacing: '4px',
            textTransform: 'uppercase',
          }}
        >
          Gestion Locative
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            width: 80,
            height: 4,
            background: '#4a9e7a',
            borderRadius: 2,
          }}
        />
      </div>
    ),
    { ...size }
  )
}
