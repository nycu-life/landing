#!/usr/bin/env node
// Safe to rerun: existing Pages (including drafts) are never modified.
import { createHmac } from 'node:crypto';
import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
	const { siteSeedPages } = await server.ssrLoadModule('/src/lib/site/seed.ts');
	const pages = siteSeedPages();
	const apply = process.argv.includes('--apply');
	if (!apply) {
		console.log(
			`Would create up to ${pages.length} editable Ghost Pages; existing slugs will be skipped.`
		);
		for (const page of pages) console.log(`${page.slug}: ${page.title}`);
		console.log('Use --apply with GHOST_ADMIN_URL and GHOST_ADMIN_API_KEY to import.');
	} else {
		const base = process.env.GHOST_ADMIN_URL?.replace(/\/$/, '');
		const key = process.env.GHOST_ADMIN_API_KEY ?? '';
		if (!base || !key.includes(':'))
			throw new Error(
				'Set GHOST_ADMIN_URL (including /cms when applicable) and GHOST_ADMIN_API_KEY.'
			);
		const parts = key.split(':');
		if (parts.length !== 2 || !/^[a-f0-9]{24}$/.test(parts[0]) || !/^[a-f0-9]{64}$/.test(parts[1]))
			throw new Error('GHOST_ADMIN_API_KEY must have the form id:secret.');
		const [id, secret] = parts;
		const encoded = (data) => Buffer.from(JSON.stringify(data)).toString('base64url');
		const request = async (path, json) => {
			const now = Math.floor(Date.now() / 1000);
			const unsigned = `${encoded({ alg: 'HS256', typ: 'JWT', kid: id })}.${encoded({ iat: now, exp: now + 300, aud: '/admin/' })}`;
			const token = `${unsigned}.${createHmac('sha256', Buffer.from(secret, 'hex')).update(unsigned).digest('base64url')}`;
			const response = await fetch(`${base}/ghost/api/admin/${path}`, {
				method: json ? 'POST' : 'GET',
				headers: {
					Authorization: `Ghost ${token}`,
					'Accept-Version': 'v6.0',
					'Content-Type': 'application/json'
				},
				body: json ? JSON.stringify(json) : undefined,
				signal: AbortSignal.timeout(15000)
			});
			if (!response.ok)
				throw new Error(`Ghost Admin API ${path.split('?')[0]} returned ${response.status}`);
			return response.json();
		};
		const existing = new Set();
		let page = 1;
		do {
			const data = await request(`pages/?limit=100&page=${page}&fields=slug`);
			for (const item of data.pages) existing.add(item.slug);
			page = data.meta.pagination.next;
		} while (page);
		let created = 0;
		for (const page of pages) {
			if (existing.has(page.slug)) continue;
			await request('pages/?source=html', {
				pages: [
					{ ...page, status: 'published', visibility: 'public', tags: [{ name: 'site-content' }] }
				]
			});
			created++;
			console.log(`Created ${page.slug}`);
		}
		console.log(
			`Created ${created}; skipped ${pages.length - created}. No existing content was changed.`
		);
	}
} finally {
	await server.close();
}
