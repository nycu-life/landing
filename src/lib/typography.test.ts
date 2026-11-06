import { describe, expect, it } from 'vitest';
import { formatDateTime, spaceChineseNumbers } from './typography';

describe('generated Chinese display text', () => {
	it('spaces a published date after Intl resolves the Taipei day boundary', () => {
		expect(
			formatDateTime(new Date('2026-11-05T16:30:00Z'), 'zh-tw', {
				dateStyle: 'long',
				timeZone: 'Asia/Taipei'
			})
		).toBe('2026 年 11 月 6 日');
	});

	it('preserves localized time punctuation and English date formatting', () => {
		const date = new Date('2026-11-06T00:30:00Z');
		const options = {
			dateStyle: 'long',
			timeStyle: 'short',
			timeZone: 'Asia/Taipei'
		} as const;
		expect(formatDateTime(date, 'zh-TW', options)).toBe('2026 年 11 月 6 日 上午 8:30');
		expect(formatDateTime(date, 'en', options)).toBe(
			new Intl.DateTimeFormat('en', options).format(date)
		);
	});

	it('handles Arabic episode fallbacks without spacing Chinese numerals or padding twice', () => {
		expect(['第九十九集', '第100集', '第 101 集', 'Episode 100'].map(spaceChineseNumbers)).toEqual([
			'第九十九集',
			'第 100 集',
			'第 101 集',
			'Episode 100'
		]);
	});
});
