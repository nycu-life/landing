import { toDevlogSummary } from '$lib/devlog';
import { getDevlog } from '$lib/server/ghost';
import type { PageServerLoad } from './$types';

// Render on request; the Ghost catalog is shared for 30 seconds.
export const prerender = false;

export const load: PageServerLoad = async () => {
	const catalog = await getDevlog();
	return { source: catalog.source, posts: catalog.posts.map(toDevlogSummary) };
};
