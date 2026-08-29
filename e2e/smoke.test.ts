import { expect, test, type Page } from '@playwright/test';

const story = (page: Page) => page.locator('.prototype-story');

test('boot splash explains waits longer than two seconds', async ({ page }) => {
	await page.route('**/story/designer/*.svg', async (route) => {
		await new Promise((resolve) => setTimeout(resolve, 3600));
		await route.continue();
	});

	await page.goto('/', { waitUntil: 'domcontentloaded' });
	const loader = page.getByRole('status');
	await expect(loader).toBeHidden();
	await expect(loader).toBeVisible({ timeout: 3000 });
	await expect(loader).toContainText(/載入中|Loading/);
	await expect(story(page)).toHaveAttribute('data-story-ready', 'true', { timeout: 5000 });
	await expect(page.locator('#boot-splash')).toHaveCount(0);
});

test('home renders the published-prototype chapter structure', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1, name: /NYCU LIFE/i })).toBeVisible();
	await expect(story(page)).toHaveAttribute('data-story-ready', 'true');
	await expect(page.locator('.gacha-machine img')).toHaveCount(14);
	await expect
		.poll(() =>
			page
				.locator('.gacha-machine img')
				.evaluateAll((images) =>
					images.every((image) => (image as HTMLImageElement).naturalWidth > 0)
				)
		)
		.toBe(true);
	const assetRatios = await page.locator('.gacha-machine').evaluate((machine) => {
		const base = machine.querySelector<HTMLImageElement>('.machine-base');
		return {
			base: base ? base.naturalWidth / base.naturalHeight : 0
		};
	});
	expect(assetRatios.base).toBeGreaterThan(1.8);
	expect(assetRatios.base).toBeLessThan(1.9);
	await expect(page.locator('.machine-knob-group')).toHaveCount(0);
	await expect(page.locator('img[src$="/knob.svg"]')).toHaveCount(0);
	await expect(page.locator('.skip-story')).toHaveCount(0);
	await expect(page.locator('.gacha-machine > .capsule .capsule-shell')).toHaveCount(2);
	await expect(page.locator('.gacha-machine > .capsule .capsule-letter')).toHaveCount(1);
	const releaseOrigin = await page.locator('.gacha-machine').evaluate((machine) => {
		const machineRect = machine.getBoundingClientRect();
		const capsuleRect = machine.querySelector('.capsule')?.getBoundingClientRect();
		if (!capsuleRect) return null;
		return {
			actualX: capsuleRect.left + capsuleRect.width / 2,
			actualY: capsuleRect.top + capsuleRect.height / 2,
			expectedX: machineRect.left + machineRect.width * 0.173,
			expectedY: machineRect.bottom - machineRect.width * 0.0867
		};
	});
	expect(releaseOrigin).not.toBeNull();
	expect(Math.abs(releaseOrigin!.actualX - releaseOrigin!.expectedX)).toBeLessThan(3);
	expect(Math.abs(releaseOrigin!.actualY - releaseOrigin!.expectedY)).toBeLessThan(3);
	const desktopMachine = await page.locator('.gacha-machine').evaluate((machine) => {
		const rect = machine.getBoundingClientRect();
		return {
			width: rect.width,
			stageWidth: machine.closest('.story-stage')?.getBoundingClientRect().width ?? 0
		};
	});
	expect(desktopMachine.width / desktopMachine.stageWidth).toBeGreaterThanOrEqual(0.44);
	await expect(story(page)).toContainText('ABOUT US');
	await expect(story(page)).toContainText('FAQ');
	await expect(story(page)).toContainText('JOIN THE TEAM');
	await expect(page.locator('#prototype-footer')).toBeAttached();
	await expect(page.locator('a[href="mailto:life@nycu.edu.tw"]')).toHaveText('life@nycu.edu.tw');
});

test('FAQ introduces NYCU LIFE without framing it as an official university system', async ({
	page
}) => {
	await page.goto('/?motion=on#faq');
	const firstQuestion = page.locator('.faq-item button').first();
	await expect(firstQuestion).toContainText('NYCU LIFE 是什麼？');
	await expect(page.getByText('NYCU LIFE 是學校官方開發的系統嗎？')).toHaveCount(0);
	await firstQuestion.click();
	await expect(page.locator('.faq-item p').first()).toContainText(
		'我們是一群由陽明交大學生自發發起、自主開發的獨立專案團隊。'
	);

	await page.evaluate(() => {
		document.cookie = 'PARAGLIDE_LOCALE=en; path=/';
	});
	await page.reload();
	await expect(page.locator('.faq-item button').first()).toContainText('What is NYCU LIFE?');
});

test('hero uses the designer art direction for desktop, phone, and tablet', async ({ page }) => {
	for (const viewport of [
		{ width: 390, height: 844, asset: /gacha-mobile\.svg$/, minWidthRatio: 0.9 },
		{ width: 768, height: 1024, asset: /gacha-tablet\.svg$/, minWidthRatio: 0.9 },
		{ width: 1440, height: 900, asset: /gacha-desktop\.svg$/, minWidthRatio: 0.6 }
	]) {
		await page.setViewportSize(viewport);
		await page.goto('/?motion=on#hero');
		const artwork = page.locator('.gacha-device-art img');
		await expect(artwork).toBeVisible();
		await expect.poll(() => artwork.evaluate((image) => image.currentSrc)).toMatch(viewport.asset);
		const result = await page.locator('.gacha-machine').evaluate((machine) => {
			const stage = machine.closest('.story-stage');
			if (!stage) throw new Error('Missing story stage');
			const machineRect = machine.getBoundingClientRect();
			const stageRect = stage.getBoundingClientRect();
			return {
				widthRatio: machineRect.width / stageRect.width,
				overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
			};
		});
		expect(result.widthRatio).toBeGreaterThanOrEqual(viewport.minWidthRatio);
		expect(result.overflow).toBe(0);
	}
});

