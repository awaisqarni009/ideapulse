import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'IdeaPulse — Community Idea Incubator';
    const category = searchParams.get('category') || 'Community Protocol';
    const votes = searchParams.get('votes');
    const cycle = searchParams.get('cycle');

    return new ImageResponse(
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#07090E',
          backgroundImage:
            'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.05) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(99, 102, 241, 0.15) 15%, transparent 50%)',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
          color: '#FFFFFF',
        }}
      >
        {/* Top Bar: Brand & Category */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
              }}
            >
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                }}
              />
            </div>
            <span style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>
              Idea<span style={{ color: '#06B6D4' }}>Pulse</span>
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '9999px',
              padding: '8px 20px',
              fontSize: '16px',
              fontWeight: 600,
              color: '#818CF8',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            {category}
          </div>
        </div>

        {/* Main Title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', margin: '40px 0' }}>
          <div
            style={{
              fontSize: title.length > 60 ? '48px' : '56px',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-1.5px',
              color: '#F8FAFC',
              maxWidth: '1040px',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {title}
          </div>
        </div>

        {/* Bottom Bar: Stats & Protocol Guarantee */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '30px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
            {votes !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px', fontWeight: 800, color: '#06B6D4' }}>{votes}</span>
                <span style={{ fontSize: '16px', color: '#94A3B8' }}>Verified Votes</span>
              </div>
            )}
            {cycle && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px', fontWeight: 800, color: '#A855F7' }}>
                  #{cycle}
                </span>
                <span style={{ fontSize: '16px', color: '#94A3B8' }}>Incubation Cycle</span>
              </div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#10B981',
              fontSize: '16px',
              fontWeight: 600,
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
              }}
            />
            <span>Verifiable Consensus on PostgreSQL</span>
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
