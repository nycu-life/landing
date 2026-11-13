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
	if (/^\/(?:brand|ui|story|og)\//.test(decoded)) return null;
	// Product screenshots are static files; the /products/ index itself is a Ghost page.
	if (/^\/products\/[^/]+\.[a-z0-9]+$/i.test(decoded)) return null;
	if (/^\/courses\/?$/.test(decoded) || /^\/team(?:\/|$)/.test(decoded)) return null;
	if (/^\/(?:devlog|comics)\/media\//.test(decoded)) return null;
	return pathname;
}

/**
 * Articles (dev log, comics, news) are written in Chinese only, so English has no
 * article lists. Retired `/en/devlog/…`-style URLs map to the Chinese original.
 */
export function chineseArticlePath(pathname: string): string | null {
	return /^\/en(\/(?:devlog|comics|news)(?:\/.*)?)$/.exec(pathname)?.[1] ?? null;
}

/** Stale Svelte clients must reload Ghost documents, never follow a data URL as a page. */
export function ghostNavigationResponse(url: URL, isDataRequest: boolean): Response | null {
	if (isDataRequest)
		return new Response('This page requires a full document navigation.', {
			status: 409,
			headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' }
		});
	const pathname = url.pathname.replace(/(?:\/__data\.json)+\/?$/, '/');
	if (pathname === url.pathname) return null;
	const clean = new URL(url);
	clean.pathname = pathname;
	clean.searchParams.delete('x-sveltekit-trailing-slash');
	clean.searchParams.delete('x-sveltekit-invalidated');
	return new Response(null, {
		status: 308,
		headers: { location: clean.pathname + clean.search, 'cache-control': 'no-store' }
	});
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
		return new Response(
			request.method === 'HEAD'
				? null
				: unavailablePage(incoming.pathname, incoming.pathname + incoming.search),
			{
				status: 503,
				headers: {
					'content-type': 'text/html; charset=utf-8',
					'retry-after': '30',
					'cache-control': 'no-store'
				}
			}
		);
	}
}

/**
 * Shown while Ghost cannot answer. It only uses files the Node service serves
 * itself (static/), keeps the site's colours and appearance setting, and points to
 * the Wish Pool, which does not depend on Ghost.
 */
