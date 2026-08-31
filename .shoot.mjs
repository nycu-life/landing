import { chromium } from 'playwright';

const BASE = 'http://localhost:5175';
const OUT = '/tmp/landing-shots';
const viewports = {
	desktop: { width: 1440, height: 900 },
	tablet: { width: 834, height: 1112 },
	phone: { width: 390, height: 844 }
};
// [name, hash, extraWaitMs]
const scenes = process.argv[2]
	? JSON.parse(process.argv[2])
	: [
			['about', '#about', 1400],
			['products', '#products', 900],
			['faq', '#faq', 600],
			['join', '#join', 600]
		];

const browser = await chromium.launch();
for (const [vpName, vp] of Object.entries(viewports)) {
	const page = await browser.newPage({ viewport: vp });
	await page.goto(BASE + '/', { waitUntil: 'networkidle' });
	await page.waitForSelector('[data-story-ready="true"]', { timeout: 15000 });
	for (const [name, hash, wait] of scenes) {
		await page.evaluate((h) => {
			window.location.hash = h;
		}, hash);
		await page.waitForTimeout(wait);
		await page.screenshot({ path: `${OUT}/${vpName}-${name}.png` });
	}
	await page.close();
}
await browser.close();
console.log('done');
