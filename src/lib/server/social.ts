/**
 * Instagram and Threads posts for the 最新消息 (/news/) page, so the social team
 * publishes once on Instagram/Threads instead of also posting in Ghost.
 *
 * The Node service reads the official APIs with long-lived user tokens:
 * - `INSTAGRAM_ACCESS_TOKEN`  Instagram API with Instagram Login (professional account)
 * - `THREADS_ACCESS_TOKEN`    Threads API
 * Either may be missing; the page then shows only the profile links.
 *
 * Long-lived tokens last 60 days. The service refreshes them in memory once a day
 * and logs the remaining lifetime (`[social] … token expires in N days`), so a
 * stored token keeps working as long as the service runs at least once every 60
 * days. Images are served through `/social/media/<id>` (only ids in the current
 * feed), because Meta CDN URLs expire and may refuse cross-site embedding.
 */

export type SocialNetwork = 'instagram' | 'threads';

export interface SocialPost {
	/** `ig-<id>` or `th-<id>`. */
	id: string;
	network: SocialNetwork;
	permalink: string;
	text: string;
	timestamp: string;
	/** Same-origin image path, or null for text-only posts. */
	image: string | null;
}

export interface SocialFeed {
	posts: SocialPost[];
	profiles: Record<SocialNetwork, string>;
}

interface MetaMedia {
	id: string;
	caption?: string;
	text?: string;
	media_type?: string;
	media_url?: string;
	thumbnail_url?: string;
	permalink?: string;
	timestamp?: string;
	is_quote_post?: boolean;
}

export const SOCIAL_PROFILES: Record<SocialNetwork, string> = {
	instagram: 'https://www.instagram.com/nycu.life/',
	threads: 'https://www.threads.com/@nycu.life'
};

const PER_NETWORK = 12;
const FEED_TTL_MS = 10 * 60_000;
/** Keep serving the last good feed through short API outages. */
const STALE_LIMIT_MS = 6 * 60 * 60_000;
const REFRESH_EVERY_MS = 24 * 60 * 60_000;
const REQUEST_TIMEOUT_MS = 8_000;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const API = {
	instagram: {
		media: 'https://graph.instagram.com/v22.0/me/media',
		fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',
		refresh: 'https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token',
		prefix: 'ig'
	},
	threads: {
		media: 'https://graph.threads.net/v1.0/me/threads',
		fields: 'id,text,media_type,media_url,thumbnail_url,permalink,timestamp,is_quote_post',
		refresh: 'https://graph.threads.net/refresh_access_token?grant_type=th_refresh_token',
		prefix: 'th'
	}
} as const;

/** Map one API page to posts, keeping the original image URL for the media proxy. */
export function mapMetaMedia(
	network: SocialNetwork,
	items: MetaMedia[]
): { post: SocialPost; source: string | null }[] {
	const prefix = API[network].prefix;
	return (
		items
			.filter((item) => item.id && item.permalink && item.timestamp)
			// Threads reposts carry someone else's content.
			.filter((item) => item.media_type !== 'REPOST_FACADE')
			.map((item) => {
				const source =
					item.media_type === 'VIDEO'
						? (item.thumbnail_url ?? null)
						: item.media_type === 'TEXT_POST'
							? null
							: (item.media_url ?? item.thumbnail_url ?? null);
				const id = `${prefix}-${item.id}`;
				return {
					post: {
						id,
						network,
						permalink: item.permalink!,
						text: (item.caption ?? item.text ?? '').trim(),
						timestamp: item.timestamp!,
						image: source ? `/social/media/${encodeURIComponent(id)}` : null
					},
					source
				};
			})
	);
}

/** Newest first across networks. */
export const mergeFeeds = (posts: SocialPost[]) =>
	[...posts].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));

interface TokenState {
	value: string;
	refreshedAt: number;
}

