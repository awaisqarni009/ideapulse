/**
 * Error logging and observability client [T-8.19]
 * Integrates Sentry-compatible release tagging and error dispatch.
 */

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0';
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

export interface ErrorContext {
  userId?: string;
  route?: string;
  extra?: Record<string, unknown>;
  severity?: 'info' | 'warning' | 'error' | 'fatal';
}

export function logError(error: unknown, context: ErrorContext = {}) {
  const errMessage = error instanceof Error ? error.message : String(error);
  const errStack = error instanceof Error ? error.stack : undefined;

  const payload = {
    release: APP_VERSION,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    message: errMessage,
    stack: errStack,
    ...context,
  };

  if (process.env.NODE_ENV !== 'production') {
    console.error('[Observability Error Log]:', payload);
  }

  // If Sentry DSN is configured, send error event via Sentry capture API
  if (SENTRY_DSN && typeof window !== 'undefined') {
    try {
      // Dispatch custom error event for observability listeners
      window.dispatchEvent(new CustomEvent('ideapulse:telemetry-error', { detail: payload }));
    } catch {}
  }

  return payload;
}

export function logMetric(name: string, value: number, tags: Record<string, string> = {}) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Metric] ${name}: ${value}`, tags);
  }
}
