#!/usr/bin/env node
import { createServer } from 'vite';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ghostAdmin, allPages } from './lib/ghost-admin.mjs';

const apply = process.argv.includes('--apply');
const origin = (process.env.GHOST_SITE_URL || 'https://nycu.life').replace(/\/$/, '');
if (new URL(origin).pathname !== '/')
	throw new Error('GHOST_SITE_URL must be the site origin without /cms.');
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
	const { themeSeedPages } = await server.ssrLoadModule('/src/lib/site/theme-seed.ts');
	let catalog,
		admin,
		existing = [];
	if (process.env.GHOST_ADMIN_URL) {
		admin = ghostAdmin();
		existing = await allPages(admin);
		const { mapSitePages } = await server.ssrLoadModule('/src/lib/server/site-loader.ts');
		catalog = mapSitePages(
			existing.filter((p) => p.status === 'published'),
			[],
			`${origin}/cms/content/images/`
		);
	} else {
		if (apply) throw new Error('--apply requires GHOST_ADMIN_URL and GHOST_ADMIN_API_KEY.');
		({ defaultSite: catalog } = await server.ssrLoadModule('/src/lib/site/defaults.ts'));
		console.log('Preview uses repository defaults. Actual migration reads published Ghost Pages.');
	}
	const bySlug = new Map(existing.map((p) => [p.slug, p]));
	const uploadedAssets = new Map();
	const uploadAsset = async (url) => {
		const parsed = new URL(url, origin);
		const pathname = parsed.pathname;
		if (parsed.origin !== new URL(origin).origin || !pathname.startsWith('/assets/')) return url;
		if (uploadedAssets.has(url)) return uploadedAssets.get(url);
		const relative = pathname.slice('/assets/'.length);
		if (relative.includes('..')) throw new Error('Invalid migration asset path.');
		const file = new FormData();
		const type = relative.endsWith('.svg')
			? 'image/svg+xml'
			: relative.endsWith('.png')
				? 'image/png'
				: 'image/jpeg';
		file.set(
			'file',
			new Blob([await readFile(path.resolve('static', relative))], { type }),
			path.basename(relative)
		);
		const uploaded = await admin('images/upload/', { method: 'POST', body: file });
		const result = uploaded.images[0].url;
		uploadedAssets.set(url, result);
		return result;
	};
	for (const page of themeSeedPages(catalog, origin)) {
		if (bySlug.has(page.slug)) {
			console.log(`Keep existing: ${page.slug}`);
			continue;
		}
		console.log(`${apply ? 'Create' : 'Would create'}: ${page.slug}`);
		if (apply) {
			// Ghost's own image storage avoids external metadata probes.
			if (page.feature_image) page.feature_image = await uploadAsset(page.feature_image);
			for (const match of [...page.html.matchAll(/<img\s+src="([^"]+)"/g)])
				page.html = page.html.replace(match[1], await uploadAsset(match[1]));
			const result = await admin('pages/?source=html', {
				method: 'POST',
				json: { pages: [{ ...page, status: 'published', visibility: 'public' }] }
			});
			if (result.pages[0].slug !== page.slug)
				throw new Error('Ghost changed a migration slug; inspect before activating.');
		}
	}
	console.log('Existing pages, posts, staff, roles, and theme settings were preserved.');
} finally {
	await server.close();
}
