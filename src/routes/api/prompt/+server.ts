import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { generateAnimationPrompt } from '$lib/server/api';
import { getCachedEnhancement, setCachedEnhancement } from '$lib/server/cache';
import { apiRateLimiter, withRateLimit } from '$lib/server/rateLimit';

const PromptSchema = z.object({
	imageDescription: z.string().min(5).max(200),
	animationDetails: z.string().max(300).optional().default('')
});

export const POST: RequestHandler = async (event) => {
	// Apply rate limiting
	withRateLimit(apiRateLimiter)(event);

	try {
		const body = await event.request.json();

		// Validate request
		const validation = PromptSchema.safeParse(body);
		if (!validation.success) {
			throw error(400, validation.error.message);
		}

		const { imageDescription, animationDetails } = validation.data;

		// Create cache key from both inputs
		const cacheKey = `${imageDescription}|${animationDetails}`;

		// Check cache first
		const cached = await getCachedEnhancement(cacheKey);
		if (cached) {
			event.setHeaders({
				'X-Cache': 'HIT',
				'Cache-Control': 'public, max-age=300'
			});

			return json({
				success: true,
				enhanced: cached,
				cached: true
			});
		}

		// Cache miss - call ChatGPT API
		const enhanced = await generateAnimationPrompt(imageDescription, animationDetails);

		// Store in cache
		setCachedEnhancement(cacheKey, enhanced);

		event.setHeaders({
			'X-Cache': 'MISS',
			'Cache-Control': 'public, max-age=300'
		});

		return json({
			success: true,
			enhanced,
			cached: false
		});
	} catch (err) {
		console.error('Prompt generation error:', err);

		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		throw error(500, 'Failed to generate prompt');
	}
};

