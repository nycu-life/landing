import { defaultSite } from '$lib/site/defaults';
import { loadSite } from '$lib/server/site-loader';
import type { SiteCatalog } from '$lib/site/types';

/** Last-known-good content covers brief outages, but withdrawals are never hidden indefinitely. */
export function createSiteCache(load: () => Promise<SiteCatalog>, now = Date.now) {
	let cached: { catalog: SiteCatalog; at: number } | undefined;
	let pending: Promise<{ site: SiteCatalog; siteUnavailable: boolean }> | undefined;
	let retryAt = 0;
	return async () => {
		if (cached && now() - cached.at < 30_000)
			return { site: cached.catalog, siteUnavailable: false };
		if (now() < retryAt)
			return {
				site: cached?.catalog ?? defaultSite,
				siteUnavailable: !cached || now() - cached.at >= 300_000
			};
		pending ??= load()
			.then((site) => {
				cached = { catalog: site, at: now() };
				return { site, siteUnavailable: false };
			})
			.catch((cause) => {
				console.error(
					'[ghost] site content temporarily unavailable',
					cause instanceof Error ? cause.message : cause
				);
				retryAt = now() + 5_000;
				return {
					site: cached?.catalog ?? defaultSite,
					siteUnavailable: !cached || now() - cached.at >= 300_000
				};
			})
			.finally(() => {
				pending = undefined;
			});
		return pending;
	};
}
export const getSite = createSiteCache(() => loadSite(process.env));
