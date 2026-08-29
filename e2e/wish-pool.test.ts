import { expect, test } from '@playwright/test';

const seedWishes = [
	{
		id: 'wish-gym',
		title: '想知道健身房現在有多少人',
		detail: '出發前就能判斷要不要換個時段。',
		category: 'life',
		status: 'picked',
		teamResponse: '正在確認場館是否有可使用的人流資料。',
		supportCount: 42,
		supportedByMe: false,
		createdAt: '2026-08-29T10:00:00Z'
	},
	{
		id: 'wish-bus',
		title: '希望校車能顯示即時擁擠度',
		detail: '',
		category: 'transport',
		status: 'new',
		teamResponse: '',
		supportCount: 31,
		supportedByMe: false,
		createdAt: '2026-08-28T08:30:00Z'
	},
	{
		id: 'wish-study',
		title: '想找有插座的自習空間',
		detail: '希望地圖上也能標示開放時間。',
		category: 'learning',
		status: 'building',
		teamResponse: '校園地圖團隊已開始整理空間資料。',
		supportCount: 18,
		supportedByMe: false,
		createdAt: '2026-08-27T15:20:00Z'
	},
	{
		id: 'wish-lost',
		title: '希望失物招領資訊可以整合',
		detail: '',
		category: 'life',
		status: 'fulfilled',
		teamResponse: '第一版已經上線。',
		supportCount: 55,
		supportedByMe: true,
		createdAt: '2026-08-24T03:40:00Z'
	}
] as const;

test('wish pool publishes, filters, opens progress, supports, and reports wishes', async ({
	page
}) => {
	let supportCount = seedWishes[0].supportCount;
	let reportReceived = false;
	await page.route('**/api/wishes**', async (route) => {
		const request = route.request();
		const url = new URL(request.url());
		if (request.method() === 'GET' && url.pathname === '/api/wishes') {
			await route.fulfill({ json: { data: [seedWishes[0]] } });
		} else if (request.method() === 'POST' && url.pathname === '/api/wishes') {
			await route.fulfill({
				status: 201,
				json: {
					data: {
						...seedWishes[0],
						id: 'wish-new',
						title: '希望圖書館座位更好找',
						category: 'learning',
						status: 'new',
						teamResponse: '',
						supportCount: 1,
						supportedByMe: true
					},
					meta: { pending: false }
				}
			});
		} else if (url.pathname.endsWith('/support')) {
			supportCount += 1;
			await route.fulfill({ json: { data: { supported: true, supportCount } } });
		} else if (url.pathname.endsWith('/report')) {
			reportReceived = true;
			await route.fulfill({ json: { data: { reported: true } } });
		} else {
			await route.abort();
		}
	});

	await page.goto('/#wishes');
	const pool = page.locator('#wishes');
	await expect(pool.getByText(seedWishes[0].title)).toBeVisible();
	await pool.getByPlaceholder('例如：想知道健身房現在有多少人').fill('希望圖書館座位更好找');
	await pool.locator('select').selectOption('learning');
	await pool.getByRole('button', { name: /投進池裡/ }).click();
	await expect(pool.getByText('願望已經落進池裡')).toBeVisible();
	await expect(pool.getByText('希望圖書館座位更好找')).toBeVisible();

	await pool.getByRole('button', { name: '生活' }).click();
	await expect(pool.getByText('希望圖書館座位更好找')).toHaveCount(0);
	await pool.getByText(seedWishes[0].title).click();
	const dialog = page.getByRole('dialog');
	await expect(dialog).toContainText(seedWishes[0].teamResponse);
	await dialog.getByRole('button', { name: /我也想要/ }).click();
	await expect(dialog.getByRole('button', { name: /我也想要/ })).toContainText('43');
	await dialog.getByRole('button', { name: '回報不適當內容' }).click();
	await dialog.getByRole('button', { name: '垃圾或重複內容' }).click();
	await expect.poll(() => reportReceived).toBe(true);
	await expect(dialog).toBeHidden();
});

test('wish pool stays readable in the 12 locale, appearance, and viewport states', async ({
	page
}) => {
	test.slow();
	await page.route('**/api/wishes**', (route) => route.fulfill({ json: { data: seedWishes } }));
	const screenshotDirectory = process.env.VISUAL_AUDIT_SCREENSHOTS;
	for (const viewport of [
		{ name: 'desktop', width: 1440, height: 900 },
		{ name: 'tablet', width: 768, height: 1024 },
		{ name: 'phone', width: 390, height: 844 }
	]) {
		await page.setViewportSize(viewport);
		for (const locale of ['zh-tw', 'en'] as const) {
			for (const theme of ['light', 'dark'] as const) {
				await page.goto('/#wishes');
				await page.evaluate(
					({ locale, theme }) => {
						document.cookie = `PARAGLIDE_LOCALE=${locale}; path=/`;
						localStorage.setItem('nycu-life-theme', theme);
					},
					{ locale, theme }
				);
				await page.reload();
				const pool = page.locator('#wishes');
				await pool.evaluate((element) => element.scrollIntoView({ block: 'start' }));
				await expect(pool.getByText(seedWishes[0].title)).toBeVisible();
				const result = await pool.evaluate((element) => {
					const bounds = element.getBoundingClientRect();
					const heading = element.querySelector('h2')?.getBoundingClientRect();
					const banner = document.querySelector('.topbar')?.getBoundingClientRect();
					return {
						outside: Array.from(
							element.querySelectorAll<HTMLElement>('.wish-heading, .wish-composer, .wish-water')
						).filter((child) => {
							const rect = child.getBoundingClientRect();
							return rect.left < bounds.left - 2 || rect.right > bounds.right + 2;
						}).length,
						clippedCards: Array.from(element.querySelectorAll<HTMLElement>('.wish-card')).filter(
							(card) =>
								card.scrollWidth > card.clientWidth + 2 || card.scrollHeight > card.clientHeight + 2
						).length,
						headingObscured: Boolean(heading && banner && heading.top < banner.bottom - 2),
						overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
					};
				});
				const label = `${viewport.name}/${locale}/${theme}`;
				expect.soft(result.outside, `${label}: section bounds`).toBe(0);
				expect.soft(result.clippedCards, `${label}: clipped cards`).toBe(0);
				expect.soft(result.headingObscured, `${label}: sticky header overlap`).toBe(false);
				expect.soft(result.overflow, `${label}: horizontal overflow`).toBe(0);
				if (screenshotDirectory) {
					await pool.screenshot({
						path: `${screenshotDirectory}/wish-pool-${viewport.name}-${locale}-${theme}.png`,
						animations: 'disabled'
					});
				}
			}
		}
	}
});
