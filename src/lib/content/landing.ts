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
	| 'layers';

export type NavItem = {
	id: string;
	label: string;
	icon: IconName;
};

export type SectionCopy = {
	eyebrow: string;
	title: string;
	summary: string;
};

export type HeroMoment = {
	time: string;
	title: string;
	summary: string;
	icon: IconName;
};

export type HeroContent = {
	badge: string;
	title: string;
	summary: string;
	primaryCtaLabel: string;
	primaryCtaHref: string;
	secondaryCtaLabel: string;
	secondaryCtaHref: string;
	tags: string[];
	sceneEyebrow: string;
	sceneTitle: string;
	sceneSummary: string;
	sceneNote: string;
	sceneMoments: HeroMoment[];
};

export type ServicePillarId = 'traffic' | 'courses' | 'spaces';

export type JourneyItem = {
	id: string;
	eyebrow: string;
	title: string;
	summary: string;
	anchorLabel: string;
	pillarId: ServicePillarId;
	icon: IconName;
};

export type ServicePillar = {
	id: ServicePillarId;
	title: string;
	summary: string;
	tone: string;
	highlights: string[];
	touchpoints: string[];
	icon: IconName;
};

export type ValuePillar = {
	title: string;
	body: string;
	icon: IconName;
};

export type FooterLink = {
	label: string;
	description: string;
	href: string;
};

export const pageMeta = {
	title: 'NYCU.LIFE | One front door for transit, courses, and places',
	description:
		'NYCU.LIFE brings transit, courses, and campus place context into one calmer front door for NYCU students.'
};

export const navItems: NavItem[] = [
	{ id: 'journeys', label: 'Journeys', icon: 'spark' },
	{ id: 'umbrella', label: 'Services', icon: 'grid' },
	{ id: 'why', label: 'Why', icon: 'badge' },
	{ id: 'updates', label: 'Updates', icon: 'branch' }
];

export const hero: HeroContent = {
	badge: 'Campus life brand',
	title: 'One front door for transit, courses, and places at NYCU.',
	summary:
		'NYCU.LIFE focuses on the campus switches students repeat every day, then turns them into one calmer, more readable experience.',
	primaryCtaLabel: 'See the three pillars',
	primaryCtaHref: '#journeys',
	secondaryCtaLabel: 'GitHub updates',
	secondaryCtaHref: 'https://github.com/nycu-life',
	tags: ['Transit', 'Courses', 'Places'],
	sceneEyebrow: 'A calmer student day',
	sceneTitle: 'Move through campus with less friction.',
	sceneSummary:
		'Start with movement and course planning, then reconnect classrooms and place context in the same product language.',
	sceneNote:
		'More services to come.',
	sceneMoments: [
		{
			time: '07:35',
			title: 'Check the next ride',
			summary: 'Shuttles, buses, coaches, and campus routes should read like one trip.',
			icon: 'route'
		},
		{
			time: '11:10',
			title: 'Shape the semester faster',
			summary: 'Search, filter, save, and compare without jumping across disconnected tools.',
			icon: 'book'
		},
		{
			time: '15:20',
			title: 'Know where to go next',
			summary: 'Room lookup and place context start with the next step, not a wall of maps.',
			icon: 'pin'
		}
	]
};

export const journeysSection: SectionCopy = {
	eyebrow: 'Student journeys',
	title: 'Campus life feels better when the next step is obvious.',
	summary:
		'NYCU.LIFE begins with the three moments students switch between most.'
};