test('hero capsule rolls toward the viewport and opens without leaving the stage', async ({
	page
}) => {
	const screenshotDirectory = process.env.VISUAL_AUDIT_SCREENSHOTS;
	for (const viewport of [
		{ name: 'desktop', width: 1440, height: 900 },
		{ name: 'tablet', width: 768, height: 1024 },
		{ name: 'mobile', width: 390, height: 844 }
	]) {
		await page.setViewportSize(viewport);
		await page.goto('/?motion=on#hero');
		await expect(story(page)).toHaveAttribute('data-story-ready', 'true');

		for (const phase of [
			{ name: 'rolling', progress: 0.14 },
			{ name: 'open', progress: 0.215 }
		]) {
			await story(page).evaluate((element, progress) => {
				element.style.setProperty('--story-progress', String(progress));
			}, phase.progress);
			const result = await page.evaluate(() => {
				const stage = document.querySelector<HTMLElement>('.story-stage');
				const capsule = document.querySelector<HTMLElement>('.capsule');
				if (!stage || !capsule) throw new Error('Missing hero capsule');
				const stageRect = stage.getBoundingClientRect();
				const capsuleRect = capsule.getBoundingClientRect();
				return {
					centerX: (capsuleRect.left + capsuleRect.width / 2 - stageRect.left) / stageRect.width,
					centerY: (capsuleRect.top + capsuleRect.height / 2 - stageRect.top) / stageRect.height,
					left: capsuleRect.left - stageRect.left,
					right: stageRect.right - capsuleRect.right,
					top: capsuleRect.top - stageRect.top,
					bottom: stageRect.bottom - capsuleRect.bottom,
					overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
				};
			});
			expect
				.soft(result.centerX, `${viewport.name}/${phase.name} horizontal position`)
				.toBeGreaterThan(0.2);
			expect
				.soft(result.centerX, `${viewport.name}/${phase.name} horizontal position`)
				.toBeLessThan(0.8);
			expect
				.soft(result.centerY, `${viewport.name}/${phase.name} vertical position`)
				.toBeGreaterThan(0.2);
			expect
				.soft(result.centerY, `${viewport.name}/${phase.name} vertical position`)
				.toBeLessThan(0.82);
			expect
				.soft(result.left, `${viewport.name}/${phase.name} left clipping`)
				.toBeGreaterThanOrEqual(-2);
			expect
				.soft(result.right, `${viewport.name}/${phase.name} right clipping`)
				.toBeGreaterThanOrEqual(-2);
			expect
				.soft(result.top, `${viewport.name}/${phase.name} top clipping`)
				.toBeGreaterThanOrEqual(-2);
			expect
				.soft(result.bottom, `${viewport.name}/${phase.name} bottom clipping`)
				.toBeGreaterThanOrEqual(-2);
			expect.soft(result.overflow, `${viewport.name}/${phase.name} overflow`).toBe(0);

			if (screenshotDirectory) {
				await page.screenshot({
					path: `${screenshotDirectory}/hero-capsule-${viewport.name}-${phase.name}.png`
				});
			}
		}
	}
});

test('one wheel gesture plays one fixed chapter without skipping and supports reverse', async ({
	page
}) => {
	test.slow();
	const screenshotDirectory = process.env.VISUAL_AUDIT_SCREENSHOTS;
	await page.goto('/?motion=on');
	await page.mouse.move(640, 400);
	await page.mouse.wheel(0, 900);
	await page.mouse.wheel(0, 900);
	await page.mouse.wheel(0, 900);

	await expect(story(page)).toHaveAttribute('data-story-animating', 'true');
	await page.waitForTimeout(180);
	await expect(story(page)).toHaveAttribute('data-story-step', '0');
	await expect(page.locator('.machine-knob-group')).toHaveCount(0);
	await expect
		.poll(() => page.locator('.capsule').evaluate((element) => getComputedStyle(element).opacity))
		.not.toBe('0');
	await expect(page.locator('.capsule')).toHaveCount(1);
	await expect(page.locator('.capsule .capsule-shell')).toHaveCount(2);
	await expect(page.locator('.capsule img[src$="bottom-ball.svg"]')).toHaveCount(0);
	await expect
		.poll(() =>
			page
				.locator('.prototype-story')
				.evaluate((element) =>
					Number.parseFloat(getComputedStyle(element).getPropertyValue('--story-progress'))
				)
		)
		.toBeGreaterThan(0.14);
	if (screenshotDirectory) {
		await page.screenshot({ path: `${screenshotDirectory}/hero-capsule-rolling.png` });
	}
	await expect
		.poll(
			() =>
				page
					.locator('.prototype-story')
					.evaluate((element) =>
						Number.parseFloat(getComputedStyle(element).getPropertyValue('--story-progress'))
					),
			{ timeout: 4200 }
		)
		.toBeGreaterThan(0.205);
	const openedShell = await page.locator('.capsule').evaluate((capsule) => {
		const top = capsule.querySelector<HTMLElement>('.capsule-shell-top');
		const bottom = capsule.querySelector<HTMLElement>('.capsule-shell-bottom');
		const glow = capsule.querySelector<HTMLElement>('.capsule-glow');
		if (!top || !bottom || !glow) return null;
		return {
			top: getComputedStyle(top).transform,
			bottom: getComputedStyle(bottom).transform,
			shellOpacity: Number.parseFloat(getComputedStyle(top).opacity),
			glowOpacity: Number.parseFloat(getComputedStyle(glow).opacity)
		};
	});
	expect(openedShell).not.toBeNull();
	expect(openedShell!.top).not.toBe(openedShell!.bottom);
	expect(openedShell!.shellOpacity).toBeLessThan(0.05);
	expect(openedShell!.glowOpacity).toBeGreaterThan(0.3);
	if (screenshotDirectory) {
		await page.screenshot({ path: `${screenshotDirectory}/hero-capsule-open.png` });
	}
	await expect(story(page)).toHaveAttribute('data-story-step', '1', { timeout: 5200 });
	await expect(story(page)).toHaveAttribute('data-story-step-name', 'about');
	await expect(story(page)).toHaveAttribute('data-story-animating', 'false');
	await expect(page.locator('.hero-scene')).toHaveCSS('opacity', '0');

	await page.keyboard.press('ArrowUp');
	await expect(story(page)).toHaveAttribute('data-story-step-name', 'hero', { timeout: 5200 });
});

