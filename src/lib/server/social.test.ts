import { describe, expect, it, vi } from 'vitest';
import { createSocialSource, mapMetaMedia, mergeFeeds } from './social';

const igPage = {
	data: [
		{
			id: '1',
			caption: '期中加油！',
			media_type: 'IMAGE',
			media_url: 'https://cdn.example/ig1.jpg',
			permalink: 'https://www.instagram.com/p/1/',
			timestamp: '2026-11-01T10:00:00+0000'
		},
		{
			id: '2',
			caption: '新影片',
			media_type: 'VIDEO',
			media_url: 'https://cdn.example/ig2.mp4',
			thumbnail_url: 'https://cdn.example/ig2.jpg',
			permalink: 'https://www.instagram.com/reel/2/',
			timestamp: '2026-11-03T10:00:00+0000'
		}
	]
};
const threadsPage = {
	data: [
		{
			id: '9',
			text: '許願池上線了',
			media_type: 'TEXT_POST',
			permalink: 'https://www.threads.com/@nycu.life/post/9',
			timestamp: '2026-11-02T10:00:00+0000'
		},
		{
			id: '8',
			media_type: 'REPOST_FACADE',
			permalink: 'https://www.threads.com/@other/post/8',
			timestamp: '2026-11-04T10:00:00+0000'
		}
	]
};

const ok = (body: unknown, type = 'application/json') =>
	new Response(typeof body === 'string' ? body : JSON.stringify(body), {
		headers: { 'content-type': type }
	});

function fakeMeta(overrides: { instagram?: () => Response } = {}) {
	return vi.fn(async (input: string | URL | Request) => {
		const url = String(input);
		if (url.includes('refresh_access_token'))
			return ok({ access_token: 'fresh', expires_in: 5_184_000 });
		if (url.startsWith('https://graph.instagram.com/v22.0/me/media'))
			return overrides.instagram?.() ?? ok(igPage);
		if (url.startsWith('https://graph.threads.net/v1.0/me/threads')) return ok(threadsPage);
		if (url === 'https://cdn.example/ig1.jpg') return ok('jpeg-bytes', 'image/jpeg');
		throw new Error(`unexpected ${url}`);
	}) as unknown as typeof fetch;
}

describe('social feed', () => {
	it('maps Instagram and Threads posts, skipping reposts and video files', () => {
		const ig = mapMetaMedia('instagram', igPage.data);
		expect(ig.map((e) => e.source)).toEqual([
			'https://cdn.example/ig1.jpg',
			'https://cdn.example/ig2.jpg'
		]);
		expect(ig[0].post).toMatchObject({
			id: 'ig-1',
			image: '/social/media/ig-1',
			text: '期中加油！'
		});
		const threads = mapMetaMedia('threads', threadsPage.data);
		expect(threads).toHaveLength(1);
		expect(threads[0].post).toMatchObject({ id: 'th-9', image: null });
	});

	it('merges both networks newest first', async () => {
		const source = createSocialSource(
			{ INSTAGRAM_ACCESS_TOKEN: 'ig', THREADS_ACCESS_TOKEN: 'th' },
			fakeMeta(),
			() => 1_000_000
		);
		const feed = await source.feed();
		expect(feed.posts.map((p) => p.id)).toEqual(['ig-2', 'th-9', 'ig-1']);
		expect(feed.profiles.instagram).toContain('instagram.com/nycu.life');
	});

	it('is empty without tokens and never calls Meta', async () => {
		const fetchFn = vi.fn() as unknown as typeof fetch;
		const source = createSocialSource({}, fetchFn);
		expect(source.configured()).toBe(false);
		expect((await source.feed()).posts).toEqual([]);
		expect(fetchFn).not.toHaveBeenCalled();
	});

	it('keeps the last good posts of a network that starts failing', async () => {
		let time = 1_000_000;
		let failing = false;
		const source = createSocialSource(
			{ INSTAGRAM_ACCESS_TOKEN: 'ig', THREADS_ACCESS_TOKEN: 'th' },
			fakeMeta({ instagram: () => (failing ? new Response('', { status: 500 }) : ok(igPage)) }),
			() => time
		);
		await source.feed();
		failing = true;
		time += 11 * 60_000;
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		expect((await source.feed()).posts.map((p) => p.id)).toEqual(['ig-2', 'th-9', 'ig-1']);
		warn.mockRestore();
	});

	it('proxies only images of the current feed', async () => {
		const source = createSocialSource({ INSTAGRAM_ACCESS_TOKEN: 'ig' }, fakeMeta(), () => 1_000);
		const image = await source.media('ig-1');
		expect(image?.headers.get('content-type')).toBe('image/jpeg');
		expect(await source.media('ig-404')).toBeNull();
	});
});

describe('mergeFeeds', () => {
	it('orders posts newest first', () => {
		const post = (id: string, timestamp: string) =>
			({ id, network: 'threads', permalink: '', text: '', timestamp, image: null }) as const;
		expect(
			mergeFeeds([post('a', '2026-01-01T00:00:00Z'), post('b', '2026-02-01T00:00:00Z')]).map(
				(p) => p.id
			)
		).toEqual(['b', 'a']);
	});
});
