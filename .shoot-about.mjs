import { chromium } from 'playwright';

const OUT = '/tmp/landing-shots';
const points = [
	['drop', 0.27],
	['mid', 0.36],
	['full', 0.41]
];
// Mirrors SEGMENTS in PrototypeStory.svelte.
const SEGMENTS = [
	[0.2, 2],
	[0.25, 0.7],
	[0.3, 0.5],
	[0.4, 0.9],
	[0.42, 0.35],
	[0.5, 1],
	[0.58, 1.2],
	[0.66, 1],
	[0.72, 0.6],
	[0.8, 1],
	[1, 0.5]
];
const TOTAL = SEGMENTS.reduce((s, [, u]) => s + u, 0);
const fractionFromProgress = (p) => {
	let used = 0,
		from = 0;
	for (const [to, units] of SEGMENTS) {
		if (p <= to) return (used + ((p - from) / (to - from)) * units) / TOTAL;
		used += units;
		from = to;
	}
	return 1;
};

const browser = await chromium.launch();
for (const [vpName, vp] of [
	['desktop', { width: 1440, height: 900 }],
	['tablet', { width: 1024, height: 768 }]
]) {
	const page = await browser.newPage({ viewport: vp });
	await page.goto('http://localhost:5175/', { waitUntil: 'networkidle' });
	await page.waitForSelector('[data-story-ready="true"]', { timeout: 15000 });
	for (const [name, progress] of points) {
		await page.evaluate((frac) => {
			const story = document.querySelector('.prototype-story');
			const stage = document.querySelector('.story-stage');
			const top = story.getBoundingClientRect().top + window.scrollY;
			window.scrollTo(0, top + frac * (story.offsetHeight - stage.offsetHeight));
		}, fractionFromProgress(progress));
		await page.waitForTimeout(1300);
		await page.screenshot({ path: `${OUT}/${vpName}-about-${name}.png` });
	}
	await page.close();
}
await browser.close();
console.log('done');
