import { getComics, fetchGhostMedia } from '$lib/server/ghost';
import type { EntryGenerator, RequestHandler } from './$types';

/**
 * Build-time mirror of the Ghost images used by comic episodes. Each entry is
 * prerendered to `build/comics/media/<path>`, so the static site never hot-links
 * the CMS. With placeholder content there are no entries and nothing is written.
 */
export const prerender = true;

export const entries: EntryGenerator = async () => {
	const catalog = await getComics();
	return catalog.media.map((path) => ({ path }));
};

export const GET: RequestHandler = async ({ params }) => {
	const catalog = await getComics();
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
