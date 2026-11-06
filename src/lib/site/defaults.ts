/** Initial content shared by local fallback and the non-destructive Ghost import. */
import { m } from '$lib/paraglide/messages';
import zh from '../../../messages/zh-tw.json';
import en from '../../../messages/en.json';
import * as landing from '$lib/content/landing';
import * as about from '$lib/content/about';
import sections from './fields.json';
import {
	emptyLocale,
	siteLocales,
	type SiteCatalog,
	type SiteLocale,
	type SiteRecord
} from './types';

const messageKeys = new Map<unknown, string>(Object.entries(m).map(([key, fn]) => [fn, key]));
export function defaultContent(locale: SiteLocale) {
	const copy: Record<string, string> = locale === 'en' ? en : zh;
	const text = (fn: () => string) => copy[messageKeys.get(fn)!];
	const records = <T>(
		items: T[],
		map: (item: T) => Omit<SiteRecord, 'fields'> & { fields: Record<string, string> }
	) =>
		items.map((item, index) => {
			const record = map(item);
			record.fields.order = String(index + 1);
			return record;
		});
	const content = emptyLocale();
	for (const section of Object.values(sections))
		for (const key of Object.keys(section.fields)) content.messages[key] = copy[key];
	content.settings = {
		recruitmentOpen: String(landing.RECRUITMENT_OPEN),
		filmId: about.TEAM_FILM_ID,
		contactEmail: landing.CONTACT_EMAIL,
		instagram: landing.INSTAGRAM_URL,
		youtube: landing.YOUTUBE_URL,
		github: landing.GITHUB_URL,
		repository: landing.LANDING_REPO_URL,
		googlePlay: landing.GOOGLE_PLAY_URL,
		appStore: landing.APP_STORE_URL
	};
	content.collections.product = records(landing.products, (p) => ({
		id: p.id,
		title: text(p.name),
		fields: {
			summary: text(p.summary),
			latin: p.latin,
			features: p.features.map(text).join('\n'),
			href: p.href ?? '',
			accent: p.accent,
			status: p.status,
			glyph: p.glyph,
			screens: p.screens?.map((s) => s.src).join('\n') ?? '',
			darkScreens: p.screens?.map((s) => s.darkSrc ?? '').join('\n') ?? ''
		}
	}));
	content.collections.role = records(landing.joinRoles, (r) => ({
		id: r.id,
		title: text(r.title),
		fields: {
			group: r.group,
			groupLabel: text(r.groupLabel),
			subtitle: text(r.subtitle),
			hook: text(r.hook),
			description: text(r.description),
			formUrl: r.formUrl
		}
	}));
	content.collections.faq = Array.from({ length: 5 }, (_, i) => ({
		id: String(i + 1),
		title: copy[`story_faq_q${i + 1}`],
		fields: {
			order: String(i + 1),
			answer: copy[`story_faq_a${i + 1}`],
			...(i === 4
				? {
						href: '/wishpool/',
						linkLabel: copy.story_faq_a5_link,
						linkBefore: copy.story_faq_a5_pre,
						linkAfter: copy.story_faq_a5_post
					}
				: {})
		}
	}));
	content.collections.vision = records(about.visionCards, (c) => ({
		id: c.id,
		title: text(c.title),
		fields: { body: text(c.body), art: c.art ?? '' }
	}));
	content.collections.milestone = records(about.milestones, (c) => ({
		id: c.id,
		title: text(c.title),
		fields: { date: text(c.date), body: text(c.body), upcoming: String(c.upcoming ?? false) }
	}));
	content.collections.nav = [
		['about', 'menu_about', '/about/'],
		['products', 'nav_products', '/#products'],
		['faq', 'nav_faq', '/#faq'],
		['join', 'nav_join', '/#join'],
		['devlog', 'nav_devlog', '/devlog/']
	].map(([id, key, href], index) => ({
		id,
		title: copy[key],
		fields: { href, order: String(index + 1) }
	}));
	return content;
}
export const defaultSite: SiteCatalog = {
	source: 'defaults',
	locales: Object.fromEntries(
		siteLocales.map((locale) => [locale, defaultContent(locale)])
	) as SiteCatalog['locales'],
	pages: []
};
export { sections };
