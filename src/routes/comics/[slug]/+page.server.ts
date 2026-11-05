import { error } from '@sveltejs/kit';
import { toSummary } from '$lib/comics';
import { getComics } from '$lib/server/ghost';
import type { PageServerLoad } from './$types';

// New slugs resolve immediately after the shared Ghost catalog refreshes.
export const prerender = false;

export const load: PageServerLoad = async ({ params }) => {
	const catalog = await getComics();
	const index = catalog.episodes.findIndex((episode) => episode.slug === params.slug);
	if (index === -1) error(404, 'Episode not found');
	const prev = catalog.episodes[index - 1];
	const next = catalog.episodes[index + 1];
	return {
		source: catalog.source,
		episode: catalog.episodes[index],
		prev: prev ? toSummary(prev) : null,
		next: next ? toSummary(next) : null,
		latestNumber: catalog.episodes.at(-1)?.number ?? null
	};
};
