import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Preserve links to images from the former static mirror. The upstream prefix
// is controlled by configuration; never allow traversal or arbitrary redirects.
export const prerender = false;
export const GET: RequestHandler = ({ params }) => {
	const path = params.path;
	if (!/^[\w%./-]+$/.test(path) || /\.\.|%2e|%2f|%5c/i.test(path)) error(404);
	const publicUrl = (process.env.GHOST_PUBLIC_URL || '/cms').replace(/\/+$/, '');
	redirect(307, `${publicUrl}/content/images/${path}`);
};
