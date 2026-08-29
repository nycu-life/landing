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
	| 'youtube'
	| 'github'
	| 'linkedin'
	| 'mail'
	| 'link'
	| 'code'
	| 'palette'
	| 'building'
	| 'scale'
	| 'users';

/** Brand links used across the site. */
export const INSTAGRAM_URL = 'https://instagram.com/nycu.life';
export const YOUTUBE_URL = 'https://www.youtube.com/@NYCU_LIFE';
export const GITHUB_URL = 'https://github.com/nycu-life';
export const WEBSITE_URL = 'https://nycu.one';
export const EVENTS_URL = 'https://events.life.nycu.edu.tw/';
export const CONTACT_EMAIL = 'life@nycu.edu.tw';
export const JOIN_FORM_URL =
	'https://docs.google.com/forms/d/e/1FAIpQLScCEb5rf9pGfClM68q6TjgpP_EAqatZo4MLwPoMTpqRfmq9Qg/viewform';

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
/* App shell — burger menu IA + home hero                                     */
/* -------------------------------------------------------------------------- */

/** The four destinations reachable from the burger menu. */
export type MenuTarget = 'products' | 'about' | 'courses' | 'devlog';

export type MenuItem = {
	/** Two-digit ordinal shown beside the label, e.g. "01". */
	num: string;
	target: MenuTarget;
	/** Localised label (used in the burger menu rows). */
	label: Message;
	/** Latin sub-label, e.g. "All products". */
	latin: Message;
	/** One-line description (menu + page lede). */
	desc: Message;
	/** Destination page H1, split so the second part renders in the accent gradient. */
	titleLead: Message;
	titleAccent: Message;
	/** Thematic label shown on the right of the page eyebrow (Latin, both locales). */
	eyebrowRight: string;
	/** Route path (combine with `base` from $app/paths; keep the trailing slash). */
	path: string;
};

export const menuItems: MenuItem[] = [
	{
		num: '01',
		target: 'products',
		label: m.menu_products,
		latin: m.menu_products_latin,
		desc: m.menu_products_desc,
		titleLead: m.page_products_lead,
		titleAccent: m.page_products_accent,
		eyebrowRight: 'GLASS SHELF',
		path: '/products/'
	},
	{
		num: '02',
		target: 'about',
		label: m.menu_about,
		latin: m.menu_about_latin,
		desc: m.menu_about_desc,
		titleLead: m.page_about_lead,
		titleAccent: m.page_about_accent,
		eyebrowRight: 'STUDENT-BUILT',
		path: '/about/'
	},
	{
		num: '03',
		target: 'courses',
		label: m.menu_courses,
		latin: m.menu_courses_latin,
		desc: m.menu_courses_desc,
		titleLead: m.page_courses_lead,
		titleAccent: m.page_courses_accent,
		eyebrowRight: 'LEARN TOGETHER',
		path: '/courses/'
	},
	{
		num: '04',
		target: 'devlog',
		label: m.menu_devlog,
		latin: m.menu_devlog_latin,
		desc: m.menu_devlog_desc,
		titleLead: m.page_devlog_lead,
		titleAccent: m.page_devlog_accent,
		eyebrowRight: 'NIGHTLY READING',
		path: '/devlog/'
	}
];

/** Home hero — the prototype's "debug your NYCU LIFE problems" treatment. */
export const appHero = {
	kickerLeft: m.app_kicker_left,
	kickerRight: m.app_kicker_right,
	line1: m.app_hero_line1,
	accent: m.app_hero_accent,
	line3: m.app_hero_line3,
	lede: m.app_hero_lede
};

/** Shared "coming soon" copy for not-yet-real sections. */
export const comingSoon = {
	label: m.coming_soon_label,
	body: m.coming_soon_body
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
	/** Glyph drawn on the tile (see ProductIcon.svelte). */
	glyph: 'bus' | 'coz' | 'activity' | 'map';
	/** Short Latin descriptor shown on the tile (same in both locales). */
	latin: string;
	/** Real product screens shown in the phone, or undefined for not-yet-shipped products. The
	 * first is the stable landing preview; `darkSrc` swaps in under the dark theme. */
	screens?: { src: string; darkSrc?: string; position?: string }[];
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
		glyph: 'bus',
		latin: 'Campus shuttle',
		screens: [1, 2, 3, 4].map((n) => ({
			src: `/products/bus-phone-${n}.png`,
			darkSrc: `/products/bus-phone-${n}-dark.png`
		})),
		href: 'https://bus.nycu.one',
		name: m.product_bus_name,
		summary: m.product_bus_summary,
		features: [m.product_bus_feature_1, m.product_bus_feature_2, m.product_bus_feature_3]
	},
	{
		id: 'coz',
		accent: 'lime',
		status: 'live',
		glyph: 'coz',
		latin: 'Course explorer',
		screens: [{ src: '/products/coz-mobile.png' }],
		href: 'https://coz.nycu.one',
		name: m.product_coz_name,
		summary: m.product_coz_summary,
		features: [m.product_coz_feature_1, m.product_coz_feature_2, m.product_coz_feature_3]
	},
	{
		id: 'activity',
		accent: 'sun',
		status: 'live',
		glyph: 'activity',
		latin: 'Campus events',
		// The source is currently desktop-only; bias the phone crop toward the search and cards.
		screens: [{ src: '/products/activity.png', position: '37% top' }],
		href: EVENTS_URL,
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
		glyph: 'map',
		latin: 'Campus map',
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

// Team copy (chrome). The member roster + per-member profile pages live in
// src/lib/content/team.ts (single source of truth, prerendered at /team/<slug>).
export const teamSection = {
	eyebrow: m.team_eyebrow,
	title: m.team_title,
	lede: m.team_lede,
	roleLabel: m.team_role_label,
	moreLabel: m.team_more_label,
	moreBody: m.team_more_body
};

export const joinSection = {
	title: m.join_title,
	lede: m.join_lede,
	cta: { label: m.join_cta, href: JOIN_FORM_URL }
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
	{ label: m.footer_youtube, href: YOUTUBE_URL, icon: 'youtube' },
	{ label: m.footer_github, href: GITHUB_URL, icon: 'github' },
	{ label: m.footer_website, href: WEBSITE_URL, icon: 'globe' }
];
