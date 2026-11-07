import { expect, test } from '@playwright/test';

test.skip(!process.env.GHOST_THEME_TEST_URL, 'Requires the disposable native Ghost fixture.');

test('Ghost serves readable home content without JavaScript', async ({ browser }) => {
	const context = await browser.newContext({ javaScriptEnabled: false });
	const page = await context.newPage();
	await page.goto(process.env.GHOST_THEME_TEST_URL!);
	await expect(page.locator('.hero-copy h1')).toContainText('NYCU LIFE');
	expect(await page.locator('.hero-copy').evaluate((e) => e.getBoundingClientRect().height)).toBe(
		1
	);
	await expect(page.locator('.product-copy')).toHaveCount(4);
	for (const product of await page.locator('.product-copy').all())
		await expect(product).toBeVisible();
	await page.locator('#faq details').last().locator('summary').click();
	await expect(page.locator('#faq details').last().locator('.faq-answer a')).toHaveAttribute(
		'href',
		/\/wishpool\/$/
	);
	await context.close();
});

test('vertical gestures step through products and release to the next chapter', async ({
	page
}) => {
	await page.goto('/?motion=on#products');
	await expect(page.locator('.prototype-story')).toHaveAttribute('data-story-ready', 'true');
	const top = await page.evaluate(() => scrollY);
	await page.mouse.move(600, 450);
	for (let index = 1; index < 4; index++) {
		await page.mouse.wheel(0, 100);
		await expect(page.locator(`[data-product-index="${index}"]`)).toBeVisible();
		await expect(page.locator('.prototype-story')).toHaveAttribute('data-story-animating', 'false');
		expect(await page.evaluate(() => scrollY)).toBe(top);
	}
	// At the final product the gesture releases the lock; following scroll reaches FAQ.
	await page.mouse.wheel(0, 100);
	await page.mouse.wheel(0, 1500);
	await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(top);
});

test('About retains vision cards, film, milestone path and wish hand-off in both locales', async ({
	page
}) => {
	for (const prefix of ['', '/en']) {
		await page.goto(`${prefix}/about/`);
		await expect(page.locator('.about-head h1')).toBeVisible();
		await expect(page.locator('.vision-card')).toHaveCount(3);
		await expect(page.locator('.film-frame iframe')).toHaveAttribute('src', /youtube-nocookie/);
		await expect(page.locator('.milestone')).toHaveCount(5);
		await page.locator('.milestone-section').scrollIntoViewIfNeeded();
		await expect(page.locator('.milestone-section')).toHaveClass(/drawn/);
		await expect(page.locator('.about-wish-link')).toHaveAttribute('href', '/wishpool/');
	}
});

test('products retain multiple screenshots, dark variants and accessible controls', async ({
	page
}) => {
	await page.goto('/#products');
	await expect(page.locator('.prototype-story')).toHaveAttribute('data-story-ready', 'true');
	const firstScreens = page.locator('[data-product-image="0"]');
	await expect(firstScreens.locator('[data-appearance="light"]')).toHaveCount(4);
	await expect(firstScreens.locator('[data-appearance="dark"]')).toHaveCount(4);
	await page.locator('.theme-toggle:visible').click();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
	await expect(firstScreens.locator('[data-appearance="dark"].active')).toBeVisible();
	await page.locator('[data-product-direction="1"]').click();
	await expect(page.locator('[data-product-index="1"]')).toBeVisible();
	await expect(page.locator('[data-product-index="0"]')).toBeHidden();
	await expect(page.locator('[data-select-product="1"]')).toHaveAttribute('aria-pressed', 'true');
	await page.locator('[data-select-product="3"]').click();
	await expect(page.locator('[data-product-index="3"]')).toBeVisible();
});

test('each FAQ opens natively and remains reachable in the phone notebook', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/en/#faq');
	await expect(page.locator('.prototype-story')).toHaveAttribute('data-story-ready', 'true');
	for (const details of await page.locator('.faq-item').all()) {
		const question = details.locator('summary');
		await question.scrollIntoViewIfNeeded();
		if (!(await details.evaluate((e) => (e as HTMLDetailsElement).open))) await question.click();
		await expect(details).toHaveAttribute('open', '');
		await expect(details.locator('.faq-answer')).toBeVisible();
	}
	await expect(page.locator('.faq-item[open]')).toHaveCount(1);
});

test('mobile menu provides locale and appearance controls', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');
	await page.locator('.menu-toggle').click();
	await page.locator('#topbar-menu .theme-toggle').click();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
	await page.locator('#topbar-menu [data-locale-switch="en"]').click();
	await expect(page).toHaveURL(/\/en\//);
	await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('native pages and articles have a title, correct status and bounded content', async ({
	page
}) => {
	for (const route of [
		'/about/',
		'/en/about/',
		'/devlog/',
		'/comics/',
		'/comics/ep-01/',
		'/news/'
	]) {
		const response = await page.goto(route);
		expect(response?.status(), route).toBe(200);
		await expect(page.locator('main h1'), route).toBeVisible();
		expect(
			await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
			route
		).toBe(0);
	}
	const missing = await page.goto('/does-not-exist-native-test/');
	expect(missing?.status()).toBe(404);
});
