export const wishCategories = ['life', 'transport', 'learning', 'space', 'other'] as const;
export type WishCategory = (typeof wishCategories)[number];

export type Wish = {
	id: string;
	title: string;
	detail: string;
	category: WishCategory;
	supportCount: number;
	supportedByMe: boolean;
	createdAt: string;
};

type WishListResponse = { data: Wish[] };
type WishResponse = { data: Wish; meta?: { pending?: boolean } };
type SupportResponse = { data: { supported: boolean; supportCount: number } };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
	const response = await fetch(path, {
		...init,
		headers: {
			Accept: 'application/json',
			...(init?.body ? { 'Content-Type': 'application/json' } : {}),
			...init?.headers
		}
	});
	const payload = (await response.json().catch(() => null)) as
		| T
		| { error?: { message?: string } }
		| null;
	if (!response.ok) {
		const message =
			payload && typeof payload === 'object' && 'error' in payload && payload.error?.message
				? payload.error.message
				: `Wish API returned ${response.status}`;
		throw new Error(message);
	}
	return payload as T;
}

export async function listWishes(signal?: AbortSignal): Promise<Wish[]> {
	const response = await request<WishListResponse>('/api/wishes?limit=24', { signal });
	return response.data;
}

export async function createWish(input: {
	title: string;
	detail: string;
	category: WishCategory;
}): Promise<{ wish: Wish; pending: boolean }> {
	const response = await request<WishResponse>('/api/wishes', {
		method: 'POST',
		body: JSON.stringify(input)
	});
	return { wish: response.data, pending: response.meta?.pending === true };
}

export async function toggleWishSupport(id: string): Promise<SupportResponse['data']> {
	const response = await request<SupportResponse>(`/api/wishes/${encodeURIComponent(id)}/support`, {
		method: 'POST'
	});
	return response.data;
}
