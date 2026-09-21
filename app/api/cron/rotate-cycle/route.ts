import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Fallback route for cycle rotation [T-5.2]
 * Wired to Vercel Cron or manual scheduled trigger.
 * Protected by CRON_SECRET shared secret header.
 */
async function handleRotateCycle(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const authHeader = req.headers.get('authorization');
    const customHeader = req.headers.get('x-cron-secret');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (bearerToken !== cronSecret && customHeader !== cronSecret) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized: Invalid or missing CRON_SECRET' },
        { status: 401 },
      );
    }
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc('rotate_cycle');

    if (error) {
      console.error('Failed to rotate cycle via cron route:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: 'Cycle rotated successfully',
      data,
    });
  } catch (err: any) {
    console.error('Unexpected error in cycle rotation cron handler:', err);
    return NextResponse.json(
      { ok: false, error: err?.message || 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  return handleRotateCycle(req);
}

export async function POST(req: NextRequest) {
  return handleRotateCycle(req);
}
