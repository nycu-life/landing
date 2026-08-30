import { expect, test } from '@playwright/test';

const adminWishes = [
	{
		id: '00000000-0000-4000-8000-000000000001',
		title: '請聯絡 0912345678 一起做專案',
		detail: '這則內容包含可能的私人資訊，需要先審核。',
		category: 'other',
		supportCount: 1,
		supportedByMe: false,
		createdAt: '2026-08-30T08:30:00Z'
	},
	{
		id: '00000000-0000-4000-8000-000000000002',
		title: '希望校車能顯示即時擁擠度',
		detail: '',
		category: 'transport',
		supportCount: 31,
		supportedByMe: false,
		createdAt: '2026-08-29T06:15:00Z'
	}
] as const;

test('signed-out administrators are sent to NYCU LIFE OAuth without a browser token field', async ({
	page
}) => {
	await page.route('**/api/wishes/auth/me', (route) =>
		route.fulfill({ json: { data: { authenticated: false } } })
	);

	await page.goto('/wishpool/admin/');
	await expect(page.getByRole('heading', { level: 1, name: '許願池管理' })).toBeVisible();
	await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
	await expect(page.getByRole('link', { name: '使用 NYCU LIFE 登入' })).toHaveAttribute(
		'href',
		'/api/wishes/auth/login'
	);
	await expect(page.locator('input[type="password"]')).toHaveCount(0);
	await expect(page.getByText('這個頁面不會取得或儲存你的密碼與 OAuth token')).toBeVisible();
});

test('OAuth session moderates, switches lists, and signs out without authorization headers', async ({
	page
}) => {
	const requests: Array<{
		method: string;
		path: string;
		authorization: string;
		body: string | null;
	}> = [];
	await page.route('**/api/wishes/auth/me', (route) =>
		route.fulfill({
			json: {
				data: {
					authenticated: true,
					user: { subject: 'authentik-user-id', name: '測試管理員' }
				}
			}
		})
	);
	await page.route('**/api/wishes/auth/logout', async (route) => {
		const request = route.request();
		requests.push({
			method: request.method(),
			path: new URL(request.url()).pathname,
			authorization: request.headers().authorization ?? '',
			body: request.postData()
		});
		await route.fulfill({ json: { data: { authenticated: false } } });
	});
	await page.route('**/api/wishes/admin**', async (route) => {
		const request = route.request();
		const url = new URL(request.url());
		requests.push({
			method: request.method(),
			path: `${url.pathname}${url.search}`,
			authorization: request.headers().authorization ?? '',
			body: request.postData()
		});
		if (request.method() === 'PATCH') {
			await route.fulfill({ json: { data: adminWishes[0] } });
			return;
		}
		const visibility = url.searchParams.get('visibility');
		await route.fulfill({
			json: { data: visibility === 'pending' ? adminWishes : [adminWishes[1]] }
		});
	});

	await page.goto('/wishpool/admin/');
	await expect(page.getByText('已登入許願池管理')).toBeVisible();
	await expect(page.getByText(/測試管理員 · 由 NYCU LIFE SSO 驗證/)).toBeVisible();
	await expect(page.getByText(adminWishes[0].title)).toBeVisible();
	await page
		.locator('.admin-card')
		.filter({ hasText: adminWishes[0].title })
		.getByRole('button', { name: '下架' })
		.click();
	await expect(page.getByText('願望已下架，不會再出現在公開許願池。')).toBeVisible();
	await expect(page.getByText(adminWishes[0].title)).toHaveCount(0);

	await page.getByRole('tab', { name: '公開中' }).click();
	await expect(page.getByText(adminWishes[1].title)).toBeVisible();
	await page.getByRole('button', { name: '登出' }).click();
	await expect(page.getByRole('link', { name: '使用 NYCU LIFE 登入' })).toBeVisible();

	expect(requests).toEqual(
		expect.arrayContaining([
			expect.objectContaining({
				method: 'GET',
				path: '/api/wishes/admin?visibility=pending',
				authorization: ''
			}),
			expect.objectContaining({
				method: 'PATCH',
				path: `/api/wishes/admin/${adminWishes[0].id}`,
				authorization: '',
				body: '{"visibility":"hidden"}'
			}),
			expect.objectContaining({
				method: 'POST',
				path: '/api/wishes/auth/logout',
				authorization: ''
			})
		])
	);
});

