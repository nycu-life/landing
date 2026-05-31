import { m } from '$lib/paraglide/messages';

/**
 * The landing page is fully data-driven. Structural data (ids, icons, links,
 * accent tones, photo paths) lives here, while every piece of display copy is
 * resolved through a Paraglide message function so the page stays bilingual
 * (zh-tw / en) without duplicating layout.
 *
 * `Message` is the shape of a Paraglide message accessor: call it to get the
 * string for the active locale.
 */
type Message = () => string;

export type IconName =
	| 'spark'
	| 'grid'
	| 'shield'
	| 'people'
	| 'branch'
	| 'globe'
	| 'arrow'
	| 'badge'
	| 'route'
	| 'book'
	| 'pin'
	| 'layers'
	| 'apple'
	| 'play'
	| 'linkedin';

/** A section that can be reached from the numbered menu navigation. */
export type SectionId = 'services' | 'team' | 'about' | 'join';

export type NavItem = {
	id: SectionId;
	/** Two-digit index rendered as "01", "02", ... */
	index: string;
	label: Message;
};

export type DownloadKind = 'appstore' | 'googleplay' | 'web';

export type DownloadLink = {
	kind: DownloadKind;
	label: Message;
	href: string;
	icon: IconName;
};

export type ServiceId = 'bus' | 'courses' | 'places';

export type Service = {
	id: ServiceId;
	/** Two-digit index rendered alongside the service. */
	index: string;
	icon: IconName;
	/** Accent tone token used for the per-service treatment. */
	accent: 'cobalt' | 'lime' | 'sun';
	name: Message;
	summary: Message;
	blurb: Message;
	features: Message[];
	downloads: DownloadLink[];
};

export type TeamMember = {
	id: string;
	/** Optional photo URL; the UI falls back to initials when absent. */
	photo?: string;
	name: Message;
	group: Message;
	intro: Message;
	linkedin?: string;
};

export type ValuePillar = {
	icon: IconName;
	title: Message;
	body: Message;
};

export type FooterLink = {
	label: Message;
	href: string;
	icon: IconName;
};

export const GITHUB_URL = 'https://github.com/nycu-life';

export const pageMeta = {
	title: m.meta_title,
	description: m.meta_description
};

export const brand = {
	name: m.brand_name,
	tagline: m.brand_tagline
};

export const navItems: NavItem[] = [
	{ id: 'services', index: '01', label: m.nav_services },
	{ id: 'team', index: '02', label: m.nav_team },
	{ id: 'about', index: '03', label: m.nav_about },
	{ id: 'join', index: '04', label: m.nav_join }
];

export const hero = {
	eyebrow: m.hero_eyebrow,
	titleLines: [m.hero_title_line_1, m.hero_title_line_2, m.hero_title_line_3] as Message[],
	lede: m.hero_lede,
	primaryCta: { label: m.hero_cta_primary, href: '#services' },
	secondaryCta: { label: m.hero_cta_secondary, href: GITHUB_URL },
	marquee: m.hero_marquee,
	imageCaption: m.hero_image_caption
};

export const servicesSection = {
	index: m.services_index,
	eyebrow: m.services_eyebrow,
	title: m.services_title,
	lede: m.services_lede,
	blurbLabel: m.services_blurb_label,
	featuresLabel: m.services_features_label
};

export const services: Service[] = [
	{
		id: 'bus',
		index: '01',
		icon: 'route',
		accent: 'cobalt',
		name: m.service_bus_name,
		summary: m.service_bus_summary,
		blurb: m.service_bus_blurb,
		features: [m.service_bus_feature_1, m.service_bus_feature_2, m.service_bus_feature_3],
		downloads: [
			{ kind: 'appstore', label: m.services_download_appstore, href: '#', icon: 'apple' },
			{ kind: 'googleplay', label: m.services_download_googleplay, href: '#', icon: 'play' },
			{ kind: 'web', label: m.services_download_web, href: '#', icon: 'globe' }
		]
	},
	{
		id: 'courses',
		index: '02',
		icon: 'book',
		accent: 'lime',
		name: m.service_courses_name,
		summary: m.service_courses_summary,
		blurb: m.service_courses_blurb,
		features: [
			m.service_courses_feature_1,
			m.service_courses_feature_2,
			m.service_courses_feature_3
		],
		downloads: [
			{ kind: 'web', label: m.services_download_web, href: '#', icon: 'globe' },
			{ kind: 'appstore', label: m.services_download_appstore, href: '#', icon: 'apple' }
		]
	},
	{
		id: 'places',
		index: '03',
		icon: 'pin',
		accent: 'sun',
		name: m.service_places_name,
		summary: m.service_places_summary,
		blurb: m.service_places_blurb,
		features: [m.service_places_feature_1, m.service_places_feature_2, m.service_places_feature_3],
		downloads: [{ kind: 'web', label: m.services_download_web, href: '#', icon: 'globe' }]
	}
];

export const teamSection = {
	index: m.team_index,
	eyebrow: m.team_eyebrow,
	title: m.team_title,
	lede: m.team_lede,
	roleLabel: m.team_role_label,
	linkedinLabel: m.team_linkedin
};

export const teamMembers: TeamMember[] = [
	{
		id: 'lead',
		name: m.member_lead_name,
		group: m.member_lead_group,
		intro: m.member_lead_intro,
		linkedin: GITHUB_URL
	},
	{
		id: 'design',
		name: m.member_design_name,
		group: m.member_design_group,
		intro: m.member_design_intro
	},
	{
		id: 'backend',
		name: m.member_backend_name,
		group: m.member_backend_group,
		intro: m.member_backend_intro,
		linkedin: GITHUB_URL
	}
];

export const joinSection = {
	title: m.join_title,
	lede: m.join_lede,
	cta: { label: m.join_cta, href: GITHUB_URL }
};

export const aboutSection = {
	index: m.about_index,
	eyebrow: m.about_eyebrow,
	title: m.about_title,
	statement: m.about_statement
};

export const aboutValues: ValuePillar[] = [
	{ icon: 'layers', title: m.about_value_1_title, body: m.about_value_1_body },
	{ icon: 'pin', title: m.about_value_2_title, body: m.about_value_2_body },
	{ icon: 'spark', title: m.about_value_3_title, body: m.about_value_3_body }
];

export const footer = {
	tagline: m.footer_tagline,
	linksLabel: m.footer_links_label,
	localeLabel: m.footer_locale_label,
	rights: m.footer_rights,
	backToTop: m.footer_back_to_top
};

export const footerLinks: FooterLink[] = [
	{ label: m.footer_github, href: GITHUB_URL, icon: 'branch' },
	{ label: m.footer_contributors, href: `${GITHUB_URL}/contributors`, icon: 'people' }
];
