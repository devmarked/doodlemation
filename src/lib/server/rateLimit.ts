// Rate limiting implementation

import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

interface RateLimitConfig {
	maxRequests: number;
	windowMs: number;
	keyGenerator?: (event: RequestEvent) => string;
}

class RateLimiter {
	private requests = new Map<string, { count: number; resetAt: number }>();

	constructor(private config: RateLimitConfig) {}

	check(event: RequestEvent): boolean {
		const key = this.config.keyGenerator?.(event) || event.getClientAddress();
		const now = Date.now();

		const record = this.requests.get(key);

		if (!record || now > record.resetAt) {
			this.requests.set(key, {
				count: 1,
				resetAt: now + this.config.windowMs
			});
			return true;
		}

		if (record.count >= this.config.maxRequests) {
			return false;
		}

		record.count++;
		return true;
	}

	// Cleanup old entries periodically
	cleanup() {
		const now = Date.now();
		for (const [key, record] of this.requests.entries()) {
			if (now > record.resetAt) {
				this.requests.delete(key);
			}
		}
	}
}

// Export rate limiters
export const apiRateLimiter = new RateLimiter({
	maxRequests: 10,
	windowMs: 60000 // 10 requests per minute
});

export const uploadRateLimiter = new RateLimiter({
	maxRequests: 5,
	windowMs: 300000 // 5 uploads per 5 minutes
});

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
	setInterval(() => {
		apiRateLimiter.cleanup();
		uploadRateLimiter.cleanup();
	}, 300000);
}

// Middleware helper
export function withRateLimit(limiter: RateLimiter) {
	return (event: RequestEvent) => {
		if (!limiter.check(event)) {
			throw error(429, {
				message: 'Too many requests. Please try again later.'
			});
		}
	};
}

