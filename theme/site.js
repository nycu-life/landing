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
// Ghost marks only the exact menu URL; articles also belong to their collection
// (/devlog/<slug>/ → 開發日誌). aria-current carries the state the styles show.
for (const link of document.querySelectorAll('.topbar-nav .nav a, .topbar-menu .nav a')) {
	const path = new URL(link.href, location.href).pathname;
	const current =
		link.closest('.nav-current') ||
		(path !== '/' && path !== '/en/' && !link.hash && location.pathname.startsWith(path));
	if (current && new URL(link.href, location.href).origin === location.origin)
		link.setAttribute('aria-current', 'page');
}
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

// Ghost resizes and re-encodes its own uploads on request (theme image_sizes), so
// phone screenshots arrive as small WebP files instead of 1+ MB PNGs.
const GHOST_WIDTHS = [320, 600, 960];
const ghostImage = (url, width) => {
	const match = /^(.*\/content\/images\/)(?!size\/)(.+\.(?:png|jpe?g|webp))$/i.exec(url ?? '');
	return match ? `${match[1]}size/w${width}/format/webp/${match[2]}` : url;
};
const ghostSrcset = (url) =>
	ghostImage(url, 600) === url
		? ''
		: GHOST_WIDTHS.map((w) => `${ghostImage(url, w)} ${w}w`).join(', ');
/** Point an <img> at a resized Ghost image; returns false when nothing changed. */
const setGhostImage = (img, url, sizes) => {
	const srcset = ghostSrcset(url);
	if (srcset) {
		img.sizes = sizes;
		img.srcset = srcset;
	} else img.removeAttribute('srcset');
	img.src = srcset ? ghostImage(url, 600) : url;
};
/** The light/dark screenshot sources an entry's caption-tagged image cards describe. */
const captionedShots = (container) =>
	[...container.querySelectorAll('figure img')].map((img) => ({
		url: img.getAttribute('src'),
		alt: img.alt,
		appearance:
			img.closest('figure').querySelector('figcaption')?.textContent.trim().toLowerCase() === 'dark'
				? 'dark'
				: 'light'
	}));

// Products page: a "Dark" captioned image card replaces the screenshot in dark mode.
// The server renders the light screenshot lazily; in dark mode the inline script at
// the end of the catalogue removes its source before layout, so only one is fetched.
const productEntries = document.querySelectorAll('[data-product-entry]');
if (productEntries.length) {
	const pickProductShots = () => {
		const dark = document.documentElement.dataset.theme === 'dark';
		for (const entry of productEntries) {
			const shot = entry.querySelector('.product-entry-shot img');
			const darkShot = captionedShots(entry.querySelector('.product-entry-body')).find(
				(s) => s.appearance === 'dark'
			);
			if (!shot || !darkShot) continue;
			shot.dataset.lightSrc ??= shot.dataset.original;
			const wanted = dark ? darkShot.url : shot.dataset.lightSrc;
			if (shot.dataset.current !== wanted) {
				shot.dataset.current = wanted;
				setGhostImage(shot, wanted, shot.sizes);
			}
		}
	};
	pickProductShots();
	new MutationObserver(pickProductShots).observe(document.documentElement, {
		attributes: true,
		attributeFilter: ['data-theme']
	});
}

