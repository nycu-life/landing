import { describe, expect, it } from 'vitest';
import { defaultSite } from './defaults';
import { themeSeedPages } from './theme-seed';

describe('native Ghost content migration', () => {
	it('carries published editor copy and both screenshot sets into normal Pages', () => {
		const catalog = structuredClone(defaultSite);
		catalog.locales['zh-tw'].messages.story_about_title_1 = '已編輯的介紹';
		const pages = themeSeedPages(catalog, 'https://nycu.life');
		const intro = pages.find((p) => p.slug === 'theme-zh-tw-intro')!;
		const product = pages.find((p) => p.slug === 'theme-zh-tw-product-bus')!;
		expect(intro.title).toContain('已編輯的介紹');
		expect(intro.html).not.toContain('<h2>');
		expect(intro.canonical_url).toBe('https://nycu.life/#about');
		expect(product.html.match(/<figure>/g)).toHaveLength(8);
		expect(product.html).toContain('bus-phone-4-dark.png');
		expect(product.tags).toContainEqual({ name: '#theme-product-zh-tw' });
		expect(pages).toHaveLength(45);
		expect(new Set(pages.map((p) => p.slug)).size).toBe(pages.length);
	});

	it('preserves uploaded images, editor punctuation, and the recruitment switch', () => {
		const catalog = structuredClone(defaultSite);
		catalog.locales.en.settings.recruitmentOpen = 'true';
		const product = catalog.locales.en.collections.product[0];
		product.title = 'Bus <campus> & more';
		product.fields.screens = 'https://nycu.life/cms/content/images/custom.png';
		product.fields.darkScreens = '';
		const pages = themeSeedPages(catalog, 'https://nycu.life');
		const bus = pages.find((p) => p.slug === 'theme-en-product-bus')!;
		expect(bus.feature_image).toBe('https://nycu.life/cms/content/images/custom.png');
		expect(bus.html).toContain('Bus &lt;campus&gt; &amp; more');
		expect(pages.find((p) => p.slug === 'theme-en-join')!.tags).toContainEqual({
			name: '#recruiting'
		});
		expect(pages.find((p) => p.slug === 'theme-zh-tw-join')!.tags).not.toContainEqual({
			name: '#recruiting'
		});
		expect(pages.find((p) => p.slug === 'theme-en-faq-5')!.html).toContain('the <a');
	});
});
