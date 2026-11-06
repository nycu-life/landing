import { toChineseNumeral } from '$lib/comics';
import { localeState } from '$lib/i18n.svelte';
import { m } from '$lib/paraglide/messages';
import { formatDateTime, spaceChineseNumbers } from '$lib/typography';

/** 第一集 / Episode 1 — follows the live locale toggle. */
export const episodeLabel = (n: number): string =>
	spaceChineseNumbers(
		m.comics_episode_label({
			number: localeState.current === 'zh-tw' ? toChineseNumeral(n) : String(n)
		})
	);

/** Ghost titles are used as-is; untitled episodes get the localized placeholder. */
export const episodeTitle = (title: string | null): string => title ?? m.comics_placeholder_title();

export const formatPublished = (iso: string): string =>
	formatDateTime(new Date(iso), localeState.current, {
		dateStyle: 'long',
		timeZone: 'Asia/Taipei'
	});