export const journeys: JourneyItem[] = [
	{
		id: 'journey-traffic',
		eyebrow: 'Before class',
		title: 'Get moving without guessing what to open',
		summary:
			'Transit should feel like one readable flow for students, not several unrelated tools.',
		anchorLabel: 'Explore transit',
		pillarId: 'traffic',
		icon: 'route'
	},
	{
		id: 'journey-courses',
		eyebrow: 'Semester planning',
		title: 'Plan more than a single class result',
		summary:
			'Course discovery should help students compare, save, and shape a semester.',
		anchorLabel: 'Explore courses',
		pillarId: 'courses',
		icon: 'book'
	},
	{
		id: 'journey-spaces',
		eyebrow: 'Between classes',
		title: 'Find the next room with less doubt',
		summary:
			'Start with classrooms and course locations, then grow into a clearer sense of campus.',
		anchorLabel: 'Explore places',
		pillarId: 'spaces',
		icon: 'pin'
	}
];

export const umbrellaSection = {
	eyebrow: 'Service umbrella',
	title: 'Three pillars. One brand.',
	summary:
		'Each pillar solves a different task, but they should still feel like the same campus front door.',
	toneLabel: 'How this should feel',
	highlightsLabel: 'What students get'
};

export const servicePillars: ServicePillar[] = [
	{
		id: 'traffic',
		title: 'Transit',
		summary:
			'A clearer way to see shuttles, buses, coaches, and campus routes in one place.',
		tone: 'Fast to scan. Built around movement, not admin structure.',
		highlights: [
			'Live transit information belongs in one student-facing flow.',
			'Cross-campus routes should read like a trip, not an internal system.'
		],
		touchpoints: ['Shuttle', 'Bus', 'Coach', 'Campus routes'],
		icon: 'route'
	},
	{
		id: 'courses',
		title: 'Courses',
		summary:
			'Course discovery should help students shape a semester, not just search a table.',
		tone: 'Focused, flexible, and easy to compare.',
		highlights: [
			'Search and advanced filters reduce guesswork across semesters.',
			'Favorites, schedule planning, and stats keep the semester readable.'
		],
		touchpoints: ['Search', 'Filter', 'Save', 'Schedule'],
		icon: 'book'
	},
	{
		id: 'spaces',
		title: 'Places',
		summary:
			'Start with classrooms and course locations, then grow into a clearer sense of campus.',
		tone: 'Useful today, honest about what is still growing.',
		highlights: [
			'Room lookup and course locations already make the next move clearer.',
			'We describe this as place context, not a complete map product.'
		],
		touchpoints: ['Rooms', 'Locations', 'Place context'],
		icon: 'pin'
	}
];

export const valuesSection: SectionCopy = {
	eyebrow: 'Why NYCU.LIFE',
	title: 'Less noise. Better orientation.',
	summary:
		'The goal is not to show everything. The goal is to make the next action easier.'
};

export const valuePillars: ValuePillar[] = [
	{
		title: 'Fewer switches',
		body: 'Move between transit, courses, and places without relearning the interface each time.',
		icon: 'layers'
	},
	{
		title: 'Less ambiguity',
		body: 'Know what to open, where to go, and what the next step is.',
		icon: 'pin'
	},
	{
		title: 'More like student life',
		body: 'The story starts from real campus moments, not backend boundaries.',
		icon: 'spark'
	}
];

export const closingSection = {
	eyebrow: 'Updates',
	title: 'NYCU.LIFE is growing as a quieter campus front door.',
	summary:
		'Transit and courses already have real product ground behind them. Place context expands from the same student day.',
	note: 'Public updates stay on GitHub.',
	primaryLabel: 'Back to top',
	primaryHref: '#top',
	secondaryLabel: 'Follow GitHub',
	secondaryHref: 'https://github.com/nycu-life',
	linksEyebrow: 'Public links',
	linksTitle: 'Follow the brand, not the noise.',
	footerNote: 'NYCU.LIFE is for students, clubs, and campus tools that still need a clearer home.'
};

export const footerLinks: FooterLink[] = [
	{
		label: 'GitHub organization',
		description: 'Public updates and open projects live here.',
		href: 'https://github.com/nycu-life'
	},
	{
		label: 'Contributors',
		description: 'Public contribution history stays visible here.',
		href: 'https://github.com/nycu-life/contributors'
	}
];
