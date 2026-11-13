// Page weight by resource type (fonts, images, CSS, JS), for before/after notes.
//   node weight.mjs BASE_URL [path ...]
// Each page loads at 1440 and 390 in light and dark, then scrolls to the bottom so
// lazy images count. Prints one row per page/size/appearance.
import { chromium } from '@playwright/test';

const [base, ...paths] = process.argv.slice(2);
const pages = paths.length ? paths : ['/', '/products/', '/news/', '/devlog/', '/wishpool/'];
const browser = await chromium.launch();
const kb = (n) => Math.round(n / 1024);
console.log(
	'| page | size | theme | fonts KB (n) | images KB (n) | largest image | css KB | js KB | total KB |'
);
console.log('|---|---|---|---:|---:|---|---:|---:|---:|');
for (const path of pages)
	for (const [size, viewport, dpr] of [
		['1440', { width: 1440, height: 900 }, 1],
		['390', { width: 390, height: 844 }, 2]
	])
		for (const theme of ['light', 'dark']) {
			const context = await browser.newContext({
				viewport,
				deviceScaleFactor: dpr,
				reducedMotion: 'reduce'
			});
			await context.addInitScript((t) => localStorage.setItem('nycu-life-theme', t), theme);
			const page = await context.newPage();
			const seen = [];
			page.on('requestfinished', async (request) => {
				const sizes = await request.sizes().catch(() => null);
				const response = await request.response();
				if (!sizes || !response) return;
				seen.push({
					url: request.url(),
					type: request.resourceType(),
					bytes: sizes.responseBodySize
				});
			});
			await page.goto(base + path, { waitUntil: 'domcontentloaded', timeout: 90000 });
			await page.waitForLoadState('load', { timeout: 30000 }).catch(() => {});
			for (let y = 0; y < 30000; y += 700) {
				const more = await page.evaluate((top) => {
					window.scrollTo(0, top);
					return top < document.documentElement.scrollHeight;
				}, y);
				await page.waitForTimeout(80);
				if (!more) break;
			}
			await page.waitForTimeout(1500);
			const sum = (type) => seen.filter((r) => r.type === type).reduce((a, r) => a + r.bytes, 0);
			const count = (type) => seen.filter((r) => r.type === type).length;
			const largest = seen.filter((r) => r.type === 'image').sort((a, b) => b.bytes - a.bytes)[0];
			const name = largest
				? `${decodeURIComponent(largest.url.split('/').pop()).slice(0, 32)} ${kb(largest.bytes)}`
				: '—';
			const total = seen.reduce((a, r) => a + r.bytes, 0);
			console.log(
				`| ${path} | ${size} | ${theme} | ${kb(sum('font'))} (${count('font')}) | ${kb(sum('image'))} (${count('image')}) | ${name} | ${kb(sum('stylesheet'))} | ${kb(sum('script'))} | ${kb(total)} |`
			);
			await context.close();
		}
await browser.close();
