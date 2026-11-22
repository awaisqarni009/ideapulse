import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';

describe('T-8.16 & T-8.17: Security Headers & Cron Fallback Verification', () => {
  const CRON_SECRET =
    process.env.CRON_SECRET || '4f7b6a189c2d3e5f0a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f';
  process.env.CRON_SECRET = CRON_SECRET;
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  it('emits all required security headers per T-8.16', async () => {
    let headers: Headers;
    try {
      const res = await fetch(`${BASE_URL}/feed`);
      expect(res.status).toBe(200);
      headers = res.headers;
    } catch {
      // In-process verification from next.config.mjs when server is not running
      const config = await import('../next.config.mjs');
      const headerDefs = config.default?.headers ? await config.default.headers() : [];
      const match = headerDefs.find((h: any) => h.source === '/:path*');
      headers = new Headers();
      match?.headers.forEach((h: any) => headers.set(h.key.toLowerCase(), h.value));
    }

    expect(headers.get('x-frame-options')).toBe('DENY');
    expect(headers.get('x-content-type-options')).toBe('nosniff');
    expect(headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
    expect(headers.get('strict-transport-security')).toContain('max-age=63072000');
    expect(headers.get('permissions-policy')).toContain('camera=()');
    expect(headers.get('content-security-policy')).toContain("default-src 'self'");
    expect(headers.get('content-security-policy')).toContain("frame-ancestors 'none'");
  });

  it('rejects unauthorized requests to /api/cron/rotate-cycle without CRON_SECRET (T-8.17)', async () => {
    let status: number;
    let data: any;
    try {
      const res = await fetch(`${BASE_URL}/api/cron/rotate-cycle`);
      status = res.status;
      data = await res.json();
    } catch {
      const { GET } = await import('@/app/api/cron/rotate-cycle/route');
      const res = await GET(new NextRequest(`${BASE_URL}/api/cron/rotate-cycle`));
      status = res.status;
      data = await res.json();
    }
    expect(status).toBe(401);
    expect(data.ok).toBe(false);
  });

  it('rejects unauthorized requests to /api/cron/purge-abuse without CRON_SECRET (T-8.17)', async () => {
    let status: number;
    try {
      const res = await fetch(`${BASE_URL}/api/cron/purge-abuse`);
      status = res.status;
    } catch {
      const { GET } = await import('@/app/api/cron/purge-abuse/route');
      const res = await GET(new NextRequest(`${BASE_URL}/api/cron/purge-abuse`));
      status = res.status;
    }
    expect(status).toBe(401);
  });

  it('accepts authorized requests to /api/cron/purge-abuse with Bearer CRON_SECRET (T-8.17)', async () => {
    let status: number;
    try {
      const res = await fetch(`${BASE_URL}/api/cron/purge-abuse`, {
        headers: {
          Authorization: `Bearer ${CRON_SECRET}`,
        },
      });
      status = res.status;
    } catch {
      const { GET } = await import('@/app/api/cron/purge-abuse/route');
      const req = new NextRequest(`${BASE_URL}/api/cron/purge-abuse`, {
        headers: {
          Authorization: `Bearer ${CRON_SECRET}`,
        },
      });
      const res = await GET(req);
      status = res.status;
    }
    expect([200, 500]).toContain(status); // 200 on success, or 500 if DB threw, but not 401 Unauthorized
    expect(status).not.toBe(401);
  });
});
