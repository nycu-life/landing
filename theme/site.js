// Ghost sends complete HTML. This script enhances the designer's scroll story;
// it never fetches the Content API or renders the site's content in the browser.
const root = document.documentElement;
const english = root.lang === 'en';
document.cookie = `PARAGLIDE_LOCALE=${english ? 'en' : 'zh-tw'}; path=/; SameSite=Lax`;
const themeButtons = document.querySelectorAll('.theme-toggle');
const syncThemeButtons = () => {
	const dark = root.dataset.theme === 'dark';
	for (const button of themeButtons) {
		button.setAttribute('aria-pressed', String(dark));
		button.setAttribute('aria-label', dark ? button.dataset.labelLight : button.dataset.labelDark);
	}
};
syncThemeButtons();
for (const button of themeButtons)
	button.addEventListener('click', () => {
		root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
		try {
			localStorage.setItem('nycu-life-theme', root.dataset.theme);
		} catch {
			/* Optional persistence. */
		}
		syncThemeButtons();
	});
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#topbar-menu');
const closeMenu = () => {
	if (menu) menu.hidden = true;
	menuButton?.setAttribute('aria-expanded', 'false');
};
menuButton?.addEventListener('click', () => {
	menu.hidden = !menu.hidden;
	menuButton.setAttribute('aria-expanded', String(!menu.hidden));
});
menu?.addEventListener('click', (event) => {
	if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape') {
		closeMenu();
		menuButton?.focus();
	}
});
for (const link of document.querySelectorAll('[data-locale-switch]')) {
	const current = location.pathname.replace(/^\/en(?=\/)/, '');
	if (['/', '/about/', '/devlog/', '/comics/'].includes(current))
		link.href = `${link.dataset.localeSwitch === 'en' ? '/en' : ''}${current}${location.hash}`;
}
