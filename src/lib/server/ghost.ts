/**
 * Build-time Ghost Content API loader for the 漫畫專區 (comics) pages.
 *
 * This module only runs while SvelteKit prerenders the site (`pnpm build`); the
 * deployed site is static HTML served by nginx and browsers never talk to Ghost.
 * Ghost images referenced by episodes are mirrored into the build under
 * `/comics/media/` (see src/routes/comics/media/[...path]/+server.ts).
 *
 * Environment (read from `process.env` at build time — SvelteKit 2 forbids
 * `$env/dynamic/*` during prerendering, and `$env/static/*` would make the
 * variables mandatory):
 *
 * - `GHOST_URL`              Ghost base URL reachable from the build, e.g. https://cms.nycu.life
 * - `GHOST_CONTENT_API_KEY`  Content API key of a Ghost Custom Integration (read-only, public-grade)
 * - `GHOST_REQUIRED=1`       Fail the build instead of falling back to placeholder episodes
 *
 * Editor conventions (docs/ghost.md):
 * - An episode is a published post tagged `#comics` (internal tag, slug `hash-comics`)
 *   or `comics` (public tag).
 * - The episode number comes from an internal tag `#ep-NN` (e.g. `#ep-01`); posts
 *   without one are numbered by `published_at` order after the explicitly numbered ones.
 * - Feature image = 1:1 cover, post body = the panels, post slug = URL slug.
 *
 * Trust model: post HTML is written by authenticated Ghost staff (editors), the
 * same trust level as a commit to this repo, so it is rendered with `{@html}`
 * without sanitising. Do not feed member/comment content through this path.
 */
import { base } from '$app/paths';
import { COMICS_MEDIA_PREFIX, type ComicEpisode, type ComicsCatalog } from '$lib/comics';
import { placeholderEpisodes } from '$lib/content/comics';

export interface GhostEnv {
	GHOST_URL?: string;
	GHOST_CONTENT_API_KEY?: string;
	GHOST_REQUIRED?: string;
}

interface GhostTag {
	slug: string;
	name?: string;
}

export interface GhostPost {
	slug: string;
	title: string;
	html?: string | null;
	feature_image?: string | null;
	feature_image_alt?: string | null;
	published_at?: string | null;
	custom_excerpt?: string | null;
	excerpt?: string | null;
	tags?: GhostTag[];
}

const COMICS_TAG_FILTER = 'tag:[comics,hash-comics]';
const EPISODE_TAG = /^hash-ep-?0*(\d+)$/;
const REQUEST_TIMEOUT_MS = 20_000;

/** Episode number from an internal `#ep-NN` tag (Ghost slug `hash-ep-nn`). */
export function parseEpisodeNumber(tags: GhostTag[] | undefined): number | null {
	for (const tag of tags ?? []) {
		const match = EPISODE_TAG.exec(tag.slug);
		if (match) {
			const n = Number(match[1]);
			if (n > 0) return n;
		}
	}
	return null;
}

/** Mirror only plain upload paths; anything odd keeps its original (Ghost-hosted) URL. */
const isMirrorablePath = (path: string) => /^[\w%./-]+$/.test(path) && !path.includes('..');

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Rewrite absolute Ghost image URLs (`<origin>/content/images/<path>`) to the
 * mirrored static path and record every `<path>` that must be mirrored. Also
 * lazy-loads inline images that Ghost did not already mark.
 */
export function rewriteGhostMedia(
	html: string,
	origins: readonly string[],
	mediaBase: string,
	media: Set<string>
): string {
	let out = html;
	for (const origin of origins) {
		const pattern = new RegExp(`${escapeRegExp(origin)}/content/images/([^\\s"'<>),]+)`, 'g');
		out = out.replace(pattern, (url: string, path: string) => {
			if (!isMirrorablePath(path)) return url;
			media.add(path);
			return `${mediaBase}${path}`;
		});
	}
	return out.replace(/<img\b(?![^>]*\bloading=)/g, '<img loading="lazy" decoding="async"');
}

function rewriteImageUrl(
	url: string | null | undefined,
	origins: readonly string[],
	mediaBase: string,
	media: Set<string>
): string | null {
	if (!url) return null;
	for (const origin of origins) {
		const prefix = `${origin}/content/images/`;
		const path = url.startsWith(prefix) ? url.slice(prefix.length) : '';
		if (path && isMirrorablePath(path)) {
			media.add(path);
			return `${mediaBase}${path}`;
		}
	}
	return url;
}

