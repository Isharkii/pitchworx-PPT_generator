import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    lazyConnect: true,
    // Don't hammer a missing Redis instance — back off quickly
    retryStrategy: (times: number) => (times > 3 ? null : Math.min(times * 200, 1000)),
  });

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

// CRITICAL: Must attach 'error' listener before any connect attempt.
// Without it, ioredis emits an unhandled 'error' EventEmitter event
// which Node.js converts to an uncaught exception → process crashes.
redis.on("error", (err: Error) => {
  console.warn("[redis] Connection error (non-fatal):", err.message);
});

// Attempt connection on startup so misconfiguration is logged immediately
// rather than silently failing on first cache operation.
redis.connect().catch((err: Error) => {
  console.warn("[redis] Could not connect — caching disabled:", err.message);
});

// ── Helpers ──────────────────────────────────────────────────────────────────

const CACHE_TTL = 60 * 5; // 5 minutes default

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const val = await redis.get(key);
    return val ? (JSON.parse(val) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttl = CACHE_TTL) {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  } catch {
    // Redis errors should never crash the app
  }
}

export async function cacheDel(key: string) {
  try {
    await redis.del(key);
  } catch {}
}