test('the first gesture is buffered until hero assets are ready', async ({ page }) => {
	test.slow();
	await page.route('**/_app/immutable/**/*.js', async (route) => {
		await new Promise((resolve) => setTimeout(resolve, 800));
		await route.continue();
	});
	await page.route('**/story/designer/*.svg', async (route) => {
		await new Promise((resolve) => setTimeout(resolve, 1100));
		await route.continue();
	});

	await page.goto('/?motion=on', { waitUntil: 'commit' });
	await story(page).waitFor({ state: 'attached' });
	const shortStageBottom = await story(page).evaluate((element) => {
		element.style.height = '480px';
		element.style.minHeight = '0';
		return element.getBoundingClientRect().bottom;
	});
	expect(shortStageBottom).toBeLessThan(await page.evaluate(() => innerHeight - 20));
	await page.mouse.move(195, 420);
	await page.mouse.wheel(0, 80);

	await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
	await expect(story(page)).toHaveAttribute('data-story-ready', 'true', { timeout: 6000 });
	await expect(story(page)).toHaveAttribute('data-story-animating', 'true');
	await expect(story(page)).toHaveAttribute('data-story-step-name', 'about', { timeout: 5200 });
});

test('normal page scrolling reaches the footer only after the final chapter', async ({ page }) => {
	await page.setViewportSize({ width: 412, height: 915 });
	await page.goto('/?motion=on#hero');
	await expect(story(page)).toHaveAttribute('data-story-ready', 'true');
	await story(page).evaluate((element) => {
		element.style.height = '650px';
		element.style.minHeight = '0';
	});

	await page.mouse.move(206, 400);
	await page.mouse.wheel(0, 80);
	await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
	await expect(story(page)).toHaveAttribute('data-story-animating', 'true');

	await page.goto('/?motion=on&footer-test=1#join');
	await expect(story(page)).toHaveAttribute('data-story-step-name', 'join');
	await page.mouse.move(206, 400);
	await page.mouse.wheel(0, 500);
	await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
	await expect(page.locator('#prototype-footer')).toBeVisible();

	// The first upward gesture only restores the complete landing stage. Inertia from that same
	// gesture must not also send JOIN back to FAQ while the user is trying to leave the footer.
	await page.mouse.wheel(0, -500);
	await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
	await expect(story(page)).toHaveAttribute('data-story-step-name', 'join');
	await expect(story(page)).toHaveAttribute('data-story-animating', 'false');
	await expect
		.poll(() =>
			page
				.locator('#prototype-footer')
				.evaluate((footer) => footer.getBoundingClientRect().top >= window.innerHeight - 2)
		)
		.toBe(true);
	await page.mouse.wheel(0, -80);
	await expect(story(page)).toHaveAttribute('data-story-step-name', 'join');
	await expect(story(page)).toHaveAttribute('data-story-animating', 'false');

	await page.waitForTimeout(220);
	await page.mouse.wheel(0, -80);
	await expect(story(page)).toHaveAttribute('data-story-animating', 'true');
	await expect(story(page)).toHaveAttribute('data-story-step-name', 'faq', { timeout: 5200 });
});

test('a fresh upward flick can leave JOIN without waiting for the restoration timer', async ({
	page
}) => {
	await page.goto('/?motion=on#join');
	await expect(story(page)).toHaveAttribute('data-story-ready', 'true');
	await expect(story(page)).toHaveAttribute('data-story-step-name', 'join');

	const result = await story(page).evaluate(() => {
		document.documentElement.style.scrollBehavior = 'auto';
		document.body.style.scrollBehavior = 'auto';
		window.scrollTo(0, 400);
		const startScrollY = window.scrollY;
		const dispatchWheel = (deltaY: number) => {
			const event = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY });
			window.dispatchEvent(event);
			return event.defaultPrevented;
		};

		const restorationPrevented = dispatchWheel(-500);
		window.scrollTo(0, 0);
		const inertiaPrevented = dispatchWheel(-80);
		const freshFlickPrevented = dispatchWheel(-160);

		return {
			startScrollY,
			restorationPrevented,
			inertiaPrevented,
			freshFlickPrevented,
			scrollY: window.scrollY
		};
	});

	expect(result).toEqual({
		startScrollY: 400,
		restorationPrevented: false,
		inertiaPrevented: false,
		freshFlickPrevented: true,
		scrollY: 0
	});
	await expect(story(page)).toHaveAttribute('data-story-animating', 'true');
	await expect(story(page)).toHaveAttribute('data-story-step-name', 'faq', { timeout: 5200 });
});

