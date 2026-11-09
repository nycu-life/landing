import { describe, expect, it, vi } from 'vitest';
import {
	chineseArticlePath,
	ghostNavigationResponse,
	proxyGhostTheme,
	themeProxyPath
} from './ghost-theme-proxy';

describe('native Ghost routing boundary', () => {
	it('keeps Admin, API, Wish Pool and withdrawn routes away from the public proxy', () => {
		for (const path of [
			'/ghost/',
			'/ghost/api/admin/users/',
			'/%67host/api/admin/',
			'//ghost/',
			'/cms/',
			'/api/wishes',
			'/wishpool/',
			'/_app/app.js',
			'/healthz',
			'/team/old/',
			'/courses/',
			'/devlog/media/image.png'
		])
			expect(themeProxyPath(path), path).toBeNull();
		for (const path of [
			'/',
			'/en/',
			'/about/',
			'/devlog/published-post/',
			'/comics/ep-01/',
			'/assets/site.css',
			'/content/images/file.jpg',
			'/sitemap.xml'
		])
			expect(themeProxyPath(path), path).toBe(path);
	});
	it('makes old Svelte data navigations fall back to a document and repairs polluted URLs', () => {
		const data = ghostNavigationResponse(
			new URL('https://nycu.life/devlog/?utm_source=test'),
			true
		);
		expect(data?.status).toBe(409);
		expect(data?.headers.get('location')).toBeNull();
		expect(data?.headers.get('cache-control')).toBe('no-store');
		const repair = ghostNavigationResponse(
			new URL(
				'https://nycu.life/devlog/__data.json/__data.json/?x-sveltekit-invalidated=01&utm_source=test&x-sveltekit-trailing-slash=1'
			),
			false
		);
		expect(repair?.status).toBe(308);
		expect(repair?.headers.get('location')).toBe('/devlog/?utm_source=test');
		expect(ghostNavigationResponse(new URL('https://nycu.life/devlog/'), false)).toBeNull();
	});
	it('streams Ghost HTML without forwarding a forged staff identity or stale compression headers', async () => {
		const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
			new Response('<h1>Published in Ghost</h1>', {
				headers: {
					'content-type': 'text/html',
					'content-encoding': 'gzip',
					'content-length': '10'
				}
			})
		);
		const result = await proxyGhostTheme(
			new Request('https://nycu.life/en/?preview=1', {
				headers: { 'X-Nycu-Cms-Identity': 'forged', authorization: 'forged' }
			}),
			'http://landing-ghost:2368',
			fetchFn
		);
		const [url, options] = fetchFn.mock.calls[0];
		expect(String(url)).toBe('http://landing-ghost:2368/en/?preview=1');
		expect(new Headers(options?.headers).has('X-Nycu-Cms-Identity')).toBe(false);
		expect(new Headers(options?.headers).has('authorization')).toBe(false);
		expect(result.headers.has('content-encoding')).toBe(false);
		expect(result.headers.has('content-length')).toBe(false);
		expect(await result.text()).toContain('Published in Ghost');
	});
	it('preserves real errors and redirects, and gives a retryable 503 when Ghost is down', async () => {
		const redirect = await proxyGhostTheme(
			new Request('https://nycu.life/about'),
			'http://ghost:2368',
			async () =>
				new Response(null, { status: 301, headers: { location: 'http://ghost:2368/about/' } })
		);
		expect(redirect.status).toBe(301);
		expect(redirect.headers.get('location')).toBe('https://nycu.life/about/');
		const missing = await proxyGhostTheme(
			new Request('https://nycu.life/missing/'),
			'http://ghost:2368',
			async () => new Response('Missing', { status: 404 })
		);
		expect(missing.status).toBe(404);
		const down = await proxyGhostTheme(
			new Request('https://nycu.life/'),
			'http://ghost:2368',
			async () => {
				throw new Error('offline');
			}
		);
		expect(down.status).toBe(503);
		expect(down.headers.get('retry-after')).toBe('30');
	});
});

describe('English article URLs', () => {
	it('send retired English article lists to the Chinese originals', () => {
		expect(chineseArticlePath('/en/devlog/')).toBe('/devlog/');
		expect(chineseArticlePath('/en/devlog/coming-soon/')).toBe('/devlog/coming-soon/');
		expect(chineseArticlePath('/en/comics')).toBe('/comics');
		expect(chineseArticlePath('/en/news/')).toBe('/news/');
		expect(chineseArticlePath('/en/about/')).toBeNull();
		expect(chineseArticlePath('/en/')).toBeNull();
		expect(chineseArticlePath('/en/devlogs/')).toBeNull();
	});
});
