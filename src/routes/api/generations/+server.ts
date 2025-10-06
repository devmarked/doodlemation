import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { z } from 'zod';

const SUPABASE_URL = env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Validation schema for generation data
const GenerationSchema = z.object({
	imageUrl: z.string().url(),
	videoUrl: z.string().url(),
	prompt: z.string().min(1),
	model: z.string().optional(),
	duration: z.number().optional(),
	resolution: z.string().optional()
});

// GET: Fetch all generations
export const GET: RequestHandler = async () => {
	try {
		const { data, error: dbError } = await supabase
			.from('generations')
			.select('*')
			.order('created_at', { ascending: false });

		if (dbError) {
			console.error('Database error:', dbError);
			throw error(500, 'Failed to fetch generations');
		}

		// Transform snake_case to camelCase
		const generations = (data || []).map((gen) => ({
			id: gen.id,
			imageUrl: gen.image_url,
			videoUrl: gen.video_url,
			prompt: gen.prompt,
			createdAt: gen.created_at,
			model: gen.model,
			duration: gen.duration,
			resolution: gen.resolution
		}));

		return json({ generations });
	} catch (err) {
		console.error('Error fetching generations:', err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(500, 'Failed to fetch generations');
	}
};

// POST: Create new generation
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();

		// Validate request
		const validation = GenerationSchema.safeParse(body);
		if (!validation.success) {
			throw error(400, validation.error.message);
		}

		const { imageUrl, videoUrl, prompt, model, duration, resolution } = validation.data;

		// Insert into database
		const { data, error: dbError } = await supabase
			.from('generations')
			.insert({
				image_url: imageUrl,
				video_url: videoUrl,
				prompt,
				model,
				duration,
				resolution
			})
			.select()
			.single();

		if (dbError) {
			console.error('Database error:', dbError);
			throw error(500, 'Failed to save generation');
		}

		// Transform snake_case to camelCase
		const generation = {
			id: data.id,
			imageUrl: data.image_url,
			videoUrl: data.video_url,
			prompt: data.prompt,
			createdAt: data.created_at,
			model: data.model,
			duration: data.duration,
			resolution: data.resolution
		};

		return json({ generation });
	} catch (err) {
		console.error('Error saving generation:', err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(500, 'Failed to save generation');
	}
};

// DELETE: Clear all generations
export const DELETE: RequestHandler = async () => {
	try {
		const { error: dbError } = await supabase.from('generations').delete().neq('id', '00000000-0000-0000-0000-000000000000');

		if (dbError) {
			console.error('Database error:', dbError);
			throw error(500, 'Failed to clear generations');
		}

		return json({ success: true });
	} catch (err) {
		console.error('Error clearing generations:', err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(500, 'Failed to clear generations');
	}
};

