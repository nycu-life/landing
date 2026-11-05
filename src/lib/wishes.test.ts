import { afterEach, describe, expect, it, vi } from 'vitest';
import { listWishes } from './wishes';

afterEach(() => vi.unstubAllGlobals());

const json = (body: unknown) =>
	new Response(JSON.stringify(body), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});

describe('public wish API', () => {
	it('lists open wishes by default and fulfilled wishes on request', async () => {
		const fulfilled = {
			id: 'wish-1',
			title: '希望校車可以看到即時位置',
			detail: '',
			category: 'transport',
			status: 'fulfilled',
			reply: '已上線！',
			repliedAt: '2026-10-02T04:00:00Z',
			fulfilledAt: '2026-10-01T08:00:00Z',
			supportCount: 3,
			supportedByMe: false,
			createdAt: '2026-08-12T10:00:00Z'
		};
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(json({ data: [] }))
			.mockResolvedValueOnce(json({ data: [fulfilled] }));
		vi.stubGlobal('fetch', fetchMock);

		await expect(listWishes()).resolves.toEqual([]);
		await expect(listWishes('fulfilled')).resolves.toEqual([fulfilled]);
		expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
			'/api/wishes?status=open',
			'/api/wishes?status=fulfilled'
		]);
	});
});
