import { expect, test } from '@playwright/test';

const horizontalOverflow = (page: import('@playwright/test').Page) =>
	page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test('the dev log is linked from the nav and lists posts or an honest empty state', async ({
	page
}) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/');
	await page.locator('.topbar-nav a[href="/devlog/"]').click();
	await expect(page).toHaveURL(/\/devlog\/$/);
	await expect(page.locator('h1')).toHaveText('開發日誌');
	await expect(page.locator('.topbar-nav a[href="/devlog/"]')).toHaveAttribute(
		'aria-current',
		'page'
	);

	const cards = page.locator('.post-list .post-card');
	if ((await cards.count()) === 0) {
		// Build without Ghost dev log posts.
		await expect(page.getByRole('heading', { level: 2, name: '第一篇日誌整理中' })).toBeVisible();
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
		await page.getByRole('link', { name: /看里程碑/ }).click();
		await expect(page).toHaveURL(/\/about\/#milestones$/);
		return;
	}

	await expect(page.locator('.devlog-count')).toContainText(`共 ${await cards.count()} 篇`);
	const dates = await page
		.locator('.post-list time')
		.evaluateAll((times) => times.map((time) => time.getAttribute('datetime') ?? ''));
	expect(dates).toEqual([...dates].sort().reverse());

	const first = cards.first();
	const title = (await first.locator('.post-title').innerText()).trim();
	await first.click();
	await expect(page.locator('h1')).toHaveText(title);
	await expect(page.locator('.prose')).not.toBeEmpty();
	await expect(page.locator('a[rel="prev"]')).toHaveCount(0);
	for (const src of await page
		.locator('article img')
		.evaluateAll((images) => images.map((image) => image.getAttribute('src') ?? ''))) {
		expect(new URL(src, page.url()).pathname).toMatch(/\/content\/images\//);
	}
	await page.getByRole('link', { name: '回到開發日誌' }).first().click();
	await expect(page).toHaveURL(/\/devlog\/$/);
});

test('dev log pages fit phone, tablet and desktop without horizontal overflow', async ({
	page
}) => {
	for (const width of [390, 820, 1440]) {
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/devlog/');
		expect(await horizontalOverflow(page), `/devlog/ at ${width}`).toBeLessThanOrEqual(0);
		const cards = page.locator('.post-card');
		if ((await cards.count()) > 0) {
			const href = (await cards.first().getAttribute('href'))!;
			await page.goto(href);
			expect(await horizontalOverflow(page), `${href} at ${width}`).toBeLessThanOrEqual(0);
		}
	}
});

test('renders the dev log chrome in English', async ({ page }) => {
	await page.addInitScript(() => {
		document.cookie = 'PARAGLIDE_LOCALE=en; path=/';
	});
	await page.goto('/devlog/');
	await expect(page.locator('h1')).toHaveText('Dev log');
});

test('the About milestones hand off to the dev log', async ({ page }) => {
	await page.goto('/about/');
	await expect(page.locator('#milestones a[href="/devlog/"]')).toHaveText(/看完整開發日誌/);
});
