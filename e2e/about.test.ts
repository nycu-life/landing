import { expect, test } from '@playwright/test';

test('about page tells the vision, film, and milestone story, then hands off to the wish pool', async ({
	page
}) => {
	const response = await page.goto('/about/');
	expect(response?.status()).toBe(200);
	await expect(page.getByRole('heading', { level: 1, name: '認識 NYCU LIFE' })).toBeVisible();
	await expect(page.locator('.topbar-nav a[href="/about/"]')).toHaveAttribute(
		'aria-current',
		'page'
	);

	await expect(page.getByRole('heading', { level: 2, name: '團隊願景' })).toBeVisible();
	await expect(page.locator('.vision-card')).toHaveCount(3);

	const film = page.locator('.film-frame iframe');
	await expect(film).toHaveAttribute('src', /youtube-nocookie\.com\/embed\//);

	const milestones = page.locator('section.milestones');
	await expect(milestones.locator('li.milestone')).toHaveCount(5);
	await milestones.scrollIntoViewIfNeeded();
	await expect(milestones).toHaveClass(/drawn/);
	await expect(milestones.locator('li.milestone').last()).toHaveCSS('opacity', '1', {
		timeout: 6000
	});

	const wishLink = page.locator('.about-wish a[href="/wishpool/"]');
	await expect(wishLink).toBeVisible();
	await wishLink.click();
	await expect(page).toHaveURL(/\/wishpool\/$/);
});

test('about page stays inside the viewport on every viewport class', async ({ page }) => {
	for (const viewport of [
		{ width: 1440, height: 900 },
		{ width: 820, height: 1180 },
		{ width: 390, height: 844 }
	]) {
		await page.setViewportSize(viewport);
		await page.goto(`/about/?vp=${viewport.width}`);
		const overflow = await page.evaluate(
			() => document.documentElement.scrollWidth - window.innerWidth
		);
		expect(overflow, `${viewport.width}px overflow`).toBe(0);
	}
});
