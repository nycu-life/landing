/* ──────────────────────────────────────────────────────────────────────────
   Team — static member data (single source of truth, lives in the repo).

   Identity and department-membership are intentionally DECOUPLED:
   - `members`  : one canonical profile per person (keyed by slug).
   - `assignments`: a person↔department relation. A person can appear in
     several departments (each with its own role) while still linking to the
     one /team/<slug> profile page.

   The roster is sourced from the team sign-up sheet (name + group). Per-person
   extras (program, intro, photo, gallery, socials, role) are optional and left
   for each member to fill — drop a photo at static/team/<slug>.jpg and it shows
   automatically. We deliberately do NOT publish emails / student ids here.
   ────────────────────────────────────────────────────────────────────────── */

export type DepartmentId = 'engineering' | 'design' | 'marketing' | 'admin' | 'legal';

/** Order departments render in on the team page. */
export const departmentOrder: DepartmentId[] = ['engineering', 'design', 'admin', 'legal'];

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
	/** 系所 / program, e.g. 科法碩 / 傳科系 / 資工系. Optional. */
	program?: string;
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
	/** 職責 within this department, e.g. 開發 / 法務、風險評估. Optional. */
	role?: string;
}

/** Canonical profiles. Add a member here; a static page is generated per slug. */
export const members: Member[] = [
	// 工程 / Engineering
	{
		slug: 'yio',
		name: '游宗易',
		program: '資工系',
		socials: [{ kind: 'github', url: 'https://github.com/yio' }]
	},
	{
		slug: 'jacoblin',
		name: '林振可',
		program: '資工碩',
		intro:
			'我在 NYCU LIFE 主要負責校車 app，也會參與其他幾個專案，從網頁到手機 app 都有涉獵。研究方向是語音與語言模型相關的 AI/ML，但比起停留在論文，我更想把這些技術做成真正有人使用的應用。平常寫程式會搭配 Codex 與 Claude Code，把 AI agent 當作協作的夥伴。最近比較關注的，是 AI agent 如何實際影響人與人的互動、帶來具體的社會影響，以及這方面的各種創新。',
		socials: [
			{ kind: 'github', url: 'https://github.com/JacobLinCool' },
			{ kind: 'website', url: 'https://jacoblin.cool' },
			{ kind: 'email', url: 'mailto:jacoblincool@gmail.com' }
		]
	},
	{ slug: 'hsuan', name: '張睿玹' },
	{
		slug: 'thc1006',
		name: '蔡秀吉',
		program: '百川',
		intro: '跨足資訊與醫療領域，熱衷開源協作，GitHub 上累積了不少專案。',
		socials: [
			{ kind: 'github', url: 'https://github.com/thc1006' },
			{ kind: 'website', url: 'https://cs.nycu.edu.tw/~hctsai1006/' }
		]
	},
	{
		slug: 'naup96321',
		name: '楊皓宇',
		program: '資工系',
		socials: [{ kind: 'github', url: 'https://github.com/naup96321' }]
	},
	{ slug: 'pb', name: '賴柏翰' },
	{
		slug: 'feedc0de',
		name: '簡煦恩',
		socials: [{ kind: 'github', url: 'https://github.com/feedc0de' }]
	},
	{ slug: 'ddd', name: '林育廷' },
	{
		slug: 'takalawang',
		name: '王重鈞',
		intro: 'NYCU 碩士生，工程組夥伴。',
		socials: [
			{ kind: 'github', url: 'https://github.com/takalawang' },
			{ kind: 'website', url: 'https://takalawang.github.io/' }
		]
	},
	{ slug: 'lin', name: 'Lin Lee' },
	// 設計 / Design
	{ slug: 'ting', name: '陳亭蓁', program: '傳科系' },
	{ slug: 'xcc', name: '陳星樺', program: '傳科系' },
	{ slug: 'eugene', name: '顏睿軍' },
	{ slug: 'wkdub', name: '張涓柔' },
	{ slug: 'einstein706', name: '王子瑜' },
	{ slug: 'lin47', name: '林思綺' },
	{ slug: 'alien', name: '許沛涵' },
	// 行政 / Administration
	{ slug: 'jun', name: '鍾佳潼', program: '光電系' },
	{ slug: 'itsivyma', name: '馬筱詩', program: '百川' },
	{ slug: 'yong0w0', name: '黃少寰' },
	{ slug: 'kgipj', name: '林雨欣' },
	{ slug: 'griffith', name: '陳俊宇' },
	{ slug: 'folksy', name: '尤時晴' },
	// 法務 / Legal
	{ slug: 'lizy', name: '李正洋', program: '科法碩' },
	{ slug: 'yo7536108', name: '魏均祐', program: '科法碩' },
	{ slug: 'yiching', name: '謝亦晴', program: '科法碩' },
	{ slug: 'joanna', name: '陳濬萱', program: '科法碩' }
];

