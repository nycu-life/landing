import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ parent, params }) => {
	const { site, siteUnavailable } = await parent();
	if (siteUnavailable) error(503, 'Content temporarily unavailable');
	const content = site.pages.find((p) => p.slug === params.slug);
	if (!content) error(404, 'Page not found');
	return { content };
};
