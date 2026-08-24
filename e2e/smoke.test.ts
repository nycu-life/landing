import { expect, test } from '@playwright/test';

// Smoke test: the built static site serves the home page and renders the real
// hero headline ("debug your NYCU LIFE problems"). The brand name is identical
// across locales, so this assertion is locale-independent.
test('home page renders the NYCU LIFE hero', async ({ page }) => {
	await page.goto('/');

	await expect(page.getByRole('heading', { level: 1, name: /NYCU LIFE/i })).toBeVisible();
});

test('scroll story reaches the product, FAQ, and join chapters', async ({ page }) => {
	test.slow();
	await page.goto('/');

	const story = page.getByRole('region', { name: 'NYCU LIFE 捲動互動故事' });
	await expect(story.getByRole('link', { name: '略過動畫' })).toBeVisible();
	await expect(story).toContainText('PRODUCT 03');
	await expect(story).toContainText('下一個解法，也許由你開始。');

	await page.mouse.move(720, 450);
	for (let step = 1; step <= 5; step += 1) {
		await page.mouse.wheel(0, 80);
		await expect(story).toHaveAttribute('data-story-step', String(step), {
			timeout: step === 1 ? 3500 : 2500
		});
		await expect(story).toHaveAttribute('data-story-animating', 'false');
		await expect(story).toHaveAttribute('data-phone-animating', 'false', { timeout: 2000 });
	}

	const collaborationQuestion = story.getByRole('button', { name: /可以和你們合作嗎？/ });
	await expect(collaborationQuestion).toBeVisible();
	await collaborationQuestion.click();
	await expect(collaborationQuestion).toHaveAttribute('aria-expanded', 'true');
});

test('one gesture plays one fixed story step without skipping and supports reverse', async ({
	page
}) => {
	await page.goto('/');

	const story = page.locator('.scroll-story');
	await page.mouse.move(720, 450);
	await page.mouse.wheel(0, 900);
	await page.mouse.wheel(0, 900);
	await page.mouse.wheel(0, 900);

	await expect(story).toHaveAttribute('data-story-animating', 'true');
	await page.waitForTimeout(180);
	await expect(story).toHaveAttribute('data-story-step', '0');
	await expect
		.poll(() =>
			page.locator('.capsule').evaluate((element) => Number(getComputedStyle(element).opacity))
		)
		.toBeGreaterThan(0.2);
	await page.waitForTimeout(1400);
	await expect(story).toHaveAttribute('data-story-animating', 'true');
	await expect
		.poll(() =>
			page.locator('.capsule').evaluate((element) => Number(getComputedStyle(element).opacity))
		)
		.toBeGreaterThan(0.2);
	await expect(story).toHaveAttribute('data-story-step', '1', { timeout: 2000 });
	await expect(story).toHaveAttribute('data-story-step-name', 'about');
	await expect(story).toHaveAttribute('data-story-animating', 'false');

	await page.mouse.wheel(0, 80);
	await expect(story).toHaveAttribute('data-story-step', '2', { timeout: 2500 });
	await expect(story).toHaveAttribute('data-story-animating', 'false');
	await expect(story).toHaveAttribute('data-phone-animating', 'true');
	await expect(story).toHaveAttribute('data-phone-animating', 'false', { timeout: 2000 });
	await expect(story).toHaveAttribute('data-phone-slide', '1.000');
	await page.keyboard.press('ArrowUp');
	await expect(story).toHaveAttribute('data-story-step', '1', { timeout: 2500 });

	await story.getByRole('link', { name: '略過動畫' }).click();
	await expect(story).toHaveAttribute('data-story-step', '6');
	await expect(page).toHaveURL(/#products$/);
	await page.evaluate(() => window.scrollTo(0, 0));
	await page.mouse.wheel(0, 300);
	await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
});

test('motion preview opt-in plays the story even when the system prefers reduced motion', async ({
	page
}) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/?motion=on');

	const story = page.locator('.scroll-story');
	await expect(story).toHaveAttribute('data-reduced-motion', 'false');
	await page.mouse.move(720, 450);
	await page.mouse.wheel(0, 80);

	await expect(story).toHaveAttribute('data-story-animating', 'true');
	await expect(story).toHaveAttribute('data-story-step-name', 'about', { timeout: 3500 });
});

