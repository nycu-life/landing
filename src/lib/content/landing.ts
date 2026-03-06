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
	title: 'NYCU.LIFE｜關於 NYCU.LIFE 計畫',
	description:
		'NYCU.LIFE 是由陽明交大學生發起的團隊，致力整合校內分散資訊，打造真正好用的數位校園生活平台。'
};

export const navItems: NavItem[] = [
	{ id: 'journeys', label: '計畫簡介', icon: 'spark' },
	{ id: 'umbrella', label: '團隊分工', icon: 'grid' },
	{ id: 'why', label: '核心價值', icon: 'badge' },
	{ id: 'updates', label: '未來合作', icon: 'branch' }
];

export const hero: HeroContent = {
	badge: '由學生發起的校園數位平台',
	title: '關於 NYCU.LIFE 計畫',
	summary:
		'我們是 NYCU.LIFE，一群由陽明交大的學生發起的團隊。因為在校園生活中，查課表、看校車、確認健身房人潮等資訊常分散在不同系統，我們決定從學生實際需求出發，打造真正好用的數位校園生活平台。',
	primaryCtaLabel: '查看計畫內容',
	primaryCtaHref: '#journeys',
	secondaryCtaLabel: 'GitHub 進度',
	secondaryCtaHref: 'https://github.com/nycu-life',
	tags: ['課務資訊', '校車動態', '即時人潮'],
	sceneEyebrow: '從學生日常情境出發',
	sceneTitle: '把分散服務整合成一個入口',
	sceneSummary:
		'我們希望打破校內資訊散落各處的現況，與學校各單位合作，整合大家每天都會用到的服務，讓校園生活的下一步更直覺。',
	sceneNote: '平台功能會持續擴充並對接更多單位。',
	sceneMoments: [
		{
			time: '07:35',
			title: '更直覺的課務資訊',
			summary: '查詢課程與課表不再需要反覆切換多個系統。',
			icon: 'route'
		},
		{
			time: '11:10',
			title: '校園地圖與校車動態',
			summary: '將移動與地點資訊放到同一個產品脈絡中。',
			icon: 'book'
		},
		{
			time: '15:20',
			title: '健身房與游泳池即時人潮',
			summary: '快速掌握場館狀態，減少等待與不確定感。',
			icon: 'pin'
		}
	]
};

export const journeysSection: SectionCopy = {
	eyebrow: '計畫目標',
	title: '打破資訊分散，打造整合式數位校園生活平台',
	summary:
		'目前規劃涵蓋課務資訊、校園地圖與校車動態、宿舍報修追蹤，以及健身房與游泳池即時人潮查詢；未來也會與更多單位合作開發學系博覽會大地遊戲、導覽地圖等加值應用。'
};

export const journeys: JourneyItem[] = [
	{
		id: 'journey-traffic',
		eyebrow: '使用痛點',
		title: '過去資訊分散在不同網頁與系統',
		summary: '學生常在查課表、校車、場館人潮時來回切換平台，流程破碎且耗時。',
		anchorLabel: '了解整合需求',
		pillarId: 'traffic',
		icon: 'route'
	},
	{
		id: 'journey-courses',
		eyebrow: '解法方向',
		title: '以學生真實情境重新設計服務入口',
		summary: '我們從日常決策情境出發，把高頻服務整合為更一致、可讀、易用的體驗。',
		anchorLabel: '查看核心分工',
		pillarId: 'courses',
		icon: 'book'
	},
	{
		id: 'journey-spaces',
		eyebrow: '國際化',
		title: '開發初期即導入完整 i18n 多語系',
		summary: '考量大量外籍師生需求，平台提供全站中英文介面，讓資訊更易於被不同背景使用者理解。',
		anchorLabel: '查看多語與價值',
		pillarId: 'spaces',
		icon: 'pin'
	}
];

