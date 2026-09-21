import { createHash } from 'crypto';

/**
 * Returns the 24-hour rotating daily salt computed from the server seed
 * and the current UTC date string (YYYY-MM-DD).
 * Held outside the database per RULES.md BR-035.
 */
export function getDailySalt(date: Date = new Date()): string {
  const seed =
    process.env.IP_HASH_SALT_SEED || 'ideapulse-default-daily-salt-seed-replace-in-production';

  // Format UTC date as YYYY-MM-DD
  const utcDateStr = date.toISOString().slice(0, 10);

  return createHash('sha256').update(`${seed}:${utcDateStr}`).digest('hex');
}

/**
 * Computes sha256(ip + ":" + dailySalt).
 * Ensures same-day correlation without storing or exposing raw IP addresses (BR-035).
 */
export function hashIp(rawIp: string, date: Date = new Date()): string {
  if (!rawIp) {
    return '0000000000000000000000000000000000000000000000000000000000000000';
  }

  const salt = getDailySalt(date);
  return createHash('sha256').update(`${rawIp.trim()}:${salt}`).digest('hex');
}

/**
 * Extracts client IP from incoming request headers and returns the daily-salted hash.
 * Never returns or persists raw IP.
 */
export function getHashedClientIp(headers: Headers): string {
  const forwardedFor = headers.get('x-forwarded-for');
  let rawIp = '';

  if (forwardedFor) {
    // x-forwarded-for may contain multiple IPs: client, proxy1, proxy2
    rawIp = forwardedFor.split(',')[0]?.trim() || '';
  }

  if (!rawIp) {
    rawIp =
      headers.get('x-real-ip') ||
      headers.get('cf-connecting-ip') ||
      headers.get('true-client-ip') ||
      '127.0.0.1';
  }

  return hashIp(rawIp);
}
