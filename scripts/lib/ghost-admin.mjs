import { createHmac } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';

/** Credentials stay in the process, never in themes, output, or URLs. */
export function ghostAdmin(
	base = process.env.GHOST_ADMIN_URL,
	key = process.env.GHOST_ADMIN_API_KEY
) {
	const sessionFile = process.env.GHOST_ADMIN_SESSION_FILE;
	if (!base || (!sessionFile && !/^[a-f0-9]{24}:[a-f0-9]{64}$/i.test(key ?? '')))
		throw new Error(
			'Set GHOST_ADMIN_URL and GHOST_ADMIN_API_KEY or a private GHOST_ADMIN_SESSION_FILE.'
		);
	let cookie = '';
	if (sessionFile) {
		if ((statSync(sessionFile).mode & 0o077) !== 0)
			throw new Error('Admin session file must have mode 0600.');
		const origin = new URL(base);
		cookie = JSON.parse(readFileSync(sessionFile, 'utf8'))
			.cookies.filter(
				(c) =>
					(origin.hostname === c.domain.replace(/^\./, '') ||
						origin.hostname.endsWith(c.domain.startsWith('.') ? c.domain : '.invalid')) &&
					(!c.secure || origin.protocol === 'https:') &&
					(c.expires === -1 || c.expires * 1000 > Date.now())
			)
			.map((c) => `${c.name}=${c.value}`)
			.join('; ');
		if (!cookie) throw new Error('No matching live cookies in Admin session file.');
	}
	const [id, secret] = (key ?? '').split(':');
	const encoded = (data) => Buffer.from(JSON.stringify(data)).toString('base64url');
	return async (path, { method = 'GET', json, body, format = 'json' } = {}) => {
		const now = Math.floor(Date.now() / 1000);
		const unsigned = `${encoded({ alg: 'HS256', typ: 'JWT', kid: id })}.${encoded({ iat: now, exp: now + 300, aud: '/admin/' })}`;
		const token = cookie
			? ''
			: `${unsigned}.${createHmac('sha256', Buffer.from(secret, 'hex')).update(unsigned).digest('base64url')}`;
		const response = await fetch(`${base.replace(/\/$/, '')}/ghost/api/admin/${path}`, {
			method,
			headers: {
				...(cookie ? { Cookie: cookie } : { Authorization: `Ghost ${token}` }),
				Origin: new URL(base).origin,
				'Accept-Version': 'v6.0',
				...(json ? { 'Content-Type': 'application/json' } : {})
			},
			body: json ? JSON.stringify(json) : body,
			signal: AbortSignal.timeout(30_000)
		});
		if (!response.ok)
			throw new Error(
				`Ghost Admin ${method} ${path.split('?')[0]} returned HTTP ${response.status}`
			);
		return response.status === 204
			? null
			: format === 'bytes'
				? new Uint8Array(await response.arrayBuffer())
				: format === 'text'
					? response.text()
					: response.json();
	};
}
export async function allPages(admin) {
	const pages = [];
	let next = 1;
	do {
		const result = await admin(`pages/?limit=100&page=${next}&formats=html&include=tags`);
		pages.push(...result.pages);
		next = result.meta.pagination.next;
	} while (next);
	return pages;
}
