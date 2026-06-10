import { m } from '$lib/paraglide/messages';
import { GITHUB_URL, INSTAGRAM_URL, WEBSITE_URL } from './landing';

/**
 * About page = a stack of collapsing "folder" cards (timeline / teams / faq /
 * contact). Copy lives in Paraglide messages; this module shapes it. Folder
 * accents follow the guide's brand palette (blue → green → gold).
 */
type Message = () => string;

export type AboutFolderId = 'timeline' | 'teams' | 'faq' | 'contact';

export type AboutFolder = {
	id: AboutFolderId;
	num: string;
	title: Message;
	latin: Message;
	/** Accent glow colour for the folder tab. */
	accent: string;
};

export const aboutLede = [m.about_lede_1, m.about_lede_2];

export const aboutFolders: AboutFolder[] = [
	{
		id: 'timeline',
		num: '01',
		title: m.about_folder_timeline_title,
		latin: m.about_folder_timeline_latin,
		accent: '#2F60DA'
	},
	{
		id: 'teams',
		num: '02',
		title: m.about_folder_teams_title,
		latin: m.about_folder_teams_latin,
		accent: '#527AE0'
	},
	{
		id: 'faq',
		num: '03',
		title: m.about_folder_faq_title,
		latin: m.about_folder_faq_latin,
		accent: '#A3E052'
	},
	{
		id: 'contact',
		num: '04',
		title: m.about_folder_contact_title,
		latin: m.about_folder_contact_latin,
		accent: '#E5B54D'
	}
];

/* ---- 01 · Timeline -------------------------------------------------------- */

export type TimelineEvent = {
	date: Message;
	title: Message;
	desc: Message;
	/** 'start' = founding node, 'now' = the current waypoint. */
	kind?: 'start' | 'now';
};

export const timelineEvents: TimelineEvent[] = [
	{ date: m.about_tl_1_date, title: m.about_tl_1_title, desc: m.about_tl_1_desc, kind: 'start' },
	{ date: m.about_tl_2_date, title: m.about_tl_2_title, desc: m.about_tl_2_desc },
	{ date: m.about_tl_3_date, title: m.about_tl_3_title, desc: m.about_tl_3_desc },
	{ date: m.about_tl_4_date, title: m.about_tl_4_title, desc: m.about_tl_4_desc },
	{ date: m.about_tl_5_date, title: m.about_tl_5_title, desc: m.about_tl_5_desc },
	{ date: m.about_tl_6_date, title: m.about_tl_6_title, desc: m.about_tl_6_desc, kind: 'now' }
];

/* ---- 03 · FAQ -------------------------------------------------------------- */

export type FaqItem = { q: Message; a: Message };

export const faqItems: FaqItem[] = [
	{ q: m.about_faq_1_q, a: m.about_faq_1_a },
	{ q: m.about_faq_2_q, a: m.about_faq_2_a },
	{ q: m.about_faq_3_q, a: m.about_faq_3_a },
	{ q: m.about_faq_4_q, a: m.about_faq_4_a },
	{ q: m.about_faq_5_q, a: m.about_faq_5_a }
];

/* ---- 04 · Contact / join --------------------------------------------------- */

export type ContactRow = {
	label: Message | string;
	value: string;
	href: string;
	icon: 'instagram' | 'github' | 'globe';
};

export const contactRows: ContactRow[] = [
	{ label: 'Instagram', value: '@nycu.life', href: INSTAGRAM_URL, icon: 'instagram' },
	{ label: 'GitHub', value: 'github.com/nycu-life', href: GITHUB_URL, icon: 'github' },
	{ label: m.about_contact_website_label, value: 'nycu.one', href: WEBSITE_URL, icon: 'globe' }
];

export const aboutJoin = {
	title: m.about_join_title,
	sub: m.about_join_sub,
	href: INSTAGRAM_URL
};
