import { parseFragment, type DefaultTreeAdapterMap } from 'parse5';
import { defaultSite, sections } from '$lib/site/defaults';
import {
	collectionKinds,
	emptyLocale,
	fieldLabels,
	safeLink,
	siteLocales,
	type SiteCatalog
} from '$lib/site/types';
import { fetchSitePages, ghostBase, rewriteGhostMedia, type GhostEnv } from '$lib/server/ghost';

export interface SiteGhostPage {
	slug: string;
	title: string;
	html?: string | null;
	custom_excerpt?: string | null;
}
type Node = DefaultTreeAdapterMap['node'];
const nodeText = (node: Node): string =>
	'value' in node ? node.value : 'childNodes' in node ? node.childNodes.map(nodeText).join('') : '';
const nodeName = (node: Node) => ('tagName' in node ? node.tagName : '');
const lines = (value: string) =>
	value
		.split('\n')
		.map((s) => s.trim())
		.filter(Boolean);
/** Plain editor paragraphs, lists, links and images under H2 labels. No executable HTML is used as structured fields. */
export function parseSiteFields(
	html: string,
	labels: Record<string, string>
): Record<string, string> {
	const reverse = new Map(Object.entries(labels).map(([key, label]) => [label, key]));
	const values: Record<string, string[]> = {};
	let active: string | undefined;
	const visit = (node: Node) => {
		const name = nodeName(node);
		if (name === 'h2') {
			active = reverse.get(nodeText(node).trim());
			if (active) {
				if (values[active]) throw new Error(`Duplicate field heading: ${nodeText(node)}`);
				values[active] = [];
			}
			return;
		}
		if (active && name === 'img' && 'attrs' in node) {
			const src = node.attrs.find((a) => a.name === 'src')?.value;
			if (src) values[active].push(src);
			return;
		}
		if (active && ['p', 'li', 'pre'].includes(name)) {
			values[active].push(
				['linkBefore', 'linkAfter'].includes(active) ? nodeText(node) : nodeText(node).trim()
			);
			return;
		}
		if ('childNodes' in node) node.childNodes.forEach(visit);
	};
	visit(parseFragment(html));
	return Object.fromEntries(
		Object.entries(values).map(([key, value]) => [
			key,
			['linkBefore', 'linkAfter'].includes(key) ? value.join('\n') : value.join('\n').trim()
		])
	);
}
const requireText = (fields: Record<string, string>, key: string, slug: string) => {
	if (!fields[key]?.trim()) throw new Error(`Missing ${key} on ${slug}`);
};
const enumField = (
	fields: Record<string, string>,
	key: string,
	choices: string[],
	slug: string
) => {
	if (!choices.includes(fields[key])) throw new Error(`Invalid ${key} on ${slug}`);
};
export function validateRecord(
	kind: string,
	fields: Record<string, string>,
	slug: string,
	mediaBase = '/cms/content/images/'
) {
	const safeImage = (url: string) =>
		safeLink(url) || (url.startsWith(mediaBase) && !url.slice(mediaBase.length).includes('..'));
	if (!/^\d{1,6}$/.test(fields.order ?? '')) throw new Error(`Invalid order on ${slug}`);
	for (const key of ['href', 'formUrl'])
		if (fields[key] && !safeLink(fields[key])) throw new Error(`Unsafe ${key} on ${slug}`);
	if (fields.art && !safeImage(fields.art)) throw new Error(`Unsafe art on ${slug}`);
	for (const key of ['screens', 'darkScreens'])
		if (lines(fields[key] ?? '').some((url) => !safeImage(url)))
			throw new Error(`Unsafe image on ${slug}`);
	if (kind === 'product') {
		requireText(fields, 'summary', slug);
		enumField(fields, 'accent', ['blue', 'lime', 'sun'], slug);
		enumField(fields, 'status', ['live', 'soon', 'dev'], slug);
		enumField(fields, 'glyph', ['bus', 'coz', 'activity', 'map'], slug);
	}
	if (kind === 'faq') {
		requireText(fields, 'answer', slug);
		if (fields.href) requireText(fields, 'linkLabel', slug);
	}
	if (kind === 'role') {
		enumField(fields, 'group', ['ux', 'marketing', 'dev', 'ops'], slug);
		for (const key of ['groupLabel', 'subtitle', 'hook', 'description', 'formUrl'])
			requireText(fields, key, slug);
	}
	if (kind === 'vision' || kind === 'milestone') requireText(fields, 'body', slug);
	if (kind === 'milestone') {
		requireText(fields, 'date', slug);
		enumField(fields, 'upcoming', ['true', 'false'], slug);
	}
	if (kind === 'nav') requireText(fields, 'href', slug);
}

