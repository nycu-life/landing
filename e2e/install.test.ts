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
		location: null
	},
	{ platform: 'unknown', userAgent: '', location: null }
];

for (const { platform, userAgent, location } of cases) {
	test(`install redirects ${platform} to its store or renders the download selector`, async ({
		request
	}) => {
		for (const path of ['/install', '/install/']) {
			const response = await request.get(path, {
				headers: { 'user-agent': userAgent },
				maxRedirects: 0
			});
			expect(response.status()).toBe(location ? 302 : 200);
			if (location) expect(response.headers().location).toBe(location);
			else {
				expect(await response.text()).toContain('id="install-title"');
				expect(response.headers().location).toBeUndefined();
			}
			expect(response.headers()['cache-control']).toContain('private');
			expect(response.headers()['cache-control']).toContain('no-cache');
			expect(response.headers().vary).toMatch(/user-agent/i);
			expect(response.headers()['x-robots-tag']).toBe('noindex');
			if (location) expect(await response.text()).not.toContain('install-title');
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
				: `${baseURL}/install`
		);
		await context.close();
	});
}

test('download choices work without JavaScript', async ({ browser, baseURL }) => {
	const context = await browser.newContext({ javaScriptEnabled: false });
	const page = await context.newPage();
	await page.goto(`${baseURL}/install`);
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	await expect(page.getByRole('link', { name: /Google Play/ })).toHaveAttribute(
		'href',
		cases[0].location!
	);
	await expect(page.getByRole('link', { name: /App Store/ })).toHaveAttribute(
		'href',
		cases[1].location!
	);
	await context.close();
});

for (const viewport of [
	{ name: 'desktop', width: 1440, height: 900 },
	{ name: 'tablet', width: 768, height: 1024 },
	{ name: 'phone', width: 390, height: 844 }
]) {
	for (const locale of ['zh-tw', 'en']) {
		for (const theme of ['light', 'dark']) {
			test(`install selector ${viewport.name}/${locale}/${theme}`, async ({ page, context }) => {
				await page.setViewportSize(viewport);
				await context.addCookies([
					{
						name: 'PARAGLIDE_LOCALE',
						value: locale,
						url:
							test.info().project.use.baseURL ??
							process.env.GHOST_THEME_TEST_URL ??
							'http://localhost:4173'
					}
				]);
				await page.addInitScript((value) => localStorage.setItem('nycu-life-theme', value), theme);
				await page.goto('/install');
				await expect(page.locator('#boot-splash')).toHaveCount(0);
				await page.evaluate(() => document.fonts.ready);
				await expect(page.locator('html')).toHaveAttribute('lang', locale);
				await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
				await expect(page.getByRole('heading', { level: 1 })).toHaveText(
					locale === 'en' ? 'Download NYCU LIFE' : '下載 NYCU LIFE'
				);
				for (const name of [/Google Play/, /App Store/]) {
					await expect(page.getByRole('link', { name })).toBeInViewport();
				}
				expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
					viewport.width
				);
				expect(
					await page
						.locator('.app-icon')
						.evaluate((image) => (image as HTMLImageElement).naturalWidth)
				).toBeGreaterThan(0);
				if (process.env.VISUAL_AUDIT_SCREENSHOTS) {
					await page.screenshot({
						path: `${process.env.VISUAL_AUDIT_SCREENSHOTS}/install-${viewport.name}-${locale}-${theme}.png`,
						fullPage: true
					});
				}
			});
		}
	}
}
