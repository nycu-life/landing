import { base } from '$app/paths';
import type { Handle } from '@sveltejs/kit';
import { getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale))
		});
	});

export const handle: Handle = async ({ event, resolve }) => {
	const path = event.url.pathname.slice(base.length);
	// /api/wishes is routed to the separate Go service by the ingress.
	if (path === '/api' || path.startsWith('/api/')) {
		return new Response(JSON.stringify({ error: 'not_found' }), {
			status: 404,
			headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
		});
	}
	const response = await handleParaglide({ event, resolve });
	if (/^\/(devlog|comics)(\/|$)/.test(path) || path === '/sitemap.xml') {
		// Locale depends on the Paraglide cookie. Do not share translated HTML or
		// prolong the server's 30-second content cache with a second HTTP cache.
		response.headers.set('cache-control', 'private, no-cache');
	}
	return response;
};