export function mapSitePages(
	pages: SiteGhostPage[],
	origins: string[] = [],
	mediaBase = '/cms/content/images/'
): SiteCatalog {
	const managed = pages.filter((p) => p.slug.startsWith('site-'));
	if (!managed.length)
		throw new Error('Ghost site Pages are not initialized; run pnpm cms:seed-site -- --apply');
	const catalog: SiteCatalog = {
		source: 'ghost',
		locales: { 'zh-tw': emptyLocale(), en: emptyLocale() },
		pages: []
	};
	for (const locale of siteLocales) {
		const content = catalog.locales[locale];
		for (const [section, definition] of Object.entries(sections)) {
			const slug = `site-${locale}-${section}`;
			const page = pages.find((p) => p.slug === slug);
			if (!page) throw new Error(`Missing required Ghost Page: ${slug}`);
			const fields = parseSiteFields(page.html ?? '', definition.fields);
			for (const key of Object.keys(definition.fields)) requireText(fields, key, slug);
			Object.assign(content.messages, fields);
		}
		const settingsSlug = `site-${locale}-settings`;
		const settings = pages.find((p) => p.slug === settingsSlug);
		if (!settings) throw new Error(`Missing required Ghost Page: ${settingsSlug}`);
		content.settings = parseSiteFields(settings.html ?? '', fieldLabels);
		for (const key of Object.keys(defaultSite.locales[locale].settings))
			requireText(content.settings, key, settingsSlug);
		enumField(content.settings, 'recruitmentOpen', ['true', 'false'], settingsSlug);
		if (!/^[\w-]{11}$/.test(content.settings.filmId))
			throw new Error(`Invalid film ID on ${settingsSlug}`);
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content.settings.contactEmail))
			throw new Error(`Invalid email on ${settingsSlug}`);
		for (const key of ['instagram', 'youtube', 'github', 'repository', 'googlePlay', 'appStore'])
			if (!safeLink(content.settings[key])) throw new Error(`Unsafe ${key} on ${settingsSlug}`);
		for (const kind of collectionKinds) {
			const prefix = `site-${locale}-${kind}-`;
			content.collections[kind] = pages
				.filter((p) => p.slug.startsWith(prefix))
				.map((page) => {
					const html = rewriteGhostMedia(page.html ?? '', origins, mediaBase, new Set());
					const fields = parseSiteFields(html, fieldLabels);
					validateRecord(kind, fields, page.slug, mediaBase);
					return { id: page.slug.slice(prefix.length), title: page.title, fields };
				})
				.sort(
					(a, b) => Number(a.fields.order) - Number(b.fields.order) || a.id.localeCompare(b.id)
				);
		}
		if (!content.collections.product.length)
			throw new Error(`At least one published product is required for ${locale}`);
	}
	catalog.pages = pages
		.filter((p) => !p.slug.startsWith('site-'))
		.map((p) => ({
			slug: p.slug,
			title: p.title,
			html: rewriteGhostMedia(p.html ?? '', origins, mediaBase, new Set()),
			excerpt: p.custom_excerpt ?? ''
		}));
	return catalog;
}
export async function loadSite(env: GhostEnv, fetchFn: typeof fetch = fetch): Promise<SiteCatalog> {
	if (!env.GHOST_URL && !env.GHOST_CONTENT_API_KEY) return defaultSite;
	const { pages, ghostUrl } = await fetchSitePages(env, fetchFn);
	return mapSitePages(
		pages,
		[ghostBase(ghostUrl), ...(env.GHOST_PUBLIC_URL ? [ghostBase(env.GHOST_PUBLIC_URL)] : [])],
		`${ghostBase(env.GHOST_PUBLIC_URL || ghostUrl)}/content/images/`
	);
}
