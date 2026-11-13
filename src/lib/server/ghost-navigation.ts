/**
 * With the native Ghost theme (`PUBLIC_SITE_ENGINE=ghost`) the public pages use
 * Ghost's own menus (Settings → Navigation: Primary is Chinese, Secondary is
 * English). The Wish Pool is still rendered here, so its top bar reads the same
 * menus instead of the built-in defaults and the two never disagree. Cached for 30
 * seconds like the rest of the site content; any failure falls back to the defaults.
 */
export type GhostNavLink = { href: string; label: string; page?: string };
export type GhostNavigation = { 'zh-tw': GhostNavLink[]; en: GhostNavLink[] };

type GhostNavItem = { label?: unknown; url?: unknown };

const TTL_MS = 30_000;
const TIMEOUT_MS = 4_000;

/** Ghost stores site-relative menu URLs, or absolute ones for its own origin. */
export function toNavLinks(items: unknown, origins: string[]): GhostNavLink[] {
	if (!Array.isArray(items)) return [];
	return items.flatMap((item: GhostNavItem) => {
		const label = typeof item?.label === 'string' ? item.label.trim() : '';
		let href = typeof item?.url === 'string' ? item.url.trim() : '';
		if (!label || !href) return [];
		for (const origin of origins) {
			if (origin && href.startsWith(origin)) href = href.slice(origin.length) || '/';
		}
		const internal = href.startsWith('/') && !href.startsWith('//');
		return [
			{
				href,
				label,
				page: internal && !href.includes('#') ? href.replace(/\/$/, '') || undefined : undefined
			}
		];
	});
}

export function createGhostNavigation(
	env: Record<string, string | undefined>,
	fetchFn: typeof fetch = fetch,
	now = Date.now
) {
	let cached: { value: GhostNavigation | null; at: number } | undefined;
	return async (): Promise<GhostNavigation | null> => {
		if (cached && now() - cached.at < TTL_MS) return cached.value;
		const base = (env.GHOST_URL ?? '').replace(/\/+$/, '');
		const key = env.GHOST_CONTENT_API_KEY ?? '';
		let value: GhostNavigation | null = null;
		if (base && key) {
			try {
				const url = new URL(`${base}/ghost/api/content/settings/`);
				url.searchParams.set('key', key);
				const response = await fetchFn(url, {
					headers: { 'Accept-Version': 'v6.0' },
					signal: AbortSignal.timeout(TIMEOUT_MS)
				});
				if (response.ok) {
					const { settings } = (await response.json()) as {
						settings?: { url?: string; navigation?: unknown; secondary_navigation?: unknown };
					};
					const origins = [settings?.url, env.GHOST_PUBLIC_URL, base]
						.filter((origin): origin is string => Boolean(origin))
						.map((origin) => origin.replace(/\/+$/, ''));
					const zh = toNavLinks(settings?.navigation, origins);
					const en = toNavLinks(settings?.secondary_navigation, origins);
					if (zh.length) value = { 'zh-tw': zh, en: en.length ? en : zh };
				}
			} catch {
				value = null;
			}
		}
		cached = { value, at: now() };
		return value;
	};
}

export const getGhostNavigation = createGhostNavigation(process.env);
