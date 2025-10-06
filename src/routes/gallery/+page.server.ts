import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

const SUPABASE_URL = env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export const load: PageServerLoad = async () => {
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

		return {
			generations
		};
	} catch (err) {
		console.error('Error fetching generations:', err);
		throw error(500, 'Failed to fetch generations');
	}
};

