import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	// Security headers
	response.headers.set(
		'Content-Security-Policy',
		[
			"default-src 'self'",
			"script-src 'self' 'unsafe-inline' 'unsafe-eval'", // SvelteKit needs unsafe-inline
			"style-src 'self' 'unsafe-inline'",
			"img-src 'self' data: https: blob:",
			"font-src 'self' data:",
			"connect-src 'self' https://api.openai.com https://api.replicate.com https://*.supabase.co",
			"media-src 'self' https://*.supabase.co https://replicate.delivery blob:",
			"frame-ancestors 'none'",
			"base-uri 'self'",
			"form-action 'self'"
		].join('; ')
	);

	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

	// Cache control for different paths
	if (event.url.pathname.startsWith('/images') || event.url.pathname.startsWith('/videos')) {
		response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
	} else if (event.url.pathname.startsWith('/api/prompt')) {
		response.headers.set('Cache-Control', 'public, max-age=60');
	}

	return response;
};

