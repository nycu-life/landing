#!/usr/bin/env node
// Run only against disposable/local Ghost: edits one migrated Page and restores it.
import assert from 'node:assert/strict';
import { ghostAdmin, allPages } from './lib/ghost-admin.mjs';

const origin = process.env.GHOST_THEME_TEST_URL;
if (!origin) throw new Error('Set GHOST_THEME_TEST_URL to a disposable Ghost site.');
if (new URL(origin).hostname === 'nycu.life')
	throw new Error('This integration test must not edit production.');
const admin = ghostAdmin();
for (const route of [
	'/',
	'/en/',
	'/about/',
	'/en/about/',
	'/devlog/',
	'/comics/',
	'/news/',
	'/sitemap.xml'
]) {
	const response = await fetch(new URL(route, origin), { signal: AbortSignal.timeout(15000) });
	assert.equal(response.status, 200, route);
	const body = await response.text();
	assert.ok(
		route.endsWith('.xml') ? body.includes('sitemap') : /class=["']ghost-theme\s/.test(body),
		route
	);
}
assert.equal((await fetch(new URL('/does-not-exist-theme-check/', origin))).status, 404);
const pages = await allPages(admin);
const page = pages.find((p) => p.slug === 'theme-zh-tw-intro');
assert.ok(page);
const marker = `GHOST-RUNTIME-CHECK-${Date.now()}`;
const edit = async (current, changes) =>
	(
		await admin(`pages/${page.id}/?source=html`, {
			method: 'PUT',
			json: { pages: [{ id: page.id, updated_at: current.updated_at, ...changes }] }
		})
	).pages[0];
let current = page;
try {
	current = await edit(current, { title: marker });
	assert.ok(
		(await (await fetch(origin)).text()).includes(marker),
		'Ghost edit appears in server HTML without rebuild or client JavaScript'
	);
	current = await edit(current, { status: 'draft' });
	assert.ok(
		!(await (await fetch(origin)).text()).includes(marker),
		'Unpublishing withdraws the section'
	);
	await edit(current, { title: page.title, status: page.status });
} finally {
	const latest = (await allPages(admin)).find((p) => p.id === page.id);
	if (latest.title !== page.title || latest.status !== page.status)
		await edit(latest, { title: page.title, status: page.status });
}
console.log(
	'Native Ghost routes, 404, sitemap, publish/edit/unpublish, and server HTML verified. Original content restored.'
);