test('expired OAuth sessions fail closed and return to sign-in', async ({ page }) => {
	await page.route('**/api/wishes/auth/me', (route) =>
		route.fulfill({
			json: {
				data: {
					authenticated: true,
					user: { subject: 'authentik-user-id', name: '測試管理員' }
				}
			}
		})
	);
	await page.route('**/api/wishes/admin**', (route) =>
		route.fulfill({
			status: 401,
			json: { error: { message: 'admin authorization required' } }
		})
	);

	await page.goto('/wishpool/admin/');
	await expect(page.getByRole('alert')).toHaveText('登入已失效，請重新使用 NYCU LIFE 帳號登入。');
	await expect(page.getByRole('link', { name: '使用 NYCU LIFE 登入' })).toBeVisible();
	await expect(page.getByText('已登入許願池管理')).toHaveCount(0);
});

test('OAuth callback failures explain group denial without keeping the error in the URL', async ({
	page
}) => {
	await page.route('**/api/wishes/auth/me', (route) =>
		route.fulfill({ json: { data: { authenticated: false } } })
	);

	await page.goto('/wishpool/admin/?auth=denied');
	await expect(page.getByRole('alert')).toHaveText(
		'你的帳號不在許願池管理群組中，無法進入管理頁面。'
	);
	await expect(page).toHaveURL('/wishpool/admin/');
});

test('admin workspace stays readable in locale, appearance, and viewport matrix', async ({
	page
}) => {
	test.slow();
	await page.route('**/api/wishes/auth/me', (route) =>
		route.fulfill({
			json: {
				data: {
					authenticated: true,
					user: { subject: 'authentik-user-id', name: 'Matrix Admin' }
				}
			}
		})
	);
	await page.route('**/api/wishes/admin**', (route) =>
		route.fulfill({ json: { data: adminWishes } })
	);
	const screenshotDirectory = process.env.VISUAL_AUDIT_SCREENSHOTS;
	for (const viewport of [
		{ name: 'desktop', width: 1440, height: 900 },
		{ name: 'tablet', width: 768, height: 1024 },
		{ name: 'phone', width: 390, height: 844 }
	]) {
		await page.setViewportSize(viewport);
		for (const locale of ['zh-tw', 'en'] as const) {
			for (const theme of ['light', 'dark'] as const) {
				await page.goto('/wishpool/admin/');
				await page.evaluate(
					({ locale, theme }) => {
						document.cookie = `PARAGLIDE_LOCALE=${locale}; path=/`;
						localStorage.setItem('nycu-life-theme', theme);
					},
					{ locale, theme }
				);
				await page.reload();
				const workspace = page.locator('#wish-admin');
				await expect(workspace.locator('.admin-card')).toHaveCount(2);
				await page.evaluate(() => {
					document.documentElement.style.scrollBehavior = 'auto';
					window.scrollTo(0, 0);
				});
				await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
				const result = await workspace.evaluate((element) => {
					const bounds = element.getBoundingClientRect();
					const heading = element.querySelector('h1')?.getBoundingClientRect();
					const banner = document.querySelector('.topbar')?.getBoundingClientRect();
					return {
						centerOffset: Math.abs(bounds.left - (innerWidth - bounds.right)),
						clipped: Array.from(
							element.querySelectorAll<HTMLElement>(
								'.admin-toolbar, .admin-controls, .admin-card, .visibility-tabs'
							)
						).filter(
							(node) =>
								node.scrollWidth > node.clientWidth + 2 || node.scrollHeight > node.clientHeight + 2
						).length,
						headingObscured: Boolean(heading && banner && heading.top < banner.bottom - 2),
						overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
					};
				});
				const label = `${viewport.name}/${locale}/${theme}`;
				expect.soft(result.centerOffset, `${label}: centred page`).toBeLessThanOrEqual(1);
				expect.soft(result.clipped, `${label}: clipped controls`).toBe(0);
				expect.soft(result.headingObscured, `${label}: sticky header overlap`).toBe(false);
				expect.soft(result.overflow, `${label}: horizontal overflow`).toBe(0);
				if (screenshotDirectory) {
					await workspace.screenshot({
						path: `${screenshotDirectory}/wish-admin-${viewport.name}-${locale}-${theme}.png`,
						animations: 'disabled'
					});
				}
			}
		}
	}
});
