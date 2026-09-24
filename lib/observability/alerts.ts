import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export interface CycleOverdueAlert {
  alert: boolean;
  message?: string;
  overdueMinutes?: number;
  cycleNumber?: number;
}

export interface AbuseSpikeAlert {
  alert: boolean;
  message?: string;
  hourlyRate: number;
  baselineHourlyRate: number;
  ratio: number;
}

export interface LatencyAlert {
  alert: boolean;
  message?: string;
  p95LatencyMs: number;
  thresholdMs: number;
}

/**
 * T-8.21: Alert if active cycle failed to rotate within 30 minutes of its boundary.
 * Invokes check_cycle_health() in PostgreSQL.
 */
export async function checkCycleBoundaryAlert(): Promise<CycleOverdueAlert> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('check_cycle_health');

  if (error) {
    return {
      alert: true,
      message: `Failed to check cycle health: ${error.message}`,
    };
  }

  const result = data as any;
  if (result?.alert) {
    return {
      alert: true,
      overdueMinutes: result.overdue_minutes,
      cycleNumber: result.cycle_number,
      message: `ALERT: Cycle #${result.cycle_number} failed to rotate within 30 minutes of boundary (overdue by ${result.overdue_minutes}m).`,
    };
  }

  return { alert: false };
}

/**
 * T-8.22: Alert if abuse_events rate spikes above 3× the rolling baseline.
 * Compares event count in the last 1 hour vs. the rolling 24-hour average.
 */
export async function checkAbuseRateSpikeAlert(): Promise<AbuseSpikeAlert> {
  const admin = createAdminClient();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // 1. Count events in the last 1 hour
  const { count: lastHourCount, error: err1 } = await admin
    .from('abuse_events')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', oneHourAgo);

  // 2. Count events in the last 24 hours
  const { count: last24hCount, error: err2 } = await admin
    .from('abuse_events')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', twentyFourHoursAgo);

  if (err1 || err2) {
    return {
      alert: false,
      hourlyRate: 0,
      baselineHourlyRate: 0,
      ratio: 0,
      message: 'Failed to query abuse event counts',
    };
  }

  const recent = lastHourCount || 0;
  const total24h = last24hCount || 0;
  const baselineRate = Math.max(1, total24h / 24); // minimum 1 event/hr baseline to avoid divide-by-zero
  const ratio = Math.round((recent / baselineRate) * 10) / 10;

  // Alert triggers if rate is at least 3x baseline and >= 5 events
  const shouldAlert = recent >= 5 && ratio >= 3.0;

  return {
    alert: shouldAlert,
    hourlyRate: recent,
    baselineHourlyRate: Math.round(baselineRate * 10) / 10,
    ratio,
    message: shouldAlert
      ? `ALERT: abuse_events rate spike detected! Current rate is ${ratio}x the rolling baseline (${recent} events in last hour vs ${baselineRate.toFixed(1)}/hr baseline).`
      : undefined,
  };
}

/**
 * In-memory sample buffer for vote latency measurements [T-8.23]
 */
const latencySamples: number[] = [];
const MAX_SAMPLES = 200;

export function recordVoteLatency(latencyMs: number) {
  latencySamples.push(latencyMs);
  if (latencySamples.length > MAX_SAMPLES) {
    latencySamples.shift();
  }
}

/**
 * T-8.23: Alert if p95 vote latency exceeds 800 ms.
 */
export function checkVoteLatencyAlert(thresholdMs = 800): LatencyAlert {
  if (latencySamples.length < 5) {
    return {
      alert: false,
      p95LatencyMs: 0,
      thresholdMs,
    };
  }

  const sorted = [...latencySamples].sort((a, b) => a - b);
  const p95Index = Math.floor(sorted.length * 0.95);
  const p95 = sorted[p95Index] ?? 0;

  const shouldAlert = p95 > thresholdMs;

  return {
    alert: shouldAlert,
    p95LatencyMs: p95,
    thresholdMs,
    message: shouldAlert
      ? `ALERT: p95 vote round-trip latency exceeded threshold: ${p95}ms > ${thresholdMs}ms.`
      : undefined,
  };
}
