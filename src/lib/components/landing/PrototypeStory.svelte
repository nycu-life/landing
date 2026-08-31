<script lang="ts">
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { fly, slide } from 'svelte/transition';
	import { joinRoles, products, productStatusLabel } from '$lib/content/landing';
	import { m } from '$lib/paraglide/messages';
	import { dismissBootSplash } from '$lib/boot-splash';

	const faqs = [
		{ question: m.story_faq_q1, answer: m.story_faq_a1 },
		{ question: m.story_faq_q2, answer: m.story_faq_a2 },
		{ question: m.story_faq_q3, answer: m.story_faq_a3 },
		{ question: m.story_faq_q4, answer: m.story_faq_a4 },
		{ question: m.story_faq_q5, answer: m.story_faq_a5 }
	];
	/* The story is one continuous progress value (0 → 1) scrubbed by native page scrolling: the
	   outer section is tall, the stage is sticky, and every scene choreographs itself off
	   --story-progress. Chapters push each other vertically; the position always tracks the
	   user's scroll and reverses with it. SEGMENTS assigns each stretch of the timeline its
	   share of scroll distance, measured in stage heights; the stage-height multiplier in the
	   CSS (see .prototype-story) must stay equal to 1 + the sum of these units. */
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
	] as const;
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
	] as const;
	/* Inside this band the page stops scrolling and each scroll gesture steps one product. */
	const PRODUCT_ZONE = { start: 0.5, end: 0.58, center: 0.54 };
	const wheelThreshold = 32;
	/* A wheel delta at least this large that also out-accelerates the previous one is a new
	   flick, not trackpad inertia — inertia only ever decays. */
	const freshWheelDelta = 40;
	const wheelGapMs = 120;
	const touchThreshold = 28;
	const productStepMs = 460;
	const aboutFilmEmbedUrl =
		'https://www.youtube-nocookie.com/embed/WbndciSLhD8?autoplay=0&mute=1&loop=1&playlist=WbndciSLhD8&playsinline=1&rel=0&enablejsapi=1';

	let storyEl: HTMLElement;
	let stageEl: HTMLElement;
	let aboutFilmFrame: HTMLIFrameElement;
	let aboutFilmLoaded = false;
	let aboutFilmShouldPlay = $state(false);
	let aboutFilmAudioUnlocked = false;
	let aboutFilmRetryTimers: ReturnType<typeof setTimeout>[] = [];
	let progressValue = 0;
	let chapterIndex = $state(0);
	let sceneVisible = $state([true, false, false, false, false]);
	let activeFaq = $state(0);
	let activeProduct = $state(0);
	let switchDir = $state(1);
	let productStepping = $state(false);
	let aboutTextIn = $state(false);
	let aboutFilmIn = $state(false);
	let storyReady = $state(false);
	let reducedMotion = $state(false);
	let activeProductData = $derived(products[activeProduct]);

	const clamp = (value: number) => Math.min(1, Math.max(0, value));
	const flyIn = (direction: number) => ({
		y: reducedMotion ? 0 : 34 * direction,
		duration: reducedMotion ? 0 : 420,
		delay: reducedMotion ? 0 : 90,
		easing: cubicOut
	});
	const flyOut = (direction: number) => ({
		y: reducedMotion ? 0 : -34 * direction,
		duration: reducedMotion ? 0 : 300,
		easing: cubicOut
	});

	/* Piecewise-linear mapping between the scrolled fraction of the story and the timeline. */
	const progressFromFraction = (fraction: number) => {
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
	const fractionFromProgress = (progress: number) => {
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
	const scrollYFor = (progress: number) =>
		scrollMetrics.top + fractionFromProgress(progress) * scrollMetrics.length;

	const applyProgress = (value: number) => {
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
	};
	const sendAboutFilmCommand = (func: string, args: unknown[] = []) => {
		if (!aboutFilmLoaded) return;
		aboutFilmFrame.contentWindow?.postMessage(
			JSON.stringify({ event: 'command', func, args }),
			'https://www.youtube-nocookie.com'
		);
	};
	const clearAboutFilmRetries = () => {
		for (const timer of aboutFilmRetryTimers) clearTimeout(timer);
		aboutFilmRetryTimers = [];
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
	const setAboutFilmPlayback = (shouldPlay: boolean) => {
		aboutFilmShouldPlay = shouldPlay;
		syncAboutFilmPlayback();
	};
	const onAboutFilmLoad = () => {
		aboutFilmLoaded = true;
		syncAboutFilmPlayback();
	};
	/* Product stepper state. While the lock is engaged the page holds still and one scroll
	   gesture advances exactly one product; stepping past either end releases the lock back to
	   native scrolling. The zone must be fully left before the lock can re-arm. */
	let lockEngaged = false;
	let zoneExited = true;
	let snappingToZone = false;
	let lastProgress = 0;
	let stepTimer: ReturnType<typeof setTimeout> | undefined;

	const beginProductStep = (direction: number) => {
		switchDir = direction;
		productStepping = true;
		if (stepTimer) clearTimeout(stepTimer);
		stepTimer = setTimeout(() => (productStepping = false), productStepMs);
	};
	const stepProduct = (direction: number) => {
		const next = activeProduct + direction;
		if (next < 0 || next >= products.length) {
			// Leaving the stepper: hand this gesture back to native scrolling.
			lockEngaged = false;
			zoneExited = false;
			return false;
		}
		beginProductStep(direction);
		activeProduct = next;
		return true;
	};
	const selectProduct = (index: number) => {
		const next = (index + products.length) % products.length;
		if (next === activeProduct) return;
		beginProductStep(index > activeProduct ? 1 : -1);
		activeProduct = next;
	};
	const snapToZoneCenter = () => {
		snappingToZone = true;
		window.scrollTo({ top: scrollYFor(PRODUCT_ZONE.center), behavior: 'instant' });
		requestAnimationFrame(() => (snappingToZone = false));
	};
	const goToChapter = (id: string) => {
		const chapter = chapters.find((entry) => entry.id === id);
		if (!chapter) return;
		measure();
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
	onMount(() => {
		const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		const forceMotion = new URLSearchParams(window.location.search).get('motion') === 'on';
		let wheelIntent = 0;
		let wheelConsumed = false;
		let lastWheelDelta = 0;
		let lastWheelAt = 0;
		let wheelResetTimer: ReturnType<typeof setTimeout> | undefined;
		let touchStartY = 0;
		let touchLocked = false;
		let touchConsumed = false;
		let disposed = false;

		const updateMotionPreference = () => {
			reducedMotion = motionQuery.matches && !forceMotion;
			if (reducedMotion) lockEngaged = false;
		};
		const normalizeWheelDelta = (event: WheelEvent) => {
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
		const onWheel = (event: WheelEvent) => {
			if (!lockEngaged) return;
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
		const onTouchStart = (event: TouchEvent) => {
			touchStartY = event.touches[0]?.clientY ?? 0;
			touchLocked = lockEngaged;
			touchConsumed = false;
		};
		const onTouchMove = (event: TouchEvent) => {
			if (!touchLocked || !lockEngaged) return;
			const currentY = event.touches[0]?.clientY;
			if (currentY === undefined) return;
			const distance = touchStartY - currentY;
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
		const onKeyDown = (event: KeyboardEvent) => {
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
			const images = Array.from(storyEl.querySelectorAll<HTMLImageElement>('.gacha-machine img'));
			await Promise.allSettled(
				images.map(async (image) => {
					if (!image.complete) {
						await new Promise<void>((resolve) => {
							const settle = () => resolve();
							image.addEventListener('load', settle, { once: true });
							image.addEventListener('error', settle, { once: true });
						});
					}
					if (image.naturalWidth > 0) await image.decode();
				})
			);
			if (disposed) return;
			storyReady = true;
			dismissBootSplash();
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
		window.addEventListener('pointerdown', unlockAboutFilmAudio, { capture: true });
		window.addEventListener('pointerup', unlockAboutFilmAudio, { capture: true });
		window.addEventListener('keydown', unlockAboutFilmAudio, { capture: true });
		motionQuery.addEventListener('change', updateMotionPreference);
		if (window.location.hash) onHashChange();
		else onScroll();
		void prepareFirstScene();
		return () => {
			disposed = true;
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onResize);
			window.removeEventListener('wheel', onWheel);
			window.removeEventListener('touchstart', onTouchStart);
			window.removeEventListener('touchmove', onTouchMove);
			window.removeEventListener('touchend', onTouchEnd);
			window.removeEventListener('touchcancel', onTouchEnd);
			window.removeEventListener('keydown', onKeyDown);
			window.removeEventListener('hashchange', onHashChange);
			window.removeEventListener('pointerdown', unlockAboutFilmAudio, { capture: true });
			window.removeEventListener('pointerup', unlockAboutFilmAudio, { capture: true });
			window.removeEventListener('keydown', unlockAboutFilmAudio, { capture: true });
			clearAboutFilmRetries();
			motionQuery.removeEventListener('change', updateMotionPreference);
			if (wheelResetTimer) clearTimeout(wheelResetTimer);
			if (stepTimer) clearTimeout(stepTimer);
		};
	});
</script>

<section
	bind:this={storyEl}
	class="scroll-story prototype-story"
	id="home"
	aria-label={m.story_region_label()}
	data-story-step={chapterIndex}
	data-story-step-name={chapters[chapterIndex].id}
	data-story-animating={productStepping}
	data-story-ready={storyReady ? 'true' : 'false'}
	data-about-film-should-play={aboutFilmShouldPlay ? 'true' : 'false'}
	data-reduced-motion={reducedMotion ? 'true' : 'false'}
>
	<div class="story-stage" bind:this={stageEl}>
		<div class="story-progress" aria-hidden="true">
			<img src="{base}/ui/progress-line.svg" alt="" />
		</div>
		<nav class="chapter-nav" class:on-hero={chapterIndex === 0} aria-label="Story chapters">
			{#each chapters as chapter, index (chapter.id)}
				<a
					href={`#${chapter.id}`}
					class:active={chapterIndex === index}
					aria-current={chapterIndex === index ? 'step' : undefined}
					onclick={(event) => {
						event.preventDefault();
						history.replaceState(null, '', `#${chapter.id}`);
						goToChapter(chapter.id);
					}}><i></i><span>{chapter.id}</span></a
				>
			{/each}
		</nav>
		<button
			type="button"
			class="skip-story"
			tabindex={chapterIndex === 0 ? 0 : -1}
			onclick={() => {
				history.replaceState(null, '', '#about');
				goToChapter('about');
			}}
		>
			<img class="skip-face skip-face-default" src="{base}/ui/skip-default.svg" alt="" />
			<img class="skip-face skip-face-hover" src="{base}/ui/skip-hover.svg" alt="" />
			<img class="skip-face skip-face-pressed" src="{base}/ui/skip-pressed.svg" alt="" />
			<span class="skip-label">{m.story_skip()}</span>
			<svg class="skip-icon" viewBox="0 0 40 28" aria-hidden="true">
				<polygon points="3,3 3,25 14,14" />
				<polygon points="19,3 19,25 30,14" />
				<line x1="36" y1="3" x2="36" y2="25" />
			</svg>
		</button>

		<section id="hero" class="story-scene hero-scene" class:scene-active={sceneVisible[0]}>
			<div class="hero-orbit" aria-hidden="true"></div>
			<div class="gacha-machine" role="img" aria-label={m.story_gacha_alt()}>
				<picture class="gacha-device-art" aria-hidden="true">
					<source media="(max-width: 430px)" srcset="{base}/story/designer/gacha-mobile.svg" />
					<source media="(max-width: 900px)" srcset="{base}/story/designer/gacha-tablet.svg" />
					<img src="{base}/story/designer/gacha-desktop.svg" alt="" />
				</picture>
				<!-- The dial cut from each artwork's 旋鈕本體 layer, sitting exactly over its baked
				     twin so it can spin as the capsule dispenses. -->
				<picture class="machine-knob" aria-hidden="true">
					<source media="(max-width: 430px)" srcset="{base}/story/designer/knob-mobile.svg" />
					<source media="(max-width: 900px)" srcset="{base}/story/designer/knob-tablet.svg" />
					<img src="{base}/story/designer/knob-desktop.svg" alt="" />
				</picture>
				<img class="machine-base" src="{base}/story/designer/gacha-machine.svg" alt="" />
				<img class="machine-glass" src="{base}/story/designer/gacha-glass.svg" alt="" />
				<div class="gacha-contents" aria-hidden="true">
					<img src="{base}/story/designer/bottom-ball.svg" alt="" />
					<img src="{base}/story/designer/error-ball.svg" alt="" />
					<img src="{base}/story/designer/bus-ball.svg" alt="" />
					<img src="{base}/story/designer/mail-ball.svg" alt="" />
					<img src="{base}/story/designer/graduation-ball.svg" alt="" />
					<img src="{base}/story/designer/debug.svg" alt="" />
					<img src="{base}/story/designer/your.svg" alt="" />
					<img src="{base}/story/designer/star.svg" alt="" />
					<img src="{base}/story/designer/problems.svg" alt="" />
					<img src="{base}/story/designer/nycu-life.svg" alt="" />
				</div>
				<img class="machine-hole" src="{base}/story/designer/gacha-hole.svg" alt="" />
				<div class="capsule" aria-hidden="true">
					<div class="capsule-rotor">
						<svg
							class="capsule-svg"
							viewBox="730.38 27.38 240 240"
							xmlns="http://www.w3.org/2000/svg"
						>
							<defs>
								<clipPath id="capsule-clip-top"
									><path
										d="M640,-200 H1060 V161.65 H959.88 C938.71,142.58 909.93,134.58 881.38,133.84 C834.99,133.83 779.24,130.99 740.68,160.03 H640 Z"
									/></clipPath
								>
								<clipPath id="capsule-clip-bottom"
									><path
										d="M640,160.03 H740.68 C779.24,130.99 834.99,133.83 881.38,133.84 C909.93,134.58 938.71,142.58 959.88,161.65 H1060 V520 H640 Z"
									/></clipPath
								>
								<radialGradient
									id="capsule-glow-fill"
									cx="850.38"
									cy="147.38"
									r="165"
									gradientUnits="userSpaceOnUse"
								>
									<stop offset="0" stop-color="#fffaf0" stop-opacity="0.95" />
									<stop offset="0.46" stop-color="#efe9d1" stop-opacity="0.45" />
									<stop offset="1" stop-color="#efe9d1" stop-opacity="0" />
								</radialGradient>
								<linearGradient
									id="capsule-seam-fill"
									x1="740"
									y1="0"
									x2="960"
									y2="0"
									gradientUnits="userSpaceOnUse"
								>
									<stop offset="0" stop-color="#fff" stop-opacity="0" />
									<stop offset="0.18" stop-color="#fff" stop-opacity="1" />
									<stop offset="0.82" stop-color="#fff" stop-opacity="1" />
									<stop offset="1" stop-color="#fff" stop-opacity="0" />
								</linearGradient>
								<path id="capsule-ray" class="capsule-ray" d="M-3.4,-116 L3.4,-116 L0,-158 Z" />
								<path
									id="capsule-spark"
									d="M0,-8 C1.1,-2.6 2.6,-1.1 8,0 C2.6,1.1 1.1,2.6 0,8 C-1.1,2.6 -2.6,1.1 -8,0 C-2.6,-1.1 -1.1,-2.6 0,-8 Z"
								/>
							</defs>
							<circle
								class="capsule-glow"
								cx="850.38"
								cy="147.38"
								r="165"
								fill="url(#capsule-glow-fill)"
							/>
							<g class="capsule-rays">
								<use href="#capsule-ray" transform="translate(850.38 147.38) rotate(0)" />
								<use href="#capsule-ray" transform="translate(850.38 147.38) rotate(30)" />
								<use href="#capsule-ray" transform="translate(850.38 147.38) rotate(60)" />
								<use href="#capsule-ray" transform="translate(850.38 147.38) rotate(90)" />
								<use href="#capsule-ray" transform="translate(850.38 147.38) rotate(120)" />
								<use href="#capsule-ray" transform="translate(850.38 147.38) rotate(150)" />
								<use href="#capsule-ray" transform="translate(850.38 147.38) rotate(180)" />
								<use href="#capsule-ray" transform="translate(850.38 147.38) rotate(210)" />
								<use href="#capsule-ray" transform="translate(850.38 147.38) rotate(240)" />
								<use href="#capsule-ray" transform="translate(850.38 147.38) rotate(270)" />
								<use href="#capsule-ray" transform="translate(850.38 147.38) rotate(300)" />
								<use href="#capsule-ray" transform="translate(850.38 147.38) rotate(330)" />
							</g>
							<circle class="capsule-ring" cx="850.38" cy="147.38" r="110.43" />
							<g class="capsule-body">
								<g class="capsule-shell capsule-shell-bottom">
									<g clip-path="url(#capsule-clip-bottom)"
										><circle class="capsule-ball" cx="850.38" cy="147.38" r="110.43" /></g
									>
									<path
										class="capsule-lip"
										d="M881.38,133.84c-46.39-.01-102.14-2.85-140.7,26.19.08.69.15,1.38.25,2.07,57.19,36.39,127.99,36.92,188.99,15.9,10.38-3.64,20.5-8.5,29.74-14.62.09-.58.14-1.16.22-1.73-21.17-19.07-49.95-27.07-78.5-27.8Z"
									/>
									<path
										class="capsule-base"
										d="M929.92,178c-61.01,21.02-131.81,20.49-189-15.9,5.14,38,29.96,72.24,68.05,87.65,56.54,22.87,120.91-4.42,143.78-60.96,3.38-8.35,5.65-16.88,6.91-25.41-9.24,6.12-19.36,10.98-29.74,14.62Z"
									/>
									<path
										class="capsule-cut"
										d="M740.68,160.03 C779.24,130.99 834.99,133.83 881.38,133.84 C909.93,134.58 938.71,142.58 959.88,161.65"
									/>
								</g>
								<g class="capsule-shell capsule-shell-top">
									<g clip-path="url(#capsule-clip-top)"
										><circle class="capsule-ball" cx="850.38" cy="147.38" r="110.43" /></g
									>
									<path
										class="capsule-cut"
										d="M740.68,160.03 C779.24,130.99 834.99,133.83 881.38,133.84 C909.93,134.58 938.71,142.58 959.88,161.65"
									/>
								</g>
								<g class="capsule-seam">
									<path
										d="M740.68,160.03 C779.24,130.99 834.99,133.83 881.38,133.84 C909.93,134.58 938.71,142.58 959.88,161.65"
										fill="none"
										stroke="url(#capsule-seam-fill)"
										stroke-width="10"
										opacity="0.35"
									/>
									<path
										d="M740.68,160.03 C779.24,130.99 834.99,133.83 881.38,133.84 C909.93,134.58 938.71,142.58 959.88,161.65"
										fill="none"
										stroke="url(#capsule-seam-fill)"
										stroke-width="5"
										opacity="0.6"
									/>
									<path
										d="M740.68,160.03 C779.24,130.99 834.99,133.83 881.38,133.84 C909.93,134.58 938.71,142.58 959.88,161.65"
										fill="none"
										stroke="url(#capsule-seam-fill)"
										stroke-width="2"
									/>
								</g>
								<g class="capsule-letter">
									<rect
										class="capsule-paper"
										x="784.58"
										y="115.78"
										width="126.97"
										height="91.6"
										rx="28.35"
										ry="28.35"
										transform="translate(-11.04 76.35) rotate(-5.12)"
									/>
									<path
										class="capsule-paper"
										d="M893.6,111.51l-99.26,8.9c-7.48.67-13.05,7.34-12.38,14.82l1.43,15.93c1.38.54,2.74,1.12,4.06,1.71,21.14,9.23,43.03,15.97,65.62,19.75,18.74-9.83,37.77-19.68,57.14-28.91l-1.78-19.82c-.67-7.48-7.34-13.05-14.82-12.38Z"
									/>
									<circle class="capsule-paper" cx="849.57" cy="172.22" r="10.73" />
									<ellipse
										class="capsule-paper"
										cx="898.46"
										cy="124.11"
										rx="31.74"
										ry="25.34"
										transform="translate(-7.49 80.7) rotate(-5.12)"
									/>
									<g class="capsule-badge">
										<path
											d="M880.72,132.65c.23.77.39,1.11.63,1.49.53.81,1.22,1.22,2.04,1.14,1.15-.1,1.99-1.08,2.4-2.73.29-1.17.36-2.47.26-4.9-.94,1.91-2.04,2.77-3.85,2.93-3.69.33-6.43-3.34-6.97-9.32-.56-6.3,1.83-10.86,5.89-11.22,2.6-.23,4.83,1.43,6.37,4.74,1.05,2.24,1.8,5.58,2.15,9.5s.24,7.3-.27,10.07c-.49,2.63-1.62,4.77-3,5.72-.78.54-1.76.91-2.68.99-1.95.17-3.61-.61-4.98-2.35-.8-1.04-1.23-1.97-1.96-4.1l3.95-1.97ZM884.96,120.03c-.24-2.67-1.59-4.42-3.29-4.26s-2.7,2.11-2.46,4.81,1.51,4.46,3.19,4.31c1.76-.16,2.8-2.12,2.56-4.86Z"
										/>
										<path
											d="M896.49,131.23c.23.77.39,1.11.63,1.49.53.81,1.22,1.22,2.04,1.14,1.15-.1,1.99-1.08,2.4-2.73.29-1.17.36-2.47.26-4.9-.94,1.91-2.04,2.77-3.85,2.93-3.69.33-6.43-3.34-6.97-9.32-.56-6.3,1.83-10.86,5.89-11.22,2.6-.23,4.84,1.43,6.37,4.74,1.05,2.24,1.8,5.58,2.15,9.5s.24,7.3-.27,10.07c-.49,2.63-1.62,4.77-3,5.72-.78.54-1.76.91-2.68.99-1.95.17-3.61-.61-4.98-2.35-.8-1.04-1.23-1.97-1.96-4.1l3.95-1.97ZM900.73,118.62c-.24-2.67-1.59-4.42-3.29-4.26s-2.7,2.11-2.46,4.81,1.51,4.46,3.19,4.31c1.76-.16,2.8-2.12,2.56-4.86Z"
										/>
										<path
											d="M912.26,129.82c.23.77.39,1.11.63,1.49.53.81,1.22,1.22,2.04,1.14,1.15-.1,1.99-1.08,2.4-2.73.29-1.17.36-2.47.26-4.9-.94,1.91-2.04,2.77-3.85,2.93-3.69.33-6.43-3.34-6.97-9.32-.56-6.3,1.83-10.86,5.89-11.22,2.6-.23,4.84,1.43,6.37,4.74,1.05,2.24,1.8,5.58,2.15,9.5.34,3.77.24,7.3-.27,10.07-.49,2.63-1.62,4.77-3,5.72-.78.54-1.76.91-2.68.99-1.95.17-3.61-.61-4.98-2.35-.8-1.04-1.23-1.97-1.96-4.1l3.95-1.97ZM916.5,117.2c-.24-2.67-1.59-4.42-3.29-4.26s-2.7,2.11-2.46,4.81,1.51,4.46,3.19,4.31c1.76-.16,2.8-2.12,2.56-4.86Z"
										/>
									</g>
								</g>
							</g>
							<g class="capsule-sparks">
								<g transform="rotate(18 850.38 147.38)"
									><g class="capsule-spark capsule-spark-a"
										><use href="#capsule-spark" x="850.38" y="147.38" fill="#fffdf5" /></g
									></g
								>
								<g transform="rotate(58 850.38 147.38)"
									><g class="capsule-spark capsule-spark-b"
										><use href="#capsule-spark" x="850.38" y="147.38" fill="#efe9d1" /></g
									></g
								>
								<g transform="rotate(96 850.38 147.38)"
									><g class="capsule-spark capsule-spark-c"
										><use href="#capsule-spark" x="850.38" y="147.38" fill="#fffdf5" /></g
									></g
								>
								<g transform="rotate(140 850.38 147.38)"
									><g class="capsule-spark capsule-spark-a"
										><use href="#capsule-spark" x="850.38" y="147.38" fill="#efe9d1" /></g
									></g
								>
								<g transform="rotate(176 850.38 147.38)"
									><g class="capsule-spark capsule-spark-b"
										><use href="#capsule-spark" x="850.38" y="147.38" fill="#fffdf5" /></g
									></g
								>
								<g transform="rotate(218 850.38 147.38)"
									><g class="capsule-spark capsule-spark-c"
										><use href="#capsule-spark" x="850.38" y="147.38" fill="#bb2e31" /></g
									></g
								>
								<g transform="rotate(262 850.38 147.38)"
									><g class="capsule-spark capsule-spark-a"
										><use href="#capsule-spark" x="850.38" y="147.38" fill="#efe9d1" /></g
									></g
								>
								<g transform="rotate(300 850.38 147.38)"
									><g class="capsule-spark capsule-spark-b"
										><use href="#capsule-spark" x="850.38" y="147.38" fill="#fffdf5" /></g
									></g
								>
								<g transform="rotate(334 850.38 147.38)"
									><g class="capsule-spark capsule-spark-c"
										><use href="#capsule-spark" x="850.38" y="147.38" fill="#bb2e31" /></g
									></g
								>
							</g>
						</svg>
					</div>
				</div>
			</div>
			<h1 class="sr-only">NYCU LIFE — {m.story_hero_title_1()}{m.story_hero_title_2()}</h1>
			<div class="scroll-hint">{m.story_scroll_cue()} ↓</div>
		</section>

		<section
			id="about"
			class="story-scene about-scene"
			class:scene-active={sceneVisible[1]}
			aria-label={m.story_about_label()}
		>
			<div class="section-shell about-shell">
				<article class="about-copy" class:landed={aboutTextIn} class:film-in={aboutFilmIn}>
					<span class="eyebrow">{m.story_about_eyebrow()}</span>
					<h2>{m.story_about_title_1()}<br />{m.story_about_title_2()}</h2>
					<p>{m.story_about_body()}</p>
				</article>
				<div class="team-film">
					<iframe
						bind:this={aboutFilmFrame}
						class="team-video"
						src={aboutFilmEmbedUrl}
						title={m.story_about_film()}
						allow="autoplay; encrypted-media; picture-in-picture; web-share"
						referrerpolicy="strict-origin-when-cross-origin"
						onload={onAboutFilmLoad}
						allowfullscreen
					></iframe>
				</div>
			</div>
		</section>

		<section
			id="products"
			class="story-scene product-scene"
			class:scene-active={sceneVisible[2]}
			aria-label={m.story_products_label()}
		>
			<div class="section-shell product-shell">
				<div class="product-copy-stack">
					{#key activeProduct}
						<article class="product-copy" in:fly={flyIn(switchDir)} out:fly={flyOut(switchDir)}>
							<h2>{activeProductData.name()}</h2>
							<p>{activeProductData.summary()}</p>
							<div class="feature-list" style="--frame-url: url('{base}/ui/product-frame.svg')">
								{#each activeProductData.features as feature, index (index)}
									<div>
										<strong>{String(index + 1).padStart(2, '0')}</strong><span>{feature()}</span>
									</div>
								{/each}
							</div>
							<!-- Designer's tag buttons (#64 assets): faces stay stacked so the swap never
							     flickers, and the label is live text for i18n. -->
							{#if activeProductData.href}
								<a
									class="product-cta"
									href={activeProductData.href}
									target="_blank"
									rel="noreferrer"
								>
									<img class="cta-face cta-face-default" src="{base}/ui/visit-default.svg" alt="" />
									<img class="cta-face cta-face-hover" src="{base}/ui/visit-hover.svg" alt="" />
									<span class="cta-label">{m.products_visit()}</span>
								</a>
							{:else}
								<span class="product-cta product-cta-soon">
									<img class="cta-face cta-face-default" src="{base}/ui/soon-tag.svg" alt="" />
									<span class="cta-label">{productStatusLabel[activeProductData.status]()}</span>
								</span>
							{/if}
						</article>
					{/key}
				</div>
				<div class="product-demo">
					<button
						type="button"
						class="arrow previous"
						aria-label="上一個產品"
						onclick={() => selectProduct(activeProduct - 1)}
					>
						<img
							class="arrow-face arrow-face-default"
							src="{base}/ui/arrow-default-left.svg"
							alt=""
						/>
						<img class="arrow-face arrow-face-hover" src="{base}/ui/arrow-hover-left.svg" alt="" />
						<img
							class="arrow-face arrow-face-pressed"
							src="{base}/ui/arrow-pressed-left.svg"
							alt=""
						/>
					</button>
					<!-- Designer's layered hand, split from her composite so every layer shares the
					     same 1863.64×1631.53 box: back fingers behind the phone, the screen inside
					     the frame's cutout, then palm/wrist, little finger and the swiping thumb. -->
					<div class="device-card" data-product={activeProductData.id}>
						<img class="device-hand" src="{base}/story/designer/hand/back-fingers-v2.svg" alt="" />
						<div class="device-phone">
							<div class="device-screen">
								{#key activeProduct}
									<div
										class="device-shot-group"
										in:fly={flyIn(switchDir)}
										out:fly={flyOut(switchDir)}
									>
										{#if activeProductData.screens}
											{#each activeProductData.screens as screen, index (screen.src)}
												<div
													class="device-shot"
													class:active={index === 0}
													style:--screen-position={screen.position ?? 'top'}
												>
													<img
														class="device-screen-light"
														src={`${base}${screen.src}`}
														alt={index === 0 ? activeProductData.name() : ''}
													/>
													{#if screen.darkSrc}
														<img
															class="device-screen-dark"
															src={`${base}${screen.darkSrc}`}
															alt=""
														/>
													{/if}
												</div>
											{/each}
										{:else}
											<div class="map-placeholder">
												<span>NYCU</span><strong>MAP</strong><i></i>
											</div>
										{/if}
									</div>
								{/key}
							</div>
						</div>
						<img class="device-frame" src="{base}/story/designer/hand/phone-v2.svg" alt="" />
						<!-- Palm and thumb are separate layers so only the thumb mimes the swipe (#61). -->
						<img
							class="device-hand-front"
							src="{base}/story/designer/hand/front-palm-v2.svg"
							alt=""
						/>
						<img
							class="device-thumb"
							class:swipe-up={productStepping && switchDir === 1}
							class:swipe-down={productStepping && switchDir === -1}
							src="{base}/story/designer/hand/thumb-v2.svg"
							alt=""
						/>
						<!-- The charging cable runs in front of the little finger. -->
						<img class="device-cable" src="{base}/story/designer/hand/cable-v2.svg" alt="" />
					</div>
					<button
						type="button"
						class="arrow next"
						aria-label="下一個產品"
						onclick={() => selectProduct(activeProduct + 1)}
					>
						<img
							class="arrow-face arrow-face-default"
							src="{base}/ui/arrow-default-right.svg"
							alt=""
						/>
						<img class="arrow-face arrow-face-hover" src="{base}/ui/arrow-hover-right.svg" alt="" />
						<img
							class="arrow-face arrow-face-pressed"
							src="{base}/ui/arrow-pressed-right.svg"
							alt=""
						/>
					</button>
					<div class="product-dots" aria-label="選擇產品">
						{#each products as product, index (product.id)}
							<button
								type="button"
								class:active={index === activeProduct}
								aria-label={product.name()}
								onclick={() => selectProduct(index)}
							></button>
						{/each}
					</div>
				</div>
			</div>
		</section>

		<section
			id="faq"
			class="story-scene faq-scene"
			class:scene-active={sceneVisible[3]}
			aria-label={m.story_faq_label()}
		>
			<div class="section-shell faq-shell">
				<div class="notebook">
					<img
						class="notebook-art"
						src="{base}/story/designer/faq-notebook.svg"
						alt={m.story_faq_alt()}
					/>
					<div class="faq-list">
						<strong>FAQ</strong>
						{#each faqs as item, index (index)}
							<div class="faq-item">
								<button
									type="button"
									aria-expanded={activeFaq === index}
									onclick={() => (activeFaq = index)}
									><span class="faq-question-text">{item.question()}</span><span
										class="faq-icon"
										aria-hidden="true"
									></span></button
								>
								{#if activeFaq === index}
									<p transition:slide={{ duration: 260 }}>{item.answer()}</p>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			</div>
		</section>

		<section
			id="join"
			class="story-scene join-scene"
			class:scene-active={sceneVisible[4]}
			aria-label={m.story_join_label()}
		>
			<div class="section-shell join-shell">
				<!-- One card per open role (#63): the heading sits top-centre, the six roles
				     below it, each linking to its pipeline's recruitment form. -->
				<div class="join-head">
					<span class="eyebrow">{m.story_join_eyebrow()}</span>
					<h2>{m.story_join_heading()}</h2>
					<p>{m.story_join_tagline()}</p>
				</div>
				<ul class="join-cards">
					{#each joinRoles as role (role.id)}
						<li class="join-card" data-group={role.group}>
							<span class="join-card-group">{role.groupLabel()}</span>
							<h3>{role.title()}</h3>
							<span class="join-card-en">{role.subtitle()}</span>
							<p class="join-card-hook">{role.hook()}</p>
							<p class="join-card-desc">{role.description()}</p>
							<a
								href={role.formUrl}
								target="_blank"
								rel="noreferrer"
								data-analytics-event="join_form_click"
								data-analytics-source="home_story"
								data-analytics-role={role.id}>{m.story_join_card_cta()}</a
							>
						</li>
					{/each}
				</ul>
			</div>
		</section>

		<span class="story-count" class:hero-count={chapterIndex === 0} aria-hidden="true"
			>{chapterIndex + 1} / {chapters.length}</span
		>
	</div>
</section>

<style>
	.prototype-story {
		--story-progress: 0;
		--stage-height: max(calc(100svh - 4.75rem), 34rem);
		position: relative;
		/* Tall scroll runway for the sticky stage: 1 stage height on screen plus one per timeline
		   unit (must equal 1 + the sum of SEGMENTS units in the script). */
		height: calc(var(--stage-height) * 10.75);
		background: #f3f4f6;
		color: #333;
	}
	.story-stage {
		position: sticky;
		top: 4.75rem;
		width: 100%;
		height: var(--stage-height);
		overflow: hidden;
		background: #fff;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		border: 0;
		clip-path: inset(50%);
		overflow: hidden;
		white-space: nowrap;
	}
	.story-stage::before {
		content: '';
		position: absolute;
		inset: 0;
		background:
			radial-gradient(circle at 14% 78%, rgba(36, 98, 255, 0.14), transparent 34%),
			radial-gradient(circle at 88% 82%, rgba(255, 173, 173, 0.16), transparent 34%);
		pointer-events: none;
	}
	:global(:root[data-theme='dark']) .prototype-story,
	:global(:root[data-theme='dark']) .story-stage,
	:global(:root[data-theme='dark']) .hero-scene {
		background: #13213a;
	}
	:global(:root[data-theme='dark']) .story-stage::before {
		background:
			radial-gradient(circle at 14% 78%, rgba(92, 137, 235, 0.34), transparent 36%),
			radial-gradient(circle at 88% 82%, rgba(226, 128, 141, 0.25), transparent 36%);
	}
	:global(:root[data-theme='dark']) .section-shell h2 {
		color: #edf4ff;
	}
	:global(:root[data-theme='dark']) .section-shell > article > p,
	:global(:root[data-theme='dark']) .product-copy > p {
		color: #c8d4e5;
	}
	:global(:root[data-theme='dark']) .hero-orbit,
	:global(:root[data-theme='dark']) .hero-orbit::before,
	:global(:root[data-theme='dark']) .hero-orbit::after {
		border-color: rgba(185, 207, 238, 0.13);
	}
	/* The feature rows sit on the designer's white paper frame, so their ink colours hold in
	   dark mode too (like the notebook and join cards). */
	:global(:root[data-theme='dark']) .product-dots button {
		background: #53657f;
	}
	:global(:root[data-theme='dark']) .product-dots button.active {
		background: #79a4ff;
	}
	:global(:root[data-theme='dark']) .scroll-hint,
	:global(:root[data-theme='dark']) .story-count {
		color: #8c9db4;
	}
	:global(:root[data-theme='dark']) .join-head p {
		color: #c8d4e5;
	}
	/* The designer's hand-drawn progress line: revealed left-to-right by clipping, so the
	   stroke's wobble never stretches with progress. */
	.story-progress {
		position: absolute;
		z-index: 30;
		top: 0;
		left: 0;
		width: 100%;
		clip-path: inset(0 calc(100% - var(--story-progress) * 100%) 0 0);
	}
	.story-progress img {
		display: block;
		width: 100%;
		height: auto;
	}
	/* Chapters push each other vertically (#47/#50): during a transition the outgoing scene
	   slides from 0 to -100% while the incoming one slides from 100% to 0, tiling exactly like
	   stacked pages driven by the scroll position. No fades. */
	.story-scene {
		--scene-enter: 1;
		--scene-exit: 0;
		position: absolute;
		inset: 0;
		visibility: hidden;
		pointer-events: none;
		will-change: transform;
		transform: translateY(calc((1 - var(--scene-enter)) * 100% - var(--scene-exit) * 100%));
	}
	.story-scene.scene-active {
		visibility: visible;
		pointer-events: auto;
	}
	.hero-scene {
		display: grid;
		place-items: center;
		--scene-exit: clamp(0, calc((var(--story-progress) - 0.2) * 20), 1);
		background: #fff;
	}
	.about-scene {
		--scene-enter: clamp(0, calc((var(--story-progress) - 0.2) * 20), 1);
		--scene-exit: clamp(0, calc((var(--story-progress) - 0.42) * 12.5), 1);
	}
	.product-scene {
		--scene-enter: clamp(0, calc((var(--story-progress) - 0.42) * 12.5), 1);
		--scene-exit: clamp(0, calc((var(--story-progress) - 0.58) * 12.5), 1);
	}
	.faq-scene {
		--scene-enter: clamp(0, calc((var(--story-progress) - 0.58) * 12.5), 1);
		--scene-exit: clamp(0, calc((var(--story-progress) - 0.72) * 12.5), 1);
	}
	.join-scene {
		--scene-enter: clamp(0, calc((var(--story-progress) - 0.72) * 12.5), 1);
	}
	.section-shell {
		position: relative;
		z-index: 2;
		width: min(72rem, calc(100% - 2 * var(--stage-gutter, 4rem)));
		height: 100%;
		margin: 0 auto;
		display: grid;
		align-items: center;
	}
	.eyebrow {
		color: #2462ff;
		font-size: 0.76rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}
	.section-shell h2 {
		margin: 0.75rem 0 1rem;
		color: #333;
		font-size: clamp(2rem, 4vw, 3.8rem);
		font-weight: 650;
		line-height: 1.13;
		letter-spacing: -0.04em;
	}
	.section-shell p {
		color: #4b5563;
		line-height: 1.75;
	}
	/* Nav-to-content clearance follows the design spec (#53): ≥1440px keeps 80–96px between the
	   nav and the shell, 1024–1439px keeps 56–64px, 768–1023px keeps 32–48px (dots only), and
	   below 768px the side nav disappears entirely. */
	.story-stage {
		--stage-gutter: 9.25rem;
	}
	@media (min-width: 1440px) {
		.story-stage {
			--stage-gutter: 11rem;
		}
	}
	.chapter-nav {
		position: absolute;
		z-index: 40;
		left: 1.4rem;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
		transition:
			opacity 0.3s ease,
			transform 0.3s ease,
			visibility 0.3s;
	}
	/* The hero keeps the whole stage for the machine (#45). */
	.chapter-nav.on-hero {
		opacity: 0;
		visibility: hidden;
		transform: translateY(-50%) translateX(-0.6rem);
		pointer-events: none;
	}
	/* The designer's cloud pill (static/ui/skip-*.svg). All three faces are stacked and kept
	   loaded so hover/press swaps never flicker; the label stays live text for i18n. */
	.skip-story {
		position: absolute;
		z-index: 40;
		top: 1rem;
		right: 1.3rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 9.25rem;
		height: 3.5rem;
		padding: 0 0.75rem;
		border: 0;
		background: none;
		color: #1b2030;
		font-size: 0.86rem;
		font-weight: 650;
		letter-spacing: 0.05em;
		cursor: pointer;
		transition:
			opacity 0.3s ease,
			visibility 0.3s;
	}
	.skip-face {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: contain;
		opacity: 0;
		pointer-events: none;
	}
	/* The hover face carries a soft halo beyond the pill, so it renders oversized to keep the
	   pill itself the same size as the other faces. */
	.skip-face-hover {
		width: 104%;
		height: 120%;
		inset: -10% 0 auto -2%;
	}
	.skip-face-default {
		opacity: 1;
	}
	.skip-story:hover {
		color: #36f;
	}
	.skip-story:hover .skip-face-default {
		opacity: 0;
	}
	.skip-story:hover .skip-face-hover {
		opacity: 1;
	}
	.skip-story:active {
		color: #fff;
	}
	.skip-story:active .skip-face-hover,
	.skip-story:active .skip-face-default {
		opacity: 0;
	}
	.skip-story:active .skip-face-pressed {
		opacity: 1;
	}
	.skip-label {
		position: relative;
	}
	.skip-icon {
		position: relative;
		width: 1.05rem;
		height: auto;
		fill: none;
		stroke: currentColor;
		stroke-width: 3.2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	:global(.prototype-story:not([data-story-step='0'])) .skip-story {
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
	}
	.chapter-nav a {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		color: #9ca3af;
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.12em;
	}
	.chapter-nav i {
		display: block;
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: #d1d5db;
		transition: 0.25s ease;
	}
	.chapter-nav a.active {
		color: #2462ff;
	}
	.chapter-nav a.active i {
		height: 0.9rem;
		border-radius: 999px;
		background: #2462ff;
	}
	.hero-orbit {
		position: absolute;
		width: min(82vh, 52rem);
		aspect-ratio: 1;
		border: 1px solid #e5e7eb;
		border-radius: 50%;
		opacity: 0.8;
		transform: scale(calc(1 - var(--story-progress) * 0.8));
	}
	.hero-orbit::before,
	.hero-orbit::after {
		content: '';
		position: absolute;
		inset: 14%;
		border: 1px solid #edf0f5;
		border-radius: 50%;
	}
	.hero-orbit::after {
		inset: 29%;
	}
	.gacha-machine {
		--gacha-width: min(64vw, 145svh, 112rem);
		--capsule-size: clamp(4.5rem, 8vw, 8rem);
		/* The roll carries the capsule from the machine's release hole (17.3% into the artwork)
		   to the horizontal centre of the viewport: 0.5 − 0.173 of the machine width. */
		--capsule-travel-x: calc(var(--gacha-width) * 0.327);
		--capsule-travel-y: -9vh;
		--capsule-zoom: 1.7;
		--hero-art-shift: 0px;
		/* The capsule drops out immediately; the machine starts rising right behind it (0.02 → 0.12)
		   while the capsule rolls and opens. The capsule counter-translates so it stays put. */
		--machine-exit: clamp(0, calc((var(--story-progress) - 0.02) * 10), 1);
		--machine-exit-distance: -90vh;
		/* The capsule keeps the gentle upward drift the whole machine used to have. */
		--capsule-drift: calc(var(--story-progress) * -65vh);
		position: relative;
		z-index: 3;
		width: var(--gacha-width);
		height: auto;
		aspect-ratio: 16 / 9;
		contain: layout style;
		isolation: isolate;
		will-change: transform;
		transform: translateY(calc(-1vh + var(--machine-exit) * var(--machine-exit-distance)));
	}
	.gacha-machine > img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: contain;
		object-position: 50% 100%;
		transform: translateY(var(--hero-art-shift));
	}
	.gacha-device-art {
		position: absolute;
		inset: 0;
		display: block;
		/* Shadow lives on the static artwork, not the machine wrapper: the capsule inside the
		   wrapper repaints every frame and would force the whole filtered layer to re-blur. */
		filter: drop-shadow(0 1.5rem 2.25rem rgba(26, 55, 103, 0.16));
	}
	.gacha-device-art img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	/* Anchors below are the 旋鈕本體 bbox within each artwork's viewBox; the dial makes one
	   decisive turn while the capsule is dispensed (progress 0 → 0.025). */
	.machine-knob {
		position: absolute;
		left: 80.89%;
		top: 77.22%;
		width: 9.22%;
		height: 16.3%;
		will-change: transform;
		transform: translateY(var(--hero-art-shift))
			rotate(calc(clamp(0, calc(var(--story-progress) * 40), 1) * 160deg));
	}
	.machine-knob img {
		display: block;
		width: 100%;
		height: 100%;
	}
	.gacha-machine > .machine-base,
	.gacha-machine > .machine-glass,
	.gacha-machine > .machine-hole,
	.gacha-machine > .gacha-contents {
		display: none;
	}
	.gacha-machine > .machine-glass {
		z-index: 2;
	}
	.gacha-contents {
		position: absolute;
		z-index: 1;
		inset: 0;
		contain: layout paint;
		will-change: transform;
		transform: translateY(calc(var(--hero-art-shift) + var(--story-progress) * -2.5vh));
	}
	.gacha-contents > img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: contain;
		object-position: 50% 100%;
	}
	.gacha-machine > .machine-hole {
		z-index: 4;
	}
	.capsule {
		--capsule-emerge: clamp(0, calc(var(--story-progress) * 33.4), 1);
		--capsule-roll: clamp(0, calc((var(--story-progress) - 0.03) * 12.5), 1);
		--capsule-shake: clamp(0, calc((var(--story-progress) - 0.11) * 50), 1);
		--capsule-open: clamp(0, calc((var(--story-progress) - 0.13) * 28.6), 1);
		--capsule-float: clamp(0, calc((var(--story-progress) - 0.165) * 11.8), 1);
		position: absolute;
		z-index: 8;
		left: 17.3%;
		top: calc(100% - var(--gacha-width) * 0.0867);
		width: var(--capsule-size);
		aspect-ratio: 1;
		opacity: clamp(0, calc(var(--story-progress) * 60), 1);
		will-change: transform, opacity;
		transform: translate3d(
				calc(-50% + var(--capsule-roll) * var(--capsule-travel-x)),
				calc(
					-50% + var(--hero-art-shift) + var(--capsule-emerge) * 2.5rem + var(--capsule-roll) *
						var(--capsule-travel-y) + var(--capsule-drift) - var(--machine-exit) *
						var(--machine-exit-distance)
				),
				0
			)
			scale(calc(0.42 + var(--capsule-emerge) * 0.58 + var(--capsule-roll) * var(--capsule-zoom)));
	}
	.capsule-rotor {
		position: absolute;
		inset: 0;
		will-change: transform;
		transform: rotate(calc(var(--capsule-roll) * 720deg));
	}
	.capsule-svg {
		display: block;
		width: 100%;
		height: 100%;
		overflow: visible;
	}
	.capsule-svg
		:is(
			.capsule-body,
			.capsule-shell,
			.capsule-letter,
			.capsule-glow,
			.capsule-rays,
			.capsule-ring,
			.capsule-spark
		) {
		transform-box: fill-box;
		transform-origin: 50% 50%;
	}
	.capsule-ball {
		fill: #fff;
		stroke: #231815;
		stroke-miterlimit: 10;
		opacity: 0.91;
	}
	.capsule-lip {
		fill: #596586;
		opacity: 0.32;
	}
	.capsule-base {
		fill: #596586;
	}
	.capsule-paper {
		fill: #fff;
		stroke: #2a4365;
		stroke-width: 1.4px;
		stroke-miterlimit: 10;
	}
	.capsule-badge {
		fill: #bb2e31;
		opacity: 0.81;
	}
	.capsule-ray {
		fill: #fffdf5;
	}
	.capsule-ring {
		fill: none;
		stroke: #fffdf5;
	}
	.capsule-cut {
		fill: none;
		stroke: #231815;
		stroke-width: 1;
		stroke-linecap: round;
		opacity: var(--capsule-open);
	}
	/* 蓄力震動：開殼前一小段左右抖動並微微脹大 */
	.capsule-body {
		transform: rotate(
				calc(sin(var(--capsule-shake) * 25.13) * sin(var(--capsule-shake) * 3.1416) * 4.4deg)
			)
			scale(calc(1 + sin(var(--capsule-shake) * 3.1416) * 0.05));
	}
	.capsule-shell {
		will-change: transform, opacity;
	}
	.capsule-shell-top {
		transform: translate(calc(var(--capsule-open) * -26px), calc(var(--capsule-open) * -118px))
			rotate(calc(var(--capsule-open) * -30deg));
		opacity: clamp(0, calc(1 - (var(--capsule-open) - 0.3) * 1.6), 1);
	}
	.capsule-shell-bottom {
		transform: translate(calc(var(--capsule-open) * 18px), calc(var(--capsule-open) * 92px))
			rotate(calc(var(--capsule-open) * 17deg));
		opacity: clamp(0, calc(1 - (var(--capsule-open) - 0.3) * 1.6), 1);
	}
	.capsule-seam {
		opacity: clamp(0, calc(sin(var(--capsule-open) * 6.2832) * 1.2), 1);
	}
	/* 內容物：壓縮 → 彈出 → 回彈，然後在漂浮段緩緩上下浮動 */
	.capsule-letter {
		transform: translate(
				0,
				calc(
					var(--capsule-open) * -9px + sin(var(--capsule-open) * 3.1416) * -6px +
						sin(var(--capsule-float) * 6.2832) * -5px
				)
			)
			rotate(calc(sin(var(--capsule-float) * 6.2832) * 1.4deg))
			scale(calc(1 + var(--capsule-open) * 0.06 + sin(var(--capsule-open) * 3.1416) * 0.12));
	}
	.capsule-glow {
		opacity: clamp(0, calc(var(--capsule-open) * 0.95 - var(--capsule-float) * 0.6), 1);
		transform: scale(calc(0.45 + var(--capsule-open) * 0.6));
	}
	.capsule-rays {
		opacity: clamp(0, calc(sin(var(--capsule-open) * 3.1416) * 0.95), 1);
		transform: scale(calc(0.6 + var(--capsule-open) * 0.48))
			rotate(calc(var(--capsule-open) * 13deg));
	}
	.capsule-ring {
		opacity: clamp(0, calc(sin(var(--capsule-open) * 3.1416) * 0.85), 1);
		stroke-width: calc(7px - var(--capsule-open) * 6px);
		transform: scale(calc(0.28 + var(--capsule-open) * 1.06));
	}
	.capsule-spark {
		opacity: clamp(0, calc(sin(var(--capsule-open) * 3.1416)), 1);
		transform: translateX(calc(14px + var(--capsule-open) * 122px))
			scale(calc(0.15 + sin(var(--capsule-open) * 3.1416) * 0.95));
	}
	.capsule-spark-b {
		transform: translateX(calc(14px + var(--capsule-open) * 138px))
			scale(calc(0.15 + sin(var(--capsule-open) * 3.1416) * 1.1));
	}
	.capsule-spark-c {
		transform: translateX(calc(14px + var(--capsule-open) * 106px))
			scale(calc(0.1 + sin(var(--capsule-open) * 3.1416) * 0.85));
	}
	.scroll-hint {
		/* Gone by the time the capsule emerges: fades and drifts upward over the first 4%. */
		--hint-out: clamp(0, calc(var(--story-progress) * 25), 1);
		position: absolute;
		z-index: 10;
		bottom: calc(clamp(2.75rem, 5vh, 4rem) + var(--hint-out) * 8vh);
		left: 50%;
		transform: translateX(-50%);
		opacity: calc(1 - var(--hint-out));
		color: #9ca3af;
		font-size: 0.65rem;
		letter-spacing: 0.16em;
		animation: bob 1.8s ease-in-out infinite;
	}
	.about-shell {
		/* Shared by the copy's centring shift and the film's rise (#59). */
		--film-in: clamp(0, calc((var(--story-progress) - 0.3) * 10), 1);
		grid-template-columns: minmax(0, 0.9fr) minmax(25rem, 1.1fr);
		gap: clamp(2rem, 6vw, 6rem);
		/* Container so the copy can measure the shell (cqw) to centre itself in it. */
		container-type: inline-size;
	}
	/* Two-stage entrance (#46): the copy drops in first and settles with two shrinking
	   bounces; only after the reader keeps scrolling does the film rise into place. Before it
	   lands it must hide via visibility, not a transform — an upward offset would cancel the
	   scene's own below-viewport enter offset and leak the copy over the hero. */
	.about-copy {
		visibility: hidden;
		/* The copy drops into the middle of the shell, centred; scrolling on slides it (via
		   `translate`, composing with the drop animation's transform) into its grid column as
		   the film rises (#59). 50cqw − 50% moves the element's centre onto the shell's. */
		translate: calc((1 - var(--film-in)) * (50cqw - 50%)) 0;
	}
	.about-copy:not(.film-in) {
		text-align: center;
	}
	.about-copy:not(.film-in) p {
		margin-inline: auto;
	}
	.about-copy.landed {
		visibility: visible;
		animation: about-drop 0.95s cubic-bezier(0.22, 0.8, 0.36, 1) forwards;
	}
	@keyframes about-drop {
		0% {
			transform: translateY(-120vh);
		}
		46% {
			transform: translateY(0);
		}
		62% {
			transform: translateY(-2.2rem);
		}
		77% {
			transform: translateY(0);
		}
		88% {
			transform: translateY(-0.7rem);
		}
		100% {
			transform: translateY(0);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.about-copy {
			transform: none;
			animation: none;
		}
	}
	.about-copy h2 {
		/* Sized so 「我們不只找到問題，」 stays on one line in its column. */
		font-size: clamp(2rem, 3vw, 3.2rem);
	}
	.about-copy p {
		max-width: 34rem;
	}
	.team-film {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 9;
		border-radius: 2rem;
		background: #0c47ef;
		box-shadow: 0 2rem 4rem rgba(36, 98, 255, 0.2);
		overflow: hidden;
		color: #fff;
		transform: translateY(calc((1 - var(--film-in)) * 95svh));
	}
	.team-video {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		border: 0;
		object-fit: cover;
		background: #0c47ef;
	}
	.product-shell {
		grid-template-columns: minmax(22rem, 0.9fr) minmax(27rem, 1.1fr);
		gap: clamp(2rem, 6vw, 6rem);
	}
	/* Outgoing and incoming copy overlap in the same grid cell while they crossfade. */
	.product-copy-stack {
		min-width: 0;
		display: grid;
	}
	.product-copy-stack > .product-copy {
		grid-area: 1 / 1;
	}
	.product-copy {
		min-width: 0;
	}
	.product-copy h2 {
		font-size: clamp(2.3rem, 4.2vw, 4rem);
	}
	.feature-list {
		display: grid;
		gap: 0.65rem;
		margin-top: 1.35rem;
	}
	/* Each feature row sits in the designer's hand-drawn frame (框框/產品介紹), stretched to
	   the row via preserveAspectRatio="none". */
	.feature-list div {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		padding: 0.85rem 1.2rem;
		background: var(--frame-url) center / 100% 100% no-repeat;
	}
	.feature-list strong {
		color: #2462ff;
		font-size: 1.05rem;
	}
	.feature-list span {
		color: #4b5563;
		font-size: 0.86rem;
	}
	/* Designer's 前往使用 tag: stacked default/hover faces with a live label over the tag's
	   text area (left of the arrow disc), tilted to sit on the drawn baseline. */
	.product-cta {
		position: relative;
		display: inline-grid;
		place-items: center;
		margin-top: 1.1rem;
		width: 11.5rem;
		aspect-ratio: 338.17 / 178.42;
		color: #fff;
		font-size: 1.02rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		transition: transform 0.2s ease;
	}
	.product-cta:hover {
		transform: translateY(-2px);
	}
	.cta-face {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: contain;
		opacity: 0;
		pointer-events: none;
	}
	.cta-face-default {
		opacity: 1;
	}
	.product-cta:hover .cta-face-default {
		opacity: 0;
	}
	.product-cta:hover .cta-face-hover {
		opacity: 1;
	}
	.cta-label {
		position: relative;
		max-width: 62%;
		text-align: center;
		line-height: 1.1;
		transform: translate(-17%, 8%) rotate(-4deg);
	}
	/* 開發中 paper tag: ink label, no link affordance. */
	.product-cta-soon {
		width: 9.75rem;
		aspect-ratio: 267.77 / 175.59;
		color: #1b2b56;
		cursor: default;
	}
	.product-cta-soon:hover {
		transform: none;
	}
	.product-cta-soon .cta-label {
		max-width: 70%;
		transform: translate(0%, 12%) rotate(-6deg);
	}
	.product-demo {
		--device-card-width: min(146vh, 100rem);
		position: relative;
		display: grid;
		place-items: center;
		min-height: 34rem;
	}
	.device-card {
		/* Out of flow so the oversized artwork can't stretch the column; anchored so the phone's
		   centre (16.4%, 28.4% of the artwork) lands exactly on the demo area's centre. */
		position: absolute;
		left: 50%;
		top: 50%;
		/* Sized so the phone (56.7% of the artwork's height) reads large; the wrist bleeds off. */
		width: var(--device-card-width);
		aspect-ratio: 1863.64 / 1631.53;
		filter: drop-shadow(0 2rem 3rem rgba(36, 98, 255, 0.18));
		transform: translate(-16.4%, -28.4%);
	}
	.device-card > img {
		position: absolute;
		inset: 0;
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
		pointer-events: none;
	}
	.device-card > .device-hand {
		z-index: 1;
	}
	/* Phone shell bounds inside the artwork (手機殼 path). */
	.device-phone {
		position: absolute;
		z-index: 2;
		left: 4.289%;
		top: 0.061%;
		width: 24.238%;
		height: 56.718%;
	}
	/* Screen fills to the inner frame line (內框 outer path) relative to the shell bounds, so no
	   bezel gap shows between the screenshot and the frame. */
	.device-screen {
		position: absolute;
		z-index: 1;
		inset: 1.651% 2.86% 1.764% 2.947%;
		border-radius: 16.5% / 7.9%;
		overflow: hidden;
		background: #fff;
	}
	.device-shot-group {
		position: absolute;
		inset: 0;
	}
	.device-shot {
		position: absolute;
		inset: 0;
		opacity: 0;
		transition: opacity 0.7s ease;
	}
	.device-shot.active {
		opacity: 1;
	}
	.device-shot > img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: var(--screen-position);
	}
	.device-screen-dark {
		display: none;
	}
	:global(:root[data-theme='dark']) .device-screen-dark {
		display: block;
	}
	:global(:root[data-theme='dark']) .device-shot:has(.device-screen-dark) .device-screen-light {
		display: none;
	}
	@media (prefers-reduced-motion: reduce) {
		.device-shot {
			transition: none;
		}
	}
	.device-card > .device-frame {
		z-index: 3;
	}
	.device-card > .device-hand-front {
		z-index: 4;
		/* The supplied hand leaves a hairline of screen between its thumb/palm join and the
		   phone's lower-right edge. -1.15% closed that seam;
		   the extra +0.85% sits the thumb a touch further right per design feedback. */
		transform: translateX(-0.3%);
	}
	/* Only the thumb moves, like idly scrolling a feed (#61): a quick flick up from its base
	   joint, a slower settle back, then a beat of rest. Origin sits on the thumb's knuckle
	   (≈29.5%, 37% of the shared artwork box) so it pivots instead of drifting. */
	.device-card > .device-thumb {
		z-index: 5;
		transform: translateX(-0.3%);
		transform-origin: 29.5% 37%;
		animation: thumb-idle 3.2s ease-in-out infinite;
	}
	@keyframes thumb-idle {
		0%,
		56%,
		100% {
			transform: translateX(-0.3%);
		}
		10% {
			transform: translateX(-0.3%) translateY(-1.3%) rotate(2.2deg);
		}
		30% {
			transform: translateX(-0.3%) translateY(0.4%) rotate(-0.8deg);
		}
		44% {
			transform: translateX(-0.3%);
		}
	}
	/* A firmer flick while the product actually switches (#49). */
	.device-card > .device-thumb.swipe-up {
		animation: thumb-swipe-up 0.46s ease;
	}
	.device-card > .device-thumb.swipe-down {
		animation: thumb-swipe-down 0.46s ease;
	}
	@keyframes thumb-swipe-up {
		40% {
			transform: translateX(-0.3%) translateY(-2.1%) rotate(3.2deg);
		}
	}
	@keyframes thumb-swipe-down {
		40% {
			transform: translateX(-0.3%) translateY(2.1%) rotate(-3.2deg);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.device-card > .device-thumb {
			animation: none;
		}
	}
	.device-card > .device-cable {
		z-index: 6;
	}
	.map-placeholder {
		height: 100%;
		border-radius: 1.5rem;
		background: linear-gradient(145deg, #ccdbff, #f3f4f6);
		display: grid;
		place-content: center;
		text-align: center;
		color: #2462ff;
	}
	.map-placeholder span {
		font-size: 0.72rem;
		letter-spacing: 0.18em;
	}
	.map-placeholder strong {
		font-size: 3.5rem;
	}
	.map-placeholder i {
		width: 6rem;
		border-top: 3px dashed #2462ff;
		transform: rotate(-20deg);
	}
	/* Designer's sticker arrows: three faces per side (default/hover/pressed). */
	.arrow {
		position: absolute;
		z-index: 4;
		top: 50%;
		width: 3.4rem;
		aspect-ratio: 1;
		padding: 0;
		border: 0;
		background: none;
		cursor: pointer;
	}
	.arrow:hover {
		transform: scale(1.08);
	}
	.arrow-face {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		pointer-events: none;
	}
	.arrow-face-default {
		opacity: 1;
	}
	.arrow:hover .arrow-face-default {
		opacity: 0;
	}
	.arrow:hover .arrow-face-hover {
		opacity: 1;
	}
	.arrow:active .arrow-face-default,
	.arrow:active .arrow-face-hover {
		opacity: 0;
	}
	.arrow:active .arrow-face-pressed {
		opacity: 1;
	}
	.arrow.previous {
		left: 0;
	}
	.arrow.next {
		right: 0;
	}
	.product-dots {
		position: absolute;
		z-index: 5;
		left: 50%;
		/* Below the charging plug: the cable ends at 69.4% of the artwork's height, the phone's
		   centre sits at 28.4%; (0.694 − 0.284) × H with H = W / 1.1423 ≈ 0.359 × W. */
		top: calc(50% + var(--device-card-width) * 0.359 + 0.6rem);
		display: flex;
		gap: 0.45rem;
		transform: translateX(-50%);
	}
	.product-dots button {
		width: 0.5rem;
		height: 0.5rem;
		padding: 0;
		border: 0;
		border-radius: 999px;
		background: #d1d5db;
		cursor: pointer;
		transition: 0.2s ease;
	}
	.product-dots button.active {
		width: 1.4rem;
		background: #2462ff;
	}
	/* The notebook holds the whole FAQ chapter, centred on the stage (#52). */
	.faq-shell {
		grid-template-columns: minmax(0, 1fr);
		place-items: center;
	}
	.notebook {
		position: relative;
		width: min(60vw, 46rem);
		justify-self: center;
	}
	.notebook-art {
		width: 100%;
		display: block;
	}
	.faq-list {
		position: absolute;
		inset: 18% 11% 15% 17%;
		color: #172235;
	}
	.faq-list > strong {
		display: block;
		margin-bottom: 0.25rem;
		font-size: clamp(2.5rem, 5vw, 5rem);
		line-height: 0.9;
	}
	.faq-item {
		border-bottom: 1px solid #d1d5db;
	}
	.faq-item button {
		width: 100%;
		min-height: 2.6rem;
		padding: 0.45rem 0;
		border: 0;
		background: transparent;
		color: #172235;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		text-align: left;
		font-weight: 650;
		line-break: strict;
		text-wrap: pretty;
		cursor: pointer;
	}
	.faq-question-text {
		min-width: 0;
		text-wrap: balance;
	}
	.faq-item p {
		margin: 0 0 0.6rem;
		color: #52647d;
		font-size: 0.8rem;
		line-height: 1.55;
	}
	/* ＋ / − built from two bars so the toggle morphs instead of swapping glyphs. */
	.faq-icon {
		position: relative;
		flex: 0 0 auto;
		width: 0.9rem;
		height: 0.9rem;
		transition: transform 0.3s cubic-bezier(0.2, 0.7, 0.2, 1);
	}
	.faq-icon::before,
	.faq-icon::after {
		content: '';
		position: absolute;
		left: 50%;
		top: 50%;
		width: 100%;
		height: 2px;
		border-radius: 2px;
		background: currentColor;
		transform: translate(-50%, -50%);
		transition: transform 0.3s cubic-bezier(0.2, 0.7, 0.2, 1);
	}
	.faq-icon::after {
		transform: translate(-50%, -50%) rotate(90deg);
	}
	.faq-item button[aria-expanded='true'] .faq-icon {
		transform: rotate(180deg);
	}
	.faq-item button[aria-expanded='true'] .faq-icon::after {
		transform: translate(-50%, -50%) rotate(0deg);
	}
	@media (prefers-reduced-motion: reduce) {
		.faq-icon,
		.faq-icon::before,
		.faq-icon::after {
			transition: none;
		}
	}
	/* One paper card per open role (#63), pinned like notes on a board: white sheets with the
	   artwork's ink-blue stroke, a strip of tape on top and alternating tilts. */
	.join-shell {
		grid-template-rows: auto auto;
		place-items: center;
		align-content: center;
		gap: clamp(1rem, 2.8vh, 2rem);
	}
	.join-head {
		text-align: center;
	}
	.join-head h2 {
		margin: 0.55rem 0 0.4rem;
	}
	.join-head p {
		margin: 0;
		color: #66758a;
		font-size: clamp(0.85rem, 1.7vh, 1rem);
	}
	.join-cards {
		list-style: none;
		width: 100%;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: clamp(0.8rem, 1.9vh, 1.3rem);
	}
	.join-card {
		position: relative;
		display: flex;
		flex-direction: column;
		padding: clamp(0.95rem, 2.1vh, 1.35rem) clamp(1rem, 1.5vw, 1.35rem);
		border: 1.5px solid #4b6390;
		border-radius: 0.45rem;
		background: #fff;
		box-shadow: 0 0.7rem 1.7rem rgba(55, 65, 81, 0.1);
		color: #172235;
		rotate: -0.7deg;
	}
	.join-card:nth-child(even) {
		rotate: 0.65deg;
	}
	.join-card::before {
		content: '';
		position: absolute;
		top: -0.55rem;
		left: 50%;
		width: 3.4rem;
		height: 1.05rem;
		border: 1px solid rgba(75, 99, 144, 0.35);
		background: rgba(204, 219, 255, 0.72);
		transform: translateX(-50%) rotate(-2deg);
	}
	.join-card:nth-child(even)::before {
		transform: translateX(-50%) rotate(1.6deg);
	}
	.join-card-group {
		align-self: flex-start;
		padding: 0.22rem 0.62rem;
		border-radius: 999px;
		background: #ccdbff;
		color: #2455a8;
		font-size: 0.62rem;
		font-weight: 700;
		letter-spacing: 0.08em;
	}
	.join-card[data-group='marketing'] .join-card-group {
		background: #ffe5ad;
		color: #6c4c08;
	}
	.join-card[data-group='dev'] .join-card-group {
		background: #d5f1b1;
		color: #44691d;
	}
	.join-card[data-group='ops'] .join-card-group {
		background: #e5dbff;
		color: #5b3fa8;
	}
	.join-card h3 {
		margin: 0.5rem 0 0.1rem;
		font-size: clamp(1rem, 2vh, 1.2rem);
		font-weight: 650;
		letter-spacing: -0.02em;
	}
	.join-card-en {
		color: #8a97ab;
		font-size: 0.6rem;
		font-weight: 650;
		letter-spacing: 0.07em;
		text-transform: uppercase;
	}
	/* Beat `.section-shell p`'s class+type specificity so the card ink colours hold. */
	.join-card p.join-card-hook {
		margin: 0.45rem 0 0;
		color: #172235;
		font-size: 0.78rem;
		font-weight: 650;
		line-height: 1.45;
		/* CJK closing punctuation would otherwise hang past the card edge on narrow cards. */
		overflow-wrap: anywhere;
	}
	.join-card p.join-card-desc {
		margin: 0.3rem 0 0;
		color: #52647d;
		font-size: 0.72rem;
		line-height: 1.55;
		overflow-wrap: anywhere;
	}
	.join-card > a {
		align-self: flex-start;
		margin-top: auto;
		padding-top: 0.55rem;
		color: #df725e;
		font-size: 0.78rem;
		font-weight: 700;
	}
	.join-card > a:hover {
		text-decoration: underline;
	}
	/* Tight stages — short laptops/landscape tablets (1024×768) and narrow portrait tablets
	   (768×1024, where two columns make three tall rows): compact the cards so the heading
	   and every row stay inside the sticky stage. */
	@media (min-width: 768px) and (max-height: 840px),
		(min-width: 768px) and (max-width: 1023px) and (max-height: 1040px) {
		.join-shell {
			gap: 1rem;
		}
		.join-head h2 {
			margin: 0.4rem 0 0.25rem;
			font-size: 2.1rem;
		}
		.join-head p {
			font-size: 0.8rem;
		}
		.join-cards {
			gap: 0.8rem;
		}
		.join-card {
			padding: 0.85rem 1rem;
		}
		.join-card h3 {
			margin-top: 0.4rem;
			font-size: 1rem;
		}
		.join-card-group {
			font-size: 0.58rem;
		}
		.join-card-en {
			font-size: 0.56rem;
		}
		.join-card p.join-card-hook {
			margin-top: 0.35rem;
			font-size: 0.72rem;
		}
		.join-card p.join-card-desc {
			font-size: 0.68rem;
			line-height: 1.5;
		}
		.join-card > a {
			padding-top: 0.45rem;
			font-size: 0.72rem;
		}
	}
	.story-count {
		position: absolute;
		z-index: 40;
		pointer-events: none;
		right: 1.3rem;
		bottom: 1.1rem;
		padding: 0.25rem 0.45rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.9);
		color: #9ca3af;
		font-size: 0.75rem;
		line-height: 1;
	}
	.story-count.hero-count {
		bottom: clamp(2.75rem, 5vh, 4rem);
	}
	:global(:root[data-theme='dark']) .story-count {
		background: rgba(19, 31, 51, 0.74);
	}
	@keyframes bob {
		50% {
			transform: translate(-50%, 0.35rem);
		}
	}

	@media (min-width: 1800px) {
		.section-shell {
			width: min(100rem, calc(100% - 2 * var(--stage-gutter)));
		}
		.section-shell h2 {
			font-size: clamp(3.5rem, 3.2vw, 5rem);
		}
		.section-shell p {
			font-size: 1.08rem;
		}
		.hero-orbit {
			width: min(86vh, 68rem);
		}
		.gacha-machine {
			--gacha-width: min(64vw, 145svh, 112rem);
		}
		.product-demo {
			min-height: 44rem;
		}
		.product-demo {
			--device-card-width: min(146vh, 120rem);
		}
		.notebook {
			width: min(50vw, 58rem);
		}
		.faq-item button,
		.faq-item p {
			font-size: 1rem;
		}
		.join-card h3 {
			font-size: 1.35rem;
		}
		.join-card p.join-card-hook,
		.join-card p.join-card-desc,
		.join-card > a {
			font-size: 0.85rem;
		}
	}

	@media (max-width: 1200px) and (min-width: 901px) {
		.faq-list > strong {
			margin-bottom: 0.1rem;
			font-size: clamp(2rem, 3.5vw, 2.6rem);
		}
		.faq-item button {
			min-height: 2.25rem;
			padding-block: 0.3rem;
			font-size: 0.86rem;
		}
		.faq-item p {
			margin-bottom: 0.45rem;
			font-size: 0.76rem;
			line-height: 1.45;
		}
	}

	@media (max-width: 1023px) {
		/* Tablets keep the side nav as dots only (#53). */
		.story-stage {
			--stage-gutter: 4.5rem;
		}
		.chapter-nav span {
			display: none;
		}
		.join-cards {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 767px) {
		.chapter-nav {
			display: none;
		}
		.story-stage {
			--stage-gutter: 1.125rem;
		}
		/* Phones: the role cards become a horizontal snap strip bleeding to the stage edges. */
		.join-cards {
			display: flex;
			overflow-x: auto;
			scroll-snap-type: x mandatory;
			gap: 0.8rem;
			margin-inline: calc(-1 * var(--stage-gutter));
			width: calc(100% + 2 * var(--stage-gutter));
			padding: 0.7rem var(--stage-gutter) 1rem;
			scrollbar-width: none;
		}
		.join-cards::-webkit-scrollbar {
			display: none;
		}
		.join-card {
			flex: 0 0 min(76vw, 19rem);
			scroll-snap-align: center;
		}
	}
	@media (max-width: 900px) {
		.prototype-story {
			--stage-height: max(calc(100svh - 4.75rem), 35rem);
		}
		.section-shell {
			width: calc(100% - 2 * var(--stage-gutter));
		}
		/* The mobile/tablet artwork occupies the lower edge, so keep utility copy out of it. */
		.scroll-hint {
			display: none;
		}
		/* Top-left on the hero: the skip pill owns the top-right corner. */
		.story-count.hero-count {
			top: 0.75rem;
			bottom: auto;
			right: auto;
			left: 1.3rem;
		}
		.gacha-machine {
			--gacha-width: min(94vw, 44rem);
			--capsule-size: clamp(4.5rem, 14vw, 6.5rem);
			/* Release hole sits 18.5% into the mobile artwork. */
			--capsule-travel-x: calc(var(--gacha-width) * 0.315);
			--capsule-travel-y: -4svh;
			--capsule-zoom: 1.65;
			--hero-art-shift: 0px;
			height: auto;
			aspect-ratio: 1179 / 1050;
			--machine-exit-distance: -110vh;
			--capsule-drift: calc(var(--story-progress) * -70vh);
			transform: translateY(calc(var(--machine-exit) * var(--machine-exit-distance)));
		}
		.gacha-device-art {
			position: absolute;
			inset: 0;
			display: block;
		}
		.gacha-device-art img {
			display: block;
			width: 100%;
			height: 100%;
			object-fit: contain;
		}
		.gacha-machine > .machine-base,
		.gacha-machine > .machine-glass,
		.gacha-machine > .machine-hole,
		.gacha-machine > .gacha-contents {
			display: none;
		}
		.capsule {
			left: 18.5%;
			top: 80%;
		}
		.machine-knob {
			left: 78.54%;
			top: 77.71%;
			width: 15.01%;
			height: 16.86%;
		}
		.about-shell {
			grid-template-columns: 1fr;
			grid-template-rows: auto auto;
			align-content: center;
			gap: clamp(1.25rem, 2.5svh, 2rem);
		}
		.about-copy {
			text-align: center;
			/* Single column: the copy is already centred, no shift toward the film. */
			translate: none;
		}
		.about-copy h2 {
			font-size: clamp(1.9rem, 7vw, 2.7rem);
		}
		.about-copy p {
			margin-inline: auto;
			max-width: 40rem;
			font-size: 0.9rem;
			text-wrap: pretty;
		}
		.team-film {
			width: min(92%, 38rem);
			justify-self: center;
			border-radius: 1.3rem;
		}
		.product-shell {
			grid-template-columns: minmax(0, 1fr);
			grid-template-rows: auto minmax(0, 1fr);
			align-content: center;
			gap: 0.75rem;
			box-sizing: border-box;
			width: 100%;
			padding: clamp(1.25rem, 3svh, 2rem) 1.125rem 0;
		}
		.product-copy {
			width: 100%;
			min-width: 0;
			text-align: center;
		}
		.product-copy h2 {
			margin: 0.3rem 0;
			font-size: clamp(1.75rem, 7vw, 2.5rem);
		}
		.product-copy > p {
			width: 100%;
			margin: 0 auto;
			max-width: 36rem;
			overflow-wrap: anywhere;
			font-size: 0.83rem;
			line-height: 1.55;
			text-wrap: pretty;
		}
		.feature-list {
			gap: 0.4rem;
			margin: 0.8rem auto 0;
			max-width: 34rem;
			text-align: left;
		}
		.feature-list div {
			gap: 0.65rem;
			padding: 0.5rem 0.8rem;
			border-radius: 0.75rem;
		}
		.feature-list strong {
			font-size: 0.85rem;
		}
		.feature-list span {
			font-size: 0.78rem;
		}
		.product-cta {
			margin-top: 0.45rem;
			width: 9.5rem;
			font-size: 0.88rem;
		}
		.product-cta-soon {
			width: 8.25rem;
		}
		.product-demo {
			min-height: 0;
			min-width: 0;
			height: 100%;
			transform: none;
		}
		/* Phones: the phone hangs from the top of the demo area, as large as the viewport width
		   allows (≈62vw), and may run off the bottom of the stage. */
		.product-demo {
			--device-card-width: min(292vw, 116svh, 68rem);
		}
		.device-card {
			top: 0;
			transform: translate(-16.4%, -0.06%);
		}
		/* The phone may run off the stage on short phones: keep the indicator pinned to the
		   stage bottom and the arrows within reach. */
		.product-dots {
			top: auto;
			bottom: 0.6rem;
		}
		.arrow {
			top: min(calc(var(--device-card-width) * 0.2483), calc(100% - 3.5rem));
		}
		.arrow {
			width: 2.8rem;
		}
		.arrow.previous {
			left: 8%;
		}
		.arrow.next {
			right: 8%;
		}
		/* Phones: heading on top, then the notebook turned 90° into a portrait pad that takes the
		   full width or the remaining height, whichever binds. One shared --pad-width drives the
		   board, its art and the type, so they can never disagree. */
		.faq-shell {
			--pad-width: min(100vw, 46rem, calc((100svh - 15rem) * 0.7857));
			grid-template-columns: minmax(0, 1fr);
			grid-template-rows: auto auto;
			align-content: center;
			gap: 0.9rem;
			width: 100%;
		}
		/* Phones: the landscape notebook (1120×880) is turned 90° into a portrait pad with the
		   spiral on top, which gives the five questions far more room. */
		.notebook {
			width: var(--pad-width);
			height: calc(var(--pad-width) * 1.2727);
			max-width: none;
			justify-self: center;
			overflow: hidden;
		}
		.notebook-art {
			position: absolute;
			left: 50%;
			top: 50%;
			width: calc(var(--pad-width) * 1.2727);
			height: var(--pad-width);
			transform: translate(-50%, -50%) rotate(90deg);
		}
		/* The landscape insets (top 16 / right 11 / bottom 12 / left 18) rotated with the art. */
		.faq-list {
			/* Align copy to the actual front sheet, not the transparent/decorative SVG canvas. */
			/* Match the phone insets: the looser 14/15% margins let long answers and the +/-
			   toggles spill past the sheet's grid squares on mid-size tablets (e.g. 853×1280). */
			inset: 21.5% 18.1% 4% 20%;
		}
		/* Type scales with the pad, so a bigger board means bigger text. */
		.faq-list > strong {
			margin-bottom: calc(var(--pad-width) * 0.006);
			font-size: calc(var(--pad-width) * 0.075);
		}
		.faq-item button {
			min-height: calc(var(--pad-width) * 0.075);
			padding-block: calc(var(--pad-width) * 0.008);
			gap: calc(var(--pad-width) * 0.02);
			font-size: calc(var(--pad-width) * 0.029);
			line-height: 1.25;
		}
		.faq-item p {
			margin-bottom: calc(var(--pad-width) * 0.01);
			max-width: 98%;
			font-size: calc(var(--pad-width) * 0.0255);
			line-height: 1.42;
			text-wrap: pretty;
		}
		.faq-icon {
			width: calc(var(--pad-width) * 0.028);
			height: calc(var(--pad-width) * 0.028);
		}
	}

	@media (max-width: 430px) {
		.prototype-story {
			--stage-height: max(calc(100svh - 4.75rem), 31rem);
		}
		.gacha-machine {
			--gacha-width: min(96vw, 26rem);
			--capsule-size: clamp(4.25rem, 18vw, 5.5rem);
			/* Release hole sits 22.6% into the compact artwork. */
			--capsule-travel-x: calc(var(--gacha-width) * 0.274);
			--capsule-travel-y: -2svh;
			--capsule-zoom: 1.8;
			aspect-ratio: 1179 / 1320;
			/* Leave a dependable text-to-art gutter even when mobile browser chrome reduces the
			   usable viewport. The lower part of this illustration is intentionally allowed to crop. */
			transform: translateY(calc(var(--machine-exit) * var(--machine-exit-distance)));
		}
		.capsule {
			left: 22.6%;
			top: 80%;
		}
		.machine-knob {
			left: 74.55%;
			top: 77.05%;
			width: 19.51%;
			height: 17.42%;
		}
		.about-shell {
			gap: 0.75rem;
			/* Keep the title-to-film group centred as one unit in the usable stage. */
		}
		.about-copy h2 {
			font-size: 1.85rem;
		}
		.about-copy p {
			font-size: 0.78rem;
			line-height: 1.55;
		}
		.team-film {
			width: min(100%, 29rem);
		}
		.product-shell {
			/* Start the copy near the top of the stage so more of the phone remains visible. */
			padding-top: 0.5rem;
		}
		.product-copy h2 {
			font-size: 1.65rem;
		}
		.product-demo {
			--device-card-width: min(292vw, 116svh, 68rem);
		}
		.arrow.previous {
			left: 4%;
		}
		.arrow.next {
			right: 4%;
		}
		.faq-shell {
			--mobile-board-size: min(110vw, 34rem, calc((100svh - 10rem) * 0.7857));
			--pad-width: var(--mobile-board-size);
			gap: 0.55rem;
		}
		.faq-list {
			/* Keep the board full-size. Only the text block moves down below the spiral; slightly
			   smaller type prevents short orphan lines such as a standalone 「嗎？」. */
			inset: 21.5% 18.1% 4% 20%;
		}
		.faq-list > strong {
			font-size: calc(var(--pad-width) * 0.069);
		}
		.faq-item button {
			font-size: calc(var(--pad-width) * 0.0275);
			line-height: 1.3;
		}
		.faq-item p {
			font-size: calc(var(--pad-width) * 0.0245);
			line-height: 1.48;
		}
	}

	@media (max-width: 430px) and (max-height: 700px) {
		.product-demo {
			--device-card-width: min(274vw, 110svh, 64rem);
		}
		.gacha-machine {
			--gacha-width: min(90vw, 22rem);
			transform: translateY(calc(var(--machine-exit) * var(--machine-exit-distance)));
		}
		.faq-shell {
			--mobile-board-size: min(104vw, 34rem, calc((100svh - 6rem) * 0.7857));
			--pad-width: var(--mobile-board-size);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.scroll-hint {
			animation: none;
		}
	}
</style>