/**
 * Department membership (decoupled join). One row per person per department.
 * `role` is filled where we have a specific one; otherwise the listing just
 * shows the member under their department.
 */
export const assignments: Assignment[] = [
	// 工程組
	{ member: 'yio', department: 'engineering', role: '開發' },
	{ member: 'jacoblin', department: 'engineering', role: '開發' },
	{ member: 'thc1006', department: 'engineering', role: '開發（醫療支持）' },
	{ member: 'naup96321', department: 'engineering', role: '開發（資安、弱點掃描）' },
	{ member: 'hsuan', department: 'engineering' },
	{ member: 'pb', department: 'engineering' },
	{ member: 'feedc0de', department: 'engineering' },
	{ member: 'ddd', department: 'engineering' },
	{ member: 'takalawang', department: 'engineering' },
	{ member: 'lin', department: 'engineering' },
	// 設計組
	{ member: 'ting', department: 'design', role: '使用者體驗、流程設計' },
	{ member: 'xcc', department: 'design', role: '設計規範、美術設計' },
	{ member: 'eugene', department: 'design' },
	{ member: 'wkdub', department: 'design' },
	{ member: 'einstein706', department: 'design' },
	{ member: 'lin47', department: 'design' },
	{ member: 'alien', department: 'design' },
	// 行政組
	{ member: 'jun', department: 'admin', role: '行政' },
	{ member: 'itsivyma', department: 'admin', role: '行政秘書' },
	{ member: 'yong0w0', department: 'admin' },
	{ member: 'kgipj', department: 'admin' },
	{ member: 'griffith', department: 'admin' },
	{ member: 'folksy', department: 'admin' },
	// 法務組
	{ member: 'lizy', department: 'legal', role: '法務、風險評估' },
	{ member: 'yo7536108', department: 'legal', role: '法務、風險評估' },
	{ member: 'yiching', department: 'legal', role: '法務' },
	{ member: 'joanna', department: 'legal', role: '法務' }
];

export const memberSlugs = members.map((m) => m.slug);

export function findMember(slug: string): Member | undefined {
	return members.find((m) => m.slug === slug);
}

/** Members assigned to a department, with their role there (for the listing). */
export function membersInDepartment(id: DepartmentId): Array<{ member: Member; role?: string }> {
	return assignments
		.filter((a) => a.department === id)
		.map((a) => ({ member: findMember(a.member), role: a.role }))
		.filter((x): x is { member: Member; role: string | undefined } => x.member !== undefined);
}

/** Departments a member belongs to, with their role there (for the profile). */
export function departmentsOfMember(
	slug: string
): Array<{ department: DepartmentId; role?: string }> {
	return assignments
		.filter((a) => a.member === slug)
		.map((a) => ({ department: a.department, role: a.role }));
}

/** First grapheme of a name, for the initials fallback avatar. */
export function memberInitial(name: string): string {
	return [...name][0] ?? '·';
}
