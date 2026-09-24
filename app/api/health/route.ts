import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  checkCycleBoundaryAlert,
  checkAbuseRateSpikeAlert,
  checkVoteLatencyAlert,
} from '@/lib/observability/alerts';

export const dynamic = 'force-dynamic';

/**
 * Uptime & Health Check Endpoint [T-8.24]
 * Evaluates database connection, cycle engine health, abuse rate anomaly, and latency.
 */
export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, unknown> = {};
  let isHealthy = true;

  try {
    // 1. Database Connectivity Check
    const supabase = await createClient();
    const { data: dbData, error: dbError } = await supabase
      .from('cycles')
      .select('id, cycle_number, status, ends_at')
      .eq('status', 'active')
      .maybeSingle();

    if (dbError) {
      checks.database = { status: 'error', message: dbError.message };
      isHealthy = false;
    } else {
      checks.database = { status: 'ok', activeCycle: dbData?.cycle_number ?? null };
    }

    // 2. Cycle Boundary Alert Check [T-8.21]
    const cycleAlert = await checkCycleBoundaryAlert();
    checks.cycleRotation = {
      status: cycleAlert.alert ? 'alert' : 'ok',
      ...(cycleAlert.alert
        ? { message: cycleAlert.message, overdueMinutes: cycleAlert.overdueMinutes }
        : {}),
    };
    if (cycleAlert.alert) {
      isHealthy = false;
    }

    // 3. Abuse Rate Spike Check [T-8.22]
    const abuseAlert = await checkAbuseRateSpikeAlert();
    checks.abuseRate = {
      status: abuseAlert.alert ? 'alert' : 'ok',
      hourlyRate: abuseAlert.hourlyRate,
      baseline: abuseAlert.baselineHourlyRate,
      ratio: abuseAlert.ratio,
      ...(abuseAlert.alert ? { message: abuseAlert.message } : {}),
    };

    // 4. Vote Latency Check [T-8.23]
    const latencyAlert = checkVoteLatencyAlert();
    checks.latency = {
      status: latencyAlert.alert ? 'alert' : 'ok',
      p95LatencyMs: latencyAlert.p95LatencyMs,
      thresholdMs: latencyAlert.thresholdMs,
    };

    const responsePayload = {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      responseTimeMs: Date.now() - startTime,
      checks,
    };

    return NextResponse.json(responsePayload, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: message,
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      },
    );
  }
}
