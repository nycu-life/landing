/**
 * Build-time Ghost Content API loader for the 漫畫專區 (comics) and 開發日誌
 * (dev log) pages.
 *
 * This module only runs while SvelteKit prerenders the site (`pnpm build`); the
 * deployed site is static HTML served by nginx and browsers never talk to Ghost.
 * Ghost images referenced by posts are mirrored into the build under
 * `/comics/media/` and `/devlog/media/` (the `media/[...path]/+server.ts` routes).
 *
 * Environment (read from `process.env` at build time — SvelteKit 2 forbids
 * `$env/dynamic/*` during prerendering, and `$env/static/*` would make the
 * variables mandatory):
 *
 * - `GHOST_URL`              Ghost base URL reachable from the build, e.g. https://cms.nycu.life
 * - `GHOST_CONTENT_API_KEY`  Content API key of a Ghost Custom Integration (read-only, public-grade)
 * - `GHOST_REQUIRED=1`       Fail the build when Ghost is unset or unreachable (an empty
 *                            section is still fine)
 *
 * Editor conventions (docs/ghost.md):
 * - An episode is a published post tagged `#comics` (internal tag, slug `hash-comics`)
 *   or `comics` (public tag).
 * - The episode number comes from an internal tag `#ep-NN` (e.g. `#ep-01`); posts
 *   without one are numbered by `published_at` order after the explicitly numbered ones.
 * - Feature image = 1:1 cover, post body = the panels, post slug = URL slug.
 * - A dev log post is a published post tagged `#devlog` (internal) or `devlog`
 *   (public). Other public tags are shown as labels; feature image = cover.
 *
 * Trust model: post HTML is written by authenticated Ghost staff (editors), the
 * same trust level as a commit to this repo, so it is rendered with `{@html}`
 * without sanitising. Do not feed member/comment content through this path.
 */
import { base } from '$app/paths';
import { COMICS_MEDIA_PREFIX, type ComicEpisode, type ComicsCatalog } from '$lib/comics';
import { placeholderEpisodes } from '$lib/content/comics';
import { DEVLOG_MEDIA_PREFIX, type DevlogCatalog, type DevlogPost } from '$lib/devlog';

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
	reading_time?: number | null;
	tags?: GhostTag[];
}

const COMICS_TAG_FILTER = 'tag:[comics,hash-comics]';
const DEVLOG_PUBLIC_TAG = 'devlog';
const DEVLOG_TAG_FILTER = `tag:[${DEVLOG_PUBLIC_TAG},hash-devlog]`;
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

const isRequired = (env: GhostEnv) => env.GHOST_REQUIRED === '1' || env.GHOST_REQUIRED === 'true';

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

interface TaggedPosts {
	ghostUrl: string;
	posts: GhostPost[];
	/** Origins whose `/content/images/` URLs are mirrored (build-side URL + Ghost's public URL). */
	origins: string[];
}

class GhostUnavailable extends Error {}

/**
 * Fetch every published post matching `filter`. Throws `GhostUnavailable` when
 * Ghost is not configured or does not answer; an empty result is not an error
 * (a section with nothing published yet is a normal state).
 */
