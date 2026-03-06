import { expect, test } from '@playwright/test';

test('landing page supports the new brand journey', async ({ page }) => {
	await page.goto('/');

	await expect(
		page.getByRole('heading', {
			level: 1,
			name: /關於 nycu\.life 計畫/i
		})
	).toBeVisible();
	await expect(page.getByRole('link', { name: /查看計畫內容/i })).toBeVisible();

	await page.getByRole('link', { name: /查看計畫內容/i }).click();
	await expect(page).toHaveURL(/#journeys$/);

	await page.getByRole('link', { name: /查看核心分工/i }).click();
	await expect(page).toHaveURL(/#umbrella$/);
	await expect(page.getByRole('heading', { level: 3, name: /^設計組$/i })).toBeVisible();
	await expect(page.getByText(/產品組：品牌視覺呈現、ui\/ux 設計與使用者體驗/i)).toBeVisible();

	await expect(page.getByRole('link', { name: /github organization/i })).toBeVisible();
});
