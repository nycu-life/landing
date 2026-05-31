/* ──────────────────────────────────────────────────────────────────────────
   Team — static member data (single source of truth, lives in the repo).

   Identity and department-membership are intentionally DECOUPLED:
   - `members`  : one canonical profile per person (keyed by slug).
   - `assignments`: a person↔department relation. A person can appear in
     several departments (each with its own role) while still linking to the
     one /team/<slug> profile page.

   Each member gets a build-time-prerendered profile page at /team/<slug>.
   Per-person content (intro, photo, gallery, socials) is left for each member
   to fill — drop a photo at static/team/<slug>.jpg and it shows automatically.
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

/** A person's canonical profile — NO department/role here (see Assignment). */
export interface Member {
	/** URL-safe id; the profile page is /team/<slug>. */
	slug: string;
	/** Display name, e.g. 魏均祐. */
	name: string;
	/** 系所 / program, e.g. 科法碩 / 傳科系 / 資工系 / 百川 / 光電系 / 資工碩. */
	program: string;
	/** A short message the member wants to say (self-intro). Optional. */
	intro?: string;
	/** Avatar override. If omitted, /team/<slug>.jpg is tried, then initials. */
	photo?: string;
	/** 2–3 extra photos shown in a small gallery on the profile page. */
	gallery?: string[];
	/** Personal site / GitHub / LinkedIn / social links. */
	socials?: SocialLink[];
}

/** Department membership — one person can have several of these. */
export interface Assignment {
	/** Member slug this assignment refers to. */
	member: string;
	department: DepartmentId;
	/** 職責 within this department, e.g. 開發 / 法務、風險評估. */
	role: string;
}

/** Canonical profiles. Add a member here; a static page is generated per slug. */
export const members: Member[] = [
	{ slug: 'you-zongyi', name: '游宗易', program: '資工系' },
	{ slug: 'cai-xiuji', name: '蔡秀吉', program: '百川' },
	{ slug: 'yang-haoyu', name: '楊皓宇', program: '資工系' },
	{ slug: 'lin-zhenke', name: '林振可', program: '資工碩' },
	{ slug: 'chen-tingzhen', name: '陳亭蓁', program: '傳科系' },
	{ slug: 'chen-xinghua', name: '陳星樺', program: '傳科系' },
	{ slug: 'ma-xiaoshi', name: '馬曉詩', program: '百川' },
	{ slug: 'zhong-jiatong', name: '鍾佳潼', program: '光電系' },
	{ slug: 'wei-junyou', name: '魏均祐', program: '科法碩' },
	{ slug: 'li-zhengyang', name: '李正洋', program: '科法碩' },
	{ slug: 'xie-yiqing', name: '謝亦晴', program: '科法碩' },
	{ slug: 'chen-junxuan', name: '陳濬萱', program: '科法碩' }
];

/**
 * Department membership (decoupled join). Some people are in more than one
 * department — e.g. 游宗易 is in 工程 + 行政, 李正洋 is in 法務 + 行政 — and
 * appear in each, all linking to the same profile.
 */
export const assignments: Assignment[] = [
	// 工程組
	{ member: 'you-zongyi', department: 'engineering', role: '開發' },
	{ member: 'cai-xiuji', department: 'engineering', role: '開發（醫療支持）' },
	{ member: 'yang-haoyu', department: 'engineering', role: '開發（資安、弱點掃描）' },
	{ member: 'lin-zhenke', department: 'engineering', role: '開發' },
	// 設計組
	{ member: 'chen-tingzhen', department: 'design', role: '使用者體驗、流程設計' },
	{ member: 'chen-xinghua', department: 'design', role: '設計規範、美術設計' },
	// 行政組
	{ member: 'ma-xiaoshi', department: 'admin', role: '行政秘書' },
	{ member: 'zhong-jiatong', department: 'admin', role: '行政' },
	{ member: 'you-zongyi', department: 'admin', role: '行政' },
	{ member: 'li-zhengyang', department: 'admin', role: '行政' },
	// 法務組
	{ member: 'wei-junyou', department: 'legal', role: '法務、風險評估' },
	{ member: 'li-zhengyang', department: 'legal', role: '法務、風險評估' },
	{ member: 'xie-yiqing', department: 'legal', role: '法務' },
	{ member: 'chen-junxuan', department: 'legal', role: '法務' }
];

export const memberSlugs = members.map((m) => m.slug);

export function findMember(slug: string): Member | undefined {
	return members.find((m) => m.slug === slug);
}

/** Members assigned to a department, with their role there (for the listing). */
export function membersInDepartment(id: DepartmentId): Array<{ member: Member; role: string }> {
	return assignments
		.filter((a) => a.department === id)
		.map((a) => ({ member: findMember(a.member), role: a.role }))
		.filter((x): x is { member: Member; role: string } => x.member !== undefined);
}

/** Departments a member belongs to, with their role there (for the profile). */
export function departmentsOfMember(
	slug: string
): Array<{ department: DepartmentId; role: string }> {
	return assignments
		.filter((a) => a.member === slug)
		.map((a) => ({ department: a.department, role: a.role }));
}

/** First grapheme of a name, for the initials fallback avatar. */
export function memberInitial(name: string): string {
	return [...name][0] ?? '·';
}
