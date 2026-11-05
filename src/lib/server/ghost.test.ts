import { describe, expect, it, vi } from 'vitest';
import {
	createCatalogCache,
	ghostBase,
	loadComics,
	loadDevlog,
	mapDevlogPosts,
	mapGhostPosts,
	parseEpisodeNumber,
	rewriteGhostMedia,
	type GhostPost
} from './ghost';

const origin = 'https://cms.nycu.life';
const media = '/comics/media/';

const post = (slug: string, publishedAt: string, extra: Partial<GhostPost> = {}): GhostPost => ({
	slug,
	title: slug.toUpperCase(),
	html: '<p>panel</p>',
	published_at: publishedAt,
	tags: [{ slug: 'hash-comics' }],
	...extra
});

const jsonResponse = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

describe('parseEpisodeNumber', () => {
	it('reads internal #ep-NN tags', () => {
		expect(parseEpisodeNumber([{ slug: 'hash-comics' }, { slug: 'hash-ep-07' }])).toBe(7);
		expect(parseEpisodeNumber([{ slug: 'hash-ep12' }])).toBe(12);
		expect(parseEpisodeNumber([{ slug: 'ep-03' }, { slug: 'hash-ep-0' }])).toBeNull();
		expect(parseEpisodeNumber(undefined)).toBeNull();
	});
});

describe('rewriteGhostMedia', () => {
	it('mirrors Ghost images, keeps foreign URLs and lazy-loads images', () => {
		const found = new Set<string>();
		const html = rewriteGhostMedia(
			`<img src="${origin}/content/images/2026/11/a.png" srcset="${origin}/content/images/size/w600/2026/11/a.png 600w, ${origin}/content/images/2026/11/a.png 1080w" width="1080" height="1350">` +
				`<img loading="eager" src="https://example.com/content/images/b.png">` +
				`<img src="${origin}/content/images/../../etc/passwd">`,
			[origin],
			media,
			found
		);
		expect(html).toContain('src="/comics/media/2026/11/a.png"');
		expect(html).toContain('/comics/media/size/w600/2026/11/a.png 600w');
		expect(html).toContain('https://example.com/content/images/b.png');
		expect(html).toContain(`${origin}/content/images/../../etc/passwd`);
		expect(html.match(/loading="lazy"/g)).toHaveLength(2);
		expect([...found].sort()).toEqual(['2026/11/a.png', 'size/w600/2026/11/a.png']);
	});
});

describe('mapGhostPosts', () => {
	it('orders by explicit #ep-NN tags, numbering the rest by publish date', () => {
		const catalog = mapGhostPosts(
			[
				post('late', '2026-10-01T00:00:00Z'),
				post('pinned-one', '2026-11-01T00:00:00Z', {
					tags: [{ slug: 'hash-comics' }, { slug: 'hash-ep-01' }],
					feature_image: `${origin}/content/images/2026/11/cover.png`
				}),
				post('early', '2026-09-01T00:00:00Z')
			],
			[origin],
			media
		);
		expect(catalog.source).toBe('ghost');
		expect(catalog.episodes.map((episode) => [episode.number, episode.slug])).toEqual([
			[1, 'pinned-one'],
			[2, 'early'],
			[3, 'late']
		]);
		expect(catalog.episodes[0].cover).toEqual({
			src: '/comics/media/2026/11/cover.png',
			alt: 'PINNED-ONE'
		});
		expect(catalog.media).toEqual(['2026/11/cover.png']);
	});
});