test('a mobile swipe advances exactly one story step', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');

	const story = page.locator('.scroll-story');
	await story.evaluate((element) => {
		const touch = (clientY: number) =>
			new Touch({
				identifier: 1,
				target: element,
				clientX: 195,
				clientY
			});
		const start = touch(650);
		const end = touch(610);
		element.dispatchEvent(
			new TouchEvent('touchstart', {
				bubbles: true,
				cancelable: true,
				touches: [start],
				targetTouches: [start],
				changedTouches: [start]
			})
		);
		element.dispatchEvent(
			new TouchEvent('touchmove', {
				bubbles: true,
				cancelable: true,
				touches: [end],
				targetTouches: [end],
				changedTouches: [end]
			})
		);
		element.dispatchEvent(
			new TouchEvent('touchend', {
				bubbles: true,
				cancelable: true,
				touches: [],
				targetTouches: [],
				changedTouches: [end]
			})
		);
	});

	await expect(story).toHaveAttribute('data-story-step', '1', { timeout: 3500 });
	await expect(story).toHaveAttribute('data-story-step-name', 'about');
	await page.waitForTimeout(250);
	await expect(story).toHaveAttribute('data-story-step', '1');
});

test('scroll story keeps every chapter readable across viewport sizes', async ({ page }) => {
	test.slow();

	const viewports = [
		{ width: 2560, height: 1440 },
		{ width: 1920, height: 1080 },
		{ width: 1440, height: 900 },
		{ width: 1280, height: 720 },
		{ width: 1024, height: 768 },
		{ width: 768, height: 1024 },
		{ width: 430, height: 932 },
		{ width: 390, height: 844 },
		{ width: 320, height: 568 }
	];
	const chapters = [
		{ progress: 0, selector: '.story-hero-copy', insetSelector: null },
		{ progress: 0.39, selector: '.about-card', insetSelector: null },
		{ progress: 0.65, selector: '.product-course', insetSelector: null },
		{ progress: 0.8, selector: '.product-bus', insetSelector: null },
		{ progress: 0.87, selector: '.product-activity', insetSelector: null },
		{ progress: 0.935, selector: '.notebook', insetSelector: '.faq-list' },
		{ progress: 0.99, selector: '.join-folder', insetSelector: 'article' }
	];

	await page.goto('/');

	for (const viewport of viewports) {
		await page.setViewportSize(viewport);

		for (const chapter of chapters) {
			const result = await page
				.locator('.scroll-story')
				.evaluate(async (story, { progress, selector, insetSelector }) => {
					document.documentElement.style.scrollBehavior = 'auto';
					window.scrollTo(0, 0);
					story.style.setProperty('--story-progress', String(progress));
					await new Promise<void>((resolve) =>
						requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
					);

					const stage = story.querySelector<HTMLElement>('.story-stage');
					const target = story.querySelector<HTMLElement>(selector);
					if (!stage || !target) throw new Error(`Missing responsive story target: ${selector}`);

					const stageRect = stage.getBoundingClientRect();
					const targetRect = target.getBoundingClientRect();
					const inset = insetSelector ? target.querySelector<HTMLElement>(insetSelector) : null;
					const insetRect = inset?.getBoundingClientRect();
					const intersectionWidth = Math.max(
						0,
						Math.min(stageRect.right, targetRect.right) - Math.max(stageRect.left, targetRect.left)
					);
					const intersectionHeight = Math.max(
						0,
						Math.min(stageRect.bottom, targetRect.bottom) - Math.max(stageRect.top, targetRect.top)
					);
					const visibleRatio =
						(intersectionWidth * intersectionHeight) /
						Math.max(1, targetRect.width * targetRect.height);

					let effectiveOpacity = 1;
					for (
						let element: HTMLElement | null = target;
						element && element !== story;
						element = element.parentElement
					) {
						effectiveOpacity *= Number.parseFloat(getComputedStyle(element).opacity);
					}

					return {
						insetContained:
							!insetRect ||
							(insetRect.left >= targetRect.left - 1 &&
								insetRect.right <= targetRect.right + 1 &&
								insetRect.top >= targetRect.top - 1 &&
								insetRect.bottom <= targetRect.bottom + 1),
						effectiveOpacity,
						visibleRatio,
						overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
					};
				}, chapter);

			expect
				.soft(result.overflow, `${viewport.width}x${viewport.height} at ${chapter.progress}`)
				.toBe(0);
			const minimumVisibleRatio =
				chapter.selector === '.notebook' && viewport.width <= 900 ? 0.6 : 0.75;
			expect
				.soft(
					result.visibleRatio,
					`${chapter.selector} clipped at ${viewport.width}x${viewport.height}`
				)
				.toBeGreaterThanOrEqual(minimumVisibleRatio);
			expect
				.soft(
					result.effectiveOpacity,
					`${chapter.selector} hidden at ${viewport.width}x${viewport.height}`
				)
				.toBeGreaterThanOrEqual(0.08);
			expect
				.soft(
					result.insetContained,
					`${chapter.insetSelector} escaped ${chapter.selector} at ${viewport.width}x${viewport.height}`
				)
				.toBe(true);
		}
	}
});

