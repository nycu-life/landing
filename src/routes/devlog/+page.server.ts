import { toDevlogSummary } from '$lib/devlog';
import { getDevlog } from '$lib/server/ghost';
import type { PageServerLoad } from './$types';

// Runs only while prerendering (`pnpm build`); the result is baked into static HTML.
export const prerender = true;

export const load: PageServerLoad = async () => {
	const catalog = await getDevlog();
	return { source: catalog.source, posts: catalog.posts.map(toDevlogSummary) };
};
