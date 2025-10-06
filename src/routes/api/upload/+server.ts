import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { uploadImage } from '$lib/server/storage';
import { uploadRateLimiter, withRateLimit } from '$lib/server/rateLimit';

export const POST: RequestHandler = async (event) => {
	// Apply rate limiting
	withRateLimit(uploadRateLimiter)(event);

	try {
		const formData = await event.request.formData();
		const file = formData.get('file') as File;

		if (!file) {
			throw error(400, 'No file provided');
		}

		// Validate file type and size
		const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
		if (!allowedTypes.includes(file.type)) {
			throw error(400, 'Invalid file type. Only JPEG, PNG, and WebP are allowed.');
		}

		const maxSize = 10 * 1024 * 1024; // 10MB
		if (file.size > maxSize) {
			throw error(400, 'File too large. Maximum size is 10MB.');
		}

		// Upload to Supabase Storage
		const url = await uploadImage(file);

		return json({
			success: true,
			url,
			fileName: file.name
		});
	} catch (err) {
		console.error('Upload error:', err);

		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		throw error(500, 'Failed to upload image');
	}
};

