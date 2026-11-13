import { describe, expect, it } from 'vitest';
import { createGhostNavigation, toNavLinks } from './ghost-navigation';

describe('Ghost navigation for the Wish Pool top bar', () => {
	it('keeps site-relative links and strips Ghost origins', () => {
		expect(
			toNavLinks(
				[
					{ label: '關於我們', url: '/about/' },
					{ label: '產品', url: 'https://nycu.life/#products' },
					{ label: 'IG', url: 'https://www.instagram.com/nycu.life/' },
					{ label: '', url: '/empty/' }
				],
				['https://nycu.life']
			)
		).toEqual([
			{ href: '/about/', label: '關於我們', page: '/about' },
			{ href: '/#products', label: '產品', page: undefined },
			{ href: 'https://www.instagram.com/nycu.life/', label: 'IG', page: undefined }
		]);
	});

	it('reads both menus, caches them, and falls back to null on failure', async () => {
		let calls = 0;
		const fetchFn = (async () => {
			calls++;
			return new Response(
				JSON.stringify({
					settings: {
						url: 'https://nycu.life/',
						navigation: [{ label: '開發日誌', url: '/devlog/' }],
						secondary_navigation: [{ label: 'About us', url: '/en/about/' }]
					}
				})
			);
		}) as typeof fetch;
		const time = 0;
		const get = createGhostNavigation(
			{ GHOST_URL: 'http://ghost:2368', GHOST_CONTENT_API_KEY: 'key' },
			fetchFn,
			() => time
		);
		expect(await get()).toEqual({
			'zh-tw': [{ href: '/devlog/', label: '開發日誌', page: '/devlog' }],
			en: [{ href: '/en/about/', label: 'About us', page: '/en/about' }]
		});
		await get();
		expect(calls).toBe(1);
		const failing = createGhostNavigation(
			{ GHOST_URL: 'http://ghost:2368', GHOST_CONTENT_API_KEY: 'key' },
			(async () => {
				throw new Error('down');
			}) as typeof fetch
		);
		expect(await failing()).toBeNull();
		expect(await createGhostNavigation({})()).toBeNull();
	});
});
