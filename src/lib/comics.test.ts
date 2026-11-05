import { describe, expect, it } from 'vitest';
import { padEpisode, toChineseNumeral, toSummary } from './comics';
import { placeholderEpisodes } from './content/comics';

describe('comics helpers', () => {
	it('spells episode numbers as Traditional Chinese numerals', () => {
		expect([1, 2, 9, 10, 11, 20, 21, 99].map(toChineseNumeral)).toEqual([
			'一',
			'二',
			'九',
			'十',
			'十一',
			'二十',
			'二十一',
			'九十九'
		]);
		expect(toChineseNumeral(100)).toBe('100');
		expect(toChineseNumeral(0)).toBe('0');
	});

	it('pads the cover mark and strips html from summaries', () => {
		expect(padEpisode(1)).toBe('01');
		expect(padEpisode(12)).toBe('12');
		expect(toSummary({ ...placeholderEpisodes[0], html: '<p>x</p>' })).not.toHaveProperty('html');
	});

	it('ships the 10 placeholder episodes from the design', () => {
		expect(placeholderEpisodes).toHaveLength(10);
		expect(placeholderEpisodes[0]).toMatchObject({
			slug: 'ep-01',
			number: 1,
			title: '小貢上大學了'
		});
		expect(placeholderEpisodes.slice(1).every((episode) => episode.title === null)).toBe(true);
	});
});
