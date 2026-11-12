// Screenshot inventory for the design review. docs/design-review/states.md
// documents the same IDs; change both together and only between rounds that
// re-shoot the baseline.
//
// theme: dark (default light)      lang: zh | en (browser locale only)
// wishes: normal | empty | error | loading      admin: out | in
// adminList: normal | empty | error | loading   images: hang (Ghost content images never load)
// phase: empty → captured after every post is switched to draft
// click / fill: actions in order after load     anchor: start the shot here
// viewportOnly: one viewport, no tall capture   only: desktop | mobile
export const SIZES = {
	desktop: { width: 1440, height: 900, deviceScaleFactor: 1, maxHeight: 2400 },
	mobile: {
		width: 390,
		height: 844,
		deviceScaleFactor: 2,
		maxHeight: 1688,
		isMobile: true,
		hasTouch: true
	}
};

const composer = '.wish-composer';

export const STATES = [
	// Ghost theme: home scroll story (reduced motion lays the chapters out in order)
	{ id: 'home-zh', path: '/' },
	{ id: 'home-en', path: '/en/', lang: 'en' },
	{ id: 'home-dark-zh', path: '/', theme: 'dark' },
	{ id: 'home-about-zh', path: '/', anchor: '#about' },
	{ id: 'home-products-zh', path: '/', anchor: '#products' },
	{ id: 'home-products-en', path: '/en/', lang: 'en', anchor: '#products' },
	{ id: 'home-products-dark-zh', path: '/', theme: 'dark', anchor: '#products' },
	{ id: 'home-faq-zh', path: '/', anchor: '#faq' },
	{ id: 'home-faq-en', path: '/en/', lang: 'en', anchor: '#faq' },
	{ id: 'home-join-zh', path: '/', anchor: '#join' },
	{ id: 'home-join-dark-en', path: '/en/', lang: 'en', theme: 'dark', anchor: '#join' },
	{ id: 'home-wish-footer-zh', path: '/', anchor: '#wishes' },
	{ id: 'menu-open-zh', path: '/', click: ['.menu-toggle'], viewportOnly: true, only: 'mobile' },
	{
		id: 'menu-open-dark-en',
		path: '/en/',
		lang: 'en',
		theme: 'dark',
		click: ['.menu-toggle'],
		viewportOnly: true,
		only: 'mobile'
	},
	// About
	{ id: 'about-zh', path: '/about/' },
	{ id: 'about-en', path: '/en/about/', lang: 'en' },
	{ id: 'about-dark-zh', path: '/about/', theme: 'dark' },
	{ id: 'about-milestones-zh', path: '/about/', anchor: '#milestones' },
	// Products
	{ id: 'products-zh', path: '/products/' },
	{ id: 'products-en', path: '/en/products/', lang: 'en' },
	{ id: 'products-dark-zh', path: '/products/', theme: 'dark' },
	{ id: 'products-loading-zh', path: '/products/', images: 'hang' },
	// News
	{ id: 'news-zh', path: '/news/' },
	{ id: 'news-dark-zh', path: '/news/', theme: 'dark' },
	{ id: 'news-loading-zh', path: '/news/', images: 'hang' },
	{ id: 'news-post-zh', path: '/news/app-v3-release/' },
	// Dev log
	{ id: 'devlog-zh', path: '/devlog/' },
	{ id: 'devlog-dark-zh', path: '/devlog/', theme: 'dark' },
	{ id: 'devlog-post-zh', path: '/devlog/design-system-glass/' },
	{ id: 'devlog-post-dark-zh', path: '/devlog/design-system-glass/', theme: 'dark' },
	{ id: 'devlog-post-nocover-zh', path: '/devlog/accessibility-audit/' },
	// Comics (with episodes)
	{ id: 'comics-zh', path: '/comics/' },
	{ id: 'comics-dark-zh', path: '/comics/', theme: 'dark' },
	{ id: 'comics-episode-zh', path: '/comics/ep-03/' },
	// Errors
	{ id: 'not-found-zh', path: '/no-such-page/' },
	{ id: 'not-found-dark-zh', path: '/no-such-page/', theme: 'dark' },
	{ id: 'ghost-down-zh', path: '/', base: 'down' },
	// Wish Pool (SvelteKit + local Wish API)
	{ id: 'wish-zh', path: '/wishpool/' },
	{ id: 'wish-en', path: '/wishpool/', lang: 'en' },
	{ id: 'wish-dark-zh', path: '/wishpool/', theme: 'dark' },
	{ id: 'wish-loading-zh', path: '/wishpool/', wishes: 'loading' },
	{ id: 'wish-error-zh', path: '/wishpool/', wishes: 'error' },
	{ id: 'wish-empty-zh', path: '/wishpool/', wishes: 'empty' },
	{
		id: 'wish-fulfilled-zh',
		path: '/wishpool/',
		click: ['#wish-tab-fulfilled'],
		anchor: '.wish-board'
	},
	{
		id: 'wish-fulfilled-dark-en',
		path: '/wishpool/',
		lang: 'en',
		theme: 'dark',
		click: ['#wish-tab-fulfilled'],
		anchor: '.wish-board'
	},
	{
		id: 'wish-card-open-zh',
		path: '/wishpool/',
		click: ['.wish-card-detail summary'],
		anchor: '.wish-board'
	},
	{
		id: 'wish-form-filled-zh',
		path: '/wishpool/',
		fill: [
			[`${composer} input`, '希望宿舍洗衣機可以線上看空位'],
			[`${composer} .wish-detail-field summary`, null],
			[`${composer} textarea`, '每次下樓都滿，想先在手機上看有沒有空的。']
		],
		anchor: composer,
		viewportOnly: true
	},
	{
		id: 'wish-form-error-zh',
		path: '/wishpool/',
		fill: [[`${composer} input`, '洗衣']],
		click: [`${composer} button[type=submit]`],
		anchor: composer,
		viewportOnly: true
	},
	{
		id: 'wish-form-sent-zh',
		path: '/wishpool/',
		fill: [[`${composer} input`, '希望圖書館的座位可以線上預約']],
		click: [`${composer} button[type=submit]`],
		anchor: composer,
		viewportOnly: true
	},
	{
		id: 'wish-form-sent-en',
		path: '/wishpool/',
		lang: 'en',
		fill: [[`${composer} input`, 'Late-night shuttle times in the app']],
		click: [`${composer} button[type=submit]`],
		anchor: composer,
		viewportOnly: true
	},
	{
		id: 'wish-supported-zh',
		path: '/wishpool/',
		click: ['.wish-card .wish-support'],
		anchor: '.wish-board'
	},
	// Wish Pool admin (SSO mocked: /auth/me says signed in; admin calls use the local break-glass token)
	{ id: 'admin-signed-out-zh', path: '/wishpool/admin/' },
	{ id: 'admin-signed-out-en', path: '/wishpool/admin/', lang: 'en', theme: 'dark' },
	{ id: 'admin-pending-zh', path: '/wishpool/admin/', admin: 'in' },
	{ id: 'admin-pending-dark-zh', path: '/wishpool/admin/', admin: 'in', theme: 'dark' },
	{
		id: 'admin-published-zh',
		path: '/wishpool/admin/',
		admin: 'in',
		click: ['.visibility-tabs [role=tab]:nth-child(2)']
	},
	{
		id: 'admin-published-en',
		path: '/wishpool/admin/',
		lang: 'en',
		admin: 'in',
		click: ['.visibility-tabs [role=tab]:nth-child(2)']
	},
	{
		id: 'admin-reply-zh',
		path: '/wishpool/admin/',
		admin: 'in',
		click: ['.visibility-tabs [role=tab]:nth-child(2)', '.card-actions .action-button.secondary'],
		anchor: '.list-heading'
	},
	{ id: 'admin-loading-zh', path: '/wishpool/admin/', admin: 'in', adminList: 'loading' },
	{ id: 'admin-empty-zh', path: '/wishpool/admin/', admin: 'in', adminList: 'empty' },
	{ id: 'admin-error-zh', path: '/wishpool/admin/', admin: 'in', adminList: 'error' },
	// Empty collections (every post switched to draft for this phase)
	{ id: 'news-empty-zh', path: '/news/', phase: 'empty' },
	{ id: 'devlog-empty-zh', path: '/devlog/', phase: 'empty' },
	{ id: 'comics-empty-zh', path: '/comics/', phase: 'empty' },
	{ id: 'comics-empty-dark-zh', path: '/comics/', theme: 'dark', phase: 'empty' }
];

// Reference sites: photographed once and reused in every round.
export const REFERENCES = [
	{ id: 'linear-home', url: 'https://linear.app/' },
	{ id: 'linear-changelog', url: 'https://linear.app/changelog' },
	{ id: 'raycast-home', url: 'https://www.raycast.com/' },
	{ id: 'raycast-blog', url: 'https://www.raycast.com/blog' },
	{ id: 'canny-roadmap', url: 'https://feedback.canny.io/' }
];

export const ADMIN_USER = { subject: 'review-admin', name: '審查用管理員' };
// Fixed clock so relative wish times never drift between rounds.
export const NOW = '2026-11-13T12:00:00+08:00';
