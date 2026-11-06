/** Runtime sitemap combines these core routes with published Ghost articles and /pages/<slug>/.
 * Preserve explicit 404/410 behavior when adding or withdrawing a core route. */
export const SITE_ORIGIN = 'https://nycu.life';

export const indexablePages: readonly string[] = ['/', '/about/', '/wishpool/'];

export const DEVLOG_INDEX = '/devlog/';
export const COMICS_INDEX = '/comics/';

export const devlogPostPath = (slug: string): string => `${DEVLOG_INDEX}${slug}/`;
export const comicEpisodePath = (slug: string): string => `${COMICS_INDEX}${slug}/`;
