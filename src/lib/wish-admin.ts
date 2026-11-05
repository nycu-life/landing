import type { Wish, WishStatus } from './wishes';

export const wishVisibilities = ['pending', 'published', 'hidden'] as const;
export type WishVisibility = (typeof wishVisibilities)[number];
export type AdminWish = Wish;
/** Maximum team reply length, matching the API's limit (code points). */
export const maxWishReplyLength = 1000;

/** Admin PATCH body: any combination of fields; `reply: ''` clears the reply. */
export type AdminWishUpdate = {
	visibility?: WishVisibility;
	status?: WishStatus;
	reply?: string;
};

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
	options: { status?: WishStatus; signal?: AbortSignal } = {}
): Promise<AdminWish[]> {
	const params = new URLSearchParams({ visibility });
	if (options.status) params.set('status', options.status);
	const response = await request<AdminWishListResponse>(`/api/wishes/admin?${params}`, {
		signal: options.signal
	});
	return response.data;
}

export async function updateAdminWish(id: string, update: AdminWishUpdate): Promise<AdminWish> {
	const response = await request<AdminWishResponse>(`/api/wishes/admin/${encodeURIComponent(id)}`, {
		method: 'PATCH',
		body: JSON.stringify(update)
	});
	return response.data;
}

export function updateAdminWishVisibility(
	id: string,
	visibility: WishVisibility
): Promise<AdminWish> {
	return updateAdminWish(id, { visibility });
}
