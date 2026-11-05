import { comicEpisodePath, indexablePages, SITE_ORIGIN } from '$lib/seo/pages';
import { getComics } from '$lib/server/ghost';
import type { RequestHandler } from './$types';

// Generated once at build time and written to build/sitemap.xml.
export const prerender = true;

const escapeXml = (value: string) =>
	value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const GET: RequestHandler = async () => {
	const catalog = await getComics();
	// Placeholder episodes are noindex and must never be advertised to crawlers.
	const episodePaths =
		catalog.source === 'ghost'
			? catalog.episodes.map((episode) => comicEpisodePath(episode.slug))
			: [];
	const urls = [...indexablePages, ...episodePaths]
		.map((path) => `  <url><loc>${escapeXml(`${SITE_ORIGIN}${path}`)}</loc></url>`)
		.join('\n');
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
	return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
};
