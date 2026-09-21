import { createClient } from '@/lib/supabase/server';

export type RateLimitTier = 'castVote' | 'submitIdea' | 'login' | 'register' | 'anonymousReads';

export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

export const RATE_LIMIT_CONFIGS: Record<RateLimitTier, RateLimitConfig> = {
  castVote: { maxRequests: 10, windowSeconds: 60 }, // 10 attempts / 1 minute (Key: user ID)
  submitIdea: { maxRequests: 5, windowSeconds: 600 }, // 5 requests / 10 minutes (Key: user ID)
  login: { maxRequests: 6, windowSeconds: 900 }, // 6 attempts / 15 minutes (Key: IP hash + email)
  register: { maxRequests: 3, windowSeconds: 3600 }, // 3 accounts / 1 hour (Key: IP hash)
  anonymousReads: { maxRequests: 300, windowSeconds: 60 }, // 300 requests / 1 minute (Key: IP hash)
};

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
}

// In-memory sliding window store for local dev, test environments, and fallback
interface WindowEntry {
  timestamps: number[];
}

const memoryStore = new Map<string, WindowEntry>();

// Clean up stale memory store entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryStore.entries()) {
      // Keep timestamps from the last hour max
      entry.timestamps = entry.timestamps.filter((ts) => now - ts < 3600000);
      if (entry.timestamps.length === 0) {
        memoryStore.delete(key);
      }
    }
  }, 60000);
}

/**
 * Checks and increments rate limit counter using sliding window.
 * Supports Upstash Redis REST when configured; falls back to in-memory store.
 */
export async function checkRateLimit(tier: RateLimitTier, key: string): Promise<RateLimitResult> {
  const config = RATE_LIMIT_CONFIGS[tier];
  const storageKey = `ratelimit:${tier}:${key}`;
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  // 1. Try Upstash Redis if configured
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      const clearBefore = now - windowMs;
      // Pipeline: zremrangebyscore, zadd, zcard, expire
      const pipelineRes = await fetch(`${upstashUrl}/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          ['ZREMRANGEBYSCORE', storageKey, 0, clearBefore],
          ['ZADD', storageKey, now, `${now}:${Math.random()}`],
          ['ZCARD', storageKey],
          ['EXPIRE', storageKey, config.windowSeconds + 10],
        ]),
      });

      if (pipelineRes.ok) {
        const results = await pipelineRes.json();
        const count = Number(results[2]?.result ?? 1);
        const success = count <= config.maxRequests;
        return {
          success,
          limit: config.maxRequests,
          remaining: Math.max(0, config.maxRequests - count),
          resetInSeconds: config.windowSeconds,
        };
      }
    } catch (err) {
      console.warn('[RateLimit] Upstash error, falling back to memory store:', err);
    }
  }

  // 2. In-memory sliding window fallback
  let entry = memoryStore.get(storageKey);
  if (!entry) {
    entry = { timestamps: [] };
    memoryStore.set(storageKey, entry);
  }

  // Filter timestamps within sliding window
  entry.timestamps = entry.timestamps.filter((ts) => now - ts < windowMs);

  const currentCount = entry.timestamps.length;
  if (currentCount >= config.maxRequests) {
    const oldest = entry.timestamps[0] || now;
    const resetInSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      resetInSeconds,
    };
  }

  // Record new request timestamp
  entry.timestamps.push(now);

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - entry.timestamps.length,
    resetInSeconds: config.windowSeconds,
  };
}

/**
 * Logs rate limit trip to abuse_events table per BR-032 / BR-036.
 */
export async function logRateLimitAbuse(params: {
  actorId?: string | null;
  ipHash: string;
  tier: RateLimitTier;
  userAgent?: string | null;
}) {
  try {
    const supabase = await createClient();
    await supabase.from('abuse_events').insert({
      actor_id: params.actorId || null,
      kind: 'rate_limit_tripped',
      error_code: 'IP_RATE_LIMITED',
      ip_hash: params.ipHash,
      user_agent: params.userAgent || null,
      detail: {
        tier: params.tier,
        limit: RATE_LIMIT_CONFIGS[params.tier].maxRequests,
        window: `${RATE_LIMIT_CONFIGS[params.tier].windowSeconds}s`,
      },
    });
  } catch (err) {
    console.error('[RateLimit] Failed to log abuse event:', err);
  }
}
