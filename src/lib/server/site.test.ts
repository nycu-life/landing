import { describe, expect, it, vi } from 'vitest';
import { mapSitePages, parseSiteFields } from './site-loader';
import { createSiteCache } from './site';
import { defaultSite } from '$lib/site/defaults';
import { fieldsHtml, siteSeedPages } from '$lib/site/seed';
import { fieldLabels } from '$lib/site/types';
import { buildSiteView, createSiteMessages } from '$lib/site/view';

describe('Ghost site content', () => {
	it('round trips both locales through normal Ghost heading/paragraph HTML', () => {
		const catalog = mapSitePages(siteSeedPages());
		expect(catalog.locales).toEqual(defaultSite.locales);
		expect(catalog.source).toBe('ghost');
	});
	it('reads escaped prose, links, lists and uploaded images without rendering markup', () => {
		expect(
			parseSiteFields(
				'<h2>回答</h2><p>A &amp; B <strong>bold</strong></p><ul><li>One</li><li>Two</li></ul><h2>圖片（每行一張）</h2><figure><img src="/cms/content/images/photo.png"></figure>',
				fieldLabels
			)
		).toEqual({ answer: 'A & B bold\nOne\nTwo', screens: '/cms/content/images/photo.png' });
	});
	it('adds, sorts and removes records without restoring bundled content', () => {
		const pages = siteSeedPages().filter(
			(p) => p.slug !== 'site-zh-tw-faq-1' && !p.slug.startsWith('site-zh-tw-role-')
		);
		pages.push({
			slug: 'site-zh-tw-faq-new',
			title: 'New question?',
			html: fieldsHtml({ order: '0', answer: 'New answer' }, fieldLabels)
		});
		const content = mapSitePages(pages).locales['zh-tw'];
		expect(content.collections.faq[0].title).toBe('New question?');
		expect(content.collections.faq.some((r) => r.id === '1')).toBe(false);
		expect(content.collections.role).toEqual([]);
		expect(content.collections.faq).toHaveLength(5);
	});
	it('rejects missing required sections, unsafe links, duplicate fields and invalid enums', () => {
		const pages = siteSeedPages();
		expect(() => mapSitePages([])).toThrow('not initialized');
		expect(() => mapSitePages(pages.slice(1))).toThrow('Missing required Ghost Page');
		expect(() =>
			parseSiteFields('<h2>回答</h2><p>A</p><h2>回答</h2><p>B</p>', fieldLabels)
		).toThrow('Duplicate');
		const unsafe = structuredClone(pages);
		unsafe.find((p) => p.slug === 'site-zh-tw-nav-about')!.html = fieldsHtml(
			{ order: '1', href: 'javascript:alert(1)' },
			fieldLabels
		);
		expect(() => mapSitePages(unsafe)).toThrow('Unsafe href');
		const invalid = structuredClone(pages);
		invalid.find((p) => p.slug === 'site-zh-tw-product-bus')!.html = fieldsHtml(
			{ order: '1', summary: 'Summary', accent: 'invalid', status: 'live', glyph: 'bus' },
			fieldLabels
		);
		expect(() => mapSitePages(invalid)).toThrow('Invalid accent');
	});
	it('exposes only ordinary published pages, rewrites images, and keeps management Pages private', () => {
		const pages = [
			...siteSeedPages(),
			{
				slug: 'club-guide',
				title: 'Guide',
				html: '<p>Guide</p><img src="http://ghost:2368/cms/content/images/test.png">',
				custom_excerpt: 'Summary'
			}
		];
		const site = mapSitePages(pages, ['http://ghost:2368/cms'], '/cms/content/images/');
		expect(site.pages).toHaveLength(1);
		expect(site.pages[0].html).toContain('src="/cms/content/images/test.png"');
		expect(buildSiteView(site, 'en').roles[0].title()).toBe(
			defaultSite.locales.en.collections.role[0].title
		);
	});
	it('isolates catalogs and locales between simultaneous render contexts', async () => {
		const first = structuredClone(defaultSite);
		const second = structuredClone(defaultSite);
		first.locales.en.messages.meta_title = 'First';
		second.locales.en.messages.meta_title = 'Second';
		const a = createSiteMessages(
			() => first,
			() => 'en'
		);
		const b = createSiteMessages(
			() => second,
			() => 'en'
		);
		const values = await Promise.all([
			Promise.resolve().then(() => a.meta_title()),
			Promise.resolve().then(() => b.meta_title())
		]);
		expect(values).toEqual(['First', 'Second']);
		let locale: 'zh-tw' | 'en' = 'zh-tw';
		const changing = createSiteMessages(
			() => first,
			() => locale
		);
		expect(changing.meta_title()).toBe(first.locales['zh-tw'].messages.meta_title);
		locale = 'en';
		expect(changing.meta_title()).toBe('First');
	});
	it('shares refreshes, serves last good content for a bounded outage, and recovers', async () => {
		let now = 0;
		let fail = false;
		const load = vi.fn(async () => {
			if (fail) throw new Error('down');
			return defaultSite;
		});
		const log = vi.spyOn(console, 'error').mockImplementation(() => {});
		try {
			const get = createSiteCache(load, () => now);
			await Promise.all([get(), get()]);
			expect(load).toHaveBeenCalledTimes(1);
			now = 30_001;
			fail = true;
			expect((await get()).siteUnavailable).toBe(false);
			now = 300_001;
			expect((await get()).siteUnavailable).toBe(true);
			now += 5_001;
			fail = false;
			expect((await get()).siteUnavailable).toBe(false);
			expect(load).toHaveBeenCalledTimes(4);
		} finally {
			log.mockRestore();
		}
	});
});
