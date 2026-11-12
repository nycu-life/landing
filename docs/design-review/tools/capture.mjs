// Photograph every state in states.mjs at both sizes, one browser at a time.
//   WISH_ADMIN_TOKEN=… node capture.mjs site BASE_URL DOWN_URL OUT_DIR [id-filter]
//   node capture.mjs references OUT_DIR
// BASE_URL is the review gateway (Ghost theme + SvelteKit + Wish API); DOWN_URL is
// the same Node build pointed at a Ghost that does not answer. The "empty" phase
// switches every local post to draft through review-ghost.mjs and restores it.
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { SIZES, STATES, REFERENCES, ADMIN_USER, NOW } from './states.mjs';

const here = path.dirname(new URL(import.meta.url).pathname);
const [mode, ...rest] = process.argv.slice(2);
const sizes = Object.entries(SIZES).filter(
	([name]) => !process.env.ONLY_SIZE || name === process.env.ONLY_SIZE
);

async function settle(page, maxHeight) {
	// Walk the page so lazy images and iframes load, then return to the top.
	const height = Math.min(
		await page.evaluate(() => document.documentElement.scrollHeight),
		maxHeight * 4
	);
	for (let y = 0; y < height; y += 600) {
		await page.evaluate((top) => window.scrollTo(0, top), y);
		await page.waitForTimeout(100);
	}
	await page.evaluate(() => window.scrollTo(0, 0));
	await page.evaluate(() =>
		Promise.all(
			[...document.images]
				.filter((img) => !img.complete && img.loading !== 'lazy')
				.map(
					(img) =>
						new Promise((done) => {
							img.onload = img.onerror = done;
							setTimeout(done, 4000);
						})
				)
		)
	);
	await page.waitForTimeout(700);
}

async function shoot(page, file, size, { anchor, viewportOnly } = {}) {
	let top = 0;
	if (anchor) {
		top = await page.evaluate((selector) => {
			const node = document.querySelector(selector);
			const header = document.querySelector('.topbar, header');
			const sticky =
				header && ['sticky', 'fixed'].includes(getComputedStyle(header).position)
					? header.offsetHeight
					: 0;
			return node
				? Math.round(Math.max(0, node.getBoundingClientRect().top + window.scrollY - 16 - sticky))
				: 0;
		}, anchor);
	}
	if (viewportOnly) {
		await page.evaluate((y) => window.scrollTo(0, y), top);
		await page.waitForTimeout(400);
		return page.screenshot({ path: file, animations: 'disabled' });
	}
	const full = await page.evaluate(() => document.documentElement.scrollHeight);
	const height = Math.round(Math.max(size.height, Math.min(full - top, size.maxHeight)));
	// Keep the real viewport (so vh/svh sections keep their true size) and capture
	// beyond it; the page was already walked so lazy images and iframes have painted.
	await page.evaluate((y) => {
		window.scrollTo(0, y);
		// Chromium paints a sticky header at the page top in beyond-viewport captures;
		// move it (without changing the flow) to where it sits while scrolled here.
		const header = document.querySelector('.topbar');
		if (y > 0 && header && getComputedStyle(header).position === 'sticky') {
			header.style.position = 'relative';
			header.style.top = `${y - header.offsetTop}px`;
		}
	}, top);
	await page.waitForTimeout(500);
	return page.screenshot({
		path: file,
		animations: 'disabled',
		fullPage: true,
		clip: { x: 0, y: top, width: size.width, height: Math.min(height, full - top) }
	});
}

function posts(status) {
	execFileSync('node', [path.join(here, 'review-ghost.mjs'), 'posts', status, 'all'], {
		stdio: 'inherit'
	});
}

