import { getSite } from '$lib/server/site';
import { defaultSite } from '$lib/site/defaults';
export const load = async () => {
	const nativeGhost = process.env.PUBLIC_SITE_ENGINE === 'ghost';
	return {
		...(nativeGhost ? { site: defaultSite, siteUnavailable: false } : await getSite()),
		nativeGhost
	};
};
