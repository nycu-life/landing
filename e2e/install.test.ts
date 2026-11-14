import { expect, test } from '@playwright/test';

const cases = [
	{
		platform: 'Android',
		userAgent:
			'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/131.0.0.0 Mobile Safari/537.36',
		location: 'https://play.google.com/store/apps/details?id=one.nycu.life&pcampaignid=web_share'
	},
	{
		platform: 'iPhone',
		userAgent:
			'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
		location: 'https://apps.apple.com/us/app/nycu-life/id6800430694'
	},
	{
		platform: 'iPad',
		userAgent: 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15',
		location: 'https://apps.apple.com/us/app/nycu-life/id6800430694'
	},
	{
		platform: 'iPod',
		userAgent: 'Mozilla/5.0 (iPod touch; CPU iPhone OS 15_0 like Mac OS X)',
		location: 'https://apps.apple.com/us/app/nycu-life/id6800430694'
	},
	{
		platform: 'desktop',
		userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
		location: '/#prototype-footer'
	},
	{ platform: 'unknown', userAgent: '', location: '/#prototype-footer' }
];

for (const { platform, userAgent, location } of cases) {
	test(`install redirects ${platform} without rendering the CMS layout`, async ({ request }) => {
		for (const path of ['/install', '/install/']) {
			const response = await request.get(path, {
				headers: { 'user-agent': userAgent },
				maxRedirects: 0
			});
			expect(response.status()).toBe(302);
			expect(response.headers().location).toBe(location);
			expect(response.headers()['cache-control']).toContain('private');
			expect(response.headers()['cache-control']).toContain('no-cache');
			expect(response.headers().vary).toMatch(/user-agent/i);
			expect(response.headers()['x-robots-tag']).toBe('noindex');
			expect(await response.body()).toHaveLength(0);
		}
	});
}

for (const touchPoints of [0, 5]) {
	test(`Mac-style user agent with ${touchPoints} touch points chooses the correct destination`, async ({
		browser,
		baseURL
	}) => {
		const context = await browser.newContext({
			userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'
		});
		await context.addInitScript((count) => {
			Object.defineProperty(navigator, 'maxTouchPoints', { get: () => count });
		}, touchPoints);
		await context.route('https://apps.apple.com/**', (route) =>
			route.fulfill({ contentType: 'text/html', body: '<title>App Store</title>' })
		);
		const page = await context.newPage();
		await page.goto(`${baseURL}/install`);
		await expect(page).toHaveURL(
			touchPoints > 1
				? 'https://apps.apple.com/us/app/nycu-life/id6800430694'
				: `${baseURL}/#prototype-footer`
		);
		await context.close();
	});
}
