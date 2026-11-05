import { expect, test, type Page } from '@playwright/test';

/** Card titles in on-screen order. */
const cardLabels = (page: Page) => page.locator('#comics-grid .ep-label').allInnerTexts();

const horizontalOverflow = (page: Page) =>
	page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test('lists every episode with a count, newest badge and client-side sort', async ({ page }) => {
	const response = await page.goto('/comics/');
	expect(response?.status()).toBe(200);
	await expect(page.locator('h1')).toHaveText('小貢的校園日常');
	await expect(page.getByText('NYCU LIFE · COMICS')).toBeVisible();

	const cards = page.locator('#comics-grid .ep-card');
	const total = await cards.count();
	expect(total).toBeGreaterThan(0);
	await expect(page.locator('.comics-count')).toHaveText(`共 ${total} 集`);
	await expect(page.locator('#comics-grid .ep-label').first()).toHaveText('第一集');

	// Exactly one "latest" badge, on the last card in oldest-first order.
	await expect(page.locator('.latest-badge')).toHaveCount(1);
	await expect(cards.last().locator('.latest-badge')).toHaveText('最新集數');

	const sort = page.getByRole('button', { name: /目前排序/ });
	await expect(sort).toHaveText('舊到新');
	const oldestFirst = await cardLabels(page);
	await sort.click();
	await expect(sort).toHaveText('新到舊');
	await expect(sort).toHaveAccessibleName('目前排序：新到舊，點一下切換');
	expect(await cardLabels(page)).toEqual([...oldestFirst].reverse());
	await expect(cards.first().locator('.latest-badge')).toBeVisible();
});

test('lays the grid out 4 / 2 / 1 columns without horizontal overflow', async ({ page }) => {
	await page.goto('/comics/');
	for (const { width, columns } of [
		{ width: 1440, columns: 4 },
		{ width: 820, columns: 2 },
		{ width: 390, columns: 1 }
	]) {
		await page.setViewportSize({ width, height: 900 });
		const tops = await page
			.locator('#comics-grid > li')
			.evaluateAll((items) => items.slice(0, 4).map((item) => item.getBoundingClientRect().top));
		expect(tops.filter((top) => Math.abs(top - tops[0]) < 1)).toHaveLength(
			Math.min(columns, tops.length)
		);
		expect(await horizontalOverflow(page), `overflow at ${width}px`).toBeLessThanOrEqual(0);
	}
});

test('reads an episode with prev/next navigation back to the list', async ({ page }) => {
	await page.goto('/comics/');
	const firstHref = await page.locator('#comics-grid .ep-card').first().getAttribute('href');
	expect(firstHref).toMatch(/^\/comics\/[^/]+\/$/);

	const response = await page.goto(firstHref!);
	expect(response?.status()).toBe(200);
	await expect(page.locator('.reader-eyebrow')).toContainText('第一集');
	await expect(page.locator('h1')).not.toBeEmpty();
	await expect(page.locator('.comic-panels')).toBeVisible();
	await expect(page.locator('a[rel="prev"]')).toHaveCount(0);

	const next = page.locator('a[rel="next"]');
	if ((await next.count()) > 0) {
		await next.click();
		await expect(page.locator('.reader-eyebrow')).toContainText('第二集');
		await expect(page.locator('a[rel="prev"]')).toHaveAttribute('href', firstHref!);
	}

	await page.getByRole('link', { name: '回到漫畫列表' }).first().click();
	await expect(page).toHaveURL(/\/comics\/$/);

	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto(firstHref!);
	expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
});

test('renders the comics chrome in English', async ({ page }) => {
	await page.addInitScript(() => {
		document.cookie = 'PARAGLIDE_LOCALE=en; path=/';
	});
	await page.goto('/comics/');
	await expect(page.locator('h1')).toHaveText("Xiao Gong's Campus Days");
	await expect(page.locator('#comics-grid .ep-label').first()).toHaveText('Episode 1');
	await expect(page.getByRole('button', { name: /Sort order/ })).toHaveText('Oldest first');
	await expect(page.locator('.latest-badge')).toHaveText('Latest');
});

test('mirrors Ghost images into the static build', async ({ page, request }) => {
	await page.goto('/comics/');
	const imageSources = await page
		.locator('#comics-grid img')
		.evaluateAll((images) => images.map((image) => image.getAttribute('src') ?? ''));
	test.skip(imageSources.length === 0, 'placeholder build: no Ghost covers');
	for (const src of imageSources) {
		expect(src).toMatch(/^\/comics\/media\//);
		const response = await request.get(src);
		expect(response.ok(), src).toBe(true);
		expect(response.headers()['content-type']).toMatch(/^image\//);
	}
});
