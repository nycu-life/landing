/**
 * Single source of truth for the static, indexable pages listed in the
 * generated `/sitemap.xml` (src/routes/sitemap.xml/+server.ts). Ghost-backed
 * sections are appended at build time only when Ghost actually supplied them:
 * `/devlog/` plus its posts once a `#devlog` post is published, `/comics/` plus
 * its episodes once a `#comics` post is. Placeholder or empty sections are
 * noindex and never listed.
 *
 * Adding a page: add its route here (trailing slash, base-path free), make sure
 * it is prerendered with a self-canonical, update `docker/nginx.conf` if it was
 * previously withdrawn, and `e2e/seo.test.ts` picks it up automatically.
 */
export const SITE_ORIGIN = 'https://nycu.life';

export const indexablePages: readonly string[] = ['/', '/about/', '/wishpool/'];

export const DEVLOG_INDEX = '/devlog/';
export const COMICS_INDEX = '/comics/';

export const devlogPostPath = (slug: string): string => `${DEVLOG_INDEX}${slug}/`;
export const comicEpisodePath = (slug: string): string => `${COMICS_INDEX}${slug}/`;
