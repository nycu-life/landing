import { toChineseNumeral } from '$lib/comics';
import { localeState } from '$lib/i18n.svelte';
import { m } from '$lib/paraglide/messages';

/** 第一集 / Episode 1 — follows the live locale toggle. */
export const episodeLabel = (n: number): string =>
	m.comics_episode_label({
		number: localeState.current === 'zh-tw' ? toChineseNumeral(n) : String(n)
	});

/** Ghost titles are used as-is; untitled placeholder episodes get "[本集標題]" / "[Episode title]". */
export const episodeTitle = (title: string | null): string => title ?? m.comics_placeholder_title();

export const formatPublished = (iso: string): string =>
	new Intl.DateTimeFormat(localeState.current === 'zh-tw' ? 'zh-TW' : 'en', {
		dateStyle: 'long',
		timeZone: 'Asia/Taipei'
	}).format(new Date(iso));
