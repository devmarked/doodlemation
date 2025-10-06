import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

const SUPABASE_URL = env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// DELETE: Delete a specific generation by ID
export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const { id } = params;

		if (!id) {
			throw error(400, 'Generation ID is required');
		}

		const { error: dbError } = await supabase.from('generations').delete().eq('id', id);

		if (dbError) {
			console.error('Database error:', dbError);
			throw error(500, 'Failed to delete generation');
		}

		return json({ success: true });
	} catch (err) {
		console.error('Error deleting generation:', err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(500, 'Failed to delete generation');
	}
};

