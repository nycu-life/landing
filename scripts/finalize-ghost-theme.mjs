#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ghostAdmin, allPages } from './lib/ghost-admin.mjs';

if (!process.argv.includes('--apply')) {
	console.log(
		'Would verify the live native theme, back up legacy site-* Pages, then unpublish only those Pages. No posts or staff are removed. Use --apply only after production cutover.'
	);
	process.exit(0);
}
const origin = process.env.GHOST_SITE_URL;
if (!origin) throw new Error('Set GHOST_SITE_URL to the public site origin.');
const live = await fetch(origin, { signal: AbortSignal.timeout(15000), redirect: 'error' });
if (!live.ok || !/class=["']ghost-theme\s/.test(await live.text()))
	throw new Error('Public site is not serving the native Ghost theme; finalization stopped.');
const admin = ghostAdmin();
const pages = (await allPages(admin)).filter(
	(p) =>
		/^site-(zh-tw|en)-/.test(p.slug) &&
		p.tags.some((t) => t.slug === 'site-content') &&
		p.status === 'published'
);
const directory = path.resolve('.ghost-theme-backups', `legacy-${Date.now()}`);
await mkdir(directory, { recursive: true, mode: 0o700 });
await writeFile(path.join(directory, 'pages.json'), JSON.stringify(pages, null, 2), {
	mode: 0o600
});
for (const page of pages) {
	await admin(`pages/${page.id}/`, {
		method: 'PUT',
		json: { pages: [{ id: page.id, updated_at: page.updated_at, status: 'draft' }] }
	});
	console.log(`Archived legacy Page: ${page.slug}`);
}
console.log(
	`Archived ${pages.length} legacy Pages; content retained as drafts. Private backup: ${directory}`
);
