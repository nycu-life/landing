import { toSummary } from '$lib/comics';
import { getComics } from '$lib/server/ghost';
import type { PageServerLoad } from './$types';

// Runs only while prerendering (`pnpm build`); the result is baked into static HTML.
export const prerender = true;

export const load: PageServerLoad = async () => {
	const catalog = await getComics();
	return { source: catalog.source, episodes: catalog.episodes.map(toSummary) };
};
