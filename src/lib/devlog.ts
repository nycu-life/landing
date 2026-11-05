/**
 * Shared 開發日誌 (dev log) types. Safe for both the build-time loader
 * (`$lib/server/ghost.ts`) and the browser.
 */
import type { ComicImage } from '$lib/comics';

export interface DevlogTag {
	slug: string;
	name: string;
}

export interface DevlogPostSummary {
	slug: string;
	title: string;
	/** ISO 8601 publish time. */
	publishedAt: string;
	excerpt: string | null;
	cover: ComicImage | null;
	/** Public Ghost tags other than `devlog` itself (internal `#tags` are never exposed). */
	tags: DevlogTag[];
	/** Ghost's estimate in minutes. */
	readingTime: number | null;
}

export interface DevlogPost extends DevlogPostSummary {
	/** Editor-controlled Ghost post HTML. */
	html: string;
}

/** `empty`: no Ghost source, or nothing published yet — the list renders an empty state, noindex. */
export type DevlogSource = 'ghost' | 'empty';

export interface DevlogCatalog {
	source: DevlogSource;
	/** Newest first. */
	posts: DevlogPost[];
	/** Ghost media paths (relative to `/content/images/`) mirrored into the static build. */
	media: string[];
}

/** Public URL prefix (under the SvelteKit base path) for mirrored dev log images. */
export const DEVLOG_MEDIA_PREFIX = '/devlog/media/';

export function toDevlogSummary(post: DevlogPost): DevlogPostSummary {
	const summary: Partial<DevlogPost> = { ...post };
	delete summary.html;
	return summary as DevlogPostSummary;
}
