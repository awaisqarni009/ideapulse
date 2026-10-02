import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title =
      searchParams.get('title') || 'PULSEWEAR — Engineered for Warmth. Cut for Streets.';
    const spec = searchParams.get('spec') || '500 GSM LOOPBACK COTTON · 20,000 MM MEMBRANE';

    return new ImageResponse(
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#15181B',
          backgroundImage:
            'radial-gradient(circle at 100px 100px, rgba(255, 90, 31, 0.12) 0%, transparent 60%), radial-gradient(circle at 1100px 500px, rgba(242, 245, 247, 0.05) 0%, transparent 50%)',
          padding: '64px 80px',
          fontFamily: 'sans-serif',
          color: '#F2F5F7',
          border: '1px solid rgba(138, 143, 149, 0.25)',
        }}
      >
        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            borderBottom: '1px solid rgba(138, 143, 149, 0.25)',
            paddingBottom: '28px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#1F2327',
                border: '1px solid #FF5A1F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 900,
                color: '#FF5A1F',
                letterSpacing: '-1px',
              }}
            >
              PW
            </div>
            <span style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>
              PULSE<span style={{ color: '#FF5A1F' }}>WEAR</span>
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#1F2327',
              border: '1px solid rgba(138, 143, 149, 0.3)',
              borderRadius: '2px',
              padding: '6px 16px',
              fontSize: '14px',
              fontWeight: 700,
              color: '#DEDBD2',
              letterSpacing: '1px',
            }}
          >
            SPECIFICATION SHEET
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', margin: '30px 0' }}>
          <div
            style={{
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '1.5px',
              color: '#FF5A1F',
              textTransform: 'uppercase',
            }}
          >
            {spec}
          </div>
          <div
            style={{
              fontSize: title.length > 50 ? '48px' : '58px',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-1.5px',
              color: '#F2F5F7',
              maxWidth: '1040px',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textTransform: 'uppercase',
            }}
          >
            {title}
          </div>
        </div>

        {/* Bottom Bar: Technical specs */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(138, 143, 149, 0.25)',
            paddingTop: '28px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: '#8A8F95', letterSpacing: '0.5px' }}>
                HOODIE WEIGHT
              </span>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#F2F5F7' }}>500 GSM</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: '#8A8F95', letterSpacing: '0.5px' }}>
                SHELL RATING
              </span>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#F2F5F7' }}>20,000 MM</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: '#8A8F95', letterSpacing: '0.5px' }}>
                HARDWARE
              </span>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#F2F5F7' }}>
                YKK AQUAGUARD
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#DEDBD2',
              fontSize: '15px',
              fontWeight: 600,
            }}
          >
            <span>HEAVYWEIGHT TECHNICAL STREETWEAR</span>
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'OG generation failed';
    return new Response(message, { status: 500 });
  }
}
