import { expect, test } from '@playwright/test';

test('landing page supports the new brand journey', async ({ page }) => {
	await page.goto('/');

	await expect(
		page.getByRole('heading', {
			level: 1,
			name: /one front door for transit, courses, and places at nycu/i
		})
	).toBeVisible();
	await expect(page.getByRole('link', { name: /see the three pillars/i })).toBeVisible();

	await page.getByRole('link', { name: /see the three pillars/i }).click();
	await expect(page).toHaveURL(/#journeys$/);

	await page.getByRole('link', { name: /explore courses/i }).click();
	await expect(page).toHaveURL(/#umbrella$/);
	await expect(page.getByRole('heading', { level: 3, name: /^courses$/i })).toBeVisible();
	await expect(page.getByText(/search and advanced filters reduce guesswork across semesters/i)).toBeVisible();

	await expect(page.getByRole('link', { name: /github organization/i })).toBeVisible();
});
