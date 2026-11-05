import { m } from '$lib/paraglide/messages';

/**
 * About page = a stack of collapsing "folder" cards. `state` is the swap
 * mechanism: 'soon' folders render <ComingSoon/>; flip to 'ready' and point
 * the body at a real component when the content exists. No fabricated data.
 */
type Message = () => string;

export type FolderState = 'ready' | 'soon';
export type AboutFolderId = 'timeline' | 'teams' | 'faq' | 'contact';

export type AboutFolder = {
	id: AboutFolderId;
	num: string;
	title: Message;
	latin: Message;
	/** Accent glow colour for the folder tab. */
	accent: string;
	state: FolderState;
};

export const aboutFolders: AboutFolder[] = [
	{
		id: 'timeline',
		num: '01',
		title: m.about_folder_timeline_title,
		latin: m.about_folder_timeline_latin,
		accent: '#2F60DA',
		state: 'soon'
	},
	{
		id: 'teams',
		num: '02',
		title: m.about_folder_teams_title,
		latin: m.about_folder_teams_latin,
		accent: '#527AE0',
		state: 'ready'
	},
	{
		id: 'faq',
		num: '03',
		title: m.about_folder_faq_title,
		latin: m.about_folder_faq_latin,
		accent: '#A3E052',
		state: 'soon'
	},
	{
		id: 'contact',
		num: '04',
		title: m.about_folder_contact_title,
		latin: m.about_folder_contact_latin,
		accent: '#E5B54D',
		state: 'ready'
	}
];

/* ── /about/ page (#106): vision cards, team film, milestone path ─────────────────── */

export type VisionCard = {
	id: 'integrate' | 'realtime' | 'students';
	title: Message;
	body: Message;
	/** Amber's per-card animation (Lottie/video) lands here; until then a CSS motif renders. */
	art?: string;
};

export const visionCards: VisionCard[] = [
	{ id: 'integrate', title: m.about_vision_1_title, body: m.about_vision_1_body },
	{ id: 'realtime', title: m.about_vision_2_title, body: m.about_vision_2_body },
	{ id: 'students', title: m.about_vision_3_title, body: m.about_vision_3_body }
];

export const TEAM_FILM_ID = 'WbndciSLhD8';

export type Milestone = {
	id: string;
	date: Message;
	title: Message;
	body: Message;
	/** Future milestones render hollow. */
	upcoming?: boolean;
};

/* Real milestones only, chronological. Copy is shared with the former devlog cards. */
export const milestones: Milestone[] = [
	{ id: 'bus-eta', date: m.devlog_1_date, title: m.devlog_1_title, body: m.devlog_1_body },
	{ id: 'nycozu', date: m.devlog_2_date, title: m.devlog_2_title, body: m.devlog_2_body },
	{
		id: 'wishpool',
		date: m.about_milestone_wish_date,
		title: m.about_milestone_wish_title,
		body: m.about_milestone_wish_body
	},
	{
		id: 'activity',
		date: m.devlog_3_date,
		title: m.devlog_3_title,
		body: m.devlog_3_body,
		upcoming: true
	},
	{
		id: 'map',
		date: m.devlog_4_date,
		title: m.devlog_4_title,
		body: m.devlog_4_body,
		upcoming: true
	}
];