test('motion opt-in overrides system reduced-motion for review', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/?motion=on');
	await expect(story(page)).toHaveAttribute('data-reduced-motion', 'false');
	await page.mouse.move(640, 400);
	await page.mouse.wheel(0, 80);
	await expect(story(page)).toHaveAttribute('data-story-animating', 'true');
	await expect(story(page)).toHaveAttribute('data-story-step-name', 'about', { timeout: 5200 });
});

test('a mobile swipe advances exactly one chapter', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/?motion=on');

	await story(page).evaluate((element) => {
		const touch = (clientY: number) =>
			new Touch({ identifier: 1, target: element, clientX: 195, clientY });
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

	await expect(story(page)).toHaveAttribute('data-story-step-name', 'about', { timeout: 5200 });
	await page.waitForTimeout(250);
	await expect(story(page)).toHaveAttribute('data-story-step', '1');
});

test('a mobile swipe restores the landing before leaving JOIN', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/?motion=on#join');
	await expect(story(page)).toHaveAttribute('data-story-step-name', 'join');

	const restoration = await story(page).evaluate((element) => {
		document.documentElement.style.scrollBehavior = 'auto';
		document.body.style.scrollBehavior = 'auto';
		window.scrollTo(0, 400);
		const startScrollY = window.scrollY;
		const touch = (clientY: number) =>
			new Touch({ identifier: 1, target: element, clientX: 195, clientY });
		const start = touch(300);
		const firstEnd = touch(340);
		const secondEnd = touch(380);
		element.dispatchEvent(
			new TouchEvent('touchstart', {
				bubbles: true,
				cancelable: true,
				touches: [start],
				targetTouches: [start],
				changedTouches: [start]
			})
		);
		const firstMove = new TouchEvent('touchmove', {
			bubbles: true,
			cancelable: true,
			touches: [firstEnd],
			targetTouches: [firstEnd],
			changedTouches: [firstEnd]
		});
		element.dispatchEvent(firstMove);
		window.scrollTo(0, 0);
		const secondMove = new TouchEvent('touchmove', {
			bubbles: true,
			cancelable: true,
			touches: [secondEnd],
			targetTouches: [secondEnd],
			changedTouches: [secondEnd]
		});
		element.dispatchEvent(secondMove);
		element.dispatchEvent(
			new TouchEvent('touchend', {
				bubbles: true,
				cancelable: true,
				touches: [],
				targetTouches: [],
				changedTouches: [secondEnd]
			})
		);
		return {
			firstPrevented: firstMove.defaultPrevented,
			secondPrevented: secondMove.defaultPrevented,
			startScrollY,
			scrollY: window.scrollY
		};
	});

	expect(restoration).toEqual({
		firstPrevented: false,
		secondPrevented: false,
		startScrollY: 400,
		scrollY: 0
	});
	await expect(story(page)).toHaveAttribute('data-story-step-name', 'join');
	await expect(story(page)).toHaveAttribute('data-story-animating', 'false');

	const nextGesturePrevented = await story(page).evaluate((element) => {
		const touch = (clientY: number) =>
			new Touch({ identifier: 2, target: element, clientX: 195, clientY });
		const start = touch(300);
		const end = touch(340);
		element.dispatchEvent(
			new TouchEvent('touchstart', {
				bubbles: true,
				cancelable: true,
				touches: [start],
				targetTouches: [start],
				changedTouches: [start]
			})
		);
		const move = new TouchEvent('touchmove', {
			bubbles: true,
			cancelable: true,
			touches: [end],
			targetTouches: [end],
			changedTouches: [end]
		});
		element.dispatchEvent(move);
		element.dispatchEvent(
			new TouchEvent('touchend', {
				bubbles: true,
				cancelable: true,
				touches: [],
				targetTouches: [],
				changedTouches: [end]
			})
		);
		return move.defaultPrevented;
	});

	expect(nextGesturePrevented).toBe(true);
	await expect(story(page)).toHaveAttribute('data-story-animating', 'true');
	await expect(story(page)).toHaveAttribute('data-story-step-name', 'faq', { timeout: 5200 });
});

