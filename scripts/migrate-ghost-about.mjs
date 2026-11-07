#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ghostAdmin, allPages } from './lib/ghost-admin.mjs';
import { aboutSections } from './lib/ghost-about-sections.mjs';

const apply = process.argv.includes('--apply');
const origin = (process.env.GHOST_SITE_URL || 'https://nycu.life').replace(/\/$/, '');
const admin = ghostAdmin();
const pages = await allPages(admin);
const planned = [];
for (const locale of ['zh-tw', 'en']) {
	const source = pages.find((p) => p.slug === `theme-${locale}-about`);
	if (!source) throw new Error(`Missing About source for ${locale}.`);
	// Retain the entire original Page, including revisions and rich text. Only add child Pages.
	const sections = aboutSections(source, locale, origin);
	const legacy = pages
		.filter((p) => p.slug.startsWith(`site-${locale}-milestone-`))
		.sort((a, b) => a.slug.localeCompare(b.slug));
	for (const section of sections) {
		if (section.slug.includes('-milestone-')) {
			// Match the legacy title instead of relying on ordinal positions.
			const old = legacy.find((p) => p.title === section.title);
			if (old && /<p>true<\/p>/.test(old.html || '')) section.tags.push({ name: '#upcoming' });
		}
		if (!pages.some((p) => p.slug === section.slug)) planned.push(section);
	}
}
if (apply && planned.length) {
	const directory = path.resolve('.ghost-theme-backups', `about-${Date.now()}`);
	await mkdir(directory, { recursive: true, mode: 0o700 });
	await writeFile(path.join(directory, 'pages.json'), JSON.stringify(pages, null, 2), {
		mode: 0o600
	});
	console.log('Saved a private pre-migration Pages snapshot.');
}
for (const page of planned) {
	console.log(`${apply ? 'Create' : 'Would create'}: ${page.slug}`);
	if (apply) {
		const result = await admin('pages/?source=html', {
			method: 'POST',
			json: { pages: [{ ...page, status: 'published', visibility: 'public' }] }
		});
		if (result.pages[0].slug !== page.slug)
			throw new Error('Ghost changed a migration slug; inspect before activation.');
	}
}
console.log(
	`About sections: ${planned.length} ${apply ? 'created' : 'planned'}; all existing Pages preserved.`
);
