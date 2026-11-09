import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const prerender = false;
export const load: PageServerLoad = ({ params }) => {
	const path = params.missing.replace(/\/+$/, '');
	const withdrawn = /^courses$/.test(path) || /^team(?:\/|$)/.test(path);
	error(withdrawn ? 410 : 404, withdrawn ? 'Page withdrawn' : 'Page not found');
};