test('every prototype chapter stays readable across desktop, tablet, and compact phones', async ({
	page
}) => {
	test.slow();
	const viewports = [
		{ width: 2560, height: 1440 },
		{ width: 1440, height: 900 },
		{ width: 1024, height: 768 },
		{ width: 768, height: 1024 },
		{ width: 430, height: 932 },
		{ width: 412, height: 915 },
		{ width: 390, height: 844 },
		{ width: 320, height: 568 }
	];
	const chapters = [
		{ hash: 'hero', selector: '.gacha-machine', minimum: 0.72 },
		{ hash: 'about', selector: '.about-shell', minimum: 0.8 },
		{ hash: 'products', selector: '.product-shell', minimum: 0.8 },
		{ hash: 'faq', selector: '.faq-shell', minimum: 0.68 },
		{ hash: 'join', selector: '.join-shell', minimum: 0.72 }
	];

	for (const viewport of viewports) {
		await page.setViewportSize(viewport);
		for (const chapter of chapters) {
			await page.goto(`/?motion=on#${chapter.hash}`);
			await expect(story(page)).toHaveAttribute('data-story-step-name', chapter.hash);
			const result = await page.locator(chapter.selector).evaluate((target) => {
				const stage = document.querySelector<HTMLElement>('.story-stage');
				if (!stage) throw new Error('Missing story stage');
				const stageRect = stage.getBoundingClientRect();
				const rect = target.getBoundingClientRect();
				const width = Math.max(
					0,
					Math.min(stageRect.right, rect.right) - Math.max(stageRect.left, rect.left)
				);
				const height = Math.max(
					0,
					Math.min(stageRect.bottom, rect.bottom) - Math.max(stageRect.top, rect.top)
				);
				return {
					visibleRatio: (width * height) / Math.max(1, rect.width * rect.height),
					sizeRatio: rect.width / stageRect.width,
					overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
				};
			});
			expect
				.soft(result.overflow, `${chapter.hash} overflow at ${viewport.width}x${viewport.height}`)
				.toBe(0);
			expect
				.soft(
					result.visibleRatio,
					`${chapter.hash} clipped at ${viewport.width}x${viewport.height}`
				)
				.toBeGreaterThanOrEqual(chapter.minimum);
			if (chapter.hash === 'hero' && viewport.width >= 641 && viewport.width <= 900) {
				expect
					.soft(result.sizeRatio, `hero undersized at ${viewport.width}x${viewport.height}`)
					.toBeGreaterThanOrEqual(0.6);
			}
		}
	}
});

test('product copy and device remain separate and centered on narrow screens', async ({ page }) => {
	for (const viewport of [
		{ width: 430, height: 760 },
		{ width: 390, height: 844 },
		{ width: 320, height: 568 }
	]) {
		await page.setViewportSize(viewport);
		await page.goto('/?motion=on#products');
		const result = await page.evaluate(() => {
			const copy = document.querySelector<HTMLElement>('.product-copy');
			const demo = document.querySelector<HTMLElement>('.product-demo');
			const title = copy?.querySelector<HTMLElement>('h2');
			if (!copy || !demo || !title) throw new Error('Missing product prototype layout');
			const copyRect = copy.getBoundingClientRect();
			const demoRect = demo.getBoundingClientRect();
			const titleRect = title.getBoundingClientRect();
			return {
				gap: demoRect.top - copyRect.bottom,
				overlap: Math.max(
					0,
					Math.min(titleRect.bottom, demoRect.bottom) - Math.max(titleRect.top, demoRect.top)
				),
				copyCenter: copyRect.left + copyRect.width / 2 - innerWidth / 2,
				demoCenter: demoRect.left + demoRect.width / 2 - innerWidth / 2,
				overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
			};
		});
		expect.soft(result.gap).toBeGreaterThanOrEqual(0);
		expect.soft(result.overlap).toBe(0);
		expect.soft(Math.abs(result.copyCenter)).toBeLessThan(4);
		expect.soft(Math.abs(result.demoCenter)).toBeLessThan(4);
		expect.soft(result.overflow).toBe(0);
	}
});

test('product screens stay registered to the phone frame at every viewport size', async ({
	page
}) => {
	const screenshotDirectory = process.env.VISUAL_AUDIT_SCREENSHOTS;
	for (const viewport of [
		{ width: 2560, height: 1440 },
		{ width: 1024, height: 768 },
		{ width: 768, height: 1024 },
		{ width: 390, height: 844 },
		{ width: 320, height: 568 }
	]) {
		await page.setViewportSize(viewport);
		await page.goto('/?motion=on#products');
		const next = page.getByRole('button', { name: '下一個產品' });

		for (let productIndex = 0; productIndex < 4; productIndex += 1) {
			if (productIndex > 0) await next.click();
			const result = await page.evaluate(() => {
				const backHand = document.querySelector<HTMLElement>('.device-hand');
				const frontHands = Array.from(document.querySelectorAll<HTMLElement>('.device-hand-front'));
				const phone = document.querySelector<HTMLElement>('.device-phone');
				const screen = document.querySelector<HTMLElement>('.device-screen');
				const frame = document.querySelector<HTMLImageElement>('.device-frame');
				if (!backHand || frontHands.length < 1 || !phone || !screen || !frame) {
					throw new Error('Missing product phone or hand layers');
				}
				const card = document.querySelector<HTMLElement>('.device-card')!;
				const cardRect = card.getBoundingClientRect();
				const phoneRect = phone.getBoundingClientRect();
				const screenRect = screen.getBoundingClientRect();
				const frameRect = frame.getBoundingClientRect();
				return {
					backHandZ: Number(getComputedStyle(backHand).zIndex),
					phoneZ: Number(getComputedStyle(phone).zIndex),
					frameZ: Number(getComputedStyle(frame).zIndex),
					frontHandZ: frontHands.map((hand) => Number(getComputedStyle(hand).zIndex)),
					left: (screenRect.left - phoneRect.left) / phoneRect.width,
					top: (screenRect.top - phoneRect.top) / phoneRect.height,
					right: (phoneRect.right - screenRect.right) / phoneRect.width,
					bottom: (phoneRect.bottom - screenRect.bottom) / phoneRect.height,
					// The frame artwork shares the card's 1080×1350 box with every hand layer.
					frameWidthDelta: Math.abs(frameRect.width - cardRect.width),
					frameHeightDelta: Math.abs(frameRect.height - cardRect.height),
					// Phone bounds inside the artwork (手機殼 path of phone.svg).
					phoneLeft: (phoneRect.left - cardRect.left) / cardRect.width,
					phoneTop: (phoneRect.top - cardRect.top) / cardRect.height,
					overflow: getComputedStyle(screen).overflow
				};
			});

			const label = `${viewport.width}x${viewport.height} product ${productIndex + 1}`;
			expect.soft(result.backHandZ, `${label}: rear hand layer`).toBeLessThan(result.phoneZ);
			expect.soft(result.frameZ, `${label}: frame over screen`).toBeGreaterThan(result.phoneZ);
			for (const z of result.frontHandZ) {
				expect.soft(z, `${label}: foreground fingers`).toBe(result.frameZ + 1);
			}
			expect.soft(result.left, `${label}: left inset`).toBeCloseTo(0.0295, 2);
			expect.soft(result.top, `${label}: top inset`).toBeCloseTo(0.0165, 2);
			expect.soft(result.right, `${label}: right inset`).toBeCloseTo(0.0286, 2);
			expect.soft(result.bottom, `${label}: bottom inset`).toBeCloseTo(0.0176, 2);
			expect.soft(result.phoneLeft, `${label}: phone x in artwork`).toBeCloseTo(0.0429, 2);
			expect.soft(result.phoneTop, `${label}: phone y in artwork`).toBeCloseTo(0.0006, 2);
			expect.soft(result.frameWidthDelta, `${label}: frame width`).toBeLessThanOrEqual(1);
			expect.soft(result.frameHeightDelta, `${label}: frame height`).toBeLessThanOrEqual(1);
			expect.soft(result.overflow, `${label}: screen clipping`).toBe('hidden');
			if (screenshotDirectory) {
				await page.screenshot({
					path: `${screenshotDirectory}/phone-${viewport.width}x${viewport.height}-product-${productIndex + 1}.png`,
					animations: 'disabled'
				});
			}
		}
	}
});

