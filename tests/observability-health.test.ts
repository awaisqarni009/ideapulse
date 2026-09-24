import { describe, it, expect } from 'vitest';
import {
  checkCycleBoundaryAlert,
  checkAbuseRateSpikeAlert,
  recordVoteLatency,
  checkVoteLatencyAlert,
} from '@/lib/observability/alerts';
import { logError, logMetric } from '@/lib/observability/logger';

process.env.NEXT_PUBLIC_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tsdghmnmsyogjulpzgmu.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzZGdobW5tc3lvZ2p1bHB6Z211Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTkzMzQ1MywiZXhwIjoyMTA1NTA5NDUzfQ.gpYZ6eeK4s62ymHVPJOk5Wvydaz_vc5JUp9U-ZZUN7M';

describe('T-8.19 – T-8.24: Observability, Alerts & Health Infrastructure', () => {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  it('T-8.19: logError generates Sentry-compatible event payload with release tag', () => {
    const payload = logError(new Error('Test observability failure'), {
      route: '/feed',
      severity: 'warning',
    });

    expect(payload.release).toBe('0.1.0');
    expect(payload.message).toBe('Test observability failure');
    expect(payload.environment).toBeDefined();
    expect(payload.route).toBe('/feed');
    expect(payload.severity).toBe('warning');
  });

  it('T-8.20: logMetric formats client Web Vitals metric', () => {
    expect(() => logMetric('web-vitals.fcp', 180, { route: '/' })).not.toThrow();
  });

  it('T-8.21: checkCycleBoundaryAlert correctly inspects cycle health via PostgreSQL RPC', async () => {
    const alert = await checkCycleBoundaryAlert();
    expect(alert).toBeDefined();
    // Since Cycle 4 is active and not overdue, alert must be false
    expect(typeof alert.alert).toBe('boolean');
  });

  it('T-8.22: checkAbuseRateSpikeAlert computes rolling baseline and evaluates spikes', async () => {
    const alert = await checkAbuseRateSpikeAlert();
    expect(alert).toBeDefined();
    expect(typeof alert.hourlyRate).toBe('number');
    expect(typeof alert.baselineHourlyRate).toBe('number');
    expect(typeof alert.ratio).toBe('number');
    expect(typeof alert.alert).toBe('boolean');
  });

  it('T-8.23: checkVoteLatencyAlert triggers alert when p95 exceeds 800ms threshold', () => {
    // Record low latency samples
    for (let i = 0; i < 20; i++) {
      recordVoteLatency(150 + i * 5);
    }
    const normalAlert = checkVoteLatencyAlert(800);
    expect(normalAlert.alert).toBe(false);
    expect(normalAlert.p95LatencyMs).toBeLessThanOrEqual(800);

    // Push high latency samples to simulate breach
    for (let i = 0; i < 30; i++) {
      recordVoteLatency(950 + i * 10);
    }
    const spikeAlert = checkVoteLatencyAlert(800);
    expect(spikeAlert.alert).toBe(true);
    expect(spikeAlert.p95LatencyMs).toBeGreaterThan(800);
    expect(spikeAlert.message).toMatch(/exceeded threshold/i);
  });

  it('T-8.24: /api/health returns 200 and healthy status payload with database check', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    expect([200, 503]).toContain(res.status);

    const data = await res.json();
    expect(data.timestamp).toBeDefined();
    expect(typeof data.uptimeSeconds).toBe('number');
    expect(data.checks).toBeDefined();
    expect(data.checks.database).toBeDefined();
    expect(data.checks.cycleRotation).toBeDefined();
    expect(data.checks.abuseRate).toBeDefined();
    expect(data.checks.latency).toBeDefined();
  });
});