// Instagram and Threads posts: the editor pastes a post link on its own line (or a
// bookmark card) and the page shows the network's official embed. On /news/ a post
// whose body is only such a link appears as the embed instead of a text card.
const SOCIAL_POSTS = [
	{
		network: 'instagram',
		pattern: /^https?:\/\/(?:www\.)?instagram\.com\/(?:[\w.]+\/)?(p|reel|tv)\/([\w-]+)/i,
		permalink: (match) => `https://www.instagram.com/${match[1].toLowerCase()}/${match[2]}/`,
		script: 'https://www.instagram.com/embed.js',
		process: () => window.instgrm?.Embeds.process()
	},
	{
		network: 'threads',
		pattern: /^https?:\/\/(?:www\.)?threads\.(?:com|net)\/@([\w.]+)\/post\/([\w-]+)/i,
		permalink: (match) => `https://www.threads.com/@${match[1]}/post/${match[2]}`,
		script: 'https://www.threads.com/embed.js',
		// Threads' script scans the page once when it loads; reloading it embeds later blockquotes.
		process: null
	}
];
const socialPost = (href) => {
	for (const kind of SOCIAL_POSTS) {
		const match = kind.pattern.exec(href ?? '');
		if (match) return { kind, url: kind.permalink(match) };
	}
	return null;
};
const OFFICIAL_EMBEDS = 'blockquote.instagram-media, blockquote.text-post-media';
/** The social post link an element stands for, when the element is nothing else. */
const standaloneSocialLink = (element) => {
	if (element.matches('.kg-bookmark-card'))
		return socialPost(element.querySelector('a.kg-bookmark-container')?.href);
	if (element.matches('p')) {
		const link = element.querySelector('a');
		if (
			link &&
			element.children.length === 1 &&
			element.textContent.trim() === link.textContent.trim()
		)
			return socialPost(link.href);
	}
	return null;
};
const socialEmbed = ({ kind, url }) => {
	const figure = document.createElement('figure');
	figure.className = `social-embed social-embed-${kind.network}`;
	const quote = document.createElement('blockquote');
	const link = document.createElement('a');
	link.href = url;
	link.target = '_blank';
	link.rel = 'noopener noreferrer';
	link.textContent = url;
	quote.append(link);
	if (kind.network === 'instagram') {
		quote.className = 'instagram-media';
		quote.dataset.instgrmPermalink = url;
		quote.dataset.instgrmVersion = '14';
	} else {
		quote.className = 'text-post-media';
		quote.dataset.textPostPermalink = url;
		quote.dataset.textPostVersion = '0';
	}
	figure.append(quote);
	return figure;
};
/** Replace standalone social links inside `container`; returns the networks converted. */
const embedSocialLinks = (container) => {
	const used = new Set();
	for (const element of container.querySelectorAll(':scope > p, :scope > .kg-bookmark-card')) {
		const post = standaloneSocialLink(element);
		if (!post) continue;
		element.replaceWith(socialEmbed(post));
		used.add(post.kind.network);
	}
	return used;
};
const loadSocialScripts = (networks) => {
	for (const kind of SOCIAL_POSTS) {
		if (!networks.has(kind.network)) continue;
		const loaded = document.querySelector(`script[src="${kind.script}"]`);
		if (loaded && kind.process) {
			kind.process();
			continue;
		}
		loaded?.remove();
		const script = document.createElement('script');
		script.src = kind.script;
		script.async = true;
		document.body.append(script);
	}
};
const socialNetworks = new Set();
for (const body of document.querySelectorAll('.article-page .gh-content'))
	for (const network of embedSocialLinks(body)) socialNetworks.add(network);
for (const item of document.querySelectorAll('[data-news-item]')) {
	const template = item.querySelector('template[data-news-content]');
	const body = template?.content;
	template?.remove();
	if (!body) continue;
	// Ghost HTML cards keep the network's own <script>; the page loads it once instead.
	for (const script of body.querySelectorAll('script')) script.remove();
	const blocks = [...body.children].filter(
		(element) => !(element.matches('p') && !element.textContent.trim() && !element.children.length)
	);
	if (blocks.length !== 1) continue;
	const post = standaloneSocialLink(blocks[0]);
	const official = blocks[0].matches(OFFICIAL_EMBEDS)
		? blocks[0]
		: blocks[0].querySelector(OFFICIAL_EMBEDS);
	if (!post && !official) continue;
	item.replaceChildren(post ? socialEmbed(post) : blocks[0]);
	item.classList.add('news-item-social');
	if (post) socialNetworks.add(post.kind.network);
	else socialNetworks.add(official.matches('.instagram-media') ? 'instagram' : 'threads');
}
loadSocialScripts(socialNetworks);

// Team film (home About chapter and /about/): the YouTube player paints only after
// it loads, which leaves an empty block. Show the video's own poster and a play
// mark underneath the iframe until then.
for (const frame of document.querySelectorAll('.team-film, .film-frame')) {
	const src = frame.querySelector('iframe')?.getAttribute('src') ?? '';
	const id = /youtube(?:-nocookie)?\.com\/embed\/([\w-]{6,})/.exec(src)?.[1];
	if (!id) continue;
	frame.classList.add('has-film-poster');
	frame.style.setProperty('--film-poster', `url("https://i.ytimg.com/vi/${id}/hqdefault.jpg")`);
}