test('scroll story fills a 2560x1440 canvas with readable focal elements', async ({ page }) => {
	await page.setViewportSize({ width: 2560, height: 1440 });
	await page.goto('/');

	const sizes = await page.evaluate(() => {
		const measure = (selector: string) => {
			const element = document.querySelector<HTMLElement>(selector);
			if (!element) throw new Error(`Missing 1440p story target: ${selector}`);
			return {
				width: element.offsetWidth,
				fontSize: Number.parseFloat(getComputedStyle(element).fontSize)
			};
		};

		return {
			heroTitle: measure('.story-hero-copy h1'),
			gacha: measure('.gacha-machine'),
			faqTitle: measure('.faq-copy h2'),
			notebook: measure('.notebook'),
			joinFolder: measure('.join-folder')
		};
	});

	expect(sizes.heroTitle.fontSize).toBeGreaterThanOrEqual(140);
	expect(sizes.gacha.width).toBeGreaterThanOrEqual(1250);
	expect(sizes.faqTitle.fontSize).toBeGreaterThanOrEqual(100);
	expect(sizes.notebook.width).toBeGreaterThanOrEqual(1250);
	expect(sizes.joinFolder.width).toBeGreaterThanOrEqual(950);
});

test('about cards separate and the large-screen phone stops at the bottom without rebounding', async ({
	page
}) => {
	await page.setViewportSize({ width: 2048, height: 1235 });
	await page.goto('/?motion=on');

	const result = await page.locator('.scroll-story').evaluate(async (story) => {
		story.style.setProperty('--story-progress', '0.39');
		await new Promise<void>((resolve) =>
			requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
		);

		const film = story.querySelector<HTMLElement>('.team-film');
		const card = story.querySelector<HTMLElement>('.about-card');
		const phone = story.querySelector<HTMLImageElement>('.phone-rig > img');
		if (!film || !card || !phone) throw new Error('Missing story assets');
		const filmRect = film.getBoundingClientRect();
		const cardRect = card.getBoundingClientRect();
		const stage = story.querySelector<HTMLElement>('.story-stage');
		if (!stage) throw new Error('Missing story stage');
		const phonePositions = [];
		for (const progress of [0.47, 0.5, 0.55, 0.6, 0.65]) {
			story.style.setProperty('--story-progress', String(progress));
			await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
			const rect = phone.getBoundingClientRect();
			phonePositions.push({
				centerX: rect.left + rect.width / 2,
				bottomGap: stage.getBoundingClientRect().bottom - rect.bottom,
				width: rect.width
			});
		}
		return {
			gap: cardRect.left - filmRect.right,
			phoneSource: phone.getAttribute('src'),
			phonePositions
		};
	});

	expect(result.gap).toBeGreaterThanOrEqual(160);
	expect(result.phoneSource).toContain('/story/phone-transparent.png');
	expect(result.phonePositions.at(-1)?.width).toBeGreaterThanOrEqual(700);
	for (const position of result.phonePositions) {
		expect(Math.abs(position.bottomGap)).toBeLessThanOrEqual(2);
	}
	for (let index = 1; index < result.phonePositions.length; index += 1) {
		expect(result.phonePositions[index].centerX).toBeGreaterThanOrEqual(
			result.phonePositions[index - 1].centerX - 1
		);
	}
});

