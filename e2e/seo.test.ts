import { expect, test } from '@playwright/test';

const siteOrigin = 'https://nycu.life';
const publicRoutes = ['/', '/wishpool/'];

test('publishes a complete production sitemap and advertises it to crawlers', async ({
	request
}) => {
	const sitemapResponse = await request.get('/sitemap.xml');
	expect(sitemapResponse.ok()).toBe(true);
	expect(sitemapResponse.headers()['content-type']).toMatch(/^(application|text)\/xml/);
	const sitemap = await sitemapResponse.text();
	const sitemapLocations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
	const expectedLocations = publicRoutes.map((route) => `${siteOrigin}${route}`);

	expect(sitemapLocations).toEqual(expectedLocations);
	for (const withdrawnRoute of ['/about/', '/courses/', '/products/', '/devlog/']) {
		expect(sitemap).not.toContain(withdrawnRoute);
	}
	expect(sitemap).not.toContain('/team/');
	expect(sitemap).not.toContain('/demo/');
	expect(sitemap).not.toContain('/wishpool/admin/');

	const robotsResponse = await request.get('/robots.txt');
	expect(robotsResponse.ok()).toBe(true);
	expect(await robotsResponse.text()).toContain(`Sitemap: ${siteOrigin}/sitemap.xml`);
});
