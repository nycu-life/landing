import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	WishAdminRequestError,
	getAdminSession,
	listAdminWishes,
	logoutAdmin,
	updateAdminWishVisibility
} from './wish-admin';

afterEach(() => vi.unstubAllGlobals());

describe('wish admin API', () => {
	it('reads the HttpOnly-backed admin session without an authorization header', async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					data: {
						authenticated: true,
						user: { subject: 'authentik-user-id', name: '管理員' }
					}
				}),
				{ status: 200, headers: { 'Content-Type': 'application/json' } }
			)
		);
		vi.stubGlobal('fetch', fetchMock);

		await expect(getAdminSession()).resolves.toEqual({
			subject: 'authentik-user-id',
			name: '管理員'
		});
		expect(fetchMock).toHaveBeenCalledWith(
			'/api/wishes/auth/me',
			expect.objectContaining({ credentials: 'same-origin' })
		);
		expect(fetchMock.mock.calls[0][1].headers).not.toHaveProperty('Authorization');
	});

	it('lists and updates wishes using only the same-origin session cookie', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(
				new Response(
					JSON.stringify({
						data: [
							{
								id: 'wish-1',
								title: '待審願望',
								detail: '',
								category: 'other',
								supportCount: 1,
								supportedByMe: false,
								createdAt: '2026-08-31T00:00:00Z'
							}
						]
					}),
					{ status: 200, headers: { 'Content-Type': 'application/json' } }
				)
			)
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ data: { id: 'wish-1' } }), {
					status: 200,
					headers: { 'Content-Type': 'application/json' }
				})
			);
		vi.stubGlobal('fetch', fetchMock);

		await expect(listAdminWishes('pending')).resolves.toHaveLength(1);
		await updateAdminWishVisibility('wish-1', 'hidden');

		for (const [, init] of fetchMock.mock.calls as Array<[string, RequestInit]>) {
			expect(init.credentials).toBe('same-origin');
			expect(init.headers).not.toHaveProperty('Authorization');
		}
		const [url, init] = fetchMock.mock.calls[1] as [string, RequestInit];
		expect(url).toBe('/api/wishes/admin/wish-1');
		expect(init.body).toBe('{"visibility":"hidden"}');
	});

	it('logs out through a same-origin POST', async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ data: { authenticated: false } }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			})
		);
		vi.stubGlobal('fetch', fetchMock);

		await logoutAdmin();
		expect(fetchMock).toHaveBeenCalledWith(
			'/api/wishes/auth/logout',
			expect.objectContaining({ method: 'POST', credentials: 'same-origin' })
		);
	});

	it('preserves the response status for expired-session handling', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(
				new Response(JSON.stringify({ error: { message: 'admin authorization required' } }), {
					status: 401,
					headers: { 'Content-Type': 'application/json' }
				})
			)
		);

		await expect(listAdminWishes('pending')).rejects.toEqual(
			expect.objectContaining<Partial<WishAdminRequestError>>({ status: 401 })
		);
	});
});