test('product copy and phone stay visually centered on mobile and portrait tablets', async ({
	page
}) => {
	await page.goto('/?motion=on');

	for (const viewport of [
		{ width: 390, height: 844 },
		{ width: 768, height: 1024 },
		{ width: 1024, height: 1366 }
	]) {
		await page.setViewportSize(viewport);

		for (const chapter of [
			{ progress: 0.65, selector: '.product-course' },
			{ progress: 0.8, selector: '.product-bus' },
			{ progress: 0.87, selector: '.product-activity' }
		]) {
			const result = await page
				.locator('.scroll-story')
				.evaluate(async (story, { progress, selector }) => {
					story.style.setProperty('--story-progress', String(progress));
					await new Promise<void>((resolve) =>
						requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
					);

					const copy = story.querySelector<HTMLElement>(selector);
					const title = copy?.querySelector<HTMLElement>('h2');
					const subtitle = copy?.querySelector<HTMLElement>('p');
					const phoneScreen = story.querySelector<HTMLElement>('.phone-screen');
					if (!copy || !title || !subtitle || !phoneScreen)
						throw new Error('Missing product layout');

					const centerOffset = (element: HTMLElement) => {
						const rect = element.getBoundingClientRect();
						return rect.left + rect.width / 2 - innerWidth / 2;
					};
					return {
						copy: centerOffset(copy),
						title: centerOffset(title),
						subtitle: centerOffset(subtitle),
						phoneScreen: centerOffset(phoneScreen)
					};
				}, chapter);

			for (const [name, offset] of Object.entries(result)) {
				expect
					.soft(Math.abs(offset), `${name} at ${viewport.width}x${viewport.height}`)
					.toBeLessThan(4);
			}
		}
	}
});

test('mobile FAQ and join artwork keep their intended scale, spacing, and optical center', async ({
	page
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/?motion=on');

	const result = await page.locator('.scroll-story').evaluate(async (story) => {
		const settle = async (progress: number) => {
			story.style.setProperty('--story-progress', String(progress));
			await new Promise<void>((resolve) =>
				requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
			);
		};

		await settle(0.935);
		const notebook = story.querySelector<HTMLElement>('.notebook');
		const faqTitle = story.querySelector<HTMLElement>('.faq-copy h2');
		const faqSubtitle = story.querySelector<HTMLElement>('.faq-copy p');
		if (!notebook || !faqTitle || !faqSubtitle) throw new Error('Missing FAQ layout');
		const notebookRect = notebook.getBoundingClientRect();
		const faqTitleRect = faqTitle.getBoundingClientRect();
		const faqSubtitleRect = faqSubtitle.getBoundingClientRect();

		await settle(0.99);
		const folder = story.querySelector<HTMLElement>('.join-folder');
		const article = folder?.querySelector<HTMLElement>('article');
		const joinTitle = article?.querySelector<HTMLElement>('h2');
		const joinSubtitle = article?.querySelector<HTMLElement>('p');
		if (!folder || !article || !joinTitle || !joinSubtitle) throw new Error('Missing join layout');
		const folderRect = folder.getBoundingClientRect();
		const articleRect = article.getBoundingClientRect();
		const joinTitleRect = joinTitle.getBoundingClientRect();
		const joinSubtitleRect = joinSubtitle.getBoundingClientRect();

		const menu = document.querySelector<HTMLElement>('.mobile-menu-btn');
		const menuIcon = menu?.querySelector<SVGElement>('svg');
		if (!menu || !menuIcon) throw new Error('Missing menu button');
		const menuRect = menu.getBoundingClientRect();
		const menuIconRect = menuIcon.getBoundingClientRect();

		return {
			notebookWidth: notebookRect.width,
			faqGap: faqSubtitleRect.top - faqTitleRect.bottom,
			folderWidth: folderRect.width,
			joinCenterOffset: articleRect.left + articleRect.width / 2 - innerWidth / 2,
			joinGap: joinSubtitleRect.top - joinTitleRect.bottom,
			menuIconCenterOffset: {
				x: menuIconRect.left + menuIconRect.width / 2 - (menuRect.left + menuRect.width / 2),
				y: menuIconRect.top + menuIconRect.height / 2 - (menuRect.top + menuRect.height / 2)
			}
		};
	});

	expect(result.notebookWidth).toBeGreaterThanOrEqual(390 * 1.2);
	expect(result.faqGap).toBeGreaterThanOrEqual(20);
	expect(result.folderWidth).toBeGreaterThanOrEqual(390 * 1.1);
	expect(Math.abs(result.joinCenterOffset)).toBeLessThanOrEqual(4);
	expect(result.joinGap).toBeGreaterThanOrEqual(16);
	expect(Math.abs(result.menuIconCenterOffset.x)).toBeLessThanOrEqual(1);
	expect(Math.abs(result.menuIconCenterOffset.y)).toBeLessThanOrEqual(1);
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
	await page.locator('.scroll-story').evaluate((story) => {
		story.style.setProperty('--story-progress', '0.935');
	});
	await expect(page.locator('.faq-list > strong')).toHaveCSS('color', 'rgb(23, 34, 53)');
	await expect(page.locator('.faq-item button').first()).toHaveCSS('color', 'rgb(23, 34, 53)');
	await expect(page.locator('.faq-item p').first()).toHaveCSS('color', 'rgb(102, 117, 138)');

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
