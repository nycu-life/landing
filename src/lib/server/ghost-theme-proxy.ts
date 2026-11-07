/** Ghost renders public HTML; SvelteKit remains the independent Wish Pool app. */
export function themeProxyPath(pathname: string): string | null {
	let decoded: string;
	try {
		decoded = decodeURIComponent(pathname)
			.replace(/\\/g, '/')
			.replace(/\/{2,}/g, '/');
	} catch {
		return null;
	}
	if (/^\/(?:ghost|cms|api)(?:\/|$)/i.test(decoded)) return null;
	if (/^\/(?:wishpool|_app|healthz)(?:\/|$)/.test(decoded)) return null;
	if (/^\/(?:brand|ui|story|products|og)\//.test(decoded)) return null;
	if (/^\/(?:courses|products)\/?$/.test(decoded) || /^\/team(?:\/|$)/.test(decoded)) return null;
	if (/^\/(?:devlog|comics)\/media\//.test(decoded)) return null;
	return pathname;
}

export async function proxyGhostTheme(
	request: Request,
	target: string,
	fetchFn: typeof fetch = fetch
): Promise<Response> {
	const incoming = new URL(request.url);
	const upstream = new URL(target);
	if (
		!['http:', 'https:'].includes(upstream.protocol) ||
		upstream.username ||
		upstream.password ||
		upstream.pathname !== '/'
	)
		throw new Error(
			'GHOST_THEME_URL must be the internal Ghost origin, without /cms or credentials.'
		);
	upstream.pathname = incoming.pathname;
	upstream.search = incoming.search;
	if (!['GET', 'HEAD'].includes(request.method))
		return new Response('Method not allowed', { status: 405, headers: { allow: 'GET, HEAD' } });
	const headers = new Headers();
	for (const key of [
		'accept',
		'accept-language',
		'cookie',
		'user-agent',
		'if-none-match',
		'if-modified-since',
		'range'
	]) {
		const value = request.headers.get(key);
		if (value) headers.set(key, value);
	}
	headers.set('host', incoming.host);
	headers.set('x-forwarded-proto', incoming.protocol.slice(0, -1));
	headers.set('x-forwarded-host', incoming.host);
	try {
		const result = await fetchFn(upstream, {
			headers,
			method: request.method,
			redirect: 'manual',
			signal: AbortSignal.timeout(15_000)
		});
		const responseHeaders = new Headers(result.headers);
		for (const name of ['content-length', 'content-encoding', 'transfer-encoding', 'connection'])
			responseHeaders.delete(name);
		const location = responseHeaders.get('location');
		if (location) {
			const redirect = new URL(location, upstream);
			if (redirect.origin === upstream.origin)
				responseHeaders.set(
					'location',
					incoming.origin + redirect.pathname + redirect.search + redirect.hash
				);
		}
		if (responseHeaders.get('content-type')?.includes('text/html'))
			responseHeaders.set('cache-control', 'private, no-cache');
		return new Response(result.body, { status: result.status, headers: responseHeaders });
	} catch {
		return new Response('Content is temporarily unavailable. Please try again shortly.', {
			status: 503,
			headers: {
				'content-type': 'text/plain; charset=utf-8',
				'retry-after': '30',
				'cache-control': 'no-store'
			}
		});
	}
}
