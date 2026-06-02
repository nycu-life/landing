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
		accent: '#8B6BFF',
		state: 'soon'
	},
	{
		id: 'teams',
		num: '02',
		title: m.about_folder_teams_title,
		latin: m.about_folder_teams_latin,
		accent: '#38C6F4',
		state: 'ready'
	},
	{
		id: 'faq',
		num: '03',
		title: m.about_folder_faq_title,
		latin: m.about_folder_faq_latin,
		accent: '#6D7BFF',
		state: 'soon'
	},
	{
		id: 'contact',
		num: '04',
		title: m.about_folder_contact_title,
		latin: m.about_folder_contact_latin,
		accent: '#B66BFF',
		state: 'ready'
	}
];
