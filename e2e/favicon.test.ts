import { expect, test } from '@playwright/test';

test('public pages advertise a crawlable favicon large enough for search results', async ({
	page,
	request
}) => {
	for (const path of process.env.GHOST_THEME_TEST_URL ? ['/', '/en/'] : ['/', '/wishpool/']) {
		await page.goto(path);
		const icons = await page.locator('link[rel~="icon"]').evaluateAll((links) =>
			links.map((link) => ({
				href: (link as HTMLLinkElement).href,
				type: (link as HTMLLinkElement).type
			}))
		);
		expect(icons.length, `${path}: favicon metadata`).toBeGreaterThan(0);
		const rasterIcons = icons.filter((icon) => icon.type !== 'image/svg+xml');
		expect(rasterIcons.length, `${path}: raster fallback`).toBeGreaterThan(0);
		let hasSearchIcon = false;
		for (const icon of rasterIcons) {
			const response = await request.get(icon.href);
			expect(response.ok(), icon.href).toBe(true);
			expect(response.headers()['content-type']).toMatch(/^image\//);
			const size = await page.evaluate(async (src) => {
				const image = new Image();
				image.src = src;
				await image.decode();
				return { width: image.naturalWidth, height: image.naturalHeight };
			}, icon.href);
			if (size.width === size.height && size.width >= 48) hasSearchIcon = true;
		}
		expect(hasSearchIcon, `${path}: square favicon at least 48px`).toBe(true);
	}
});
