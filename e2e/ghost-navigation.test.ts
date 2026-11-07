import { expect, test } from '@playwright/test';

test.skip(!process.env.GHOST_NAVIGATION_TEST_URL, 'Requires Node with the native Ghost upstream.');

test('Wish Pool links leave Svelte and load the Ghost dev log as a document', async ({ page }) => {
	await page.setViewportSize({ width: 412, height: 778 });
	await page.goto('/wishpool/');
	await page.locator('.menu-toggle').click();
	const requests: string[] = [];
	page.on('request', (request) => requests.push(new URL(request.url()).pathname));
	await page.locator('#topbar-menu').getByRole('link', { name: '開發日誌', exact: true }).click();
	await expect(page).toHaveURL(/\/devlog\/$/);
	await expect(page.locator('body')).toHaveClass(/ghost-theme/);
	await expect(page.getByRole('heading', { name: '開發日誌', exact: true })).toBeVisible();
	expect(requests.some((path) => path.includes('__data.json'))).toBe(false);
});

test('a stale Svelte tab falls back to a clean Ghost document instead of redirecting data URLs', async ({
	page
}) => {
	await page.setViewportSize({ width: 412, height: 778 });
	await page.goto('/wishpool/');
	await page.locator('.menu-toggle').click();
	// Simulate an already-open tab that predates the reload boundary attribute.
	await page
		.locator('.app-shell')
		.evaluate((shell) => shell.removeAttribute('data-sveltekit-reload'));
	const statuses: number[] = [];
	page.on('response', (response) => {
		if (new URL(response.url()).pathname.includes('/devlog/__data.json'))
			statuses.push(response.status());
	});
	await page.locator('#topbar-menu').getByRole('link', { name: '開發日誌', exact: true }).click();
	await expect(page).toHaveURL(/\/devlog\/$/);
	await expect(page.locator('body')).toHaveClass(/ghost-theme/);
	expect(statuses.length).toBeGreaterThan(0);
	expect(statuses.every((status) => status === 409)).toBe(true);
});

test('a previously broken dev log URL recovers without the Svelte query parameters', async ({
	page
}) => {
	await page.goto(
		'/devlog/__data.json/__data.json/?x-sveltekit-invalidated=01&utm_source=test&x-sveltekit-trailing-slash=1'
	);
	await expect(page).toHaveURL(/\/devlog\/\?utm_source=test$/);
	await expect(page.locator('body')).toHaveClass(/ghost-theme/);
});