async function fetchTaggedPosts(
	env: GhostEnv,
	fetchFn: typeof fetch,
	filter: string,
	order: string
): Promise<TaggedPosts> {
	const ghostUrl = env.GHOST_URL ? trimSlash(env.GHOST_URL) : '';
	const key = env.GHOST_CONTENT_API_KEY ?? '';
	if (!ghostUrl || !key) throw new GhostUnavailable('GHOST_URL / GHOST_CONTENT_API_KEY not set');
	try {
		const [{ posts }, settings] = await Promise.all([
			ghostGet<{ posts: GhostPost[] }>(fetchFn, ghostUrl, key, 'posts', {
				filter,
				include: 'tags',
				formats: 'html',
				limit: 'all',
				order
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
		return { ghostUrl, posts, origins };
	} catch (error) {
		throw new GhostUnavailable(
			`could not load ${filter} from ${ghostUrl}: ${error instanceof Error ? error.message : error}`
		);
	}
}

/** Unavailable Ghost: fatal with GHOST_REQUIRED=1, otherwise a warning and the fallback. */
function unavailable<T>(env: GhostEnv, error: unknown, section: string, fallback: () => T): T {
	if (!(error instanceof GhostUnavailable)) throw error;
	const message = `[ghost] ${error.message}`;
	if (isRequired(env))
		throw new Error(`${message} (GHOST_REQUIRED=1, refusing a ${section} fallback)`);
	console.warn(`${message}; building ${section} without Ghost content.`);
	return fallback();
}

/**
 * Load the comics catalog from Ghost. Without Ghost (and without GHOST_REQUIRED=1)
 * the placeholder episodes are used. Ghost answering with no `#comics` posts is
 * not an error: the comics pages stay placeholder (noindex, unlinked) until the
 * first episode is published.
 */
export async function loadComics(
	env: GhostEnv,
	fetchFn: typeof fetch = fetch,
	mediaBase = `${base}${COMICS_MEDIA_PREFIX}`
): Promise<ComicsCatalog> {
	let result: TaggedPosts;
	try {
		result = await fetchTaggedPosts(env, fetchFn, COMICS_TAG_FILTER, 'published_at asc');
	} catch (error) {
		return unavailable(env, error, 'the comics pages', placeholderCatalog);
	}
	if (result.posts.length === 0) {
		console.info(
			`[ghost] no posts tagged #comics at ${result.ghostUrl} yet; comics stay placeholder`
		);
		return placeholderCatalog();
	}
	const catalog = mapGhostPosts(result.posts, result.origins, mediaBase);
	console.info(
		`[ghost] loaded ${catalog.episodes.length} comic episodes (${catalog.media.length} images) from ${result.ghostUrl}`
	);
	return catalog;
}

/** Ghost internal tags (`#foo`) have slugs starting with `hash-` and are never shown. */
const publicTags = (tags: GhostTag[] | undefined) =>
	(tags ?? [])
		.filter((tag) => !tag.slug.startsWith('hash-') && tag.slug !== DEVLOG_PUBLIC_TAG)
		.map((tag) => ({ slug: tag.slug, name: tag.name || tag.slug }));

/** Map Ghost posts to devlog entries, newest first. */
export function mapDevlogPosts(
	posts: GhostPost[],
	origins: readonly string[],
	mediaBase: string
): DevlogCatalog {
	const media = new Set<string>();
	const entries: DevlogPost[] = posts
		.filter((post) => post.published_at)
		.map((post) => {
			const coverSrc = rewriteImageUrl(post.feature_image, origins, mediaBase, media);
			return {
				slug: post.slug,
				title: post.title,
				publishedAt: post.published_at as string,
				excerpt: post.custom_excerpt || post.excerpt || null,
				cover: coverSrc ? { src: coverSrc, alt: post.feature_image_alt || post.title } : null,
				tags: publicTags(post.tags),
				readingTime: post.reading_time && post.reading_time > 0 ? post.reading_time : null,
				html: post.html ? rewriteGhostMedia(post.html, origins, mediaBase, media) : ''
			};
		})
		.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
	return { source: 'ghost', posts: entries, media: [...media].sort() };
}

const emptyDevlog = (): DevlogCatalog => ({ source: 'empty', posts: [], media: [] });

/** Load the 開發日誌 posts (`#devlog`) from Ghost; no Ghost or no posts → an empty, noindex list. */
export async function loadDevlog(
	env: GhostEnv,
	fetchFn: typeof fetch = fetch,
	mediaBase = `${base}${DEVLOG_MEDIA_PREFIX}`
): Promise<DevlogCatalog> {
	let result: TaggedPosts;
	try {
		result = await fetchTaggedPosts(env, fetchFn, DEVLOG_TAG_FILTER, 'published_at desc');
	} catch (error) {
		return unavailable(env, error, 'the dev log', emptyDevlog);
	}
	if (result.posts.length === 0) {
		console.info(`[ghost] no posts tagged #devlog at ${result.ghostUrl} yet`);
		return emptyDevlog();
	}
	const catalog = mapDevlogPosts(result.posts, result.origins, mediaBase);
	console.info(
		`[ghost] loaded ${catalog.posts.length} dev log posts (${catalog.media.length} images) from ${result.ghostUrl}`
	);
	return catalog;
}

let catalogPromise: Promise<ComicsCatalog> | undefined;
let devlogPromise: Promise<DevlogCatalog> | undefined;

/** Memoised per build: every prerendered comics route and the sitemap share one Ghost fetch. */
export function getComics(): Promise<ComicsCatalog> {
	catalogPromise ??= loadComics(process.env);
	return catalogPromise;
}

/** Memoised per build, like `getComics`. */
export function getDevlog(): Promise<DevlogCatalog> {
	devlogPromise ??= loadDevlog(process.env);
	return devlogPromise;
}

/** Fetch one mirrored image from Ghost at build time. */
export async function fetchGhostMedia(path: string, fetchFn: typeof fetch = fetch) {
	const ghostUrl = process.env.GHOST_URL ? trimSlash(process.env.GHOST_URL) : '';
	if (!ghostUrl) throw new Error('[ghost] GHOST_URL not set; cannot mirror Ghost media');
	const response = await fetchFn(`${ghostUrl}/content/images/${path}`, {
		signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
	});
	if (!response.ok) throw new Error(`[ghost] media ${path} → HTTP ${response.status}`);
	return response;
}
