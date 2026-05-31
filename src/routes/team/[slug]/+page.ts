import { error } from '@sveltejs/kit';
import { findMember, memberSlugs } from '$lib/content/team';
import type { EntryGenerator, PageLoad } from './$types';

// Prerender one static page per member at build time.
export const prerender = true;

export const entries: EntryGenerator = () => memberSlugs.map((slug) => ({ slug }));

export const load: PageLoad = ({ params }) => {
	const member = findMember(params.slug);
	if (!member) {
		error(404, 'Member not found');
	}
	return { member };
};
