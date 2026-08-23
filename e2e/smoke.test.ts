import { expect, test } from '@playwright/test';

// Smoke test: the built static site serves the home page and renders the real
// hero headline ("debug your NYCU LIFE problems"). The brand name is identical
// across locales, so this assertion is locale-independent.
test('home page renders the NYCU LIFE hero', async ({ page }) => {
	await page.goto('/');

	await expect(page.getByRole('heading', { level: 1, name: /NYCU LIFE/i })).toBeVisible();
});

test('scroll story reaches the product, FAQ, and join chapters', async ({ page }) => {
	await page.goto('/');

	const story = page.getByRole('region', { name: 'NYCU LIFE 捲動互動故事' });
	await expect(story.getByRole('link', { name: '略過動畫' })).toBeVisible();
	await expect(story).toContainText('PRODUCT 03');
	await expect(story).toContainText('下一個解法，也許由你開始。');

	await story.evaluate((element) => {
		const progress = 0.91;
		window.scrollTo(0, element.offsetTop + (element.scrollHeight - window.innerHeight) * progress);
	});

	const collaborationQuestion = story.getByRole('button', { name: /可以和你們合作嗎？/ });
	await expect(collaborationQuestion).toBeVisible();
	await collaborationQuestion.click();
	await expect(collaborationQuestion).toHaveAttribute('aria-expanded', 'true');
});

test('theme toggle persists and mobile navigation stays usable', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');

	await expect(page.locator('.topbar-nav')).toBeHidden();
	await page.getByRole('button', { name: '切換至深色模式' }).click();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
	await expect(page.locator('.topbar-brand img').first()).toHaveAttribute(
		'src',
		/logo-horizontal-white\.svg$/
	);

	await page.reload();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
	await page.getByRole('button', { name: '開啟選單' }).click();
	await expect(page.locator('.menu.open')).toBeVisible();
	await expect(page).toHaveURL(/\/$/);
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('language switcher stays in the navbar', async ({ page }) => {
	await page.goto('/');

	const navbar = page.getByRole('banner');
	await expect(navbar.getByRole('group', { name: '語言' })).toBeVisible();
	await expect(page.locator('footer').getByRole('group', { name: '語言' })).toHaveCount(0);

	await navbar.getByRole('button', { name: 'EN' }).click();
	await expect(
		page.getByRole('heading', {
			level: 1,
			name: /Campus problems, solved one capsule at a time/i
		})
	).toBeVisible();
});
