import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 22,
          background: 'linear-gradient(135deg, #00F0FF, #FF00C8)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#050510',
          fontWeight: 900,
          fontFamily: 'sans-serif',
        }}
      >
        C
      </div>
    ),
    { ...size }
  );
}