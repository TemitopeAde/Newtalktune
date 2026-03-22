// In-memory sliding window rate limiter.
// Works for single-instance / self-hosted deployments.
// For multi-instance or serverless (e.g. Vercel), replace the store with
// a shared Redis store (e.g. Upstash @upstash/ratelimit).

interface RateLimitEntry {
    count: number
    resetAt: number // Unix timestamp (ms)
}

const store = new Map<string, RateLimitEntry>()

function cleanup() {
    const now = Date.now()
    for (const [key, entry] of store) {
        if (entry.resetAt <= now) {
            store.delete(key)
        }
    }
}

/**
 * Check and increment a rate limit counter.
 *
 * @param key       Unique identifier, e.g. `login:192.168.1.1`
 * @param limit     Max allowed requests within the window
 * @param windowMs  Window size in milliseconds
 */
export function rateLimit(
    key: string,
    limit: number,
    windowMs: number
): { success: boolean; remaining: number; retryAfter: number } {
    // Periodically purge expired entries to prevent unbounded memory growth
    if (store.size > 1000) {
        cleanup()
    }

    const now = Date.now()
    const entry = store.get(key)

    if (!entry || entry.resetAt <= now) {
        store.set(key, { count: 1, resetAt: now + windowMs })
        return { success: true, remaining: limit - 1, retryAfter: 0 }
    }

    if (entry.count >= limit) {
        const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
        return { success: false, remaining: 0, retryAfter }
    }

    entry.count += 1
    return { success: true, remaining: limit - entry.count, retryAfter: 0 }
}
