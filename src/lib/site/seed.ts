import { defaultContent, sections } from './defaults';
import { collectionKinds, fieldLabels, siteLocales } from './types';

const escape = (s: string) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const fieldsHtml = (fields: Record<string, string>, labels: Record<string, string>) =>
	Object.entries(fields)
		.filter(([key]) => labels[key])
		.map(
			([key, value]) =>
				`<h2>${escape(labels[key])}</h2>${value
					.split('\n')
					.map((line) => `<p>${escape(line)}</p>`)
					.join('')}`
		)
		.join('');
/** Stable slugs make repeated imports safe: the importer never updates an existing page. */
export function siteSeedPages() {
	return siteLocales.flatMap((locale) => {
		const content = defaultContent(locale);
		const pages = Object.entries(sections).map(([section, definition]) => ({
			slug: `site-${locale}-${section}`,
			title: `${definition.title} · ${locale}`,
			html: fieldsHtml(
				Object.fromEntries(
					Object.keys(definition.fields).map((key) => [key, content.messages[key]])
				),
				definition.fields
			)
		}));
		pages.push({
			slug: `site-${locale}-settings`,
			title: `全站：連結、影片與招募開關 · ${locale}`,
			html: fieldsHtml(content.settings, fieldLabels)
		});
		for (const kind of collectionKinds)
			for (const record of content.collections[kind])
				pages.push({
					slug: `site-${locale}-${kind}-${record.id}`,
					title: record.title,
					html: fieldsHtml(record.fields, fieldLabels)
				});
		return pages;
	});
}
