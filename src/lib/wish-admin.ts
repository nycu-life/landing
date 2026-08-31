import type { Wish } from './wishes';

export const wishVisibilities = ['pending', 'published', 'hidden'] as const;
export type WishVisibility = (typeof wishVisibilities)[number];
export type AdminWish = Wish;

type AdminWishListResponse = { data: AdminWish[] };
type AdminWishResponse = { data: AdminWish };
type AdminSessionResponse = {
	data: {
		authenticated: boolean;
		user?: AdminSessionUser;
	};
};

export type AdminSessionUser = {
	subject: string;
	name: string;
};

export class WishAdminRequestError extends Error {
	constructor(
		message: string,
		readonly status: number
	) {
		super(message);
		this.name = 'WishAdminRequestError';
	}
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
	const response = await fetch(path, {
		...init,
		credentials: 'same-origin',
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
		throw new WishAdminRequestError(message, response.status);
	}
	return payload as T;
}

export async function getAdminSession(signal?: AbortSignal): Promise<AdminSessionUser | null> {
	const response = await request<AdminSessionResponse>('/api/wishes/auth/me', { signal });
	return response.data.authenticated && response.data.user ? response.data.user : null;
}

export async function logoutAdmin(): Promise<void> {
	await request<AdminSessionResponse>('/api/wishes/auth/logout', { method: 'POST' });
}

export async function listAdminWishes(
	visibility: WishVisibility,
	signal?: AbortSignal
): Promise<AdminWish[]> {
	const response = await request<AdminWishListResponse>(
		`/api/wishes/admin?visibility=${encodeURIComponent(visibility)}`,
		{ signal }
	);
	return response.data;
}

export async function updateAdminWishVisibility(
	id: string,
	visibility: WishVisibility
): Promise<AdminWish> {
	const response = await request<AdminWishResponse>(`/api/wishes/admin/${encodeURIComponent(id)}`, {
		method: 'PATCH',
		body: JSON.stringify({ visibility })
	});
	return response.data;
}
