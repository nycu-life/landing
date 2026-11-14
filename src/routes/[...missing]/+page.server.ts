import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const prerender = false;
// /install has its own download redirect endpoint; unknown descendants still return 404.
export const load: PageServerLoad = ({ params }) => {
	const path = params.missing.replace(/\/+$/, '');
	const withdrawn = /^courses$/.test(path) || /^team(?:\/|$)/.test(path);
	error(withdrawn ? 410 : 404, withdrawn ? 'Page withdrawn' : 'Page not found');
};
