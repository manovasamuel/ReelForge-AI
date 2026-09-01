import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#09090b', // zinc-950 (dark mode bg)
          color: 'white',
          position: 'relative',
        }}
      >
        {/* Subtle background glow */}
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, rgba(0, 0, 0, 0) 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '96px',
              height: '96px',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="96"
              height="96"
              viewBox="0 0 24 24"
              fill="white"
            >
              <path d="M5 3h5l-3 18H2z" />
              <path d="M11 3l12 9-15 9 6-9z" />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '64px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
              ReelForge
            </span>
            <span style={{ fontSize: '24px', fontWeight: 600, color: '#a78bfa', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '4px' }}>
              AI
            </span>
          </div>
        </div>

        <h1
          style={{
            fontSize: '72px',
            fontWeight: 800,
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: '32px',
          }}
        >
          Extract Winning Patterns & Generate Viral Reels with AI
        </h1>

        <p
          style={{
            fontSize: '32px',
            color: '#a1a1aa', // zinc-400
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.4,
          }}
        >
          Analyze your competitors top-performing content and generate ready-to-publish scripts in seconds.
        </p>
      </div>
    ),
    { ...size }
  );
}
