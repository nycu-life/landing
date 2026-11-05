/**
 * Shared comics (漫畫專區) types and display helpers. Safe for both the
 * build-time loader (`$lib/server/ghost.ts`) and the browser.
 */

export interface ComicImage {
	src: string;
	alt: string;
	width?: number;
	height?: number;
}

export interface ComicEpisodeSummary {
	slug: string;
	/** 1-based episode number shown as 第一集 / Episode 1 and EP.01. */
	number: number;
	/** `null` means "no title yet": the UI renders the localized placeholder title. */
	title: string | null;
	/** ISO 8601 timestamp, or `null` for placeholder episodes. */
	publishedAt: string | null;
	/** `null` renders the CSS placeholder cover from the design. */
	cover: ComicImage | null;
	excerpt: string | null;
}

export interface ComicEpisode extends ComicEpisodeSummary {
	/** Editor-controlled Ghost post HTML (the panels); `null` for placeholders. */
	html: string | null;
}

export type ComicsSource = 'ghost' | 'placeholder';

export interface ComicsCatalog {
	source: ComicsSource;
	/** Ordered oldest → newest (ascending episode number). */
	episodes: ComicEpisode[];
	/** Ghost media paths (relative to `/content/images/`) mirrored into the static build. */
	media: string[];
}

/** Public URL prefix (under the SvelteKit base path) for mirrored Ghost images. */
export const COMICS_MEDIA_PREFIX = '/comics/media/';

export function toSummary(episode: ComicEpisode): ComicEpisodeSummary {
	const summary: Partial<ComicEpisode> = { ...episode };
	delete summary.html;
	return summary as ComicEpisodeSummary;
}

/** `7` → `07` for the EP.07 cover mark. */
export const padEpisode = (n: number): string => String(n).padStart(2, '0');

const DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

/** 1–99 as Traditional Chinese numerals (第一集, 第十集, 第二十一集); larger numbers stay Arabic. */
export function toChineseNumeral(n: number): string {
	if (!Number.isInteger(n) || n < 1 || n > 99) return String(n);
	if (n < 10) return DIGITS[n];
	const tens = Math.floor(n / 10);
	const ones = n % 10;
	return `${tens === 1 ? '' : DIGITS[tens]}十${ones === 0 ? '' : DIGITS[ones]}`;
}
