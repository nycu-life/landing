import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

test.skip(!process.env.GHOST_SSO_TEST_STATE, 'Requires a private NYCU One browser session.');

test('NYCU One returns from an IdP page directly to the matching Ghost staff account', async ({
	browser,
	baseURL
}) => {
	const state = JSON.parse(readFileSync(process.env.GHOST_SSO_TEST_STATE!, 'utf8'));
	const context = await browser.newContext({
		storageState: {
			// Keep only the IdP session: neither a CMS gate nor a Ghost login may mask failures.
			cookies: state.cookies.filter(
				(cookie: { domain: string }) => cookie.domain.replace(/^\./, '') === 'auth.nycu.one'
			),
			origins: []
		}
	});
	try {
		const page = await context.newPage();
		const entry = new URL('/ghost/', baseURL).href;
		// A real IdP document supplies the cross-origin Referer that silent 302 chains omit.
		const idpDocument = 'https://auth.nycu.one/nycu-sso-browser-test';
		await page.route(idpDocument, (route) =>
			route.fulfill({
				contentType: 'text/html',
				body: `<a href="${entry}">Return to Ghost</a>`
			})
		);
		await page.goto(idpDocument);
		const callback = page.waitForResponse(
			(response) => new URL(response.url()).pathname === '/api/wishes/auth/callback'
		);
		await page.getByRole('link', { name: 'Return to Ghost' }).click();
		expect((await callback).status()).toBe(200);
		await expect(page.locator('.gh-nav')).toBeVisible();
		const me = await context.request.get(new URL('/ghost/api/admin/users/me/', baseURL).href, {
			headers: { Origin: new URL(baseURL!).origin }
		});
		expect(me.status()).toBe(200);
		if (process.env.GHOST_SSO_EXPECTED_EMAIL)
			expect((await me.json()).users[0].email).toBe(process.env.GHOST_SSO_EXPECTED_EMAIL);
	} finally {
		await context.close();
	}
});
