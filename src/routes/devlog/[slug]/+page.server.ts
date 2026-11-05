import { error } from '@sveltejs/kit';
import { toDevlogSummary } from '$lib/devlog';
import { getDevlog } from '$lib/server/ghost';
import type { EntryGenerator, PageServerLoad } from './$types';

// Runs only while prerendering (`pnpm build`); every published post becomes static HTML.
export const prerender = true;

export const entries: EntryGenerator = async () => {
	const catalog = await getDevlog();
	return catalog.posts.map(({ slug }) => ({ slug }));
};

export const load: PageServerLoad = async ({ params }) => {
	const catalog = await getDevlog();
	const index = catalog.posts.findIndex((post) => post.slug === params.slug);
	if (index === -1) error(404, 'Post not found');
	// Posts are newest first: the next index is the older post.
	const newer = catalog.posts[index - 1];
	const older = catalog.posts[index + 1];
	return {
		post: catalog.posts[index],
		newer: newer ? toDevlogSummary(newer) : null,
		older: older ? toDevlogSummary(older) : null
	};
};
