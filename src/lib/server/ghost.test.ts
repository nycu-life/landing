import { describe, expect, it, vi } from 'vitest';
import {
	loadComics,
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
