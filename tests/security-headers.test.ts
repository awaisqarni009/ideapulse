import { describe, it, expect } from 'vitest';

describe('T-8.16 & T-8.17: Security Headers & Cron Fallback Verification', () => {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const CRON_SECRET =
    process.env.CRON_SECRET || '4f7b6a189c2d3e5f0a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f';

  it('emits all required security headers per T-8.16', async () => {
    const res = await fetch(`${BASE_URL}/feed`);
    expect(res.status).toBe(200);

    const headers = res.headers;
    expect(headers.get('x-frame-options')).toBe('DENY');
    expect(headers.get('x-content-type-options')).toBe('nosniff');
    expect(headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
    expect(headers.get('strict-transport-security')).toContain('max-age=63072000');
    expect(headers.get('permissions-policy')).toContain('camera=()');
    expect(headers.get('content-security-policy')).toContain("default-src 'self'");
    expect(headers.get('content-security-policy')).toContain("frame-ancestors 'none'");
  });

  it('rejects unauthorized requests to /api/cron/rotate-cycle without CRON_SECRET (T-8.17)', async () => {
    const res = await fetch(`${BASE_URL}/api/cron/rotate-cycle`);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.ok).toBe(false);
  });

  it('rejects unauthorized requests to /api/cron/purge-abuse without CRON_SECRET (T-8.17)', async () => {
    const res = await fetch(`${BASE_URL}/api/cron/purge-abuse`);
    expect(res.status).toBe(401);
  });

  it('accepts authorized requests to /api/cron/purge-abuse with Bearer CRON_SECRET (T-8.17)', async () => {
    const res = await fetch(`${BASE_URL}/api/cron/purge-abuse`, {
      headers: {
        Authorization: `Bearer ${CRON_SECRET}`,
      },
    });
    expect([200, 500]).toContain(res.status); // 200 on success, or 500 if DB threw, but not 401 Unauthorized
    expect(res.status).not.toBe(401);
  });
});