test('product carousel exposes all four products without changing story chapter', async ({
	page
}) => {
	await page.goto('/?motion=on#products');
	await expect(story(page)).toHaveAttribute('data-story-step-name', 'products');
	const next = page.getByRole('button', { name: '下一個產品' });
	for (const product of ['NYCozU', 'NYCU EVENTS', 'NYCU MAPS']) {
		await next.click();
		await expect(page.locator('.product-copy h2')).toContainText(product);
		if (product === 'NYCU EVENTS') {
			await expect(page.locator('.product-cta')).toHaveAttribute(
				'href',
				'https://events.life.nycu.edu.tw/'
			);
		}
		await expect(story(page)).toHaveAttribute('data-story-step-name', 'products');
	}
});

test('FAQ and recruitment boards stay readable in dark mode', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/?motion=on#faq');
	await page.getByRole('button', { name: '切換至深色模式' }).click();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
	await expect(page.locator('.faq-list > strong')).toHaveCSS('color', 'rgb(23, 34, 53)');
	await expect(page.locator('.faq-item button').first()).toHaveCSS('color', 'rgb(23, 34, 53)');
	await expect(page.locator('.faq-item p').first()).toHaveCSS('color', 'rgb(82, 100, 125)');

	await page.evaluate(() => {
		location.hash = 'join';
	});
	await expect(story(page)).toHaveAttribute('data-story-step-name', 'join');
	await expect(page.locator('.join-board-content h2')).toHaveCSS('color', 'rgb(23, 34, 53)');
	await expect(page.locator('.join-board-content p')).toHaveCSS('color', 'rgb(102, 117, 138)');
});

