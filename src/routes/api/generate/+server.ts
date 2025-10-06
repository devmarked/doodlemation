import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { generateVideo } from '$lib/server/api';
import { uploadVideoFromUrl } from '$lib/server/storage';
import { apiRateLimiter, withRateLimit } from '$lib/server/rateLimit';

const GenerateSchema = z.object({
	imageUrl: z.string().url(),
	prompt: z.string().min(10),
	duration: z.union([z.literal(6), z.literal(10)]).optional(),
	resolution: z.enum(['512p', '768p', '1080p']).optional(),
	promptOptimizer: z.boolean().optional()
});

export const POST: RequestHandler = async (event) => {
	// Apply rate limiting
	withRateLimit(apiRateLimiter)(event);

	try {
		const body = await event.request.json();

		// Validate request
		const validation = GenerateSchema.safeParse(body);
		if (!validation.success) {
			throw error(400, validation.error.message);
		}

		const {
			imageUrl,
			prompt,
			duration = 6,
			resolution = '512p',
			promptOptimizer = false
		} = validation.data;

		console.log('Starting Replicate video generation:', {
			duration,
			resolution,
			promptLength: prompt.length,
			promptOptimizer
		});

		// Generate video with Replicate (handles polling automatically)
		const result = await generateVideo(imageUrl, prompt, duration, resolution, promptOptimizer);

		if (!result.videoUrl) {
			throw error(500, 'Video generation completed but no video URL returned');
		}

		console.log('Video generated successfully, uploading to Supabase...');

		// Upload the generated video to Supabase Storage
		const supabaseVideoUrl = await uploadVideoFromUrl(result.videoUrl);

		console.log('Video uploaded to Supabase:', supabaseVideoUrl);

		return json({
			success: true,
			videoUrl: supabaseVideoUrl, // Return Supabase URL instead of Replicate URL
			predictionId: result.predictionId,
			status: result.status,
			model: 'minimax/hailuo-02',
			duration,
			resolution
		});
	} catch (err) {
		console.error('Video generation error:', err);

		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		const message = err instanceof Error ? err.message : 'Failed to generate video';
		throw error(500, message);
	}
};