export const umbrellaSection = {
	eyebrow: '團隊架構與成員',
	title: '跨域共學，推動校園層級的數位轉型',
	summary:
		'團隊成員來自科技法律學院、資訊學院、電機學院、客家文化學院與博雅書苑，從開發、資安到法規、風險與使用者體驗共同協作。',
	toneLabel: '各組定位',
	highlightsLabel: '主要職責'
};

export const servicePillars: ServicePillar[] = [
	{
		id: 'traffic',
		title: '行政組',
		summary: '負責專案治理與溝通協調，確保跨組合作與外部對接順暢推進。',
		tone: '專案協調與風險管理核心。',
		highlights: [
			'秘書組：專案進度追蹤、跨組溝通協調與團隊行政。',
			'公關組：內外部團隊溝通；法務組：組織發展方向、風險評估與法律指引。'
		],
		touchpoints: ['秘書組', '公關組', '法務組'],
		icon: 'route'
	},
	{
		id: 'courses',
		title: '設計組',
		summary: '負責品牌、介面體驗與對外內容，讓平台在視覺與敘事上維持一致。',
		tone: '品牌與使用者體驗整合中心。',
		highlights: [
			'產品組：品牌視覺呈現、UI/UX 設計與使用者體驗。',
			'行銷組：團隊社群帳號經營與短影音內容製作。'
		],
		touchpoints: ['產品組', '行銷組'],
		icon: 'book'
	},
	{
		id: 'spaces',
		title: '工程組',
		summary: '負責前後端與雙平台 App 開發、基礎設施維運與資安防護。',
		tone: '產品落地與平台穩定性的技術核心。',
		highlights: [
			'開發：前端、後端與雙平台 App 程式設計；維運：伺服器、Kubernetes Cluster 與內部服務。',
			'資安：程式弱點檢查與系統漏洞檢測。'
		],
		touchpoints: ['開發', '維運', '資安'],
		icon: 'pin'
	}
];

export const valuesSection: SectionCopy = {
	eyebrow: '跨域合作價值',
	title: '讓不同背景學生共學，解決真實校園問題',
	summary:
		'從程式開發、資訊安全到法規檢視、風險管理與在地人文考量，NYCU.LIFE 是陽明交大跨域合作的實質展現。'
};

export const valuePillars: ValuePillar[] = [
	{
		title: '跨域協作',
		body: '打破系所界線，讓技術、設計、法務與營運在同一專案節奏中協同。',
		icon: 'layers'
	},
	{
		title: '解決複雜問題',
		body: '以真實校園情境為題，透過跨組合作處理服務整合與治理挑戰。',
		icon: 'pin'
	},
	{
		title: '數位化與國際化',
		body: '以完整中英文介面與一致服務體驗，支持更多元的師生使用情境。',
		icon: 'spark'
	}
];

export const closingSection = {
	eyebrow: '後續發展',
	title: '持續擴充服務，與更多單位共同開發',
	summary:
		'NYCU.LIFE 將持續整合校內高頻服務，並與不同單位共同打造學系博覽會大地遊戲、導覽地圖等加值應用，讓陽明交大在數位化與國際化真正邁進一大步。',
	note: '專案公開進度與更新可於 GitHub 持續追蹤。',
	primaryLabel: '回到頂部',
	primaryHref: '#top',
	secondaryLabel: '追蹤 GitHub',
	secondaryHref: 'https://github.com/nycu-life',
	linksEyebrow: '公開連結',
	linksTitle: '掌握團隊資訊與開發進度',
	footerNote: '若你也關注校園服務整合與跨域共學，歡迎持續關注 NYCU.LIFE。'
};

export const footerLinks: FooterLink[] = [
	{
		label: 'GitHub Organization',
		description: '查看團隊公開專案與最新更新。',
		href: 'https://github.com/nycu-life'
	},
	{
		label: 'Contributors',
		description: '查看公開貢獻紀錄與參與成員。',
		href: 'https://github.com/nycu-life/contributors'
	}
];
