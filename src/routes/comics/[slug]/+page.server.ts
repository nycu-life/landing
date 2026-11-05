import { error } from '@sveltejs/kit';
import { toSummary } from '$lib/comics';
import { getComics } from '$lib/server/ghost';
import type { EntryGenerator, PageServerLoad } from './$types';

// Runs only while prerendering (`pnpm build`); every episode becomes static HTML.
export const prerender = true;

export const entries: EntryGenerator = async () => {
	const catalog = await getComics();
	return catalog.episodes.map(({ slug }) => ({ slug }));
};

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
