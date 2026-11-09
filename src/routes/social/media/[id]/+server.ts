import { socialSource } from '$lib/server/social';
import type { RequestHandler } from './$types';

export const trailingSlash = 'never';

/** Images of the current social feed only; this is not an open proxy. */
export const GET: RequestHandler = async ({ params }) =>
	(await socialSource()
		.media(params.id)
		.catch(() => null)) ??
	new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } });
