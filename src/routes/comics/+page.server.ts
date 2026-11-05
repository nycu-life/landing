import { toSummary } from '$lib/comics';
import { getComics } from '$lib/server/ghost';
import type { PageServerLoad } from './$types';

// Render on request; the Ghost catalog is shared for 30 seconds.
export const prerender = false;

export const load: PageServerLoad = async () => {
	const catalog = await getComics();
	return { source: catalog.source, episodes: catalog.episodes.map(toSummary) };
};
