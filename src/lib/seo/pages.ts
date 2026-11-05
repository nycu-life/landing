/**
 * Single source of truth for the static, indexable pages listed in the
 * generated `/sitemap.xml` (src/routes/sitemap.xml/+server.ts). Comic episodes
 * published in Ghost are appended at build time; placeholder episodes never are.
 *
 * Adding a page: add its route here (trailing slash, base-path free), make sure
 * it is prerendered with a self-canonical, update `docker/nginx.conf` if it was
 * previously withdrawn, and `e2e/seo.test.ts` picks it up automatically.
 */
export const SITE_ORIGIN = 'https://nycu.life';

export const indexablePages: readonly string[] = ['/', '/about/', '/wishpool/', '/comics/'];

export const comicEpisodePath = (slug: string): string => `/comics/${slug}/`;