describe('loadComics', () => {
	it('falls back to placeholders without configuration', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const fetchFn = vi.fn<typeof fetch>();
		const catalog = await loadComics({}, fetchFn, media);
		expect(catalog.source).toBe('placeholder');
		expect(catalog.episodes).toHaveLength(10);
		expect(fetchFn).not.toHaveBeenCalled();
		expect(warn).toHaveBeenCalled();
		warn.mockRestore();
	});

	it('fails loudly when GHOST_REQUIRED=1 and Ghost is unavailable', async () => {
		const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({}, 503));
		await expect(
			loadComics(
				{ GHOST_URL: origin, GHOST_CONTENT_API_KEY: 'k', GHOST_REQUIRED: '1' },
				fetchFn,
				media
			)
		).rejects.toThrow(/GHOST_REQUIRED=1/);
		await expect(loadComics({ GHOST_REQUIRED: '1' }, fetchFn, media)).rejects.toThrow(/not set/);
	});

	it('loads comics posts through the Content API', async () => {
		const info = vi.spyOn(console, 'info').mockImplementation(() => {});
		const fetchFn = vi.fn<typeof fetch>(async (input) => {
			const url = new URL(String(input));
			if (url.pathname.endsWith('/settings/')) {
				return jsonResponse({ settings: { url: 'https://public.example/' } });
			}
			expect(url.pathname).toBe('/ghost/api/content/posts/');
			expect(url.searchParams.get('key')).toBe('k');
			expect(url.searchParams.get('filter')).toBe('tag:[comics,hash-comics]');
			return jsonResponse({
				posts: [
					post('ep-01', '2026-09-01T00:00:00Z', {
						feature_image: 'https://public.example/content/images/c.png'
					})
				]
			});
		});
		const catalog = await loadComics(
			{ GHOST_URL: `${origin}/`, GHOST_CONTENT_API_KEY: 'k' },
			fetchFn,
			media
		);
		expect(catalog.source).toBe('ghost');
		expect(catalog.episodes[0].cover?.src).toBe('/comics/media/c.png');
		expect(catalog.media).toEqual(['c.png']);
		info.mockRestore();
	});
});

const configured = { GHOST_URL: origin, GHOST_CONTENT_API_KEY: 'k', GHOST_REQUIRED: '1' };

const postsOnly = (posts: GhostPost[]) =>
	vi.fn<typeof fetch>(async (input) =>
		new URL(String(input)).pathname.endsWith('/settings/')
			? jsonResponse({ settings: {} })
			: jsonResponse({ posts })
	);

describe('empty sections', () => {
	it('keeps comics placeholder when Ghost has no #comics posts, even with GHOST_REQUIRED=1', async () => {
		const info = vi.spyOn(console, 'info').mockImplementation(() => {});
		const catalog = await loadComics(configured, postsOnly([]), media);
		expect(catalog.source).toBe('placeholder');
		info.mockRestore();
	});

	it('returns an empty dev log without Ghost, and fails when required', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		expect(await loadDevlog({}, vi.fn<typeof fetch>(), '/devlog/media/')).toEqual({
			source: 'empty',
			posts: [],
			media: []
		});
		warn.mockRestore();
		await expect(loadDevlog({ GHOST_REQUIRED: '1' }, vi.fn<typeof fetch>())).rejects.toThrow(
			/GHOST_REQUIRED=1/
		);
	});
});

describe('dev log', () => {
	const devlogPost = (slug: string, publishedAt: string | null, extra: Partial<GhostPost> = {}) =>
		post(slug, publishedAt as string, {
			tags: [{ slug: 'hash-devlog' }, { slug: 'devlog', name: 'devlog' }],
			...extra
		});

	it('orders newest first, exposes only public labels and mirrors images', () => {
		const catalog = mapDevlogPosts(
			[
				devlogPost('old', '2025-01-01T00:00:00Z'),
				devlogPost('new', '2026-11-01T00:00:00Z', {
					reading_time: 3,
					feature_image: `${origin}/content/images/2026/11/cover.png`,
					html: `<p><img src="${origin}/content/images/2026/11/inline.png"></p>`,
					tags: [
						{ slug: 'hash-devlog' },
						{ slug: 'bus', name: '校園公車' },
						{ slug: 'hash-internal', name: '#internal' }
					]
				}),
				devlogPost('draft-ish', null)
			],
			[origin],
			'/devlog/media/'
		);
		expect(catalog.source).toBe('ghost');
		expect(catalog.posts.map((entry) => entry.slug)).toEqual(['new', 'old']);
		expect(catalog.posts[0]).toMatchObject({
			readingTime: 3,
			tags: [{ slug: 'bus', name: '校園公車' }],
			cover: { src: '/devlog/media/2026/11/cover.png', alt: 'NEW' }
		});
		expect(catalog.posts[1].tags).toEqual([]);
		expect(catalog.posts[0].html).toContain('src="/devlog/media/2026/11/inline.png"');
		expect(catalog.media).toEqual(['2026/11/cover.png', '2026/11/inline.png']);
	});

	it('queries #devlog posts newest first', async () => {
		const info = vi.spyOn(console, 'info').mockImplementation(() => {});
		const fetchFn = vi.fn<typeof fetch>(async (input) => {
			const url = new URL(String(input));
			if (url.pathname.endsWith('/settings/')) return jsonResponse({ settings: {} });
			expect(url.searchParams.get('filter')).toBe('tag:[devlog,hash-devlog]');
			expect(url.searchParams.get('order')).toBe('published_at desc');
			return jsonResponse({ posts: [devlogPost('one', '2026-11-01T00:00:00Z')] });
		});
		const catalog = await loadDevlog(configured, fetchFn, '/devlog/media/');
		expect(catalog.posts.map((entry) => entry.slug)).toEqual(['one']);
		info.mockRestore();
	});
});

