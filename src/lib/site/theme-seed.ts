import type { SiteCatalog, SiteLocale } from './types';

const escape = (text = '') =>
	text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const paragraph = (text: string) => `<p>${escape(text)}</p>`;
const link = (href: string, text: string) => `<a href="${escape(href)}">${escape(text)}</a>`;

/** Non-overwriting conversion from legacy fields to normal Ghost rich content. */
export function themeSeedPages(catalog: SiteCatalog, origin: string) {
	const result = (['zh-tw', 'en'] as SiteLocale[]).flatMap((locale) => {
		const { messages: m, settings: s, collections: c } = catalog.locales[locale];
		const prefix = locale === 'en' ? '/en' : '';
		const pages: {
			slug: string;
			title: string;
			html: string;
			custom_excerpt?: string;
			canonical_url?: string;
			feature_image?: string;
			feature_image_alt?: string;
			tags: { name: string }[];
			published_at?: string;
		}[] = [];
		const section = (id: string, title: string, html: string, anchor = '') => {
			pages.push({
				slug: `theme-${locale}-${id}`,
				title,
				html,
				tags: [{ name: `#theme-${locale}` }],
				canonical_url: `${origin}${prefix}/${id === 'about' ? 'about/' : anchor ? `#${anchor}` : ''}`
			});
		};
		section(
			'hero',
			`${m.story_hero_title_1}${locale === 'en' ? ' ' : ''}${m.story_hero_title_2}`,
			paragraph(m.meta_description)
		);
		pages.at(-1)!.custom_excerpt = m.meta_description.slice(0, 300);
		section(
			'intro',
			`${m.story_about_title_1} ${m.story_about_title_2}`,
			paragraph(m.story_about_body),
			'about'
		);
		section(
			'film',
			m.story_about_film,
			`<iframe src="https://www.youtube-nocookie.com/embed/${escape(s.filmId)}?playsinline=1&amp;rel=0" title="${escape(m.story_about_film)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`,
			'about'
		);
		section(
			'join',
			m.story_join_heading,
			paragraph(s.recruitmentOpen === 'true' ? m.story_join_open_lede : m.story_join_closed_lede),
			'join'
		);
		if (s.recruitmentOpen === 'true') pages.at(-1)!.tags.push({ name: '#recruiting' });
		section('wish', m.wish_title, paragraph(m.wish_lede), 'wishes');
		section(
			'footer',
			m.brand_name,
			paragraph(m.footer_tagline) +
				'<ul>' +
				[
					link(`mailto:${s.contactEmail}`, s.contactEmail),
					link('/wishpool/', m.footer_wishlist),
					link(s.instagram, 'Instagram'),
					link(s.youtube, 'YouTube'),
					link(s.github, 'GitHub')
				]
					.map((item) => `<li>${item}</li>`)
					.join('') +
				'</ul>',
			'prototype-footer'
		);
		const asset = (src: string) =>
			src.startsWith('/') && !src.startsWith('/cms/') && !src.startsWith('/content/')
				? `${origin}/assets${src}`
				: src;
		for (const kind of ['product', 'faq', 'role'] as const) {
			for (const [index, record] of c[kind].entries()) {
				const f = record.fields;
				let html: string;
				if (kind === 'product') {
					html = `<ul>${(f.features || '')
						.split('\n')
						.filter(Boolean)
						.map((feature) => `<li>${escape(feature)}</li>`)
						.join('')}</ul>`;
					html += f.href
						? `<p>${link(f.href, m.products_visit)}</p>`
						: paragraph(f.status === 'soon' ? m.products_status_soon : m.products_status_dev);
					for (const [mode, sources] of [
						['Light', f.screens],
						['Dark', f.darkScreens]
					]) {
						for (const src of (sources || '').split('\n').filter(Boolean))
							html += `<figure><img src="${escape(asset(src))}" alt="${escape(record.title)}"><figcaption>${mode}</figcaption></figure>`;
					}
				} else if (kind === 'faq') {
					html = f.href
						? `<p>${escape((f.linkBefore || '').trimEnd())}${locale === 'en' ? ' ' : ''}${link(f.href, f.linkLabel)}${locale === 'en' ? ' ' : ''}${escape((f.linkAfter || '').trimStart())}</p>`
						: paragraph(f.answer);
				} else
					html =
						paragraph(f.groupLabel) +
						paragraph(f.subtitle) +
						paragraph(f.description) +
						`<p>${link(f.formUrl, m.story_join_card_cta)}</p>`;
				pages.push({
					slug: `theme-${locale}-${kind}-${record.id}`,
					title: record.title,
					html,
					custom_excerpt: (f.summary || f.hook || '').slice(0, 300),
					canonical_url: `${origin}${prefix}/#${kind === 'product' ? 'products' : kind === 'role' ? 'join' : 'faq'}`,
					tags: [{ name: `#theme-${kind}-${locale}` }],
					published_at: new Date(Date.UTC(2026, 0, 1, 0, 0, index)).toISOString(),
					...(kind === 'product' && f.screens
						? { feature_image: asset(f.screens.split('\n')[0]), feature_image_alt: record.title }
						: {})
				});
			}
		}
		section(
			'about',
			m.about_page_title,
			[
				paragraph(m.about_page_lede || m.story_about_body),
				...c.vision.map(
					(r) =>
						`<h2>${escape(r.title)}</h2>${r.fields.art ? `<figure><img src="${escape(asset(r.fields.art))}" alt=""></figure>` : ''}${paragraph(r.fields.body)}`
				),
				`<h2 id="milestones">${escape(m.about_milestone_title)}</h2>`,
				...c.milestone.map(
					(r) => `<h3>${escape(r.fields.date)} — ${escape(r.title)}</h3>${paragraph(r.fields.body)}`
				)
			].join('')
		);
		return pages;
	});
	result.push({
		slug: 'theme-wishpool',
		title: catalog.locales['zh-tw'].messages.nav_wishpool,
		html: paragraph(catalog.locales['zh-tw'].messages.wish_lede),
		canonical_url: `${origin}/wishpool/`,
		tags: [{ name: '#theme-app' }]
	});
	return result;
}
