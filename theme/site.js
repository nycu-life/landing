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
	// Only the home and About pages have an English version; articles are Chinese only.
	if (['/', '/about/', '/products/'].includes(current))
		link.href = `${link.dataset.localeSwitch === 'en' ? '/en' : ''}${current}${location.hash}`;
}

// Products page: a "Dark" captioned image card replaces the screenshot in dark mode.
const productEntries = document.querySelectorAll('[data-product-entry]');
if (productEntries.length) {
	const pickProductShots = () => {
		const dark = document.documentElement.dataset.theme === 'dark';
		for (const entry of productEntries) {
			const shot = entry.querySelector('.product-entry-shot img');
			const figures = [...entry.querySelectorAll('.product-entry-body figure')];
			const caption = (f) => f.querySelector('figcaption')?.textContent.trim().toLowerCase();
			const darkImage = figures.find((f) => caption(f) === 'dark')?.querySelector('img');
			if (!shot || !darkImage) continue;
			shot.dataset.lightSrc ??= shot.src;
			shot.src = dark ? darkImage.src : shot.dataset.lightSrc;
		}
	};
	pickProductShots();
	new MutationObserver(pickProductShots).observe(document.documentElement, {
		attributes: true,
		attributeFilter: ['data-theme']
	});
}

// 最新消息: Instagram and Threads posts from the Node service. Without them the
// profile links in the markup stay as the fallback.
const socialFeed = document.querySelector('[data-social-feed]');
if (socialFeed) {
	const list = socialFeed.querySelector('[data-social-list]');
	const fallback = socialFeed.querySelector('[data-social-fallback]');
	const dateFormat = new Intl.DateTimeFormat(document.documentElement.lang || 'zh-TW', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	});
	const label = { instagram: 'Instagram', threads: 'Threads' };
	fetch('/social/feed.json', { headers: { accept: 'application/json' } })
		.then((response) => (response.ok ? response.json() : { posts: [] }))
		.then(({ posts = [] }) => {
			if (!posts.length) return;
			list.replaceChildren(
				...posts.map((post) => {
					const item = document.createElement('li');
					item.className = `social-card social-${post.network}`;
					const link = document.createElement('a');
					link.href = post.permalink;
					link.target = '_blank';
					link.rel = 'noopener noreferrer';
					if (post.image) {
						const image = document.createElement('img');
						image.src = post.image;
						image.alt = '';
						image.loading = 'lazy';
						image.decoding = 'async';
						link.append(image);
					}
					const copy = document.createElement('div');
					copy.className = 'social-card-copy';
					const meta = document.createElement('p');
					meta.className = 'social-card-meta';
					const network = document.createElement('span');
					network.textContent = label[post.network] ?? post.network;
					const time = document.createElement('time');
					time.dateTime = post.timestamp;
					time.textContent = dateFormat.format(new Date(post.timestamp));
					meta.append(network, time);
					const text = document.createElement('p');
					text.className = 'social-card-text';
					text.textContent = post.text;
					const open = document.createElement('span');
					open.className = 'social-card-open';
					open.textContent = `${socialFeed.dataset.openLabel} →`;
					copy.append(meta, text, open);
					link.append(copy);
					item.append(link);
					return item;
				})
			);
			list.hidden = false;
			fallback.hidden = true;
		})
		.catch(() => {});
}
