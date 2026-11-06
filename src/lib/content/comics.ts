import type { ComicEpisode } from '$lib/comics';

/**
 * Placeholder comics catalog, matching the 漫畫專區 design artboard (issue #107).
 *
 * Used whenever the build has no Ghost content source (GHOST_URL /
 * GHOST_CONTENT_API_KEY unset, or Ghost unreachable without GHOST_REQUIRED=1).
 * Placeholder episode pages are `noindex` and never listed in the sitemap.
 * `title: null` renders the localized placeholder title, and
 * `cover: null` renders the CSS placeholder cover.
 */
export const PLACEHOLDER_EPISODE_COUNT = 10;

export const placeholderEpisodes: ComicEpisode[] = Array.from(
	{ length: PLACEHOLDER_EPISODE_COUNT },
	(_, index) => {
		const number = index + 1;
		return {
			slug: `ep-${String(number).padStart(2, '0')}`,
			number,
			title: number === 1 ? '小貢上大學了' : null,
			publishedAt: null,
			cover: null,
			excerpt: null,
			html: null
		};
	}
);
