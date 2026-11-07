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
		link.href = `${english ? '' : '/en'}${current}${location.hash}`;
}

const story = document.querySelector('.prototype-story');
if (story) {
	const roleList = story.querySelector('.join-cards');
	roleList?.classList.toggle('extended', roleList.children.length > 6);
	const stage = story.querySelector('.story-stage');
	const chapters = ['hero', 'about', 'products', 'faq', 'join'];
	const anchors = [0, 0.41, 0.54, 0.69, 0.9];
	const bounds = [0.225, 0.46, 0.62, 0.76];
	const spans = [
		[0, 0.25],
		[0.2, 0.5],
		[0.42, 0.66],
		[0.58, 0.8],
		[0.72, 1]
	];
	const segments = [
		[0.2, 2],
		[0.25, 0.7],
		[0.3, 0.5],
		[0.4, 0.9],
		[0.42, 0.35],
		[0.5, 1],
		[0.58, 1.2],
		[0.66, 1],
		[0.72, 0.6],
		[0.8, 1],
		[1, 0.5]
	];
	const total = segments.reduce((sum, [, units]) => sum + units, 0);
	const clamp = (value) => Math.min(1, Math.max(0, value));
	const progressAt = (fraction) => {
		const target = clamp(fraction) * total;
		let used = 0,
			from = 0;
		for (const [to, units] of segments) {
			if (target <= used + units) return from + ((target - used) / units) * (to - from);
			used += units;
			from = to;
		}
		return 1;
	};
	const fractionAt = (progress) => {
		let used = 0,
			from = 0;
		for (const [to, units] of segments) {
			if (progress <= to) return (used + ((progress - from) / (to - from)) * units) / total;
			used += units;
			from = to;
		}
		return 1;
	};
	const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
	const reduced = () =>
		reducedQuery.matches && new URLSearchParams(location.search).get('motion') !== 'on';
	const applyProgress = () => {
		const top = story.getBoundingClientRect().top + scrollY;
		const progress = progressAt(
			(scrollY - top) / Math.max(1, story.offsetHeight - stage.offsetHeight)
		);
		story.style.setProperty('--story-progress', String(progress));
		stage.scrollTop = 0;
		const chapter = bounds.filter((bound) => progress >= bound).length;
		story.dataset.storyStep = String(chapter);
		story.dataset.storyStepName = chapters[chapter];
		story.querySelectorAll('.story-scene').forEach((scene, index) => {
			scene.classList.toggle(
				'scene-active',
				reduced() || (progress >= spans[index][0] && progress <= spans[index][1])
			);
			scene.inert = !reduced() && !(progress >= spans[index][0] && progress <= spans[index][1]);
		});
		const copy = story.querySelector('.about-copy');
		copy?.classList.toggle('landed', progress >= 0.25);
		copy?.classList.toggle('film-in', progress >= 0.345);
		const counter = story.querySelector('.story-count');
		counter.textContent = `${chapter + 1} / 5`;
		counter.classList.toggle('hero-count', chapter === 0);
		story.querySelector('.skip-story').tabIndex = chapter === 0 ? 0 : -1;
	};
	const goToChapter = (name) => {
		const index = chapters.indexOf(name);
		if (index < 0) return;
		if (reduced()) {
			document.getElementById(name).scrollIntoView();
			return;
		}
		const top = story.getBoundingClientRect().top + scrollY;
		scrollTo({
			top: top + fractionAt(anchors[index]) * (story.offsetHeight - stage.offsetHeight),
			behavior: 'instant'
		});
		applyProgress();
	};
	document.addEventListener('click', (event) => {
		const link = event.target.closest('a[href]');
		if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		const target = new URL(link.href);
		if (
			target.origin === location.origin &&
			target.pathname === location.pathname &&
			chapters.includes(target.hash.slice(1))
		) {
			event.preventDefault();
			history.pushState(null, '', target.hash);
			goToChapter(target.hash.slice(1));
		}
	});
	story.querySelector('.skip-story').addEventListener('click', () => {
		history.replaceState(null, '', '#about');
		goToChapter('about');
	});
	window.addEventListener('hashchange', () => goToChapter(location.hash.slice(1)));
	window.addEventListener('popstate', () => goToChapter(location.hash.slice(1)));
	window.addEventListener('scroll', applyProgress, { passive: true });
	window.addEventListener('resize', applyProgress);
	const configureMotion = () => {
		document.body.classList.toggle('story-enhanced', !reduced());
		story.dataset.reducedMotion = String(reduced());
		applyProgress();
	};
	reducedQuery.addEventListener('change', configureMotion);
	configureMotion();
	let activeProduct = 0;
	const products = [...story.querySelectorAll('[data-product-index]')];
	// Ordinary image cards remain editable in Ghost. A Light/Dark caption picks
	// the appearance; uncaptained images work as the default screenshot set.
	for (const product of products) {
		const target = story.querySelector(`[data-product-image="${product.dataset.productIndex}"]`);
		const images = [...product.querySelectorAll('.native-product-content figure img')];
		if (!images.length || !target) continue;
		target.replaceChildren();
		for (const image of images) {
			const shot = document.createElement('div');
			shot.className = 'device-shot';
			shot.dataset.appearance =
				image.closest('figure').querySelector('figcaption')?.textContent.trim().toLowerCase() ===
				'dark'
					? 'dark'
					: 'light';
			shot.append(image.cloneNode());
			target.append(shot);
		}
	}
	let screenshotIndex = 0;
	const refreshScreenshots = () => {
		const dark = root.dataset.theme === 'dark';
		for (const group of story.querySelectorAll('[data-product-image]')) {
			const shots = [...group.querySelectorAll('.device-shot')];
			const appearance =
				dark && shots.some((s) => s.dataset.appearance === 'dark') ? 'dark' : 'light';
			const candidates = shots.filter(
				(s) => !s.dataset.appearance || s.dataset.appearance === appearance
			);
			for (const shot of shots) {
				const selected = shot === candidates[screenshotIndex % candidates.length];
				shot.hidden = !selected;
				shot.classList.toggle('active', selected);
			}
		}
	};
	new MutationObserver(refreshScreenshots).observe(root, {
		attributes: true,
		attributeFilter: ['data-theme']
	});
	refreshScreenshots();
	setInterval(() => {
		if (document.hidden || reduced() || story.dataset.storyStepName !== 'products') return;
		screenshotIndex++;
		refreshScreenshots();
	}, 3500);
	const selectProduct = (index) => {
		if (!products.length) return;
		activeProduct = (index + products.length) % products.length;
		screenshotIndex = 0;
		refreshScreenshots();
		for (const element of story.querySelectorAll('[data-product-index], [data-product-image]')) {
			const selected =
				Number(element.dataset.productIndex ?? element.dataset.productImage) === activeProduct;
			element.hidden = !selected;
			if (selected && !reduced())
				element.animate(
					[
						{ opacity: 0, transform: 'translateY(18px)' },
						{ opacity: 1, transform: 'translateY(0)' }
					],
					{ duration: 300 }
				);
		}
		for (const button of story.querySelectorAll('[data-select-product]')) {
			const selected = Number(button.dataset.selectProduct) === activeProduct;
			button.classList.toggle('active', selected);
			button.setAttribute('aria-pressed', String(selected));
		}
		const thumb = story.querySelector('.device-thumb');
		if (!reduced())
			thumb.animate(
				[{ transform: 'rotate(0)' }, { transform: 'rotate(-9deg)' }, { transform: 'rotate(0)' }],
				{ duration: 460 }
			);
	};
	for (const button of story.querySelectorAll('[data-select-product]'))
		button.addEventListener('click', () => selectProduct(Number(button.dataset.selectProduct)));
	for (const button of story.querySelectorAll('[data-product-direction]'))
		button.addEventListener('click', () =>
			selectProduct(activeProduct + Number(button.dataset.productDirection))
		);
	const productDemo = story.querySelector('.product-demo');
	let gestureAt = 0;
	productDemo?.addEventListener(
		'wheel',
		(event) => {
			if (
				reduced() ||
				Math.abs(event.deltaX) < 28 ||
				Math.abs(event.deltaX) <= Math.abs(event.deltaY)
			)
				return;
			event.preventDefault();
			if (performance.now() - gestureAt < 450) return;
			gestureAt = performance.now();
			selectProduct(activeProduct + Math.sign(event.deltaX));
		},
		{ passive: false }
	);
	let touchStart;
	productDemo?.addEventListener(
		'touchstart',
		(event) => {
			const touch = event.touches[0];
			touchStart = touch ? { x: touch.clientX, y: touch.clientY } : undefined;
		},
		{ passive: true }
	);
	productDemo?.addEventListener(
		'touchend',
		(event) => {
			const touch = event.changedTouches[0];
			if (!touchStart || !touch) return;
			const dx = touchStart.x - touch.clientX;
			const dy = touchStart.y - touch.clientY;
			if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy))
				selectProduct(activeProduct + Math.sign(dx));
			touchStart = undefined;
		},
		{ passive: true }
	);
	selectProduct(0);
	const ready = () => {
		story.dataset.storyReady = 'true';
		goToChapter(location.hash.slice(1));
		applyProgress();
	};
	// Ghost marks editor images lazy. Waiting for hidden/lazy scene images would
	// deadlock readiness on a cold cache, so only the visible hero gates setup.
	Promise.race([
		Promise.all(
			[...story.querySelectorAll('.gacha-machine img')].map((image) =>
				image.decode().catch(() => {})
			)
		),
		new Promise((resolve) => setTimeout(resolve, 2500))
	]).then(ready);
}
