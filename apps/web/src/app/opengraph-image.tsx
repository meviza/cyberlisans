import { ImageResponse } from 'next/og';

export const alt = 'CyberLisans — Dijital Lisansların Yeni Adresi';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #050510 0%, #0A0A1F 100%)',
          color: '#fff',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 90,
            fontWeight: 900,
            background: 'linear-gradient(135deg, #00F0FF, #FF00C8)',
            backgroundClip: 'text',
            color: 'transparent',
            letterSpacing: -2,
          }}
        >
          CyberLisans
        </div>
        <div style={{ fontSize: 32, color: '#00F0FF', marginTop: 20 }}>
          Dijital Lisansların Yeni Adresi
        </div>
        <div style={{ display: 'flex', gap: 40, marginTop: 50, fontSize: 26, color: '#FF00C8' }}>
          <span>Aninda Teslim</span>
          <span>Guvenli Odeme</span>
          <span>Coklu Para Birimi</span>
        </div>
      </div>
    ),
    { ...size }
  );
}