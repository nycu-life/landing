import { afterEach, describe, expect, it, vi } from 'vitest';
import { WishAdminRequestError, listAdminWishes, updateAdminWishVisibility } from './wish-admin';

afterEach(() => vi.unstubAllGlobals());

describe('wish admin API', () => {
	it('lists a selected visibility with the bearer token in the header', async () => {
		const fetchMock = vi.fn().mockResolvedValue(
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
		);
		vi.stubGlobal('fetch', fetchMock);

		await expect(listAdminWishes('secret-token', 'pending')).resolves.toHaveLength(1);
		expect(fetchMock).toHaveBeenCalledWith(
			'/api/wishes/admin?visibility=pending',
			expect.objectContaining({
				headers: expect.objectContaining({ Authorization: 'Bearer secret-token' })
			})
		);
	});

	it('updates visibility without putting the token in the URL or body', async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ data: { id: 'wish-1' } }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			})
		);
		vi.stubGlobal('fetch', fetchMock);

		await updateAdminWishVisibility('secret-token', 'wish-1', 'hidden');
		const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
		expect(url).toBe('/api/wishes/admin/wish-1');
		expect(url).not.toContain('secret-token');
		expect(init.body).toBe('{"visibility":"hidden"}');
		expect(init.body).not.toContain('secret-token');
	});

	it('preserves the response status for invalid-token handling', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(
				new Response(JSON.stringify({ error: { message: 'admin authorization required' } }), {
					status: 401,
					headers: { 'Content-Type': 'application/json' }
				})
			)
		);

		await expect(listAdminWishes('wrong-token', 'pending')).rejects.toEqual(
			expect.objectContaining<Partial<WishAdminRequestError>>({ status: 401 })
		);
	});
});
