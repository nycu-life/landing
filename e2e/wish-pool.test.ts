import { expect, test } from '@playwright/test';

const seedWishes = [
	{
		id: 'wish-gym',
		title: '想知道健身房現在有多少人',
		detail: '出發前就能判斷要不要換個時段。',
		category: 'life',
		supportCount: 42,
		supportedByMe: false,
		createdAt: '2026-08-29T10:00:00Z'
	},
	{
		id: 'wish-bus',
		title: '希望校車能顯示即時擁擠度',
		detail: '',
		category: 'transport',
		supportCount: 31,
		supportedByMe: false,
		createdAt: '2026-08-28T08:30:00Z'
	},
	{
		id: 'wish-study',
		title: '想找有插座的自習空間',
		detail: '希望地圖上也能標示開放時間。',
		category: 'learning',
		supportCount: 18,
		supportedByMe: false,
		createdAt: '2026-08-27T15:20:00Z'
	},
	{
		id: 'wish-lost',
		title: '希望失物招領資訊可以整合',
		detail: '',
		category: 'life',
		supportCount: 55,
		supportedByMe: true,
		createdAt: '2026-08-24T03:40:00Z'
	}
] as const;

const fulfilledWishes = [
	{
		id: 'wish-bus-live',
		title: '希望校車可以看到即時位置',
		detail: '',
		category: 'transport',
		status: 'fulfilled',
		reply: '校車即時位置已經在 NYCU LIFE App 上線！打開「交通」分頁就能看到每一班車的位置。',
		repliedAt: '2026-10-02T04:00:00Z',
		fulfilledAt: '2026-10-01T08:00:00Z',
		supportCount: 128,
		supportedByMe: true,
		createdAt: '2026-08-12T10:00:00Z'
	},
	{
		id: 'wish-calendar',
		title: '希望可以把課表匯出到手機行事曆',
		detail: '',
		category: 'learning',
		status: 'fulfilled',
		reply: '',
		repliedAt: null,
		fulfilledAt: '2026-09-02T12:00:00Z',
		supportCount: 37,
		supportedByMe: false,
		createdAt: '2026-07-28T03:20:00Z'
	}
] as const;

const openWishWithReply = {
	...seedWishes[0],
	status: 'open',
	reply: '我們正在和體育室討論人流資料的串接方式。',
	repliedAt: '2026-08-30T02:00:00Z',
	fulfilledAt: null
} as const;

const routeByStatus = (url: URL) =>
	url.searchParams.get('status') === 'fulfilled' ? fulfilledWishes : seedWishes;

test('wish pool publishes and supports directly from wish cards', async ({ page }) => {
	await page.clock.setFixedTime(new Date('2026-08-30T01:00:00Z'));
	let supportCount = seedWishes[0].supportCount;
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
						supportCount: 1,
						supportedByMe: true
					},
					meta: { pending: false }
				}
			});
		} else if (url.pathname.endsWith('/support')) {
			supportCount += 1;
			await route.fulfill({ json: { data: { supported: true, supportCount } } });
		} else {
			await route.abort();
		}
	});

	await page.goto('/wishpool/');
	const pool = page.locator('#wishes');
	await expect(
		page.getByRole('heading', { level: 1, name: '一起改造 NYCU 的 LIFE' })
	).toBeVisible();
	await expect(page.getByRole('heading', { level: 2, name: '大家正在敲碗' })).toBeVisible();
	await expect(page.locator('.topbar-brand')).toBeVisible();
	await expect(page.locator('.topbar .sticker-link[href="/wishpool/"]')).toHaveAttribute(
		'aria-current',
		'page'
	);
	await expect(pool.getByText(seedWishes[0].title)).toBeVisible();
	await expect(page.locator('#prototype-footer')).toBeAttached();
	await expect(page.locator('#prototype-footer a[href="/wishpool/"]')).toBeAttached();
	await expect(pool.locator('.wish-filter')).toHaveCount(0);
	const seedCard = pool.locator('.wish-card').filter({ hasText: seedWishes[0].title });
	await expect(seedCard.getByText('15 小時前')).toBeVisible();
	const supportButton = seedCard.getByRole('button', { name: /我也想要/ });
	await supportButton.click();
	await expect(supportButton).toHaveText('✓ +1');
	await expect(seedCard.getByText('43 人有共鳴')).toBeVisible();
	await expect(supportButton).toHaveAttribute('aria-pressed', 'true');
	await expect(page.getByRole('dialog')).toHaveCount(0);
	await expect(seedCard.getByRole('button', { name: '回報不適當內容' })).toHaveCount(0);
	await pool.getByText('補充一點細節（選填）').click();
	const detailField = pool.getByRole('textbox', { name: '願望補充說明' });
	await expect(detailField).toBeVisible();
	await expect(detailField).toHaveCSS('border-top-style', 'solid');

	await pool.getByPlaceholder('例如：想知道健身房現在有多少人').fill('希望圖書館座位更好找');
	await pool.locator('select').selectOption('learning');
	await pool.getByRole('button', { name: /投下願望/ }).click();
	await expect(pool.getByText('願望已經落進池裡')).toBeVisible();
	await expect(pool.getByText('希望圖書館座位更好找')).toBeVisible();
});