export function createSocialSource(
	env: Partial<Record<'INSTAGRAM_ACCESS_TOKEN' | 'THREADS_ACCESS_TOKEN', string>> = process.env,
	fetchFn: typeof fetch = fetch,
	now: () => number = Date.now
) {
	const tokens: Partial<Record<SocialNetwork, TokenState>> = {};
	for (const [network, key] of [
		['instagram', 'INSTAGRAM_ACCESS_TOKEN'],
		['threads', 'THREADS_ACCESS_TOKEN']
	] as const) {
		const value = env[key]?.trim();
		// refreshedAt 0: refresh on first use, which also logs the remaining lifetime.
		if (value) tokens[network] = { value, refreshedAt: 0 };
	}

	const get = async (url: string) => {
		const response = await fetchFn(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		return response.json();
	};

	async function refresh(network: SocialNetwork, token: TokenState) {
		if (now() - token.refreshedAt < REFRESH_EVERY_MS) return;
		token.refreshedAt = now();
		try {
			const body = (await get(
				`${API[network].refresh}&access_token=${encodeURIComponent(token.value)}`
			)) as { access_token?: string; expires_in?: number };
			if (body.access_token) token.value = body.access_token;
			const days = Math.floor((body.expires_in ?? 0) / 86_400);
			const log = days < 14 ? console.warn : console.info;
			log(`[social] ${network} token expires in ${days} days`);
		} catch (error) {
			// A token younger than 24 hours cannot be refreshed yet; the old one still works.
			console.warn(`[social] could not refresh the ${network} token: ${String(error)}`);
		}
	}

	async function loadNetwork(network: SocialNetwork) {
		const token = tokens[network];
		if (!token) return [];
		await refresh(network, token);
		const url = new URL(API[network].media);
		url.searchParams.set('fields', API[network].fields);
		url.searchParams.set('limit', String(PER_NETWORK));
		url.searchParams.set('access_token', token.value);
		const body = (await get(url.toString())) as { data?: MetaMedia[] };
		return mapMetaMedia(network, body.data ?? []);
	}

	let cached: { feed: SocialFeed; sources: Map<string, string>; at: number } | undefined;
	/** Last reload attempt, successful or not: a failing API is retried once per TTL. */
	let checkedAt = -Infinity;
	let pending: Promise<void> | undefined;

	async function reload() {
		checkedAt = now();
		const results = await Promise.allSettled(
			(['instagram', 'threads'] as const).map((network) => loadNetwork(network))
		);
		const entries = results.flatMap((result, index) => {
			if (result.status === 'fulfilled') return result.value;
			const network = index === 0 ? 'instagram' : 'threads';
			console.warn(`[social] could not load ${network}: ${String(result.reason)}`);
			// Keep that network's last good posts instead of dropping them.
			return (cached?.feed.posts ?? [])
				.filter((post) => post.network === network)
				.map((post) => ({ post, source: cached!.sources.get(post.id) ?? null }));
		});
		const failedAll = results.every((result) => result.status === 'rejected');
		if (failedAll && Object.keys(tokens).length && cached) return; // keep the last good feed
		cached = {
			feed: { posts: mergeFeeds(entries.map((e) => e.post)), profiles: SOCIAL_PROFILES },
			sources: new Map(entries.flatMap((e) => (e.source ? [[e.post.id, e.source]] : []))),
			at: now()
		};
	}

	async function current() {
		if (now() - checkedAt >= FEED_TTL_MS) {
			pending ??= reload().finally(() => (pending = undefined));
			try {
				await pending;
			} catch (error) {
				console.warn(`[social] feed reload failed: ${String(error)}`);
			}
		}
		if (cached && now() - cached.at < STALE_LIMIT_MS) return cached;
		return { feed: { posts: [], profiles: SOCIAL_PROFILES }, sources: new Map<string, string>() };
	}

	return {
		configured: () => Object.keys(tokens).length > 0,
		feed: async (): Promise<SocialFeed> => (await current()).feed,
		/** Fetch one feed image; null for ids not in the current feed. */
		async media(id: string): Promise<Response | null> {
			const source = (await current()).sources.get(id);
			if (!source) return null;
			const upstream = await fetchFn(source, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
			const type = upstream.headers.get('content-type') ?? '';
			const length = Number(upstream.headers.get('content-length') ?? 0);
			if (!upstream.ok || !type.startsWith('image/') || length > MAX_IMAGE_BYTES) return null;
			const body = await upstream.arrayBuffer();
			if (body.byteLength > MAX_IMAGE_BYTES) return null;
			return new Response(body, {
				headers: {
					'content-type': type,
					'cache-control': 'public, max-age=3600',
					'x-content-type-options': 'nosniff'
				}
			});
		}
	};
}

let shared: ReturnType<typeof createSocialSource> | undefined;
export const socialSource = () => (shared ??= createSocialSource());
