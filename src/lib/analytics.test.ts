import { describe, expect, it } from 'vitest';
import { getCampaignEventId, getPageViewPath } from './analytics';

describe('getCampaignEventId', () => {
	it('accepts the event ids used by campaign links', () => {
		expect(getCampaignEventId(new URL('https://nycu.life/?event=123'))).toBe('123');
		expect(getCampaignEventId(new URL('https://nycu.life/?event=summer_2026'))).toBe('summer_2026');
	});

	it('rejects missing and unsafe ids', () => {
		expect(getCampaignEventId(new URL('https://nycu.life/'))).toBeNull();
		expect(getCampaignEventId(new URL('https://nycu.life/?event=hello%20world'))).toBeNull();
	});
});

describe('getPageViewPath', () => {
	it('keeps campaign parameters but excludes story-only hashes', () => {
		expect(getPageViewPath(new URL('https://nycu.life/?event=e3#products'))).toBe('/?event=e3');
		expect(getPageViewPath(new URL('https://nycu.life/about/#team'))).toBe('/about/');
	});
});
