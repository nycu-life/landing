import { getSite } from '$lib/server/site';
import { getGhostNavigation } from '$lib/server/ghost-navigation';
import { defaultSite } from '$lib/site/defaults';
export const load = async () => {
	const nativeGhost = process.env.PUBLIC_SITE_ENGINE === 'ghost';
	return {
		...(nativeGhost ? { site: defaultSite, siteUnavailable: false } : await getSite()),
		nativeGhost,
		// The Wish Pool top bar shows the same Ghost menu as the native theme pages.
		ghostNavigation: nativeGhost ? await getGhostNavigation() : null
	};
};