test('visual acceptance matrix has no broken images, clipped copy, or horizontal overflow', async ({
	page
}) => {
	test.slow();
	const viewports = [
		{ name: 'desktop-large', width: 2560, height: 1440 },
		{ name: 'desktop', width: 1440, height: 900 },
		{ name: 'tablet-landscape', width: 1024, height: 768 },
		{ name: 'tablet-portrait', width: 768, height: 1024 },
		{ name: 'phone-large', width: 430, height: 932 },
		{ name: 'phone-user', width: 412, height: 915 },
		{ name: 'mobile', width: 390, height: 844 },
		{ name: 'compact', width: 320, height: 568 }
	];
	const locales = ['zh-tw', 'en'] as const;
	const themes = ['light', 'dark'] as const;
	const chapters = ['hero', 'about', 'products', 'faq', 'join'] as const;
	const screenshotDirectory = process.env.VISUAL_AUDIT_SCREENSHOTS;

	for (const viewport of viewports) {
		await page.setViewportSize(viewport);
		for (const locale of locales) {
			for (const theme of themes) {
				await page.goto('/?motion=on#hero');
				await page.evaluate(
					({ locale, theme }) => {
						document.cookie = `PARAGLIDE_LOCALE=${locale}; path=/`;
						localStorage.setItem('nycu-life-theme', theme);
					},
					{ locale, theme }
				);
				await page.reload();
				await expect(page.locator('html')).toHaveAttribute('lang', locale);
				await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

				for (const chapter of chapters) {
					await page.evaluate((nextChapter) => {
						location.hash = nextChapter;
					}, chapter);
					await expect(story(page)).toHaveAttribute('data-story-step-name', chapter);

					const result = await page.locator('.story-scene.scene-active').evaluate((scene) => {
						const stage = document.querySelector<HTMLElement>('.story-stage');
						if (!stage) throw new Error('Missing story stage');
						const stageRect = stage.getBoundingClientRect();
						const isVisible = (element: HTMLElement) => {
							const style = getComputedStyle(element);
							const rect = element.getBoundingClientRect();
							return (
								style.display !== 'none' &&
								style.visibility !== 'hidden' &&
								Number(style.opacity) > 0.01 &&
								rect.width > 1 &&
								rect.height > 1
							);
						};
						const clippedCopy = Array.from(
							scene.querySelectorAll<HTMLElement>('h1, h2, h3, p, a, button, .eyebrow')
						)
							.filter(isVisible)
							.filter((element) => {
								const rect = element.getBoundingClientRect();
								return (
									rect.left < stageRect.left - 2 ||
									rect.right > stageRect.right + 2 ||
									rect.top < stageRect.top - 2 ||
									rect.bottom > stageRect.bottom + 2 ||
									element.scrollWidth > element.clientWidth + 2 ||
									element.scrollHeight > element.clientHeight + 2
								);
							})
							.map((element) => `${element.tagName}.${element.className}`);
						const brokenImages = Array.from(scene.querySelectorAll<HTMLImageElement>('img'))
							.filter((image) => image.complete && image.naturalWidth === 0)
							.map((image) => image.src);
						const safeAreaOverflow = Array.from(
							scene.querySelectorAll<HTMLElement>(
								'.about-copy, .product-copy, .faq-list, .join-board-content'
							)
						).flatMap((container) => {
							const containerRect = container.getBoundingClientRect();
							return Array.from(
								container.querySelectorAll<HTMLElement>('h1, h2, h3, p, a, button, .eyebrow')
							)
								.filter(isVisible)
								.filter((element) => {
									const rect = element.getBoundingClientRect();
									return (
										rect.left < containerRect.left - 2 ||
										rect.right > containerRect.right + 2 ||
										rect.top < containerRect.top - 2 ||
										rect.bottom > containerRect.bottom + 2
									);
								})
								.map((element) => `${element.tagName}.${element.className}`);
						});
						return {
							brokenImages,
							clippedCopy,
							safeAreaOverflow,
							overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
						};
					});
					const label = `${locale}/${theme}/${viewport.name}/${chapter}`;
					expect.soft(result.brokenImages, `${label}: broken images`).toEqual([]);
					expect.soft(result.clippedCopy, `${label}: clipped copy`).toEqual([]);
					expect.soft(result.safeAreaOverflow, `${label}: safe-area overflow`).toEqual([]);
					expect.soft(result.overflow, `${label}: horizontal overflow`).toBe(0);
					if (screenshotDirectory) {
						await page.screenshot({
							path: `${screenshotDirectory}/${viewport.name}-${locale}-${theme}-${chapter}.png`,
							animations: 'disabled'
						});
					}
				}
			}
		}
	}
});

test('every expanded FAQ fits inside the notebook on phones', async ({ page }) => {
	const screenshotDirectory = process.env.VISUAL_AUDIT_SCREENSHOTS;
	for (const viewport of [
		{ width: 430, height: 932 },
		{ width: 412, height: 915 },
		{ width: 390, height: 844 },
		{ width: 320, height: 568 }
	]) {
		await page.setViewportSize(viewport);
		for (const locale of ['zh-tw', 'en']) {
			await page.goto('/?motion=on#faq');
			await page.evaluate((nextLocale) => {
				document.cookie = `PARAGLIDE_LOCALE=${nextLocale}; path=/`;
			}, locale);
			await page.reload();
			await expect(story(page)).toHaveAttribute('data-story-step-name', 'faq');

			const questions = page.locator('.faq-item button');
			for (let index = 0; index < (await questions.count()); index += 1) {
				await questions.nth(index).click();
				await expect(questions.nth(index)).toHaveAttribute('aria-expanded', 'true');
				await page.waitForTimeout(300);
				const result = await page.locator('.faq-list').evaluate((list) => {
					const listRect = list.getBoundingClientRect();
					const notebook = list.closest<HTMLElement>('.notebook');
					if (!notebook) throw new Error('Missing FAQ notebook');
					const notebookRect = notebook.getBoundingClientRect();
					const visibleChildren = Array.from(list.children).filter(
						(child) => getComputedStyle(child).display !== 'none'
					);
					const horizontalOverflow = Array.from(
						list.querySelectorAll<HTMLElement>('strong, button, p')
					).filter((element) => {
						const rect = element.getBoundingClientRect();
						return (
							rect.left < listRect.left - 1 ||
							rect.right > listRect.right + 1 ||
							element.scrollWidth > element.clientWidth + 1
						);
					}).length;
					return {
						scrollOverflow: list.scrollHeight - list.clientHeight,
						horizontalOverflow,
						topGridInset: (listRect.top - notebookRect.top) / notebookRect.height,
						leftGridInset: (listRect.left - notebookRect.left) / notebookRect.width,
						rightGridInset: (notebookRect.right - listRect.right) / notebookRect.width,
						outside: visibleChildren
							.map((child) => child.getBoundingClientRect())
							.filter((rect) => rect.top < listRect.top - 1 || rect.bottom > listRect.bottom + 1)
							.length
					};
				});
				expect
					.soft(result.scrollOverflow, `${viewport.width}/${locale}/faq ${index + 1}`)
					.toBeLessThanOrEqual(1);
				expect
					.soft(result.horizontalOverflow, `${viewport.width}/${locale}/faq ${index + 1}`)
					.toBe(0);
				expect
					.soft(result.topGridInset, `${viewport.width}/${locale}/faq ${index + 1} top grid`)
					.toBeGreaterThanOrEqual(0.195);
				expect
					.soft(result.leftGridInset, `${viewport.width}/${locale}/faq ${index + 1} left grid`)
					.toBeGreaterThanOrEqual(0.195);
				expect
					.soft(result.rightGridInset, `${viewport.width}/${locale}/faq ${index + 1} right grid`)
					.toBeGreaterThanOrEqual(0.18);
				expect.soft(result.outside, `${viewport.width}/${locale}/faq ${index + 1}`).toBe(0);
				if (screenshotDirectory && viewport.width === 412 && locale === 'zh-tw' && index === 4) {
					await page.screenshot({
						path: `${screenshotDirectory}/phone-user-zh-tw-faq-expanded-5.png`,
						animations: 'disabled'
					});
				}
			}
		}
	}
});

