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
		{ progress: 0.21, selector: '.capsule', insetSelector: null },
		{ progress: 0.39, selector: '.about-card', insetSelector: null },
		{ progress: 0.55, selector: '.phone-rig', insetSelector: null },
		{ progress: 0.63, selector: '.product-course', insetSelector: null },
		{ progress: 0.8, selector: '.product-bus', insetSelector: null },
		{ progress: 0.87, selector: '.product-activity', insetSelector: null },
		{ progress: 0.925, selector: '.notebook', insetSelector: '.faq-list' },
		{ progress: 0.99, selector: '.join-folder', insetSelector: 'article' }
	];

	await page.goto('/');

	for (const viewport of viewports) {
		await page.setViewportSize(viewport);

		for (const chapter of chapters) {
			const result = await page
				.locator('.scroll-story')
				.evaluate(async (story, { progress, selector, insetSelector }) => {
					const storyTop = story.getBoundingClientRect().top + window.scrollY;
					document.documentElement.style.scrollBehavior = 'auto';
					window.scrollTo(0, storyTop + (story.offsetHeight - window.innerHeight) * progress);
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
			expect
				.soft(
					result.visibleRatio,
					`${chapter.selector} clipped at ${viewport.width}x${viewport.height}`
				)
				.toBeGreaterThanOrEqual(0.75);
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
