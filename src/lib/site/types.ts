/** Published Ghost Pages form a locale-specific site catalog. No API keys cross this boundary. */
export const siteLocales = ['zh-tw', 'en'] as const;
export type SiteLocale = (typeof siteLocales)[number];
export const collectionKinds = ['product', 'faq', 'role', 'vision', 'milestone', 'nav'] as const;
export type CollectionKind = (typeof collectionKinds)[number];
export interface SiteRecord {
	id: string;
	title: string;
	fields: Record<string, string>;
}
export interface SiteLocaleContent {
	messages: Record<string, string>;
	settings: Record<string, string>;
	collections: Record<CollectionKind, SiteRecord[]>;
}
export interface SitePage {
	slug: string;
	title: string;
	html: string;
	excerpt: string;
}
export interface SiteCatalog {
	source: 'ghost' | 'defaults';
	locales: Record<SiteLocale, SiteLocaleContent>;
	pages: SitePage[];
}
export const emptyLocale = (): SiteLocaleContent => ({
	messages: {},
	settings: {},
	collections: { product: [], faq: [], role: [], vision: [], milestone: [], nav: [] }
});

/** Site-relative links and HTTPS only. Protocol-relative links and executable schemes are rejected. */
export function safeLink(value: string): boolean {
	return /^\/(?!\/)[^\\\s]*$/.test(value) || /^https:\/\/[^\s\\]+$/i.test(value);
}
export const fieldLabels = {
	order: '排序',
	summary: '簡介',
	answer: '回答',
	features: '特色（每行一項）',
	latin: '英文副標',
	href: '連結',
	accent: '配色（blue／lime／sun）',
	status: '狀態（live／soon／dev）',
	glyph: '圖示（bus／coz／activity／map）',
	screens: '圖片（每行一張）',
	darkScreens: '深色圖片（每行一張）',
	group: '組別（ux／marketing／dev／ops）',
	groupLabel: '組別名稱',
	subtitle: '副標題',
	hook: '短句',
	description: '說明',
	formUrl: '報名連結',
	body: '內文',
	art: '插圖',
	date: '日期',
	upcoming: '尚未完成（true／false）',
	linkLabel: '連結文字',
	linkBefore: '連結前文字',
	linkAfter: '連結後文字',
	recruitmentOpen: '開放招募（true／false）',
	filmId: 'YouTube 影片 ID',
	contactEmail: '聯絡信箱',
	instagram: 'Instagram',
	youtube: 'YouTube',
	github: 'GitHub',
	repository: '網站原始碼',
	googlePlay: 'Google Play',
	appStore: 'App Store'
} as const;
