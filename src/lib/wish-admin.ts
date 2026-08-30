import type { Wish } from './wishes';

export const wishVisibilities = ['pending', 'published', 'hidden'] as const;
export type WishVisibility = (typeof wishVisibilities)[number];
export type AdminWish = Wish;

type AdminWishListResponse = { data: AdminWish[] };
type AdminWishResponse = { data: AdminWish };

export class WishAdminRequestError extends Error {
	constructor(
		message: string,
		readonly status: number
	) {
		super(message);
		this.name = 'WishAdminRequestError';
	}
}

async function request<T>(path: string, token: string, init?: RequestInit): Promise<T> {
	const response = await fetch(path, {
		...init,
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${token}`,
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
		throw new WishAdminRequestError(message, response.status);
	}
	return payload as T;
}

export async function listAdminWishes(
	token: string,
	visibility: WishVisibility,
	signal?: AbortSignal
): Promise<AdminWish[]> {
	const response = await request<AdminWishListResponse>(
		`/api/wishes/admin?visibility=${encodeURIComponent(visibility)}`,
		token,
		{ signal }
	);
	return response.data;
}

export async function updateAdminWishVisibility(
	token: string,
	id: string,
	visibility: WishVisibility
): Promise<AdminWish> {
	const response = await request<AdminWishResponse>(
		`/api/wishes/admin/${encodeURIComponent(id)}`,
		token,
		{
			method: 'PATCH',
			body: JSON.stringify({ visibility })
		}
	);
	return response.data;
}
