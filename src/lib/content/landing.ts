import { m } from '$lib/paraglide/messages';

/**
 * The landing page is fully data-driven. Structural data (ids, links, status,
 * screenshot paths, accent tones) lives here, while every piece of display copy
 * is resolved through a Paraglide message function so the page stays bilingual
 * (zh-tw / en) without duplicating layout.
 *
 * `Message` is the shape of a Paraglide message accessor: call it to get the
 * string for the active locale.
 */
type Message = () => string;

export type IconName =
	| 'spark'
	| 'arrow'
	| 'check'
	| 'route'
	| 'book'
	| 'pin'
	| 'globe'
	| 'instagram'
	| 'github'
	| 'linkedin';

/** Brand links used across the site. */
export const INSTAGRAM_URL = 'https://instagram.com/nycu.life';
export const GITHUB_URL = 'https://github.com/nycu-life';
export const WEBSITE_URL = 'https://nycu.one';

/** A section that can be reached from the header navigation. */
export type SectionId = 'products' | 'courses' | 'devlog' | 'team';

export type NavItem = {
	id: SectionId;
	label: Message;
};

export const navItems: NavItem[] = [
	{ id: 'products', label: m.nav_products },
	{ id: 'courses', label: m.nav_courses },
	{ id: 'devlog', label: m.nav_devlog },
	{ id: 'team', label: m.nav_team }
];

export const pageMeta = {
	title: m.meta_title,
	description: m.meta_description
};

export const brand = {
	name: m.brand_name,
	tagline: m.brand_tagline
};

export const hero = {
	eyebrow: m.hero_eyebrow,
	title: m.hero_title,
	subtitle: m.hero_subtitle,
	lede: m.hero_lede,
	primaryCta: { label: m.hero_cta_primary, href: '#products' },
	secondaryCta: { label: m.hero_cta_secondary, href: INSTAGRAM_URL },
	image: { src: '/products/bus.png', caption: m.hero_image_caption }
};

/* -------------------------------------------------------------------------- */
/* Why NYCU LIFE — pain → answer                                              */
/* -------------------------------------------------------------------------- */

export type PainPoint = {
	id: string;
	icon: IconName;
	pain: Message;
	answer: Message;
};

export const whySection = {
	eyebrow: m.why_eyebrow,
	title: m.why_title,
	lede: m.why_lede,
	painLabel: m.why_pain_label,
	answerLabel: m.why_answer_label
};

export const painPoints: PainPoint[] = [
	{ id: 'bus', icon: 'route', pain: m.why_bus_pain, answer: m.why_bus_answer },
	{ id: 'info', icon: 'spark', pain: m.why_info_pain, answer: m.why_info_answer },
	{ id: 'course', icon: 'book', pain: m.why_course_pain, answer: m.why_course_answer },
	{ id: 'commute', icon: 'pin', pain: m.why_commute_pain, answer: m.why_commute_answer }
];

/* -------------------------------------------------------------------------- */
/* Products                                                                   */
/* -------------------------------------------------------------------------- */

export type ProductStatus = 'live' | 'soon' | 'dev';

export type Product = {
	id: string;
	accent: 'blue' | 'lime' | 'sun';
	status: ProductStatus;
	/** A real product screenshot, or undefined for not-yet-shipped products. */
	screenshot?: { src: string; frame: 'browser' | 'phone' };
	/** Optional link to the live product. */
	href?: string;
	name: Message;
	summary: Message;
	features: Message[];
};

export const productsSection = {
	eyebrow: m.products_eyebrow,
	title: m.products_title,
	lede: m.products_lede,
	featuresLabel: m.products_features_label,
	visitLabel: m.products_visit
};

export const productStatusLabel: Record<ProductStatus, Message> = {
	live: m.products_status_live,
	soon: m.products_status_soon,
	dev: m.products_status_dev
};

export const products: Product[] = [
	{
		id: 'bus',
		accent: 'blue',
		status: 'live',
		screenshot: { src: '/products/bus.png', frame: 'browser' },
		href: 'https://bus.nycu.one',
		name: m.product_bus_name,
		summary: m.product_bus_summary,
		features: [m.product_bus_feature_1, m.product_bus_feature_2, m.product_bus_feature_3]
	},
	{
		id: 'coz',
		accent: 'lime',
		status: 'live',
		screenshot: { src: '/products/coz.png', frame: 'browser' },
		href: 'https://coz.nycu.one',
		name: m.product_coz_name,
		summary: m.product_coz_summary,
		features: [m.product_coz_feature_1, m.product_coz_feature_2, m.product_coz_feature_3]
	},
	{
		id: 'activity',
		accent: 'sun',
		status: 'soon',
		screenshot: { src: '/products/activity.png', frame: 'browser' },
		name: m.product_activity_name,
		summary: m.product_activity_summary,
		features: [
			m.product_activity_feature_1,
			m.product_activity_feature_2,
			m.product_activity_feature_3
		]
	},
	{
		id: 'map',
		accent: 'blue',
		status: 'dev',
		name: m.product_map_name,
		summary: m.product_map_summary,
		features: [m.product_map_feature_1, m.product_map_feature_2, m.product_map_feature_3]
	}
];

