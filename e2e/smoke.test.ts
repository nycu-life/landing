import { expect, test } from '@playwright/test';

// Smoke test: the built static site serves the home page and renders the real
// hero headline ("debug your NYCU LIFE problems"). The brand name is identical
// across locales, so this assertion is locale-independent.
test('home page renders the NYCU LIFE hero', async ({ page }) => {
	await page.goto('/');

	await expect(page.getByRole('heading', { level: 1, name: /NYCU LIFE/i })).toBeVisible();
});