test('phone chapters use the full stage without pushing their compositions down', async ({
	page
}) => {
	await page.setViewportSize({ width: 430, height: 932 });
	await page.goto('/?motion=on#about');
	await expect(story(page)).toHaveAttribute('data-story-step-name', 'about');

	const stage = page.locator('.story-stage');
	const stageRect = await stage.boundingBox();
	if (!stageRect) throw new Error('Missing story stage');

	const aboutCopyRect = await page.locator('.about-copy').boundingBox();
	const filmRect = await page.locator('.team-film').boundingBox();
	if (!aboutCopyRect || !filmRect) throw new Error('Missing about composition');
	const aboutTop = Math.min(aboutCopyRect.y, filmRect.y);
	const aboutBottom = Math.max(
		aboutCopyRect.y + aboutCopyRect.height,
		filmRect.y + filmRect.height
	);
	const aboutCenter = (aboutTop + (aboutBottom - aboutTop) / 2 - stageRect.y) / stageRect.height;
	expect(aboutCenter).toBeGreaterThan(0.45);
	expect(aboutCenter).toBeLessThan(0.55);

	for (const chapter of ['faq', 'join'] as const) {
		await page.evaluate((nextChapter) => {
			location.hash = nextChapter;
		}, chapter);
		await expect(story(page)).toHaveAttribute('data-story-step-name', chapter);
		const board = page.locator(chapter === 'faq' ? '.notebook' : '.join-board');
		const boardRect = await board.boundingBox();
		if (!boardRect) throw new Error(`Missing ${chapter} board`);
		expect(boardRect.width / stageRect.width, `${chapter} board width`).toBeGreaterThanOrEqual(
			1.05
		);
		expect(boardRect.width / stageRect.width, `${chapter} board width`).toBeLessThanOrEqual(1.15);
		if (chapter === 'join') {
			const contentRect = await page.locator('.join-board-content').boundingBox();
			if (!contentRect) throw new Error('Missing join content');
			const contentCenter = contentRect.x + contentRect.width / 2;
			const stageCenter = stageRect.x + stageRect.width / 2;
			expect(Math.abs(contentCenter - stageCenter), 'join content horizontal centre').toBeLessThan(
				stageRect.width * 0.035
			);
		}
	}

	await page.evaluate(() => {
		location.hash = 'products';
	});
	await expect(story(page)).toHaveAttribute('data-story-step-name', 'products');
	const phoneRect = await page.locator('.device-phone').boundingBox();
	if (!phoneRect) throw new Error('Missing product phone');
	const visiblePhoneHeight =
		Math.min(phoneRect.y + phoneRect.height, stageRect.y + stageRect.height) -
		Math.max(phoneRect.y, stageRect.y);
	expect(visiblePhoneHeight / stageRect.height).toBeGreaterThan(0.58);
});

test('theme persists and the burger menu is gone on phones', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');
	await page.getByRole('button', { name: '切換至深色模式' }).click();
	await page.reload();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
	await expect(page.getByRole('button', { name: '開啟選單' })).toHaveCount(0);
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('language switcher translates in place without reloading or losing the chapter', async ({
	page
}) => {
	await page.goto('/?motion=on#faq');
	await expect(story(page)).toHaveAttribute('data-story-step-name', 'faq');
	const pageMarker = await page.evaluate(() => {
		const marker = crypto.randomUUID();
		(window as Window & { __localeSwitchMarker?: string }).__localeSwitchMarker = marker;
		return marker;
	});
	const navbar = page.getByRole('banner');
	await expect(navbar.getByRole('group', { name: '語言' })).toBeVisible();
	const englishButton = navbar.getByRole('button', { name: 'EN' });
	await englishButton.click();
	await expect(
		page.getByRole('heading', { level: 2, name: /Wait, I still have questions/i })
	).toBeVisible();
	await expect(page.locator('.faq-item button').first()).toContainText('What is NYCU LIFE?');
	await expect(story(page)).toHaveAttribute('data-story-step-name', 'faq');
	expect(page.url()).toContain('#faq');
	expect(
		await page.evaluate(
			() => (window as Window & { __localeSwitchMarker?: string }).__localeSwitchMarker
		)
	).toBe(pageMarker);
	await expect(englishButton).toBeFocused();

	await page.reload();
	await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	await expect(page.locator('.faq-item button').first()).toContainText('What is NYCU LIFE?');
});