test('fulfilled tab shows completed wishes with team replies inside the same page', async ({
	page
}) => {
	const listRequests: string[] = [];
	await page.route('**/api/wishes**', async (route) => {
		const url = new URL(route.request().url());
		if (url.pathname !== '/api/wishes') return route.abort();
		listRequests.push(url.search);
		const data =
			url.searchParams.get('status') === 'fulfilled' ? fulfilledWishes : [openWishWithReply];
		await route.fulfill({ json: { data } });
	});

	await page.goto('/wishpool/');
	const pool = page.locator('#wishes');
	const tabs = pool.getByRole('tablist', { name: '切換願望列表' });
	await expect(tabs.getByRole('tab', { name: '願望池' })).toHaveAttribute('aria-selected', 'true');

	// Open wishes with a team reply show it too.
	const openCard = pool.locator('.wish-card').filter({ hasText: openWishWithReply.title });
	await expect(openCard.getByText('NYCU LIFE 團隊回覆')).toBeVisible();
	await expect(openCard.getByText(openWishWithReply.reply)).toBeVisible();
	await expect(openCard.getByRole('button', { name: /我也想要/ })).toBeVisible();
	expect(listRequests).toEqual(['?status=open']);

	await tabs.getByRole('tab', { name: '已實現' }).click();
	await expect(page).toHaveURL('/wishpool/');
	await expect(pool.getByRole('heading', { level: 2, name: '已經實現的願望' })).toBeVisible();
	await expect(tabs.getByRole('tab', { name: '已實現' })).toHaveAttribute('aria-selected', 'true');
	const fulfilledCard = pool.locator('.wish-card').filter({ hasText: fulfilledWishes[0].title });
	await expect(fulfilledCard.getByText('128 人有共鳴')).toBeVisible();
	await expect(fulfilledCard.getByText('2026 年 10 月 1 日 實現')).toBeVisible();
	await expect(fulfilledCard.locator('.wish-reply')).toContainText('NYCU LIFE 團隊回覆');
	await expect(fulfilledCard.locator('.wish-reply')).toContainText(fulfilledWishes[0].reply);
	await expect(fulfilledCard.getByRole('button')).toHaveCount(0);
	const silentCard = pool.locator('.wish-card').filter({ hasText: fulfilledWishes[1].title });
	await expect(silentCard.locator('.wish-reply')).toHaveCount(0);
	await expect(pool.getByText(openWishWithReply.title)).toHaveCount(0);
	expect(listRequests).toEqual(['?status=open', '?status=fulfilled']);

	// Arrow keys move between tabs without refetching an already loaded list.
	await tabs.getByRole('tab', { name: '已實現' }).press('ArrowLeft');
	await expect(tabs.getByRole('tab', { name: '願望池' })).toBeFocused();
	await expect(pool.getByText(openWishWithReply.title)).toBeVisible();
	expect(listRequests).toEqual(['?status=open', '?status=fulfilled']);
});

