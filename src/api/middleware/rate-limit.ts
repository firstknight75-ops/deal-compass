/**
 * Production Rate Limiting Middleware
 * In-memory for now (suitable for single-instance / Vercel).
 * Production: replace with Redis or Upstash.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitOptions {
  windowMs: number;   // e.g. 60000 = 1 minute
  max: number;        // max requests per window
}

const DEFAULT_OPTIONS: RateLimitOptions = {
  windowMs: 60 * 1000, // 1 minute
  max: 60,             // 60 req/min per IP (tune per endpoint)
};

export function rateLimit(options: Partial<RateLimitOptions> = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return (request: Request): { allowed: boolean; remaining: number; reset: number } => {
    // Use IP or fallback to a token/user id when available
    const ip = request.headers.get('x-forwarded-for') 
      || request.headers.get('x-real-ip') 
      || 'unknown';

    const now = Date.now();
    const key = `${ip}:${Math.floor(now / opts.windowMs)}`;

    let entry = store.get(key);

    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + opts.windowMs };
      store.set(key, entry);
    }

    entry.count += 1;

    const remaining = Math.max(0, opts.max - entry.count);
    const allowed = entry.count <= opts.max;

    // Cleanup old keys occasionally (simple)
    if (store.size > 1000) {
      const cutoff = now - (opts.windowMs * 2);
      for (const [k, v] of store) {
        if (v.resetAt < cutoff) store.delete(k);
      }
    }

    return {
      allowed,
      remaining,
      reset: entry.resetAt,
    };
  };
}

// Convenience wrapper for API handlers
export function withRateLimit(handler: (req: Request) => Promise<Response>, opts?: Partial<RateLimitOptions>) {
  const limiter = rateLimit(opts);
  return async (req: Request): Promise<Response> => {
    const result = limiter(req);
    if (!result.allowed) {
      return Response.json(
        { error: 'Rate limit exceeded', retryAfter: Math.ceil((result.reset - Date.now()) / 1000) },
        { 
          status: 429,
          headers: { 
            'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
          }
        }
      );
    }
    const res = await handler(req);
    // Add headers to successful responses
    res.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    return res;
  };
}