async function captureState(browser, bases, out, sizeName, size, state) {
	const context = await browser.newContext({
		viewport: { width: size.width, height: size.height },
		deviceScaleFactor: size.deviceScaleFactor,
		isMobile: !!size.isMobile,
		hasTouch: !!size.hasTouch,
		colorScheme: state.theme === 'dark' ? 'dark' : 'light',
		locale: state.lang === 'en' ? 'en-US' : 'zh-TW',
		timezoneId: 'Asia/Taipei',
		reducedMotion: 'reduce'
	});
	await context.addInitScript(
		(theme) => {
			try {
				localStorage.setItem('nycu-life-theme', theme);
			} catch {
				// Storage can be unavailable; the light default is still correct.
			}
		},
		state.theme === 'dark' ? 'dark' : 'light'
	);
	// SvelteKit picks the Wish Pool language from the cookie Ghost pages set (theme/site.js).
	const origin = state.base === 'down' ? bases.down : bases.site;
	await context.addCookies([
		{ name: 'PARAGLIDE_LOCALE', value: state.lang === 'en' ? 'en' : 'zh-tw', url: origin }
	]);
	const page = await context.newPage();
	await page.clock.setFixedTime(new Date(NOW));
	const is = (pathname) => (url) => url.pathname === pathname;
	if (state.images === 'hang')
		await page.route(
			(url) => url.pathname.includes('/content/images/'),
			() => {}
		);
	if (state.wishes && state.wishes !== 'normal')
		await page.route(is('/api/wishes'), (route) => {
			if (state.wishes === 'loading') return;
			if (state.wishes === 'error')
				return route.fulfill({
					status: 500,
					json: { error: { message: 'Wish API returned 500' } }
				});
			return route.fulfill({ json: { data: [] } });
		});
	if (state.admin === 'in') {
		await page.route(is('/api/wishes/auth/me'), (route) =>
			route.fulfill({ json: { data: { authenticated: true, user: ADMIN_USER } } })
		);
		await page.route(
			(url) => url.pathname.startsWith('/api/wishes/admin'),
			(route) => {
				if (state.adminList === 'loading') return;
				if (state.adminList === 'error')
					return route.fulfill({
						status: 500,
						json: { error: { message: 'Wish API returned 500' } }
					});
				if (state.adminList === 'empty') return route.fulfill({ json: { data: [] } });
				return route.continue({
					headers: {
						...route.request().headers(),
						authorization: `Bearer ${process.env.WISH_ADMIN_TOKEN}`
					}
				});
			}
		);
	} else {
		await page.route(is('/api/wishes/auth/me'), (route) =>
			route.fulfill({ json: { data: { authenticated: false } } })
		);
	}
	const base = state.base === 'down' ? bases.down : bases.site;
	await page
		.goto(base + state.path, { waitUntil: 'load', timeout: 45000 })
		.catch((error) => console.warn(state.id, error.message.split('\n')[0]));
	await page.waitForTimeout(
		state.wishes === 'loading' || state.adminList === 'loading' ? 1500 : 1200
	);
	if (state.wishes !== 'loading' && state.adminList !== 'loading' && state.images !== 'hang')
		await settle(page, size.maxHeight);
	for (const [selector, value] of state.fill || []) {
		const target = page.locator(selector).first();
		await (
			value === null ? target.click({ timeout: 5000 }) : target.fill(value, { timeout: 5000 })
		).catch((error) =>
			console.warn(state.id, 'fill failed', selector, error.message.split('\n')[0])
		);
		await page.waitForTimeout(250);
	}
	for (const selector of state.click || []) {
		await page
			.locator(selector)
			.first()
			.click({ timeout: 5000 })
			.catch((error) =>
				console.warn(state.id, 'click failed', selector, error.message.split('\n')[0])
			);
		await page.waitForTimeout(700);
	}
	if (state.fill || state.click) await page.waitForTimeout(600);
	const file = `${out}/${state.id}_${sizeName}.png`;
	await shoot(page, file, size, state);
	console.log(file);
	await context.close();
}

if (mode === 'site') {
	const [site, down, out, filter] = rest;
	// Forms and +1 write to the local Wish API; start every run from the same data.
	execFileSync(
		'sh',
		[
			'-c',
			`docker exec -i nycu-hc-pg psql -q -U wishes -d wishes < ${process.env.WISH_SNAPSHOT ?? '/tmp/nycu-hc/wishes.sql'}`
		],
		{ stdio: ['ignore', 'ignore', 'inherit'] }
	);
	mkdirSync(out, { recursive: true });
	const browser = await chromium.launch();
	const chosen = STATES.filter((s) => !filter || new RegExp(filter).test(s.id));
	const normal = chosen.filter((s) => s.phase !== 'empty');
	const empty = chosen.filter((s) => s.phase === 'empty');
	try {
		for (const [sizeName, size] of sizes)
			for (const state of normal.filter((s) => !s.only || s.only === sizeName))
				await captureState(browser, { site, down }, out, sizeName, size, state);
		if (empty.length) {
			posts('draft');
			try {
				for (const [sizeName, size] of sizes)
					for (const state of empty)
						await captureState(browser, { site, down }, out, sizeName, size, state);
			} finally {
				posts('published');
			}
		}
	} finally {
		await browser.close();
	}
} else if (mode === 'references') {
	const [out, filter] = rest;
	mkdirSync(out, { recursive: true });
	const browser = await chromium.launch();
	for (const [sizeName, size] of sizes) {
		for (const ref of REFERENCES.filter((r) => !filter || r.id.includes(filter))) {
			const context = await browser.newContext({
				viewport: { width: size.width, height: size.height },
				deviceScaleFactor: size.deviceScaleFactor,
				isMobile: !!size.isMobile,
				hasTouch: !!size.hasTouch,
				locale: 'en-US',
				timezoneId: 'Asia/Taipei',
				reducedMotion: 'reduce',
				userAgent: size.isMobile
					? 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
					: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
			});
			const page = await context.newPage();
			await page.goto(ref.url, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
			await page.waitForTimeout(7000);
			for (const name of [
				'Reject All',
				'Reject all',
				'Decline',
				'Accept All',
				'Accept all',
				'Accept',
				'Got it'
			]) {
				const button = page.getByRole('button', { name, exact: true });
				if (await button.count().catch(() => 0)) {
					await button
						.first()
						.click({ timeout: 2000 })
						.catch(() => {});
					break;
				}
			}
			await settle(page, size.maxHeight);
			const file = `${out}/${ref.id}_${sizeName}.png`;
			await shoot(page, file, size, {});
			console.log(file);
			await context.close();
		}
	}
	await browser.close();
}
