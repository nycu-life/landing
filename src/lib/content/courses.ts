import { m } from '$lib/paraglide/messages';
import { INSTAGRAM_URL } from './landing';

/**
 * 課程專區 — club-run course cards (Luma-inspired, from the 0610 design).
 * Two shelves: upcoming (open enrollment) and the archive. Sign-ups are
 * announced on Instagram, so every live CTA points there until a real
 * registration form exists.
 */
type Message = () => string;

export type Course = {
	id: string;
	/** Accent colour for the enrollment tag (upcoming cards only). */
	accent: string;
	code: Message;
	tag: Message;
	title: Message;
	date: Message;
	location: Message;
};

export const coursesSignupHref = INSTAGRAM_URL;

export const coursesTabs = {
	label: m.courses_tabs_label,
	upcoming: m.courses_tab_upcoming,
	archive: m.courses_tab_archive
};

export const courseCardLabels = {
	signup: m.courses_signup,
	ended: m.courses_ended
};

export const upcomingCourses: Course[] = [
	{
		id: 'nextjs',
		accent: '#4D7FFF',
		code: m.course_nextjs_code,
		tag: m.course_nextjs_tag,
		title: m.course_nextjs_title,
		date: m.course_nextjs_date,
		location: m.course_nextjs_location
	},
	{
		id: 'nodems',
		accent: '#A3E052',
		code: m.course_nodems_code,
		tag: m.course_nodems_tag,
		title: m.course_nodems_title,
		date: m.course_nodems_date,
		location: m.course_nodems_location
	},
	{
		id: 'figma',
		accent: '#E5B54D',
		code: m.course_figma_code,
		tag: m.course_figma_tag,
		title: m.course_figma_title,
		date: m.course_figma_date,
		location: m.course_figma_location
	}
];

export const archivedCourses: Course[] = [
	{
		id: 'hooks',
		accent: '#4D7FFF',
		code: m.course_hooks_code,
		tag: m.course_hooks_tag,
		title: m.course_hooks_title,
		date: m.course_hooks_date,
		location: m.course_hooks_location
	},
	{
		id: 'ts',
		accent: '#A3E052',
		code: m.course_ts_code,
		tag: m.course_ts_tag,
		title: m.course_ts_title,
		date: m.course_ts_date,
		location: m.course_ts_location
	},
	{
		id: 'git',
		accent: '#E5B54D',
		code: m.course_git_code,
		tag: m.course_git_tag,
		title: m.course_git_title,
		date: m.course_git_date,
		location: m.course_git_location
	}
];