/** Map Ghost posts to ordered episodes. Explicit `#ep-NN` numbers win; the rest follow by date. */
export function mapGhostPosts(
	posts: GhostPost[],
	origins: readonly string[],
	mediaBase: string
): ComicsCatalog {
	const media = new Set<string>();
	const byDate = [...posts].sort((a, b) =>
		(a.published_at ?? '').localeCompare(b.published_at ?? '')
	);
	const used = new Set<number>();
	const explicit = new Map<GhostPost, number>();
	for (const post of byDate) {
		const n = parseEpisodeNumber(post.tags);
		if (n === null) continue;
		if (used.has(n)) {
			console.warn(`[ghost] duplicate episode tag #ep-${n} on "${post.slug}"; numbering by date`);
			continue;
		}
		used.add(n);
		explicit.set(post, n);
	}
	let next = 1;
	const episodes: ComicEpisode[] = byDate.map((post) => {
		let number = explicit.get(post);
		if (number === undefined) {
			while (used.has(next)) next += 1;
			number = next;
			used.add(number);
		}
		const coverSrc = rewriteImageUrl(post.feature_image, origins, mediaBase, media);
		return {
			slug: post.slug,
			number,
			title: post.title,
			publishedAt: post.published_at ?? null,
			cover: coverSrc ? { src: coverSrc, alt: post.feature_image_alt || post.title } : null,
			excerpt: post.custom_excerpt || post.excerpt || null,
			html: post.html ? rewriteGhostMedia(post.html, origins, mediaBase, media) : ''
		};
	});
	episodes.sort((a, b) => a.number - b.number);
	return { source: 'ghost', episodes, media: [...media].sort() };
}

const placeholderCatalog = (): ComicsCatalog => ({
	source: 'placeholder',
	episodes: placeholderEpisodes,
	media: []
});

const trimSlash = (url: string) => url.replace(/\/+$/, '');

async function ghostGet<T>(
	fetchFn: typeof fetch,
	ghostUrl: string,
	key: string,
	resource: string,
	params: Record<string, string> = {}
): Promise<T> {
	const url = new URL(`${ghostUrl}/ghost/api/content/${resource}/`);
	url.searchParams.set('key', key);
	for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value);
	const response = await fetchFn(url, {
		headers: { 'Accept-Version': 'v6.0' },
		signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
	});
	if (!response.ok) {
		throw new Error(`GET ${resource} → HTTP ${response.status} ${response.statusText}`);
	}
	return (await response.json()) as T;
}

/** Load the comics catalog from Ghost, falling back to placeholders unless GHOST_REQUIRED=1. */
export async function loadComics(
	env: GhostEnv,
	fetchFn: typeof fetch = fetch,
	mediaBase = `${base}${COMICS_MEDIA_PREFIX}`
): Promise<ComicsCatalog> {
	const required = env.GHOST_REQUIRED === '1' || env.GHOST_REQUIRED === 'true';
	const ghostUrl = env.GHOST_URL ? trimSlash(env.GHOST_URL) : '';
	const key = env.GHOST_CONTENT_API_KEY ?? '';

	const fallback = (reason: string): ComicsCatalog => {
		const message = `[ghost] ${reason}`;
		if (required) throw new Error(`${message} (GHOST_REQUIRED=1, refusing placeholder comics)`);
		console.warn(`${message}; building the comics pages with placeholder episodes.`);
		return placeholderCatalog();
	};

	if (!ghostUrl || !key) return fallback('GHOST_URL / GHOST_CONTENT_API_KEY not set');

	try {
		const [{ posts }, settings] = await Promise.all([
			ghostGet<{ posts: GhostPost[] }>(fetchFn, ghostUrl, key, 'posts', {
				filter: COMICS_TAG_FILTER,
				include: 'tags',
				formats: 'html',
				limit: 'all',
				order: 'published_at asc'
			}),
			ghostGet<{ settings?: { url?: string } }>(fetchFn, ghostUrl, key, 'settings').catch(() => ({
				settings: undefined
			}))
		]);
		// Images carry Ghost's public `url`, which can differ from the build-side GHOST_URL.
		const origins = [
			...new Set(
				[ghostUrl, settings.settings?.url]
					.filter((value): value is string => Boolean(value))
					.map((value) => new URL(value).origin)
			)
		];
		if (posts.length === 0) return fallback(`no posts tagged #comics at ${ghostUrl}`);
		const catalog = mapGhostPosts(posts, origins, mediaBase);
		console.info(
			`[ghost] loaded ${catalog.episodes.length} comic episodes (${catalog.media.length} images) from ${ghostUrl}`
		);
		return catalog;
	} catch (error) {
		return fallback(
			`could not load comics from ${ghostUrl}: ${error instanceof Error ? error.message : error}`
		);
	}
}

let catalogPromise: Promise<ComicsCatalog> | undefined;

/** Memoised per build: every prerendered comics route and the sitemap share one Ghost fetch. */
export function getComics(): Promise<ComicsCatalog> {
	catalogPromise ??= loadComics(process.env);
	return catalogPromise;
}

/** Fetch one mirrored image from Ghost at build time. */
export async function fetchGhostMedia(path: string, fetchFn: typeof fetch = fetch) {
	const ghostUrl = process.env.GHOST_URL ? trimSlash(process.env.GHOST_URL) : '';
	if (!ghostUrl) throw new Error('[ghost] GHOST_URL not set; cannot mirror comics media');
	const response = await fetchFn(`${ghostUrl}/content/images/${path}`, {
		signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
	});
	if (!response.ok) throw new Error(`[ghost] media ${path} → HTTP ${response.status}`);
	return response;
}
