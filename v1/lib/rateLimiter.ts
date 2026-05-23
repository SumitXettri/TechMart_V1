let redisClient: unknown = null;
let usingRedis = false;

const RATE_LIMIT_WINDOW_MS_DEFAULT = 60_000;

async function getRedis() {
  if (redisClient) return redisClient;
  try {
    // dynamic import to keep optional
    const IORedis = await import('ioredis');
    const RedisFactory = (IORedis && (IORedis as unknown as Record<string, unknown>).default) || IORedis;
    const RedisCtor = RedisFactory as unknown as new (url?: string) => unknown;
    // @ts-expect-error dynamic constructor
    redisClient = new RedisCtor(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
    usingRedis = true;
    return redisClient;
  } catch {
    redisClient = null;
    usingRedis = false;
    return null;
  }
}

const memoryMap = new Map<string, { count: number; reset: number }>();

export async function rateAllowed(key: string, max = 120, windowMs = RATE_LIMIT_WINDOW_MS_DEFAULT) {
  const redis = await getRedis();
  const now = Date.now();
  if (redis) {
    try {
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.pexpire(key, windowMs);
      }
      return count <= max;
    } catch {
      // fall through to memory
    }
  }

  const existing = memoryMap.get(key);
  if (!existing || existing.reset <= now) {
    memoryMap.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (existing.count >= max) return false;
  existing.count += 1;
  return true;
}

export function isUsingRedis() {
  return usingRedis;
}

export default rateAllowed;
