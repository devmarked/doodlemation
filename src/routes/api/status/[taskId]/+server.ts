import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { checkPredictionStatus } from '$lib/server/api';
import { uploadVideoFromUrl } from '$lib/server/storage';

export const GET: RequestHandler = async ({ params }) => {
	const { taskId } = params;

	if (!taskId) {
		throw error(400, 'Task ID is required');
	}

	try {
		console.log('Checking status for prediction:', taskId);

		// Check prediction status
		const result = await checkPredictionStatus(taskId);

		// If succeeded, upload to Supabase
		if (result.status === 'succeeded' && result.videoUrl) {
			console.log('Video generation complete, uploading to Supabase...');
			
			try {
				const supabaseVideoUrl = await uploadVideoFromUrl(result.videoUrl);
				console.log('Video uploaded to Supabase:', supabaseVideoUrl);

				return json({
					status: 'succeeded',
					videoUrl: supabaseVideoUrl,
					predictionId: taskId
				});
			} catch (uploadErr) {
				console.error('Failed to upload video to Supabase:', uploadErr);
				// Return Replicate URL as fallback
				return json({
					status: 'succeeded',
					videoUrl: result.videoUrl,
					predictionId: taskId,
					warning: 'Failed to upload to storage, using original URL'
				});
			}
		}

		// If failed or canceled
		if (result.status === 'failed' || result.status === 'canceled') {
			return json({
				status: result.status,
				error: result.error || 'Video generation failed',
				predictionId: taskId
			});
		}

		// Still processing
		return json({
			status: result.status,
			predictionId: taskId
		});
	} catch (err) {
		console.error('Error checking prediction status:', err);
		const message = err instanceof Error ? err.message : 'Failed to check prediction status';
		throw error(500, message);
	}
};

