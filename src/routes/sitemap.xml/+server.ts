import {
	COMICS_INDEX,
	comicEpisodePath,
	DEVLOG_INDEX,
	devlogPostPath,
	indexablePages,
	SITE_ORIGIN
} from '$lib/seo/pages';
import { getComics, getDevlog } from '$lib/server/ghost';
import type { RequestHandler } from './$types';

// Generated once at build time and written to build/sitemap.xml.
export const prerender = true;

const escapeXml = (value: string) =>
	value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const GET: RequestHandler = async () => {
	const [devlog, comics] = await Promise.all([getDevlog(), getComics()]);
	// Empty / placeholder sections are noindex and must never be advertised to crawlers.
	const devlogPaths =
		devlog.source === 'ghost'
			? [DEVLOG_INDEX, ...devlog.posts.map((post) => devlogPostPath(post.slug))]
			: [];
	const comicPaths =
		comics.source === 'ghost'
			? [COMICS_INDEX, ...comics.episodes.map((episode) => comicEpisodePath(episode.slug))]
			: [];
	const urls = [...indexablePages, ...devlogPaths, ...comicPaths]
		.map((path) => `  <url><loc>${escapeXml(`${SITE_ORIGIN}${path}`)}</loc></url>`)
		.join('\n');
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
	return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
};
