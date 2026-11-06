import { getContext } from 'svelte';
import { m as defaultMessages } from '$lib/paraglide/messages';
import { getLocale } from '$lib/paraglide/runtime';
import { defaultSite } from './defaults';
import type { SiteCatalog, SiteLocale, SiteRecord } from './types';
import type { Product, JoinRole } from '$lib/content/landing';
import type { Milestone, VisionCard } from '$lib/content/about';

export type SiteMessages = typeof defaultMessages;
const lines = (value = '') => value.split('\n').filter(Boolean);
const value = (record: SiteRecord, key: string) => record.fields[key] ?? '';
const text =
	(value = '') =>
	() =>
		value;
export function buildSiteView(catalog: SiteCatalog, locale: SiteLocale) {
	const content = catalog.locales[locale];
	const products: Product[] = content.collections.product.map((r) => ({
		id: r.id,
		name: text(r.title),
		summary: text(value(r, 'summary')),
		accent: value(r, 'accent') as Product['accent'],
		status: value(r, 'status') as Product['status'],
		glyph: value(r, 'glyph') as Product['glyph'],
		latin: value(r, 'latin'),
		href: value(r, 'href') || undefined,
		features: lines(value(r, 'features')).map(text),
		screens: lines(value(r, 'screens')).map((src, i) => ({
			src,
			darkSrc: lines(value(r, 'darkScreens'))[i]
		}))
	}));
	const roles: JoinRole[] = content.collections.role.map((r) => ({
		id: r.id,
		title: text(r.title),
		group: value(r, 'group') as JoinRole['group'],
		groupLabel: text(value(r, 'groupLabel')),
		subtitle: text(value(r, 'subtitle')),
		hook: text(value(r, 'hook')),
		description: text(value(r, 'description')),
		formUrl: value(r, 'formUrl')
	}));
	const faqs = content.collections.faq.map((r) => ({
		question: text(r.title),
		answer: text(value(r, 'answer')),
		link: value(r, 'href')
			? {
					href: value(r, 'href'),
					pre: text(
						locale === 'en' && value(r, 'linkBefore')
							? value(r, 'linkBefore').trimEnd() + ' '
							: value(r, 'linkBefore')
					),
					label: text(value(r, 'linkLabel')),
					post: text(
						locale === 'en' && value(r, 'linkAfter')
							? ' ' + value(r, 'linkAfter').trimStart()
							: value(r, 'linkAfter')
					)
				}
			: undefined
	}));
	const vision: VisionCard[] = content.collections.vision.map((r) => ({
		id: r.id as VisionCard['id'],
		title: text(r.title),
		body: text(value(r, 'body')),
		art: value(r, 'art') || undefined
	}));
	const milestones: Milestone[] = content.collections.milestone.map((r) => ({
		id: r.id,
		title: text(r.title),
		date: text(value(r, 'date')),
		body: text(value(r, 'body')),
		upcoming: value(r, 'upcoming') === 'true'
	}));
	return {
		content,
		products,
		roles,
		faqs,
		vision,
		milestones,
		settings: content.settings,
		recruitmentOpen: content.settings.recruitmentOpen === 'true',
		filmId: content.settings.filmId,
		navigation: content.collections.nav.map((r) => ({
			href: value(r, 'href'),
			label: text(r.title),
			page:
				value(r, 'href').includes('#') || !value(r, 'href').startsWith('/')
					? undefined
					: value(r, 'href').replace(/\/$/, '')
		}))
	};
}
/** Resolves values lazily inside this layout instance. Never mutates Paraglide or process globals. */
export function createSiteMessages(
	catalog: () => SiteCatalog,
	locale: () => SiteLocale
): SiteMessages {
	const wrappers = new Map<PropertyKey, unknown>();
	return new Proxy(defaultMessages, {
		get(target, key) {
			const original = Reflect.get(target, key);
			if (typeof original !== 'function' || typeof key !== 'string') return original;
			if (!wrappers.has(key))
				wrappers.set(
					key,
					(...args: unknown[]) => catalog().locales[locale()].messages[key] ?? original(...args)
				);
			return wrappers.get(key);
		}
	});
}
export const useSiteMessages = (): SiteMessages =>
	getContext<SiteMessages>('site-messages') ?? defaultMessages;
export const useSiteView = (): (() => ReturnType<typeof buildSiteView>) =>
	getContext<() => ReturnType<typeof buildSiteView>>('site-view') ??
	(() => buildSiteView(defaultSite, getLocale()));
