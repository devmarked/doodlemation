import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { z } from 'zod';

const SUPABASE_URL = env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Validation schema for import
const ImportSchema = z.object({
	generations: z.array(
		z.object({
			id: z.string().optional(),
			imageUrl: z.string().url(),
			videoUrl: z.string().url(),
			prompt: z.string().min(1),
			createdAt: z.string().optional(),
			model: z.string().optional(),
			duration: z.number().optional(),
			resolution: z.string().optional()
		})
	)
});

// POST: Import multiple generations
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();

		// Validate request
		const validation = ImportSchema.safeParse(body);
		if (!validation.success) {
			throw error(400, validation.error.message);
		}

		const { generations } = validation.data;

		// Get existing generation IDs to avoid duplicates
		const { data: existing } = await supabase.from('generations').select('id');
		const existingIds = new Set((existing || []).map((g) => g.id));

		// Filter out duplicates and prepare for insert
		const newGenerations = generations
			.filter((g) => !g.id || !existingIds.has(g.id))
			.map((g) => ({
				...(g.id && { id: g.id }), // Include ID if provided
				image_url: g.imageUrl,
				video_url: g.videoUrl,
				prompt: g.prompt,
				created_at: g.createdAt || new Date().toISOString(),
				model: g.model,
				duration: g.duration,
				resolution: g.resolution
			}));

		if (newGenerations.length === 0) {
			return json({ imported: 0, message: 'No new generations to import' });
		}

		// Insert new generations
		const { error: dbError } = await supabase.from('generations').insert(newGenerations);

		if (dbError) {
			console.error('Database error:', dbError);
			throw error(500, 'Failed to import generations');
		}

		return json({ imported: newGenerations.length });
	} catch (err) {
		console.error('Error importing generations:', err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(500, 'Failed to import generations');
	}
};