describe('sub-path Ghost installs', () => {
	it('keeps the sub-path when matching image URLs', async () => {
		expect(ghostBase('https://nycu.life/cms/')).toBe('https://nycu.life/cms');
		expect(ghostBase('http://127.0.0.1:2368')).toBe('http://127.0.0.1:2368');
		const info = vi.spyOn(console, 'info').mockImplementation(() => {});
		const fetchFn = vi.fn<typeof fetch>(async (input) => {
			const url = new URL(String(input));
			expect(url.pathname.startsWith('/cms/ghost/api/content/')).toBe(true);
			if (url.pathname.endsWith('/settings/')) {
				return jsonResponse({ settings: { url: 'https://nycu.life/cms/' } });
			}
			return jsonResponse({
				posts: [
					post('one', '2026-11-01T00:00:00Z', {
						tags: [{ slug: 'hash-devlog' }],
						feature_image: 'https://nycu.life/cms/content/images/2026/11/a.png'
					})
				]
			});
		});
		const catalog = await loadDevlog(
			{ GHOST_URL: 'https://nycu.life/cms/', GHOST_CONTENT_API_KEY: 'k' },
			fetchFn,
			'/devlog/media/'
		);
		expect(catalog.posts[0].cover?.src).toBe('/devlog/media/2026/11/a.png');
		expect(catalog.media).toEqual(['2026/11/a.png']);
		info.mockRestore();
	});
});

describe('runtime content', () => {
	it('serves public Ghost images without the former static mirror', async () => {
		const catalog = await loadDevlog(
			{ ...configured, GHOST_PUBLIC_URL: 'https://nycu.life/cms' },
			postsOnly([
				post('runtime', '2026-11-01T00:00:00Z', {
					feature_image: `${origin}/content/images/cover.png`,
					html: `<img src="${origin}/content/images/body.png">`
				})
			])
		);
		expect(catalog.posts[0].cover?.src).toBe('https://nycu.life/cms/content/images/cover.png');
		expect(catalog.posts[0].html).toContain('https://nycu.life/cms/content/images/body.png');
	});
	it('shares concurrent refreshes, expires content and recovers after failure', async () => {
		let now = 0;
		const load = vi
			.fn()
			.mockResolvedValueOnce('published')
			.mockResolvedValueOnce('updated')
			.mockRejectedValueOnce(new Error('offline'))
			.mockResolvedValueOnce('unpublished');
		const get = createCatalogCache(load, 30_000, () => now);
		expect(await Promise.all([get(), get()])).toEqual(['published', 'published']);
		expect(load).toHaveBeenCalledTimes(1);
		now = 29_999;
		expect(await get()).toBe('published');
		now = 30_000;
		expect(await get()).toBe('updated');
		now = 60_000;
		await expect(get()).rejects.toThrow('offline');
		expect(await get()).toBe('unpublished');
		expect(load).toHaveBeenCalledTimes(4);
	});
});