/* -------------------------------------------------------------------------- */
/* Course zone — NYCozU highlight                                             */
/* -------------------------------------------------------------------------- */

export type CoursePoint = {
	title: Message;
	body: Message;
};

export const courseSection = {
	eyebrow: m.course_eyebrow,
	title: m.course_title,
	lede: m.course_lede,
	cta: { label: m.course_cta, href: 'https://coz.nycu.one' },
	image: { src: '/products/coz.png', caption: m.course_image_caption }
};

export const coursePoints: CoursePoint[] = [
	{ title: m.course_point_1_title, body: m.course_point_1_body },
	{ title: m.course_point_2_title, body: m.course_point_2_body },
	{ title: m.course_point_3_title, body: m.course_point_3_body }
];

/* -------------------------------------------------------------------------- */
/* Dev log                                                                    */
/* -------------------------------------------------------------------------- */

export type DevLogEntry = {
	id: string;
	status: ProductStatus | 'done';
	date: Message;
	title: Message;
	body: Message;
};

export const devLogSection = {
	eyebrow: m.devlog_eyebrow,
	title: m.devlog_title,
	lede: m.devlog_lede
};

export const devLogEntries: DevLogEntry[] = [
	{
		id: 'eta',
		status: 'done',
		date: m.devlog_1_date,
		title: m.devlog_1_title,
		body: m.devlog_1_body
	},
	{
		id: 'courses',
		status: 'done',
		date: m.devlog_2_date,
		title: m.devlog_2_title,
		body: m.devlog_2_body
	},
	{
		id: 'activity',
		status: 'soon',
		date: m.devlog_3_date,
		title: m.devlog_3_title,
		body: m.devlog_3_body
	},
	{
		id: 'map',
		status: 'dev',
		date: m.devlog_4_date,
		title: m.devlog_4_title,
		body: m.devlog_4_body
	}
];

/* -------------------------------------------------------------------------- */
/* Team — organized by department                                             */
/* -------------------------------------------------------------------------- */

export type TeamMember = {
	id: string;
	/** Optional photo URL; the UI falls back to initials when absent. */
	photo?: string;
	name: Message;
	role: Message;
	linkedin?: string;
};

export type Department = {
	id: string;
	label: Message;
	members: TeamMember[];
};

export const teamSection = {
	eyebrow: m.team_eyebrow,
	title: m.team_title,
	lede: m.team_lede,
	roleLabel: m.team_role_label,
	linkedinLabel: m.team_linkedin,
	moreLabel: m.team_more_label,
	moreBody: m.team_more_body
};

/**
 * Departments mirror the team's real org structure. We only list the members
 * we actually know and leave the remaining departments as clean, fillable
 * slots (rendered via the "more members joining" affordance) rather than
 * inventing names.
 */
// Departments mirror the team's real org structure. Members are intentionally
// left empty for now — the team will fill in name/role/intro/LinkedIn/photo
// later; until then each department renders the "more members joining" slot.
// PM is omitted on purpose: PMs already appear within their own department.
export const departments: Department[] = [
	{
		id: 'engineering',
		label: m.dept_engineering,
		members: []
	},
	{
		id: 'design',
		label: m.dept_design,
		members: []
	},
	{
		id: 'marketing',
		label: m.dept_marketing,
		members: []
	},
	{
		id: 'admin',
		label: m.dept_admin,
		members: []
	},
	{
		id: 'legal',
		label: m.dept_legal,
		members: []
	}
];

export const joinSection = {
	title: m.join_title,
	lede: m.join_lede,
	cta: { label: m.join_cta, href: INSTAGRAM_URL }
};

/* -------------------------------------------------------------------------- */
/* Footer                                                                     */
/* -------------------------------------------------------------------------- */

export type FooterLink = {
	label: Message;
	href: string;
	icon: IconName;
};

export const footer = {
	tagline: m.footer_tagline,
	linksLabel: m.footer_links_label,
	localeLabel: m.footer_locale_label,
	rights: m.footer_rights,
	backToTop: m.footer_back_to_top
};

export const footerLinks: FooterLink[] = [
	{ label: m.footer_instagram, href: INSTAGRAM_URL, icon: 'instagram' },
	{ label: m.footer_github, href: GITHUB_URL, icon: 'github' },
	{ label: m.footer_website, href: WEBSITE_URL, icon: 'globe' }
];
