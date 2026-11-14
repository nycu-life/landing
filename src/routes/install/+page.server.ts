import { redirect } from '@sveltejs/kit';
import { APP_STORE_URL, GOOGLE_PLAY_URL } from '$lib/content/landing';
import type { PageServerLoad } from './$types';

export const prerender = false;
export const trailingSlash = 'ignore';

export const load: PageServerLoad = ({ request, setHeaders }) => {
	const userAgent = request.headers.get('user-agent') ?? '';
	setHeaders({
		'cache-control': 'private, no-cache',
		vary: 'User-Agent',
		'x-robots-tag': 'noindex'
	});
	if (/android/i.test(userAgent)) redirect(302, GOOGLE_PLAY_URL);
	if (/iPhone|iPad|iPod/i.test(userAgent)) redirect(302, APP_STORE_URL);
	return {};
};
