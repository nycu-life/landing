import { describe, expect, it } from 'vitest';
import { getCampaignEventId, getJoinFormClickParams, getPageViewPath } from './analytics';

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

describe('getJoinFormClickParams', () => {
	it('records the recruitment destination, CTA source, and active locale', () => {
		const linkUrl =
			'https://docs.google.com/forms/d/e/1FAIpQLScCEb5rf9pGfClM68q6TjgpP_EAqatZo4MLwPoMTpqRfmq9Qg/viewform';

		expect(getJoinFormClickParams('home_story', linkUrl, 'zh-tw')).toEqual({
			link_url: linkUrl,
			link_domain: 'docs.google.com',
			link_id: 'join_form',
			link_source: 'home_story',
			language: 'zh-tw'
		});
	});
});
