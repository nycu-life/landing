import { json } from '@sveltejs/kit';
import { socialSource } from '$lib/server/social';
import type { RequestHandler } from './$types';

export const trailingSlash = 'never';

/** Instagram + Threads posts for the 最新消息 page (theme/site.js renders them). */
export const GET: RequestHandler = async () =>
	json(await socialSource().feed(), {
		headers: { 'cache-control': 'public, max-age=300' }
	});
