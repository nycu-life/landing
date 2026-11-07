import { base } from '$app/paths';
import type { Handle } from '@sveltejs/kit';
import { getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';
import {
	ghostNavigationResponse,
	proxyGhostTheme,
	themeProxyPath
} from '$lib/server/ghost-theme-proxy';

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
	if (process.env.PUBLIC_SITE_ENGINE === 'ghost') {
		if (
			path === '/cms' ||
			path === '/cms/' ||
			path === '/cms/ghost' ||
			path.startsWith('/cms/ghost/')
		) {
			return new Response(null, {
				status: 308,
				headers: {
					location:
						path === '/cms' || path === '/cms/' ? '/ghost/' : path.slice(4) + event.url.search
				}
			});
		}
		if (path.startsWith('/pages/'))
			return new Response(null, {
				status: 308,
				headers: { location: path.slice('/pages'.length) + event.url.search }
			});
		if (themeProxyPath(path) !== null) {
			const navigationResponse = ghostNavigationResponse(event.url, event.isDataRequest);
			if (navigationResponse) return navigationResponse;
			if (!process.env.GHOST_THEME_URL)
				return new Response('Ghost theme upstream is not configured', { status: 503 });
			return proxyGhostTheme(event.request, process.env.GHOST_THEME_URL);
		}
		// The ingress gates Admin traffic and sends it directly to Ghost.
		if (/^\/ghost(?:\/|$)/.test(path)) return new Response('Not found', { status: 404 });
	}
	// /api/wishes is routed to the separate Go service by the ingress.
	if (path === '/api' || path.startsWith('/api/')) {
		return new Response(JSON.stringify({ error: 'not_found' }), {
			status: 404,
			headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
		});
	}
	const response = await handleParaglide({ event, resolve });
	if (!path.startsWith('/_app/')) {
		// Locale depends on the Paraglide cookie. Do not share translated HTML or
		// prolong the server's 30-second content cache with a second HTTP cache.
		response.headers.set('cache-control', 'private, no-cache');
	}
	return response;
};
