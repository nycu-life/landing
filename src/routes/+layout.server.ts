import { getSite } from '$lib/server/site';
import { defaultSite } from '$lib/site/defaults';
export const load = () =>
	process.env.PUBLIC_SITE_ENGINE === 'ghost'
		? { site: defaultSite, siteUnavailable: false }
		: getSite();