function unavailablePage(pathname: string, retryHref: string): string {
	const attr = (value: string) =>
		value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
	const english = pathname === '/en' || pathname.startsWith('/en/');
	const copy = english
		? {
				lang: 'en',
				title: 'This page cannot load right now',
				lede: 'Our content service is not responding. Please refresh in a moment. The Wish Pool is not affected and still takes wishes.',
				retry: 'Refresh',
				wish: 'Go to the Wish Pool',
				wishShort: 'Wish Pool',
				theme: 'Switch light or dark appearance'
			}
		: {
				lang: 'zh-tw',
				title: '頁面暫時打不開',
				lede: '網站內容服務沒有回應，請稍後重新整理。許願池不受影響，仍然可以許願。',
				retry: '重新整理',
				wish: '前往許願池',
				wishShort: '許願池',
				theme: '切換淺色或深色外觀'
			};
	return `<!doctype html>
<html lang="${copy.lang}" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${copy.title}｜NYCU LIFE</title>
<script>try{document.documentElement.dataset.theme=localStorage.getItem('nycu-life-theme')==='dark'?'dark':'light'}catch{}</script>
<style>
:root{--base:#f4f6fb;--surface:#fff;--ink:#17212e;--ink-soft:#5d6b7a;--brand:#0045f2;--line:rgba(0,69,242,.3);color-scheme:light}
:root[data-theme=dark]{--base:#0b1220;--surface:#131f33;--ink:#edf4ff;--ink-soft:#b5c3d6;--brand:#79a4ff;--line:rgba(121,164,255,.35);color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;background:var(--base);color:var(--ink);font-family:Roboto,'Noto Sans TC','PingFang TC','Microsoft JhengHei',system-ui,sans-serif;display:grid;grid-template-rows:auto 1fr auto}
header{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1.1rem clamp(1.25rem,4vw,2.5rem);border-bottom:1px solid rgba(127,140,160,.2)}
header nav{display:flex;flex-wrap:nowrap;align-items:center;gap:.5rem;margin:0}
.lang{display:inline-flex;border:1px solid rgba(127,140,160,.35);border-radius:999px;padding:.15rem}
.lang a{display:inline-grid;place-items:center;min-width:2.1rem;height:2.1rem;border-radius:999px;font-size:.8rem;font-weight:700;text-decoration:none}
.lang a[aria-current]{background:var(--brand);color:var(--base)}
.toggle svg{width:1.1rem;height:1.1rem}
:root[data-theme=dark] .sun,:root:not([data-theme=dark]) .moon{display:none}
@media (max-width:420px){.sticker{width:6.4rem;height:2.3rem;font-size:.82rem}.lang{display:none}}
.sticker{position:relative;display:inline-grid;place-items:center;width:7.4rem;height:2.6rem;background:url(/ui/wishpool-mobile.svg) center/100% 100% no-repeat;color:#fff;font-size:.9rem;font-weight:800;text-decoration:none}
.sticker i{position:absolute;inset:27% 14% 25% 23%;background:#33f}
.sticker b{position:relative}
.toggle{display:inline-grid;place-items:center;width:2.5rem;height:2.5rem;border:1px solid rgba(127,140,160,.35);border-radius:999px;background:var(--surface);color:var(--ink);font:inherit;cursor:pointer}
footer{display:flex;flex-wrap:wrap;justify-content:space-between;gap:.5rem 1.5rem;padding:1.4rem clamp(1.25rem,4vw,2.5rem);background:#374151;color:#e5e7eb;font-size:.85rem}
footer a{color:#fff}
header img{display:block;height:1.35rem;width:auto;max-width:9.5rem}
.dark-logo{display:none!important}
:root[data-theme=dark] .light-logo{display:none!important}
:root[data-theme=dark] .dark-logo{display:block!important}
main{display:grid;place-items:center;padding:2rem clamp(1.25rem,4vw,2.5rem)}
section{display:grid;grid-template-columns:auto minmax(0,1fr);gap:clamp(1.25rem,4vw,3rem);align-items:center;max-width:56rem;width:100%;padding:clamp(1.5rem,4vw,2.75rem);border:1.5px dashed var(--line);border-radius:1.6rem;background:var(--surface)}
section>img{width:clamp(8rem,18vw,12rem);height:auto;aspect-ratio:5/4;object-fit:cover;object-position:100% 50%}
section span{color:var(--brand);font-size:.8rem;font-weight:700;letter-spacing:.14em}
h1{margin:.6rem 0;font-size:clamp(1.8rem,4vw,2.6rem);line-height:1.2}
p{margin:0;color:var(--ink-soft);line-height:1.75}
nav{display:flex;flex-wrap:wrap;gap:.75rem 1.5rem;align-items:center;margin-top:1.25rem;font-weight:700}
a{color:var(--brand)}
.primary{display:inline-flex;align-items:center;min-height:2.75rem;padding:0 1.25rem;border-radius:999px;background:var(--brand);color:var(--base);text-decoration:none}
a:focus-visible{outline:3px solid var(--ink);outline-offset:3px}
@media (max-width:640px){section{grid-template-columns:1fr;justify-items:center;text-align:center}nav{justify-content:center}}
</style>
</head>
<body>
<header><a href="${english ? '/en/' : '/'}" aria-label="NYCU LIFE"><img class="light-logo" src="/brand/logo-horizontal-blue.svg" alt="NYCU LIFE" width="160" height="26"><img class="dark-logo" src="/brand/logo-horizontal-white.svg" alt="NYCU LIFE" width="160" height="26"></a><nav><a class="sticker" href="/wishpool/"><i aria-hidden="true"></i><b>${copy.wishShort} ✦</b></a><span class="lang"><a href="/"${english ? '' : ' aria-current="true"'}>中</a><a href="/en/"${english ? ' aria-current="true"' : ''}>EN</a></span><button class="toggle" type="button" aria-label="${copy.theme}" onclick="var r=document.documentElement;r.dataset.theme=r.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('nycu-life-theme',r.dataset.theme)}catch(e){}"><svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42m0-14.14-1.42 1.42m-11.3 11.3-1.42 1.42"/></svg><svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.44.402.785a6.25 6.25 0 0 0 8.268 8.268c.344-.215.806-.004.803.419"/></svg></button></nav></header>
<main><section aria-labelledby="title"><img src="/story/designer/wishpool/machine.svg" alt="" width="176" height="176"><div><span>503</span><h1 id="title">${copy.title}</h1><p>${copy.lede}</p><nav><a class="primary" href="${attr(retryHref)}">${copy.retry}</a><a href="/wishpool/">${copy.wish} →</a></nav></div></section></main>
<footer><span>© ${new Date().getFullYear()} NYCU LIFE</span><span><a href="mailto:life@nycu.edu.tw">life@nycu.edu.tw</a> · <a href="https://www.instagram.com/nycu.life/" rel="noopener noreferrer">Instagram</a></span></footer>
</body>
</html>`;
}
