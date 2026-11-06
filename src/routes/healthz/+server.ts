/** Process health does not depend on Ghost; a CMS outage must not restart the web service. */
export const GET = () =>
	new Response('ok', { headers: { 'content-type': 'text/plain', 'cache-control': 'no-store' } });
