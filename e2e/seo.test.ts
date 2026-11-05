import { expect, test, type APIRequestContext } from '@playwright/test';
import { indexablePages, SITE_ORIGIN as siteOrigin } from '../src/lib/seo/pages';

const publicRoutes = [...indexablePages];
const comicEpisodeRoute = /^\/comics\/[^/]+\/$/;

/** Sitemap paths, in order. Comic episodes appear only when the build read them from Ghost. */
const sitemapPaths = async (request: APIRequestContext) => {
	const sitemap = await (await request.get('/sitemap.xml')).text();
	return [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
		match[1].replace(siteOrigin, '')
	);
};

test('publishes a complete production sitemap and advertises it to crawlers', async ({
	request
}) => {
	const sitemapResponse = await request.get('/sitemap.xml');
	expect(sitemapResponse.ok()).toBe(true);
	expect(sitemapResponse.headers()['content-type']).toMatch(/^(application|text)\/xml/);
	const sitemap = await sitemapResponse.text();
	const sitemapLocations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
	const expectedLocations = publicRoutes.map((route) => `${siteOrigin}${route}`);

	// Static pages first, in source order, then only Ghost-backed comic episodes.
	expect(sitemapLocations.slice(0, expectedLocations.length)).toEqual(expectedLocations);
	expect(new Set(sitemapLocations).size).toBe(sitemapLocations.length);
	for (const location of sitemapLocations.slice(expectedLocations.length)) {
		expect(location.replace(siteOrigin, '')).toMatch(comicEpisodeRoute);
	}
	for (const withdrawnRoute of ['/courses/', '/products/', '/devlog/']) {
		expect(sitemap).not.toContain(withdrawnRoute);
	}
	expect(sitemap).not.toContain('/team/');
	expect(sitemap).not.toContain('/demo/');
	expect(sitemap).not.toContain('/wishpool/admin/');

	const robotsResponse = await request.get('/robots.txt');
	expect(robotsResponse.ok()).toBe(true);
	expect(await robotsResponse.text()).toContain(`Sitemap: ${siteOrigin}/sitemap.xml`);
});

test('serves unknown URLs a noindex error page without a canonical', async ({ page }) => {
	for (const path of ['/nonexistent-page/', '/demo/']) {
		const response = await page.goto(path);
		expect(response?.status()).toBe(404);
		await expect(page.locator('h1')).toHaveText('找不到這個頁面');
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
		await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
		await expect(page.locator('meta[property="og:url"]')).toHaveCount(0);
	}
});

test('keeps a self-referencing canonical on every sitemap page', async ({ page, request }) => {
	const routes = await sitemapPaths(request);
	expect(routes).toEqual(expect.arrayContaining(publicRoutes));
	for (const route of routes) {
		const response = await page.goto(route);
		expect(response?.status()).toBe(200);
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
			'href',
			`${siteOrigin}${route}`
		);
		await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
	}
});

test('keeps placeholder comic episodes out of the index', async ({ page, request }) => {
	await page.goto('/comics/');
	const episodeRoutes = await page
		.locator('#comics-grid .ep-card')
		.evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
	expect(episodeRoutes.length).toBeGreaterThan(0);
	const listed = new Set(await sitemapPaths(request));
	for (const route of episodeRoutes) {
		await page.goto(route);
		if (listed.has(route)) {
			// Ghost-backed: indexable (checked with the other sitemap pages above).
			await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
		} else {
			await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
		}
	}
	// Ghost builds list every episode; placeholder builds list none.
	const listedEpisodes = episodeRoutes.filter((route) => listed.has(route));
	expect([0, episodeRoutes.length]).toContain(listedEpisodes.length);
});
