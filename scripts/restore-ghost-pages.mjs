#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ghostAdmin, allPages } from './lib/ghost-admin.mjs';

const directory = process.argv
	.find((arg) => arg.startsWith('--backup='))
	?.slice('--backup='.length);
if (!directory) throw new Error('Provide --backup=<private-legacy-backup-directory>.');
const pages = JSON.parse(await readFile(path.join(directory, 'pages.json'), 'utf8'));
if (!process.argv.includes('--apply')) {
	console.log(
		`Would restore the publication status of ${pages.length} archived legacy Pages. Use --apply to restore.`
	);
	process.exit(0);
}
const admin = ghostAdmin();
const current = new Map((await allPages(admin)).map((p) => [p.id, p]));
for (const previous of pages) {
	if (!/^site-(zh-tw|en)-/.test(previous.slug) || !['draft', 'published'].includes(previous.status))
		throw new Error('Unexpected Page in legacy backup.');
	const page = current.get(previous.id);
	if (!page) throw new Error('A backed-up Page is missing; restoration stopped.');
	if (page.status === previous.status) continue;
	await admin(`pages/${page.id}/`, {
		method: 'PUT',
		json: { pages: [{ id: page.id, updated_at: page.updated_at, status: previous.status }] }
	});
}
console.log('Restored legacy publication status. Existing titles and body content were preserved.');
