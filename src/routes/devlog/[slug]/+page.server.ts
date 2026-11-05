import { error } from '@sveltejs/kit';
import { toDevlogSummary } from '$lib/devlog';
import { getDevlog } from '$lib/server/ghost';
import type { PageServerLoad } from './$types';

// New slugs resolve immediately after the shared Ghost catalog refreshes.
export const prerender = false;

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