test('fulfilled tab explains an empty list in English', async ({ page }) => {
	await page.route('**/api/wishes**', (route) => {
		const url = new URL(route.request().url());
		return route.fulfill({
			json: { data: url.searchParams.get('status') === 'fulfilled' ? [] : [seedWishes[0]] }
		});
	});
	await page.goto('/wishpool/');
	await page.evaluate(() => (document.cookie = 'PARAGLIDE_LOCALE=en; path=/'));
	await page.reload();
	const pool = page.locator('#wishes');
	await pool.getByRole('tab', { name: 'Fulfilled' }).click();
	await expect(pool.getByText('No fulfilled wishes yet')).toBeVisible();
	await expect(pool.getByRole('tab', { name: 'Wishes' })).toHaveAttribute('aria-selected', 'false');
});

test('wish cards reveal their public detail on demand', async ({ page }) => {
	await page.route('**/api/wishes**', (route) => route.fulfill({ json: { data: seedWishes } }));
	await page.goto('/wishpool/');
	const pool = page.locator('#wishes');
	const gym = pool.locator('.wish-card', { hasText: seedWishes[0].title });
	const detail = gym.getByText(seedWishes[0].detail);
	await expect(detail).toBeHidden();
	await gym.getByText('顯示詳情').click();
	await expect(detail).toBeVisible();
	await expect(gym.getByText('收起詳情')).toBeVisible();
	await gym.getByText('收起詳情').click();
	await expect(detail).toBeHidden();

	const withoutDetail = pool.locator('.wish-card', { hasText: seedWishes[1].title });
	await expect(withoutDetail.locator('.wish-card-detail')).toHaveCount(0);
});

test('category filters appear only when the pool has more than 20 wishes', async ({ page }) => {
	let items = [...seedWishes];
	await page.route('**/api/wishes**', (route) => route.fulfill({ json: { data: items } }));

	await page.goto('/wishpool/');
	const pool = page.locator('#wishes');
	await expect(pool.locator('.wish-filter')).toHaveCount(0);

	items = Array.from({ length: 21 }, (_, index) => ({
		...seedWishes[index % seedWishes.length],
		id: `wish-${index}`,
		title: `${seedWishes[index % seedWishes.length].title} ${index}`
	}));
	await page.reload();
	await expect(pool.locator('.wish-filter')).toBeVisible();
	await pool.getByRole('button', { name: '交通', exact: true }).click();
	await expect(pool.getByText(`${seedWishes[1].title} 1`, { exact: true })).toBeVisible();
	await expect(pool.getByText(`${seedWishes[0].title} 0`, { exact: true })).toHaveCount(0);
});

test('live update events refresh new wishes and support counts from another browser', async ({
	page
}) => {
	let releaseEvent: (() => void) | undefined;
	const eventGate = new Promise<void>((resolve) => (releaseEvent = resolve));
	let items = [seedWishes[0]];
	await page.route('**/api/wishes**', async (route) => {
		const url = new URL(route.request().url());
		if (url.pathname === '/api/wishes/events') {
			await eventGate;
			await route.fulfill({
				headers: { 'Content-Type': 'text/event-stream' },
				body: 'event: wishes\ndata: {}\n\n'
			});
			return;
		}
		await route.fulfill({ json: { data: items } });
	});

	await page.goto('/wishpool/');
	const pool = page.locator('#wishes');
	await expect(pool.getByText(seedWishes[0].title)).toBeVisible();
	items = [
		{ ...seedWishes[1], id: 'wish-from-another-browser' },
		{ ...seedWishes[0], supportCount: 43 }
	];
	releaseEvent?.();
	await expect(pool.getByText(seedWishes[1].title)).toBeVisible();
	await expect(
		pool.locator('.wish-card').filter({ hasText: seedWishes[0].title }).getByText('43 人有共鳴')
	).toBeVisible();
});

