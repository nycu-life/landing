/* ──────────────────────────────────────────────────────────────────────────
   Team — static member data (single source of truth, lives in the repo).

   Each member gets a build-time-prerendered profile page at /team/<slug>.
   Names / programs / roles / departments are filled in; the per-person content
   (intro, photo, gallery, socials) is left for each member to fill — drop a
   photo at static/team/<slug>.jpg and it shows automatically (otherwise an
   initials avatar is used).
   ────────────────────────────────────────────────────────────────────────── */

export type DepartmentId = 'engineering' | 'design' | 'marketing' | 'admin' | 'legal';

/** Order departments render in on the team page. */
export const departmentOrder: DepartmentId[] = [
	'engineering',
	'design',
	'marketing',
	'admin',
	'legal'
];

export type SocialKind =
	| 'github'
	| 'linkedin'
	| 'website'
	| 'instagram'
	| 'threads'
	| 'x'
	| 'facebook'
	| 'youtube'
	| 'email';

export interface SocialLink {
	kind: SocialKind;
	/** Full URL, or a mailto: for email. */
	url: string;
	/** Optional display label; defaults to the platform name. */
	label?: string;
}

export interface Member {
	/** URL-safe id; the profile page is /team/<slug>. */
	slug: string;
	/** Display name, e.g. 魏均祐. */
	name: string;
	/** 系所 / program, e.g. 科法碩 / 傳科系 / 資工系 / 百川 / 光電系 / 資工碩. */
	program: string;
	/** Which department this member belongs to. */
	department: DepartmentId;
	/** 職責 — short responsibility line, e.g. 法務、風險評估. */
	role: string;
	/** A short message the member wants to say (self-intro). Optional. */
	intro?: string;
	/** Avatar override. If omitted, /team/<slug>.jpg is tried, then initials. */
	photo?: string;
	/** 2–3 extra photos shown in a small gallery on the profile page. */
	gallery?: string[];
	/** Personal site / GitHub / LinkedIn / social links. */
	socials?: SocialLink[];
}

/**
 * The roster. To add a member: append an entry here (slug must be unique) and
 * optionally drop static/team/<slug>.jpg + gallery images. A static profile
 * page is generated for every entry at build time.
 */
export const members: Member[] = [
	// 工程組
	{ slug: 'you-zongyi', name: '游宗易', program: '資工系', department: 'engineering', role: '開發兼行政' },
	{ slug: 'cai-xiuji', name: '蔡秀吉', program: '百川', department: 'engineering', role: '開發（醫療支持）' },
	{ slug: 'yang-haoyu', name: '楊皓宇', program: '資工系', department: 'engineering', role: '開發（資安、弱點掃描）' },
	{ slug: 'lin-zhenke', name: '林振可', program: '資工碩', department: 'engineering', role: '開發' },
	// 設計組
	{ slug: 'chen-tingzhen', name: '陳亭蓁', program: '傳科系', department: 'design', role: '使用者體驗、流程設計' },
	{ slug: 'chen-xinghua', name: '陳星樺', program: '傳科系', department: 'design', role: '設計規範、美術設計' },
	// 行政組
	{ slug: 'ma-xiaoshi', name: '馬曉詩', program: '百川', department: 'admin', role: '行政秘書' },
	{ slug: 'zhong-jiatong', name: '鍾佳潼', program: '光電系', department: 'admin', role: '行政' },
	// 法務組
	{ slug: 'wei-junyou', name: '魏均祐', program: '科法碩', department: 'legal', role: '法務、風險評估' },
	{ slug: 'li-zhengyang', name: '李正洋', program: '科法碩', department: 'legal', role: '法務、風險評估兼行政' },
	{ slug: 'xie-yiqing', name: '謝亦晴', program: '科法碩', department: 'legal', role: '法務' },
	{ slug: 'chen-junxuan', name: '陳濬萱', program: '科法碩', department: 'legal', role: '法務' }
];

export const memberSlugs = members.map((m) => m.slug);

export function findMember(slug: string): Member | undefined {
	return members.find((m) => m.slug === slug);
}

export function membersByDepartment(id: DepartmentId): Member[] {
	return members.filter((m) => m.department === id);
}

/** First grapheme of a name, for the initials fallback avatar. */
export function memberInitial(name: string): string {
	return [...name][0] ?? '·';
}

/** Conventional avatar path; a file dropped here shows without code changes. */
export function memberPhoto(member: Member): string | undefined {
	return member.photo ?? `/team/${member.slug}.jpg`;
}
