import { base } from '$app/paths';
import { APP_STORE_URL, GOOGLE_PLAY_URL } from '$lib/content/landing';
import type { RequestHandler } from './$types';

export const prerender = false;
export const trailingSlash = 'ignore';

/** A shareable download URL; unknown platforms can choose a store on the home page. */
export const GET: RequestHandler = ({ request }) => {
	const userAgent = request.headers.get('user-agent') ?? '';
	const fallback = `${base}/#prototype-footer`;
	const headers = {
		'cache-control': 'private, no-cache',
		vary: 'User-Agent',
		'x-robots-tag': 'noindex'
	};
	// iPadOS desktop browsing shares the Mac user agent. Touch capability is only
	// available in the browser, so distinguish it before falling back to the website.
	if (/Macintosh/i.test(userAgent)) {
		return new Response(
			`<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><script>location.replace(navigator.maxTouchPoints > 1 ? ${JSON.stringify(APP_STORE_URL)} : ${JSON.stringify(fallback)});</script><noscript><meta http-equiv="refresh" content="0;url=${fallback}"></noscript></head><body></body></html>`,
			{ headers: { ...headers, 'content-type': 'text/html; charset=utf-8' } }
		);
	}
	const location = /android/i.test(userAgent)
		? GOOGLE_PLAY_URL
		: /iPhone|iPad|iPod/i.test(userAgent)
			? APP_STORE_URL
			: fallback;

	return new Response(null, {
		status: 302,
		headers: { ...headers, location }
	});
};
