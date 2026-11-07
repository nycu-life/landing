#!/usr/bin/env node
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ghostAdmin, allPages } from './lib/ghost-admin.mjs';
import { restoreTheme } from './lib/ghost-theme-backup.mjs';

if (!process.argv.includes('--apply')) {
	console.log(
		'Would back up theme/routes/navigation, upload nycu-life.zip, install routes, then activate nycu-life. Use --apply after cms:migrate-theme.'
	);
	process.exit(0);
}
const admin = ghostAdmin();
const pages = await allPages(admin);
for (const locale of ['zh-tw', 'en']) {
	for (const id of ['hero', 'intro', 'film', 'join', 'wish', 'footer', 'about'])
		if (!pages.some((p) => p.slug === `theme-${locale}-${id}` && p.status === 'published'))
			throw new Error(`Missing theme-${locale}-${id}; run cms:migrate-theme first.`);
	for (const kind of ['product', 'faq', 'role'])
		if (
			!pages.some(
				(p) =>
					p.status === 'published' && p.tags.some((t) => t.slug === `hash-theme-${kind}-${locale}`)
			)
		)
			throw new Error(`Missing ${kind} for ${locale}.`);
}
const settings = await admin('settings/');
const snapshot = settings.settings
	.filter((s) =>
		[
			'active_theme',
			'navigation',
			'secondary_navigation',
			'title',
			'description',
			'cover_image',
			'logo'
		].includes(s.key)
	)
	.map(({ key, value }) => ({ key, value }));
const directory = path.resolve(
	'.ghost-theme-backups',
	new Date().toISOString().replace(/[:.]/g, '-')
);
await mkdir(directory, { recursive: true, mode: 0o700 });
await writeFile(path.join(directory, 'settings.json'), JSON.stringify(snapshot, null, 2), {
	mode: 0o600
});
const routes = await admin('settings/routes/yaml/', { format: 'text' });
if (!routes?.includes('routes:'))
	throw new Error('Cannot back up Ghost routes; activation stopped.');
await writeFile(path.join(directory, 'routes.yaml'), routes, { mode: 0o600 });
const activeTheme = snapshot.find((s) => s.key === 'active_theme')?.value;
if (!activeTheme || !/^[a-z0-9_-]+$/i.test(activeTheme))
	throw new Error('Invalid active theme name.');
await writeFile(
	path.join(directory, 'theme.zip'),
	await admin(`themes/${activeTheme}/download/`, { format: 'bytes' }),
	{ mode: 0o600 }
);
try {
	// Replace only Ghost's untouched sample branding; custom editor settings stay intact.
	const branding = [];
	const setting = (key) => settings.settings.find((s) => s.key === key)?.value;
	if (
		String(setting('cover_image')).includes('static.ghost.org/v5.0.0/images/publication-cover.jpg')
	) {
		const image = new FormData();
		image.set(
			'file',
			new Blob([await readFile('static/og/nycu-life.jpg')], { type: 'image/jpeg' }),
			'nycu-life.jpg'
		);
		const uploaded = await admin('images/upload/', { method: 'POST', body: image });
		branding.push({ key: 'cover_image', value: uploaded.images[0].url });
	}
	if (setting('description') === 'Thoughts, stories and ideas.')
		branding.push({
			key: 'description',
			value: JSON.parse(await readFile('messages/zh-tw.json', 'utf8')).meta_description
		});
	if (branding.length) await admin('settings/', { method: 'PUT', json: { settings: branding } });
	const form = new FormData();
	form.set(
		'file',
		new Blob([await readFile('dist/nycu-life.zip')], { type: 'application/zip' }),
		'nycu-life.zip'
	);
	await admin('themes/upload/', { method: 'POST', body: form });
	const routeForm = new FormData();
	routeForm.set(
		'routes',
		new Blob([await readFile('theme/routes.yaml')], { type: 'text/yaml' }),
		'routes.yaml'
	);
	await admin('settings/routes/yaml/', { method: 'POST', body: routeForm });
	if (process.argv.includes('--initialize-navigation')) {
		const navigation = (english) => {
			const p = english ? '/en' : '';
			return [
				{ label: english ? 'About us' : '關於我們', url: `${p}/about/` },
				{ label: english ? 'Products' : '產品', url: `${p}/#products` },
				{ label: 'FAQ', url: `${p}/#faq` },
				{ label: english ? 'Join us' : '加入我們', url: `${p}/#join` },
				{ label: english ? 'Dev log' : '開發日誌', url: `${p}/devlog/` }
			];
		};
		await admin('settings/', {
			method: 'PUT',
			json: {
				settings: [
					{ key: 'navigation', value: JSON.stringify(navigation(false)) },
					{ key: 'secondary_navigation', value: JSON.stringify(navigation(true)) }
				]
			}
		});
	}
	await admin('themes/nycu-life/activate/', { method: 'PUT' });
	console.log(
		`Activated native theme. Rollback settings/routes: ${directory}. Public web engine has not been switched.`
	);
} catch (error) {
	try {
		await restoreTheme(admin, directory);
		console.error('Installation failed; previous theme, routes and settings restored.');
	} catch {
		console.error(
			`Automatic restoration failed. Use scripts/restore-ghost-theme.mjs --backup=${directory} --apply.`
		);
	}
	throw error;
}
