import { fetchGhostMedia, getDevlog } from '$lib/server/ghost';
import type { EntryGenerator, RequestHandler } from './$types';

/**
 * Build-time mirror of the Ghost images used by dev log posts, written to
 * `build/devlog/media/<path>` (same as the comics mirror). No posts, no entries.
 */
export const prerender = true;

export const entries: EntryGenerator = async () => {
	const catalog = await getDevlog();
	return catalog.media.map((path) => ({ path }));
};

export const GET: RequestHandler = async ({ params }) => {
	const catalog = await getDevlog();
	if (!catalog.media.includes(params.path)) {
		return new Response('Not found', { status: 404 });
	}
	const upstream = await fetchGhostMedia(params.path);
	return new Response(await upstream.arrayBuffer(), {
		headers: {
			'content-type': upstream.headers.get('content-type') ?? 'application/octet-stream'
		}
	});
};
