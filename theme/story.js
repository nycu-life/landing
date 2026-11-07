// The native theme mirrors PrototypeStory.svelte: the DOM is rendered by Ghost.
'use strict';
const storyEl = document.querySelector('.prototype-story');
if (storyEl) {
	const stageEl = storyEl.querySelector('.story-stage');
	const products = [...storyEl.querySelectorAll('[data-product-index]')];
	const aboutFilmFrame = storyEl.querySelector('.team-film iframe');
	let aboutFilmLoaded = false,
		aboutFilmShouldPlay = false,
		aboutFilmAudioUnlocked = false;
	let aboutFilmRetryTimers = [];
	let progressValue = 0,
		chapterIndex = 0,
		sceneVisible = [true, false, false, false, false];
	let activeProduct = 0,
		switchDir = 1,
		productStepping = false,
		aboutTextIn = false,
		aboutFilmIn = false;
	let storyReady = false,
		reducedMotion = false;
	const SEGMENTS = [
		{ to: 0.2, units: 2 }, // capsule drops, rolls and opens; the machine rises away
		{ to: 0.25, units: 0.7 }, // hero pushes up while about slides in
		{ to: 0.3, units: 0.5 }, // about copy holds after its drop-in
		{ to: 0.4, units: 0.9 }, // the team film rises into place
		{ to: 0.42, units: 0.35 }, // complete about composition holds
		{ to: 0.5, units: 1 }, // about → products push
		{ to: 0.58, units: 1.2 }, // product stepper zone
		{ to: 0.66, units: 1 }, // products → faq push
		{ to: 0.72, units: 0.6 }, // faq hold
		{ to: 0.8, units: 1 }, // faq → join push
		{ to: 1, units: 0.5 } // join hold
	];
	const TOTAL_UNITS = SEGMENTS.reduce((sum, segment) => sum + segment.units, 0);
	const chapters = [
		{ id: 'hero', anchor: 0 },
		{ id: 'about', anchor: 0.41 },
		{ id: 'products', anchor: 0.54 },
		{ id: 'faq', anchor: 0.69 },
		{ id: 'join', anchor: 0.9 }
	];
	/* Which chapter "owns" a progress value, for the nav and data attributes. */
	const CHAPTER_BOUNDS = [0.225, 0.46, 0.62, 0.76];
	/* A scene participates from the start of its enter push to the end of its exit push;
       outside that span it is hidden entirely. */
	const SCENE_SPANS = [
		[0, 0.25],
		[0.2, 0.5],
		[0.42, 0.66],
		[0.58, 0.8],
		[0.72, 1]
	];
	/* Inside this band the page stops scrolling and each scroll gesture steps one product. */
	const PRODUCT_ZONE = { start: 0.5, end: 0.58, center: 0.54 };
	const wheelThreshold = 32;
	/* A wheel delta at least this large that also out-accelerates the previous one is a new
       flick, not trackpad inertia — inertia only ever decays. */
	const freshWheelDelta = 40;
	const wheelGapMs = 120;
	const touchThreshold = 28;
	const productStepMs = 460;
	// Ordinary image cards remain editable in Ghost. A Light/Dark caption picks
	// the appearance; uncaptained images work as the default screenshot set.
	for (const product of products) {
		const target = storyEl.querySelector(`[data-product-image="${product.dataset.productIndex}"]`);
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
		for (const group of storyEl.querySelectorAll('[data-product-image]')) {
			const shots = [...group.querySelectorAll('.device-shot')];
			const appearance =
				dark && shots.some((s) => s.dataset.appearance === 'dark') ? 'dark' : 'light';
			const candidates = shots.filter(
				(s) => !s.dataset.appearance || s.dataset.appearance === appearance
			);
			for (const shot of shots) {
				const selected = shot === candidates[screenshotIndex % candidates.length];
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
		if (document.hidden || reducedMotion || storyEl.dataset.storyStepName !== 'products') return;
		screenshotIndex++;
		refreshScreenshots();
	}, 3500);
	let renderedProduct = -1;
	const renderProduct = () => {
		if (renderedProduct === activeProduct) return;
		renderedProduct = activeProduct;
		screenshotIndex = 0;
		refreshScreenshots();
		for (const element of storyEl.querySelectorAll('[data-product-index], [data-product-image]')) {
			const selected =
				Number(element.dataset.productIndex ?? element.dataset.productImage) === activeProduct;
			element.hidden = !selected;
			if (selected && !reducedMotion && storyReady)
				element.animate(
					[
						{ opacity: 0, transform: 'translateY(' + 34 * switchDir + 'px)' },
						{ opacity: 1, transform: 'translateY(0)' }
					],
					{
						duration: 420,
						delay: 90,
						easing: 'cubic-bezier(0.215,0.61,0.355,1)',
						fill: 'backwards'
					}
				);
		}
		for (const button of storyEl.querySelectorAll('[data-select-product]')) {
			const selected = Number(button.dataset.selectProduct) === activeProduct;
			button.classList.toggle('active', selected);
			button.setAttribute('aria-pressed', String(selected));
		}
	};
	const syncStory = () => {
		storyEl.dataset.storyStep = String(chapterIndex);
		storyEl.dataset.storyStepName = chapters[chapterIndex].id;
		storyEl.querySelectorAll('.story-scene').forEach((scene, index) => {
			const visible = reducedMotion || sceneVisible[index];
			scene.classList.toggle('scene-active', visible);
			scene.inert = !visible;
		});
		const copy = storyEl.querySelector('.about-copy');
		copy?.classList.toggle('landed', aboutTextIn);
		copy?.classList.toggle('film-in', aboutFilmIn);
		const counter = storyEl.querySelector('.story-count');
		counter.textContent = chapterIndex + 1 + ' / 5';
		counter.classList.toggle('hero-count', chapterIndex === 0);
		storyEl.querySelector('.skip-story').tabIndex = chapterIndex === 0 ? 0 : -1;
		renderProduct();
	};
	for (const button of storyEl.querySelectorAll('[data-select-product]'))
		button.addEventListener('click', () => selectProduct(Number(button.dataset.selectProduct)));
	for (const button of storyEl.querySelectorAll('[data-product-direction]'))
		button.addEventListener('click', () =>
			selectProduct(activeProduct + Number(button.dataset.productDirection))
		);
	storyEl
		.querySelector('.join-cards')
		?.classList.toggle('extended', storyEl.querySelector('.join-cards').children.length > 6);
	storyEl.querySelector('.skip-story').addEventListener('click', () => {
		history.replaceState(null, '', '#about');
		goToChapter('about');
	});
	document.addEventListener('click', (event) => {
		const link = event.target.closest('a[href]');
		if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		const url = new URL(link.href);
		if (
			url.origin === location.origin &&
			url.pathname === location.pathname &&
			chapters.some((c) => c.id === url.hash.slice(1))
		) {
			event.preventDefault();
			history.pushState(null, '', url.hash);
			goToChapter(url.hash.slice(1));
		}
	});
	window.addEventListener('popstate', () => goToChapter(location.hash.slice(1)));

	const clamp = (value) => Math.min(1, Math.max(0, value));
	/* Piecewise-linear mapping between the scrolled fraction of the story and the timeline. */
	const progressFromFraction = (fraction) => {
		const target = clamp(fraction) * TOTAL_UNITS;
		let usedUnits = 0;
		let from = 0;
		for (const segment of SEGMENTS) {
			if (target <= usedUnits + segment.units) {
				return from + ((target - usedUnits) / segment.units) * (segment.to - from);
			}
			usedUnits += segment.units;
			from = segment.to;
		}
		return 1;
	};
	const fractionFromProgress = (progress) => {
		const value = clamp(progress);
		let usedUnits = 0;
		let from = 0;
		for (const segment of SEGMENTS) {
			if (value <= segment.to) {
				const local = segment.to === from ? 1 : (value - from) / (segment.to - from);
				return (usedUnits + local * segment.units) / TOTAL_UNITS;
			}
			usedUnits += segment.units;
			from = segment.to;
		}
		return 1;
	};
	let scrollMetrics = { top: 0, length: 1 };
	const measure = () => {
		if (!storyEl || !stageEl) return;
		const rect = storyEl.getBoundingClientRect();
		scrollMetrics = {
			top: rect.top + window.scrollY,
			length: Math.max(1, storyEl.offsetHeight - stageEl.offsetHeight)
		};
	};
	const readProgress = () =>
		progressFromFraction((window.scrollY - scrollMetrics.top) / scrollMetrics.length);
	const scrollYFor = (progress) =>
		scrollMetrics.top + fractionFromProgress(progress) * scrollMetrics.length;
	const applyProgress = (value) => {
		progressValue = clamp(value);
		storyEl?.style.setProperty('--story-progress', String(progressValue));
		// Native anchor navigation (e.g. loading /#products) scrolls the overflow-hidden stage
		// itself to reach the target scene; the stage must always stay at its own origin.
		if (stageEl && stageEl.scrollTop !== 0) stageEl.scrollTop = 0;
		chapterIndex = CHAPTER_BOUNDS.filter((boundary) => progressValue >= boundary).length;
		sceneVisible = SCENE_SPANS.map(([from, to]) => progressValue >= from && progressValue <= to);
		if (progressValue >= 0.25) aboutTextIn = true;
		else if (progressValue < 0.21) aboutTextIn = false;
		// The copy's text realigns left partway through its slide toward the film (#59).
		if (progressValue >= 0.345) aboutFilmIn = true;
		else if (progressValue < 0.33) aboutFilmIn = false;
		const filmShouldPlay = progressValue >= 0.36 && progressValue <= 0.47;
		if (filmShouldPlay !== aboutFilmShouldPlay) setAboutFilmPlayback(filmShouldPlay);
		syncStory();
	};
	const sendAboutFilmCommand = (func, args = []) => {
		if (!aboutFilmLoaded) return;
		aboutFilmFrame.contentWindow?.postMessage(
			JSON.stringify({ event: 'command', func, args }),
			'https://www.youtube-nocookie.com'
		);
	};
	const clearAboutFilmRetries = () => {
		for (const timer of aboutFilmRetryTimers) clearTimeout(timer);
		aboutFilmRetryTimers = [];
		storyEl.dataset.aboutFilmRetrying = 'false';
	};
	const readAboutFilmPlayerState = (data) => {
		let message = data;
		if (typeof message === 'string') {
			try {
				message = JSON.parse(message);
			} catch {
				return null;
			}
		}
		if (!message || typeof message !== 'object') return null;
		const payload = message;
		if (payload.event === 'onStateChange' && typeof payload.info === 'number') {
			return payload.info;
		}
		if (
			payload.event === 'infoDelivery' &&
			payload.info &&
			typeof payload.info === 'object' &&
			typeof payload.info.playerState === 'number'
		) {
			return payload.info.playerState;
		}
		return null;
	};
	const onAboutFilmMessage = (event) => {
		if (
			event.origin !== 'https://www.youtube-nocookie.com' ||
			event.source !== aboutFilmFrame?.contentWindow
		)
			return;
		// Once YouTube reports a real player state, it is ready. Continuing the startup
		// retries after that point can immediately undo a viewer's tap on Pause (#78).
		if (readAboutFilmPlayerState(event.data) !== null) clearAboutFilmRetries();
	};
	const playAboutFilm = () => {
		if (aboutFilmAudioUnlocked) {
			sendAboutFilmCommand('unMute');
			sendAboutFilmCommand('setVolume', [100]);
		} else sendAboutFilmCommand('mute');
		sendAboutFilmCommand('playVideo');
	};
	const unlockAboutFilmAudio = () => {
		aboutFilmAudioUnlocked = true;
		if (aboutFilmShouldPlay) playAboutFilm();
	};
	const syncAboutFilmPlayback = () => {
		clearAboutFilmRetries();
		if (!aboutFilmLoaded) return;
		if (aboutFilmShouldPlay) {
			storyEl.dataset.aboutFilmRetrying = 'true';
			for (const delay of [0, 120, 350, 700, 1200, 2000, 3500, 5000]) {
				if (delay === 0) playAboutFilm();
				else {
					aboutFilmRetryTimers.push(
						setTimeout(() => {
							if (aboutFilmShouldPlay) playAboutFilm();
						}, delay)
					);
				}
			}
			return;
		}
		sendAboutFilmCommand('pauseVideo');
	};
	const setAboutFilmPlayback = (shouldPlay) => {
		aboutFilmShouldPlay = shouldPlay;
		storyEl.dataset.aboutFilmShouldPlay = String(shouldPlay);
		syncAboutFilmPlayback();
	};
	const onAboutFilmLoad = () => {
		aboutFilmLoaded = true;
		sendAboutFilmCommand('addEventListener', ['onStateChange']);
		syncAboutFilmPlayback();
	};
	/* Product stepper state. While the lock is engaged the page holds still and one scroll
       gesture advances exactly one product; stepping past either end releases the lock back to
       native scrolling. The zone must be fully left before the lock can re-arm. */
	let lockEngaged = false;
	let zoneExited = true;
	let snappingToZone = false;
	let lastProgress = 0;
	let stepTimer;
	const beginProductStep = (direction) => {
		switchDir = direction;
		productStepping = true;
		if (stepTimer) clearTimeout(stepTimer);
		storyEl.dataset.storyAnimating = 'true';
		const thumb = storyEl.querySelector('.device-thumb');
		thumb.classList.remove('swipe-up', 'swipe-down');
		void thumb.offsetWidth;
		thumb.classList.add(direction === 1 ? 'swipe-up' : 'swipe-down');
		stepTimer = setTimeout(() => {
			productStepping = false;
			storyEl.dataset.storyAnimating = 'false';
			thumb.classList.remove('swipe-up', 'swipe-down');
		}, productStepMs);
	};
	const stepProduct = (direction) => {
		const next = activeProduct + direction;
		if (next < 0 || next >= products.length) {
			// Leaving the stepper: hand this gesture back to native scrolling.
			lockEngaged = false;
			zoneExited = false;
			return false;
		}
		beginProductStep(direction);
		activeProduct = next;
		renderProduct();
		return true;
	};
	const selectProduct = (index) => {
		const next = (index + products.length) % products.length;
		if (next === activeProduct) return;
		beginProductStep(index > activeProduct ? 1 : -1);
		activeProduct = next;
		renderProduct();
	};
	const snapToZoneCenter = () => {
		snappingToZone = true;
		window.scrollTo({ top: scrollYFor(PRODUCT_ZONE.center), behavior: 'instant' });
		requestAnimationFrame(() => (snappingToZone = false));
	};
	const goToChapter = (id) => {
		const chapter = chapters.find((entry) => entry.id === id);
		if (!chapter) return;
		measure();
		if (reducedMotion) {
			document.getElementById(id)?.scrollIntoView();
			return;
		}
		if (chapter.id === 'products') {
			// Jumping straight into the stepper: arm the lock at the first product so the scroll
			// event fired by the jump is not mistaken for an entry from below.
			lockEngaged = !reducedMotion;
			zoneExited = false;
			activeProduct = 0;
		}
		window.scrollTo({ top: scrollYFor(chapter.anchor), behavior: 'instant' });
		lastProgress = chapter.anchor;
		applyProgress(chapter.anchor);
	};
	const productDemo = storyEl.querySelector('.product-demo');
	let gestureAt = 0;
	productDemo?.addEventListener(
		'wheel',
		(event) => {
			if (
				reducedMotion ||
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
	if (aboutFilmFrame) {
		const url = new URL(aboutFilmFrame.src);
		if (url.origin === 'https://www.youtube-nocookie.com') {
			for (const [key, value] of Object.entries({
				autoplay: '0',
				mute: '1',
				loop: '1',
				playlist: url.pathname.split('/').pop(),
				playsinline: '1',
				rel: '0',
				enablejsapi: '1'
			}))
				url.searchParams.set(key, value);
			aboutFilmFrame.addEventListener('load', onAboutFilmLoad);
			aboutFilmFrame.src = url.href;
		}
	}
	const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
	const forceMotion = new URLSearchParams(window.location.search).get('motion') === 'on';
	let wheelIntent = 0;
	let wheelConsumed = false;
	let lastWheelDelta = 0;
	let lastWheelAt = 0;
	let wheelResetTimer;
	let touchStartY = 0;
	let touchStartX = 0;
	let touchLocked = false;
	let touchConsumed = false;
	const updateMotionPreference = () => {
		reducedMotion = motionQuery.matches && !forceMotion;
		if (reducedMotion) lockEngaged = false;
		document.body.classList.toggle('story-enhanced', !reducedMotion);
		storyEl.dataset.reducedMotion = String(reducedMotion);
	};
	const normalizeWheelDelta = (event) => {
		if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * 16;
		if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * window.innerHeight;
		return event.deltaY;
	};
	const resetWheelGestureSoon = () => {
		if (wheelResetTimer) clearTimeout(wheelResetTimer);
		wheelResetTimer = setTimeout(() => {
			wheelIntent = 0;
			wheelConsumed = false;
		}, 180);
	};
	const onScroll = () => {
		const progress = readProgress();
		const inZone = progress > PRODUCT_ZONE.start && progress < PRODUCT_ZONE.end;
		if (!inZone) {
			zoneExited = true;
			lockEngaged = false;
		} else if (lockEngaged && !snappingToZone) {
			// The lock swallows wheel and touch input, so any movement came from something we
			// cannot intercept (scrollbar drag, find-in-page, iOS momentum). Small drifts are
			// pulled back to the anchor; a deliberate jump falls back to plain scrubbing.
			const drift = window.scrollY - scrollYFor(PRODUCT_ZONE.center);
			const zoneLength =
				(fractionFromProgress(PRODUCT_ZONE.end) - fractionFromProgress(PRODUCT_ZONE.start)) *
				scrollMetrics.length;
			if (Math.abs(drift) > zoneLength * 0.35) {
				lockEngaged = false;
				zoneExited = false;
			} else if (Math.abs(drift) > 1) {
				snapToZoneCenter();
				return;
			}
		} else if (!lockEngaged && zoneExited && !reducedMotion) {
			lockEngaged = true;
			zoneExited = false;
			activeProduct = lastProgress <= PRODUCT_ZONE.start ? 0 : products.length - 1;
			snapToZoneCenter();
		}
		if (reducedMotion && inZone) {
			const zoneShare = (progress - PRODUCT_ZONE.start) / (PRODUCT_ZONE.end - PRODUCT_ZONE.start);
			activeProduct = Math.min(products.length - 1, Math.floor(zoneShare * products.length));
		}
		lastProgress = progress;
		applyProgress(progress);
	};
	const onResize = () => {
		measure();
		onScroll();
	};
	const onWheel = (event) => {
		if (!lockEngaged || event.defaultPrevented || Math.abs(event.deltaX) > Math.abs(event.deltaY))
			return;
		const delta = normalizeWheelDelta(event);
		if (!delta) return;
		event.preventDefault();
		const direction = Math.sign(delta);
		const now = performance.now();
		const magnitude = Math.abs(delta);
		const freshGesture =
			now - lastWheelAt > wheelGapMs ||
			Math.sign(lastWheelDelta) !== direction ||
			(magnitude >= freshWheelDelta && magnitude > Math.abs(lastWheelDelta) * 1.5);
		lastWheelAt = now;
		lastWheelDelta = delta;
		resetWheelGestureSoon();
		if (productStepping) {
			wheelConsumed = true;
			return;
		}
		// Inertia from the flick that switched the last product keeps arriving after the
		// animation ends; ignore it, but let a genuinely new flick through right away.
		if (wheelConsumed && !freshGesture) return;
		wheelConsumed = false;
		if (wheelIntent && Math.sign(wheelIntent) !== direction) wheelIntent = 0;
		wheelIntent += delta;
		if (Math.abs(wheelIntent) < wheelThreshold) return;
		wheelConsumed = true;
		wheelIntent = 0;
		stepProduct(direction);
	};
	const onTouchStart = (event) => {
		touchStartY = event.touches[0]?.clientY ?? 0;
		touchStartX = event.touches[0]?.clientX ?? 0;
		touchLocked = lockEngaged;
		touchConsumed = false;
	};
	const onTouchMove = (event) => {
		if (!touchLocked || !lockEngaged) return;
		const currentY = event.touches[0]?.clientY;
		if (currentY === undefined) return;
		const distance = touchStartY - currentY;
		if (Math.abs(touchStartX - event.touches[0].clientX) > Math.abs(distance)) return;
		if (!distance) return;
		event.preventDefault();
		if (productStepping || touchConsumed || Math.abs(distance) < touchThreshold) return;
		touchConsumed = true;
		stepProduct(Math.sign(distance));
	};
	const onTouchEnd = () => {
		touchLocked = false;
		touchConsumed = false;
	};
	const onKeyDown = (event) => {
		if (!lockEngaged || event.repeat) return;
		const target = event.target;
		if (
			target instanceof HTMLElement &&
			target.closest('a, button, input, textarea, select, [contenteditable="true"]')
		)
			return;
		let direction = 0;
		if (['ArrowDown', 'PageDown'].includes(event.key) || (event.key === ' ' && !event.shiftKey))
			direction = 1;
		else if (['ArrowUp', 'PageUp'].includes(event.key) || (event.key === ' ' && event.shiftKey))
			direction = -1;
		if (!direction) return;
		const next = activeProduct + direction;
		if (next < 0 || next >= products.length) {
			// Releasing at the boundary: let the browser handle this keypress as page scroll.
			lockEngaged = false;
			zoneExited = false;
			return;
		}
		event.preventDefault();
		if (!productStepping) stepProduct(direction);
	};
	const onHashChange = () => {
		const hash = window.location.hash.slice(1);
		if (chapters.some((chapter) => chapter.id === hash)) goToChapter(hash);
		// Anchors past the story (e.g. #wishes): the browser's own jump lands short because the
		// tall story runway settles its height only after layout, so re-aim at the element.
		else if (hash) document.getElementById(hash)?.scrollIntoView({ behavior: 'instant' });
	};
	const prepareFirstScene = async () => {
		const images = Array.from(storyEl.querySelectorAll('.gacha-machine img'));
		await Promise.allSettled(
			images.map(async (image) => {
				if (!image.complete) {
					await new Promise((resolve) => {
						const settle = () => resolve();
						image.addEventListener('load', settle, { once: true });
						image.addEventListener('error', settle, { once: true });
					});
				}
				if (image.naturalWidth > 0) await image.decode();
			})
		);
		storyReady = true;
		storyEl.dataset.storyReady = 'true';
		// Image decoding can change the page height; realign any deep link once it settles.
		if (window.location.hash) {
			measure();
			onHashChange();
		}
	};
	updateMotionPreference();
	measure();
	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', onResize);
	window.addEventListener('wheel', onWheel, { passive: false });
	window.addEventListener('touchstart', onTouchStart, { passive: true });
	window.addEventListener('touchmove', onTouchMove, { passive: false });
	window.addEventListener('touchend', onTouchEnd, { passive: true });
	window.addEventListener('touchcancel', onTouchEnd, { passive: true });
	window.addEventListener('keydown', onKeyDown);
	window.addEventListener('hashchange', onHashChange);
	window.addEventListener('message', onAboutFilmMessage);
	window.addEventListener('pointerdown', unlockAboutFilmAudio, { capture: true });
	window.addEventListener('pointerup', unlockAboutFilmAudio, { capture: true });
	window.addEventListener('keydown', unlockAboutFilmAudio, { capture: true });
	motionQuery.addEventListener('change', updateMotionPreference);
	if (window.location.hash) onHashChange();
	else onScroll();
	void prepareFirstScene();
}