test('wish pool stays readable in the 12 locale, appearance, and viewport states', async ({
	page
}) => {
	test.slow();
	await page.route('**/api/wishes**', (route) =>
		route.fulfill({ json: { data: routeByStatus(new URL(route.request().url())) } })
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
				await page.goto('/wishpool/');
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
				for (const tab of ['open', 'fulfilled'] as const) {
					if (tab === 'fulfilled') {
						await pool.locator('#wish-tab-fulfilled').click();
						await expect(pool.getByText(fulfilledWishes[0].title)).toBeVisible();
					}
					const result = await pool.evaluate((element) => {
						const bounds = element.getBoundingClientRect();
						const heading = element.querySelector('h1')?.getBoundingClientRect();
						const banner = document.querySelector('.topbar')?.getBoundingClientRect();
						return {
							centerOffset: Math.abs(bounds.left - (innerWidth - bounds.right)),
							outside: Array.from(
								element.querySelectorAll<HTMLElement>('.page-head, .wish-composer, .wish-list')
							).filter((child) => {
								const rect = child.getBoundingClientRect();
								return rect.left < bounds.left - 2 || rect.right > bounds.right + 2;
							}).length,
							clippedCards: Array.from(element.querySelectorAll<HTMLElement>('.wish-card')).filter(
								(card) =>
									card.scrollWidth > card.clientWidth + 2 ||
									card.scrollHeight > card.clientHeight + 2
							).length,
							tabsOutside: Array.from(element.querySelectorAll<HTMLElement>('.wish-tabs')).filter(
								(tabs) =>
									tabs.getBoundingClientRect().right > bounds.right + 2 ||
									tabs.scrollWidth > tabs.clientWidth + 2
							).length,
							headingObscured: Boolean(heading && banner && heading.top < banner.bottom - 2),
							overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
						};
					});
					const label = `${viewport.name}/${locale}/${theme}/${tab}`;
					expect.soft(result.centerOffset, `${label}: centred page`).toBeLessThanOrEqual(1);
					expect.soft(result.outside, `${label}: section bounds`).toBe(0);
					expect.soft(result.clippedCards, `${label}: clipped cards`).toBe(0);
					expect.soft(result.tabsOutside, `${label}: tab control fits`).toBe(0);
					expect.soft(result.headingObscured, `${label}: sticky header overlap`).toBe(false);
					expect.soft(result.overflow, `${label}: horizontal overflow`).toBe(0);
					if (screenshotDirectory) {
						await pool.screenshot({
							path: `${screenshotDirectory}/wish-pool-${tab}-${viewport.name}-${locale}-${theme}.png`,
							animations: 'disabled'
						});
					}
				}
			}
		}
	}
});

test('wide wish pool keeps designer frames aligned without a tinted page seam', async ({
	page
}) => {
	await page.setViewportSize({ width: 1920, height: 1200 });
	await page.route('**/api/wishes**', (route) =>
		route.fulfill({ json: { data: [seedWishes[0]] } })
	);

	const readLayout = () =>
		page.evaluate(async () => {
			const [composerSource, cardSource] = await Promise.all([
				fetch('/wishpool/composer-frame.svg').then((response) => response.text()),
				fetch('/wishpool/card-frame.svg').then((response) => response.text())
			]);
			const readAspectMode = (source: string) =>
				new DOMParser()
					.parseFromString(source, 'image/svg+xml')
					.documentElement.getAttribute('preserveAspectRatio');
			return {
				composerAspectMode: readAspectMode(composerSource),
				cardAspectMode: readAspectMode(cardSource),
				pageBackground: getComputedStyle(document.querySelector<HTMLElement>('.wish-page')!)
					.backgroundImage,
				overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
			};
		});

	for (const theme of ['light', 'dark']) {
		await page.goto('/wishpool/');
		await page.evaluate(
			(selectedTheme) => localStorage.setItem('nycu-life-theme', selectedTheme),
			theme
		);
		await page.reload();
		await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
		await expect(page.locator('.wish-card')).toHaveCount(1);
		const result = await readLayout();
		expect(result.composerAspectMode).toBe('none');
		expect(result.cardAspectMode).toBe('none');
		expect(result.pageBackground).toBe('none');
		expect(result.overflow).toBe(0);
	}
});
