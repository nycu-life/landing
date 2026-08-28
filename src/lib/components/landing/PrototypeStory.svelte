<script lang="ts">
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { INSTAGRAM_URL, products } from '$lib/content/landing';
	import { m } from '$lib/paraglide/messages';

	const faqs = [
		{ question: m.story_faq_q1, answer: m.story_faq_a1 },
		{ question: m.story_faq_q2, answer: m.story_faq_a2 },
		{ question: m.story_faq_q3, answer: m.story_faq_a3 }
	];
	const storySteps = [
		{ id: 'hero', progress: 0, duration: 0 },
		{ id: 'about', progress: 0.25, duration: 4200 },
		{ id: 'products', progress: 0.5, duration: 1050 },
		{ id: 'faq', progress: 0.75, duration: 950 },
		{ id: 'join', progress: 1, duration: 950 }
	] as const;
	const wheelThreshold = 32;
	const touchThreshold = 28;
	const lastStepIndex = storySteps.length - 1;

	let storyEl: HTMLElement;
	let progressValue = 0;
	let stepIndex = $state(0);
	let animationFromIndex = $state(0);
	let animationToIndex = $state(0);
	let activeFaq = $state(0);
	let activeProduct = $state(0);
	let activeProductData = $derived(products[activeProduct]);
	let isAnimating = $state(false);
	let storyReady = $state(false);
	let reducedMotion = $state(false);
	let animationFrame = 0;
	let queuedDirection = 0;

	type StoryBootstrap = { consume: () => number; cleanup: () => void };
	const clamp = (value: number) => Math.min(1, Math.max(0, value));
	const easeInOutCubic = (value: number) =>
		value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
	const setProgress = (value: number) => {
		progressValue = clamp(value);
		storyEl?.style.setProperty('--story-progress', String(progressValue));
	};
	const goToStep = (nextIndex: number, immediate = false) => {
		if (isAnimating || nextIndex < 0 || nextIndex > lastStepIndex || nextIndex === stepIndex)
			return false;

		const fromIndex = stepIndex;
		const from = progressValue;
		const target = storySteps[nextIndex].progress;
		if (immediate || reducedMotion) {
			stepIndex = nextIndex;
			setProgress(target);
			return true;
		}

		const duration =
			nextIndex > fromIndex ? storySteps[nextIndex].duration : storySteps[fromIndex].duration;
		const startedAt = performance.now();
		animationFromIndex = fromIndex;
		animationToIndex = nextIndex;
		isAnimating = true;
		const tick = (now: number) => {
			const elapsed = clamp((now - startedAt) / duration);
			const eased = fromIndex === 0 && nextIndex === 1 ? elapsed : easeInOutCubic(elapsed);
			setProgress(from + (target - from) * eased);
			if (elapsed < 1) {
				animationFrame = requestAnimationFrame(tick);
				return;
			}
			animationFrame = 0;
			stepIndex = nextIndex;
			isAnimating = false;
		};
		animationFrame = requestAnimationFrame(tick);
		return true;
	};
	const requestStep = (direction: number) => {
		if (!storyReady) {
			queuedDirection = direction;
			return true;
		}
		return goToStep(stepIndex + direction);
	};
	const selectProduct = (index: number) => {
		activeProduct = (index + products.length) % products.length;
	};
	onMount(() => {
		const bootstrap = (window as Window & { __nycuStoryBootstrap?: StoryBootstrap })
			.__nycuStoryBootstrap;
		const initialIntent = bootstrap?.consume() ?? 0;
		bootstrap?.cleanup();
		const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		const forceMotion = new URLSearchParams(window.location.search).get('motion') === 'on';
		let wheelIntent = 0;
		let wheelConsumed = false;
		let wheelResetTimer: ReturnType<typeof setTimeout> | undefined;
		let touchStartY = 0;
		let touchStartedInStory = false;
		let touchConsumed = false;
		let disposed = false;

		const updateMotionPreference = () => {
			reducedMotion = motionQuery.matches && !forceMotion;
			if (reducedMotion && animationFrame) {
				cancelAnimationFrame(animationFrame);
				animationFrame = 0;
				isAnimating = false;
				stepIndex = Math.max(
					0,
					storySteps.findIndex((step) => step.progress >= progressValue)
				);
				setProgress(storySteps[stepIndex].progress);
			}
		};
		const storyIsEngaged = () => {
			const rect = storyEl.getBoundingClientRect();
			const topBarBottom =
				document.querySelector<HTMLElement>('.topbar')?.getBoundingClientRect().bottom ?? 0;
			return rect.top <= topBarBottom + 3 && rect.bottom >= window.innerHeight - 3;
		};
		const isOutwardBoundary = (direction: number) =>
			(direction < 0 && stepIndex === 0) || (direction > 0 && stepIndex === lastStepIndex);
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
		const onWheel = (event: WheelEvent) => {
			const delta = normalizeWheelDelta(event);
			if (!delta || reducedMotion || !storyIsEngaged()) return;
			const direction = Math.sign(delta);
			if (!isAnimating && isOutwardBoundary(direction)) return;

			event.preventDefault();
			resetWheelGestureSoon();
			if (isAnimating || wheelConsumed) {
				wheelConsumed = true;
				return;
			}
			if (wheelIntent && Math.sign(wheelIntent) !== direction) wheelIntent = 0;
			wheelIntent += delta;
			if (Math.abs(wheelIntent) < wheelThreshold) return;
			wheelConsumed = true;
			wheelIntent = 0;
			requestStep(direction);
		};
		const onTouchStart = (event: TouchEvent) => {
			const target = event.target;
			touchStartedInStory = target instanceof Node && storyEl.contains(target);
			touchStartY = event.touches[0]?.clientY ?? 0;
			touchConsumed = false;
		};
		const onTouchMove = (event: TouchEvent) => {
			if (!touchStartedInStory || reducedMotion || !storyIsEngaged()) return;
			const currentY = event.touches[0]?.clientY;
			if (currentY === undefined) return;
			const distance = touchStartY - currentY;
			const direction = Math.sign(distance);
			if (!direction || (!isAnimating && isOutwardBoundary(direction))) return;
			event.preventDefault();
			if (isAnimating || touchConsumed || Math.abs(distance) < touchThreshold) return;
			touchConsumed = true;
			requestStep(direction);
		};
		const onTouchEnd = () => {
			touchStartedInStory = false;
			touchConsumed = false;
		};
		const onKeyDown = (event: KeyboardEvent) => {
			if (reducedMotion || !storyIsEngaged()) return;
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
			if (!direction || (!isAnimating && isOutwardBoundary(direction))) return;
			event.preventDefault();
			if (!event.repeat && !isAnimating) requestStep(direction);
		};
		const onHashChange = () => {
			const hash = window.location.hash.slice(1);
			const nextIndex = storySteps.findIndex((step) => step.id === hash);
			if (nextIndex >= 0) goToStep(nextIndex, true);
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
			const direction = queuedDirection || initialIntent;
			queuedDirection = 0;
			if (direction && !reducedMotion && !isOutwardBoundary(direction))
				goToStep(stepIndex + direction);
		};

		updateMotionPreference();
		setProgress(storySteps[stepIndex].progress);
		window.addEventListener('wheel', onWheel, { passive: false });
		window.addEventListener('touchstart', onTouchStart, { passive: true });
		window.addEventListener('touchmove', onTouchMove, { passive: false });
		window.addEventListener('touchend', onTouchEnd, { passive: true });
		window.addEventListener('touchcancel', onTouchEnd, { passive: true });
		window.addEventListener('keydown', onKeyDown);
		window.addEventListener('hashchange', onHashChange);
		motionQuery.addEventListener('change', updateMotionPreference);
		onHashChange();
		void prepareFirstScene();
		return () => {
			disposed = true;
			window.removeEventListener('wheel', onWheel);
			window.removeEventListener('touchstart', onTouchStart);
			window.removeEventListener('touchmove', onTouchMove);
			window.removeEventListener('touchend', onTouchEnd);
			window.removeEventListener('touchcancel', onTouchEnd);
			window.removeEventListener('keydown', onKeyDown);
			window.removeEventListener('hashchange', onHashChange);
			motionQuery.removeEventListener('change', updateMotionPreference);
			if (wheelResetTimer) clearTimeout(wheelResetTimer);
			if (animationFrame) cancelAnimationFrame(animationFrame);
		};
	});
</script>

<section
	bind:this={storyEl}
	class="scroll-story prototype-story"
	id="home"
	aria-label={m.story_region_label()}
	data-story-step={stepIndex}
	data-story-step-name={storySteps[stepIndex].id}
	data-story-animating={isAnimating}
	data-phone-animating="false"
	data-phone-slide={activeProduct.toFixed(3)}
	data-story-ready={storyReady ? 'true' : 'false'}
	data-reduced-motion={reducedMotion ? 'true' : 'false'}
>
	<div class="story-stage">
		<div class="story-progress"></div>
		<nav class="chapter-nav" aria-label="Story chapters">
			{#each storySteps as step, index (step.id)}
				<a
					href={`#${step.id}`}
					class:active={stepIndex === index}
					aria-current={stepIndex === index ? 'step' : undefined}><i></i><span>{step.id}</span></a
				>
			{/each}
		</nav>

		<section
			id="hero"
			class="story-scene hero-scene"
			class:scene-active={stepIndex === 0 ||
				(isAnimating && (animationFromIndex === 0 || animationToIndex === 0))}
		>
			<div class="hero-orbit" aria-hidden="true"></div>
			<div class="gacha-machine" role="img" aria-label={m.story_gacha_alt()}>
				<picture class="gacha-device-art" aria-hidden="true">
					<source media="(max-width: 430px)" srcset="{base}/story/designer/gacha-mobile.svg" />
					<source media="(max-width: 900px)" srcset="{base}/story/designer/gacha-tablet.svg" />
					<img src="{base}/story/designer/gacha-desktop.svg" alt="" />
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
						<div class="capsule-core"></div>
						<div class="capsule-shell capsule-shell-top">
							<img class="capsule-art" src="{base}/story/designer/error-ball.svg" alt="" />
						</div>
						<div class="capsule-shell capsule-shell-bottom">
							<img class="capsule-art" src="{base}/story/designer/error-ball.svg" alt="" />
						</div>
					</div>
				</div>
			</div>
			<div class="hero-caption">
				<span>{m.story_hero_eyebrow()}</span>
				<h1>
					<span class="sr-only">NYCU LIFE — </span>{m.story_hero_title_1()}<br
					/>{m.story_hero_title_2()}
				</h1>
				<p>{m.story_hero_lede()}</p>
			</div>
			<div class="scroll-hint">{m.story_scroll_cue()} ↓</div>
		</section>

		<section
			id="about"
			class="story-scene about-scene"
			class:scene-active={stepIndex === 1 ||
				(isAnimating && (animationFromIndex === 1 || animationToIndex === 1))}
			aria-label={m.story_about_label()}
		>
			<div class="section-shell about-shell">
				<article class="about-copy">
					<span class="eyebrow">{m.story_about_eyebrow()}</span>
					<h2>{m.story_about_title_1()}<br />{m.story_about_title_2()}</h2>
					<p>{m.story_about_body()}</p>
					<div class="fact-pills">
						<span>STUDENT-BUILT</span><span>4 PRODUCTS</span><span>NYCU</span>
					</div>
				</article>
				<div class="team-film">
					<div class="play-mark">▶</div>
					<span>{m.story_about_film()}</span>
					<strong>{m.story_about_quote()}</strong>
				</div>
			</div>
		</section>

		<section
			id="products"
			class="story-scene product-scene"
			class:scene-active={stepIndex === 2 ||
				(isAnimating && (animationFromIndex === 2 || animationToIndex === 2))}
			aria-label={m.story_products_label()}
		>
			<div class="section-shell product-shell">
				<article class="product-copy">
					<span class="eyebrow"
						>PRODUCT {String(activeProduct + 1).padStart(2, '0')} · {activeProductData.latin}</span
					>
					<h2>{activeProductData.name()}</h2>
					<p>{activeProductData.summary()}</p>
					<div class="feature-list">
						{#each activeProductData.features as feature, index (index)}
							<div>
								<strong>{String(index + 1).padStart(2, '0')}</strong><span>{feature()}</span>
							</div>
						{/each}
					</div>
				</article>
				<div class="product-demo">
					<button
						type="button"
						class="arrow previous"
						aria-label="上一個產品"
						onclick={() => selectProduct(activeProduct - 1)}>←</button
					>
					<div class="device-card" data-product={activeProductData.id}>
						<img class="device-hand" src="{base}/story/phone-transparent.png" alt="" />
						<div class="device-phone">
							<div class="device-screen">
								{#if activeProductData.screenshot}
									<img
										src={`${base}${activeProductData.screenshot.src}`}
										alt={activeProductData.name()}
									/>
								{:else}
									<div class="map-placeholder"><span>NYCU</span><strong>MAP</strong><i></i></div>
								{/if}
							</div>
							<img class="device-frame" src="{base}/story/designer/phone-frame.svg" alt="" />
						</div>
						<img
							class="device-hand-front device-hand-thumb"
							src="{base}/story/phone-transparent.png"
							alt=""
						/>
						<img
							class="device-hand-front device-hand-finger"
							src="{base}/story/phone-transparent.png"
							alt=""
						/>
					</div>
					<button
						type="button"
						class="arrow next"
						aria-label="下一個產品"
						onclick={() => selectProduct(activeProduct + 1)}>→</button
					>
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
			class:scene-active={stepIndex === 3 ||
				(isAnimating && (animationFromIndex === 3 || animationToIndex === 3))}
			aria-label={m.story_faq_label()}
		>
			<div class="section-shell faq-shell">
				<article class="faq-copy">
					<span class="eyebrow">{m.story_faq_eyebrow()}</span>
					<h2>{m.story_faq_title_1()}<br />{m.story_faq_title_2()}</h2>
					<p>{m.story_faq_body()}</p>
				</article>
				<div class="notebook">
					<img src="{base}/story/designer/faq-notebook.svg" alt={m.story_faq_alt()} />
					<div class="faq-list">
						<strong>FAQ</strong>
						{#each faqs as item, index (index)}
							<div class="faq-item">
								<button
									type="button"
									aria-expanded={activeFaq === index}
									onclick={() => (activeFaq = index)}
									>{item.question()}<span>{activeFaq === index ? '−' : '＋'}</span></button
								>
								{#if activeFaq === index}<p>{item.answer()}</p>{/if}
							</div>
						{/each}
					</div>
				</div>
			</div>
		</section>

		<section
			id="join"
			class="story-scene join-scene"
			class:scene-active={stepIndex === 4 ||
				(isAnimating && (animationFromIndex === 4 || animationToIndex === 4))}
			aria-label={m.story_join_label()}
		>
			<div class="section-shell join-shell">
				<article class="join-board">
					<img src="{base}/story/designer/join-board.svg" alt="" />
					<div class="join-board-content">
						<span class="eyebrow">{m.story_join_eyebrow()}</span>
						<h2>{m.story_join_title_1()}<br />{m.story_join_title_2()}</h2>
						<p>{m.story_join_body()}</p>
						<a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">{m.story_join_cta()}</a>
					</div>
				</article>
			</div>
		</section>

		<span class="story-count" class:hero-count={stepIndex === 0} aria-hidden="true"
			>{stepIndex + 1} / {storySteps.length}</span
		>
	</div>
</section>

<style>
	.prototype-story {
		--story-progress: 0;
		position: relative;
		height: calc(100svh - 4.75rem);
		min-height: 34rem;
		background: #f3f4f6;
		color: #333;
		overflow: hidden;
		overscroll-behavior: contain;
	}
	.story-stage {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
		background: #fff;
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
	:global(:root[data-theme='dark']) .section-shell h2,
	:global(:root[data-theme='dark']) .hero-caption h1 {
		color: #edf4ff;
	}
	:global(:root[data-theme='dark']) .section-shell > article > p,
	:global(:root[data-theme='dark']) .product-copy > p,
	:global(:root[data-theme='dark']) .faq-copy > p,
	:global(:root[data-theme='dark']) .hero-caption > p {
		color: #b5c3d6;
	}
	:global(:root[data-theme='dark']) .hero-orbit,
	:global(:root[data-theme='dark']) .hero-orbit::before,
	:global(:root[data-theme='dark']) .hero-orbit::after {
		border-color: rgba(185, 207, 238, 0.13);
	}
	:global(:root[data-theme='dark']) .feature-list div {
		background: #18263d;
		box-shadow: 0 0.7rem 2rem rgba(0, 0, 0, 0.2);
	}
	:global(:root[data-theme='dark']) .feature-list span {
		color: #c1ccdc;
	}
	:global(:root[data-theme='dark']) .arrow {
		border-color: #36517c;
		background: #18263d;
		color: #8fb2ff;
	}
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
	:global(:root[data-theme='dark']) .join-board-content h2 {
		color: #172235;
	}
	:global(:root[data-theme='dark']) .join-board-content p {
		color: #66758a;
	}
	.story-progress {
		position: absolute;
		z-index: 30;
		top: 0;
		left: 0;
		width: 100%;
		height: 3px;
		transform-origin: left;
		transform: scaleX(var(--story-progress));
		background: #2462ff;
	}
	.story-scene {
		position: absolute;
		inset: 0;
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
		transition: visibility 0s linear 0.2s;
	}
	.story-scene.scene-active {
		visibility: visible;
		pointer-events: auto;
		transition-delay: 0s;
	}
	.hero-scene {
		display: grid;
		place-items: center;
		opacity: clamp(0, calc((0.25 - var(--story-progress)) * 40), 1);
		background: #fff;
	}
	.about-scene {
		opacity: clamp(
			0,
			min(calc((var(--story-progress) - 0.225) * 40), calc((0.42 - var(--story-progress)) * 18)),
			1
		);
	}
	.product-scene {
		opacity: clamp(
			0,
			min(calc((var(--story-progress) - 0.35) * 18), calc((0.67 - var(--story-progress)) * 18)),
			1
		);
	}
	.faq-scene {
		opacity: clamp(
			0,
			min(calc((var(--story-progress) - 0.6) * 18), calc((0.91 - var(--story-progress)) * 18)),
			1
		);
	}
	.join-scene {
		opacity: clamp(0, calc((var(--story-progress) - 0.84) * 14), 1);
	}
	.section-shell {
		position: relative;
		z-index: 2;
		width: min(72rem, calc(100% - 8rem));
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
	.chapter-nav {
		position: absolute;
		z-index: 40;
		left: 1.4rem;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
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
		--capsule-travel-x: 0vw;
		--capsule-travel-y: -9vh;
		--capsule-zoom: 1.7;
		--hero-art-shift: 0px;
		position: relative;
		z-index: 3;
		width: var(--gacha-width);
		height: auto;
		aspect-ratio: 16 / 9;
		contain: layout style;
		isolation: isolate;
		will-change: transform;
		filter: drop-shadow(0 1.5rem 2.25rem rgba(26, 55, 103, 0.16));
		transform: translate(18vw, calc(-1vh + var(--story-progress) * -65vh))
			scale(calc(1 - var(--story-progress) * 0.2));
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
		--capsule-emerge: clamp(0, calc((var(--story-progress) - 0.04) * 25), 1);
		--capsule-roll: clamp(0, calc((var(--story-progress) - 0.075) * 12.5), 1);
		--capsule-open: clamp(0, calc((var(--story-progress) - 0.17) * 33.34), 1);
		position: absolute;
		z-index: 8;
		left: 17.3%;
		top: calc(100% - var(--gacha-width) * 0.0867);
		width: var(--capsule-size);
		aspect-ratio: 1;
		opacity: clamp(0, calc((var(--story-progress) - 0.045) * 40), 1);
		will-change: transform, opacity;
		transform: translate3d(
				calc(-50% + var(--capsule-roll) * var(--capsule-travel-x)),
				calc(
					-50% + var(--hero-art-shift) + var(--capsule-emerge) * 2.5rem + var(--capsule-roll) *
						var(--capsule-travel-y)
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
	.capsule-shell {
		position: absolute;
		z-index: 2;
		inset: 0;
		border-radius: 50%;
		will-change: transform;
	}
	.capsule-shell-top {
		clip-path: inset(0 0 49.5% 0);
		transform: translate3d(calc(var(--capsule-open) * -6%), calc(var(--capsule-open) * -32%), 0)
			rotate(calc(var(--capsule-open) * -12deg));
	}
	.capsule-shell-bottom {
		clip-path: inset(49.5% 0 0 0);
		transform: translate3d(calc(var(--capsule-open) * 6%), calc(var(--capsule-open) * 32%), 0)
			rotate(calc(var(--capsule-open) * 10deg));
	}
	.capsule-core {
		position: absolute;
		z-index: 1;
		inset: 14%;
		border: 1px solid rgba(255, 255, 255, 0.92);
		border-radius: 50%;
		opacity: var(--capsule-open);
		background:
			radial-gradient(circle at 36% 31%, #fff 0 7%, transparent 8%),
			radial-gradient(circle, #fff 0 12%, #acc2ff 13% 42%, #315fff 68%, transparent 70%);
		box-shadow:
			0 0 1.2rem rgba(89, 126, 255, 0.72),
			0 0 3rem rgba(89, 126, 255, 0.5);
		transform: scale(calc(0.25 + var(--capsule-open) * 0.75));
	}
	.capsule .capsule-art {
		position: absolute;
		width: 713.75%;
		height: 401.5%;
		max-width: none;
		left: -141.25%;
		top: -161.25%;
	}
	.hero-caption {
		position: absolute;
		z-index: 10;
		left: 10vw;
		right: auto;
		top: 50%;
		max-width: min(30rem, 26vw);
		margin-inline: 0;
		opacity: clamp(0, calc((0.1 - var(--story-progress)) * 18), 1);
		text-align: left;
		transform: translateY(-50%);
	}
	.hero-caption span {
		color: #2462ff;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.18em;
	}
	.hero-caption h1 {
		margin: 0.5rem 0;
		color: #333;
		font-size: clamp(1.8rem, 3.2vw, 3.4rem);
		line-height: 1.08;
		letter-spacing: -0.045em;
	}
	.hero-caption p {
		margin: 0;
		color: #6b7280;
	}
	.scroll-hint {
		position: absolute;
		z-index: 10;
		bottom: clamp(2.75rem, 5vh, 4rem);
		left: 50%;
		transform: translateX(-50%);
		color: #9ca3af;
		font-size: 0.65rem;
		letter-spacing: 0.16em;
		animation: bob 1.8s ease-in-out infinite;
	}
	.about-shell {
		grid-template-columns: minmax(0, 0.9fr) minmax(25rem, 1.1fr);
		gap: clamp(2rem, 6vw, 6rem);
	}
	.about-copy {
		transform: translateX(calc((0.25 - var(--story-progress)) * -80vw));
	}
	.about-copy p {
		max-width: 34rem;
	}
	.fact-pills {
		display: flex;
		flex-wrap: wrap;
		gap: 0.55rem;
		margin-top: 1.5rem;
	}
	.fact-pills span {
		padding: 0.5rem 0.85rem;
		border-radius: 999px;
		background: #ccdbff;
		color: #2455a8;
		font-size: 0.72rem;
		font-weight: 650;
	}
	.fact-pills span:nth-child(2) {
		background: #d5f1b1;
		color: #4b5563;
	}
	.fact-pills span:nth-child(3) {
		background: #ffe5ad;
		color: #6c4c08;
	}
	.team-film {
		position: relative;
		min-height: min(58vh, 31rem);
		border-radius: 2rem;
		background: linear-gradient(135deg, #0c47ef, #7099ff);
		box-shadow: 0 2rem 4rem rgba(36, 98, 255, 0.2);
		display: grid;
		place-items: center;
		color: #fff;
		overflow: hidden;
		transform: translateX(calc((0.25 - var(--story-progress)) * 80vw));
	}
	.team-film::before {
		content: '';
		position: absolute;
		width: 14rem;
		aspect-ratio: 1;
		border: 2.5rem solid rgba(255, 255, 255, 0.13);
		border-radius: 50%;
	}
	.team-film .play-mark {
		position: relative;
		z-index: 2;
		display: grid;
		place-items: center;
		width: 4.5rem;
		aspect-ratio: 1;
		border: 1px solid rgba(255, 255, 255, 0.8);
		border-radius: 50%;
	}
	.team-film span {
		position: absolute;
		left: 1.4rem;
		bottom: 1.3rem;
		font-size: 0.72rem;
		letter-spacing: 0.13em;
	}
	.team-film strong {
		position: absolute;
		left: 1.4rem;
		top: 1.3rem;
		max-width: 18rem;
		font-size: 1rem;
	}
	.product-shell {
		grid-template-columns: minmax(22rem, 0.9fr) minmax(27rem, 1.1fr);
		gap: clamp(2rem, 6vw, 6rem);
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
	.feature-list div {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		padding: 0.85rem 1rem;
		border-radius: 1rem;
		background: #fff;
		box-shadow: 0 0.7rem 2rem rgba(55, 65, 81, 0.1);
	}
	.feature-list strong {
		color: #2462ff;
		font-size: 1.05rem;
	}
	.feature-list span {
		color: #4b5563;
		font-size: 0.86rem;
	}
	.product-demo {
		position: relative;
		display: grid;
		place-items: center;
		min-height: 34rem;
	}
	.device-card {
		position: relative;
		width: min(44vw, 38rem);
		aspect-ratio: 781 / 984;
		filter: drop-shadow(0 2rem 3rem rgba(36, 98, 255, 0.18));
		transform: translateX(-13%);
	}
	.device-card > .device-hand {
		position: absolute;
		z-index: 1;
		inset: 0;
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
		pointer-events: none;
	}
	.device-card > .device-hand-front {
		position: absolute;
		z-index: 3;
		inset: 0;
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
		pointer-events: none;
	}
	.device-hand-thumb {
		clip-path: polygon(
			67.2% 52.2%,
			69.5% 52.7%,
			74% 55%,
			79% 56.3%,
			84.5% 55.8%,
			87% 54.8%,
			89% 55.5%,
			100% 65.5%,
			100% 72%,
			94% 68%,
			88% 64%,
			84% 63%,
			81.5% 63.8%,
			78% 63.2%,
			74.5% 62%,
			71.5% 60%,
			69% 57%,
			67.5% 54.5%
		);
	}
	.device-hand-finger {
		clip-path: polygon(
			43% 83.8%,
			50% 82.8%,
			55.5% 81.6%,
			58.5% 82%,
			60% 83.8%,
			59.3% 86%,
			55% 88.8%,
			48% 91.8%,
			44% 91.5%,
			42.5% 89.5%,
			42.5% 86%
		);
	}
	.device-phone {
		position: absolute;
		z-index: 2;
		left: 38.2%;
		top: 11.8%;
		width: 51.2%;
		height: 76.4%;
	}
	.device-screen {
		position: absolute;
		z-index: 1;
		inset: 3.46% 6.49% 3.25% 6.63%;
		border-radius: 11% / 5%;
		overflow: hidden;
		background: #fff;
	}
	.device-screen > img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: top;
	}
	.device-frame {
		position: absolute;
		z-index: 2;
		inset: 0;
		display: block;
		width: 100%;
		height: 100%;
		pointer-events: none;
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
	.arrow {
		position: absolute;
		z-index: 4;
		top: 50%;
		width: 3.2rem;
		aspect-ratio: 1;
		border: 1px solid #ccdbff;
		border-radius: 50%;
		background: #fff;
		color: #2462ff;
		font-size: 1.3rem;
		cursor: pointer;
		box-shadow: 0 0.8rem 2rem rgba(55, 65, 81, 0.1);
	}
	.arrow:hover {
		transform: scale(1.08);
	}
	.arrow.previous {
		left: 0;
	}
	.arrow.next {
		right: 0;
	}
	.product-dots {
		position: absolute;
		bottom: 0.5rem;
		display: flex;
		gap: 0.45rem;
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
	.faq-shell {
		grid-template-columns: 0.7fr 1.3fr;
		gap: clamp(2rem, 4vw, 4rem);
	}
	.faq-copy {
		align-self: center;
	}
	.notebook {
		position: relative;
		width: min(60vw, 46rem);
		justify-self: end;
	}
	.notebook > img {
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
		min-height: 3rem;
		padding: 0.6rem 0;
		border: 0;
		background: transparent;
		color: #172235;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		text-align: left;
		font-weight: 650;
		cursor: pointer;
	}
	.faq-item p {
		margin: 0 0 0.7rem;
		color: #66758a;
		font-size: 0.82rem;
		line-height: 1.6;
	}
	.join-shell {
		width: 100%;
		place-items: center;
	}
	.join-board {
		position: relative;
		width: min(64vh, 39rem, calc(100vw - 8rem));
		aspect-ratio: 1;
	}
	.join-board > img {
		width: 100%;
		height: 100%;
		display: block;
		object-fit: contain;
	}
	.join-board-content {
		position: absolute;
		inset: 19% 10% 18% 27%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		text-align: center;
		color: #172235;
	}
	.join-board-content h2 {
		width: 100%;
		margin: clamp(0.65rem, 1.5vh, 1rem) 0 clamp(0.8rem, 1.8vh, 1.2rem);
		color: #172235;
		font-size: clamp(2rem, 4.2vh, 3.15rem);
		line-height: 1.12;
	}
	.join-board-content p {
		width: 88%;
		margin: 0;
		max-width: 100%;
		color: #66758a;
		font-size: clamp(0.82rem, 1.55vh, 1rem);
		line-height: 1.65;
	}
	.join-board-content a {
		box-sizing: border-box;
		max-width: 100%;
		margin-top: clamp(1rem, 2.3vh, 1.6rem);
		padding: 0.85rem 1.35rem;
		border-radius: 999px;
		background: #df725e;
		color: #fff;
		font-size: clamp(0.8rem, 1.55vh, 1rem);
		font-weight: 700;
	}
	.story-count {
		position: absolute;
		z-index: 40;
		right: 1.3rem;
		bottom: 1.1rem;
		padding: 0.25rem 0.45rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.76);
		color: #9ca3af;
		font-size: 0.75rem;
		line-height: 1;
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
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
			width: min(100rem, calc(100% - 12rem));
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
		.hero-caption {
			max-width: min(42rem, 26vw);
		}
		.hero-caption span {
			font-size: 0.9rem;
		}
		.hero-caption h1 {
			font-size: clamp(2.8rem, 2.75vw, 4.2rem);
			line-height: 1.08;
			padding-bottom: 0.05em;
		}
		.hero-caption p {
			font-size: 1.12rem;
		}
		.team-film {
			min-height: min(58vh, 40rem);
		}
		.team-film strong {
			max-width: 24rem;
			font-size: 1.15rem;
		}
		.product-demo {
			min-height: 44rem;
		}
		.device-card {
			width: min(40vw, 48rem);
		}
		.notebook {
			width: min(50vw, 58rem);
		}
		.faq-item button,
		.faq-item p {
			font-size: 1rem;
		}
		.join-board {
			width: min(72vh, 52rem, calc(100vw - 10rem));
		}
		.join-board-content h2 {
			font-size: clamp(3rem, 4.2vh, 3.6rem);
		}
	}

	@media (max-width: 900px) {
		.prototype-story {
			height: calc(100svh - 4.75rem);
			min-height: 35rem;
		}
		.chapter-nav {
			display: none;
		}
		.section-shell {
			width: calc(100% - 2.25rem);
		}
		.hero-caption {
			left: 1.4rem;
			right: 1.4rem;
			top: clamp(8rem, 18svh, 11rem);
			bottom: auto;
			text-align: center;
			max-width: none;
			transform: none;
		}
		.hero-caption h1 {
			font-size: clamp(1.65rem, 7vw, 2.7rem);
		}
		.hero-caption p {
			font-size: 0.86rem;
		}
		.gacha-machine {
			--gacha-width: min(94vw, 44rem);
			--capsule-size: clamp(4.5rem, 14vw, 6.5rem);
			--capsule-travel-x: 30vw;
			--capsule-travel-y: -4svh;
			--capsule-zoom: 1.65;
			--hero-art-shift: 0px;
			height: auto;
			aspect-ratio: 1179 / 1050;
			transform: translateY(calc(14svh + var(--story-progress) * -70vh));
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
		.about-shell {
			grid-template-columns: 1fr;
			grid-template-rows: auto auto;
			align-content: center;
			gap: clamp(1.25rem, 2.5svh, 2rem);
			transform: translateY(2svh);
		}
		.about-copy {
			text-align: center;
			transform: translateY(calc((0.25 - var(--story-progress)) * -100vh));
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
		.fact-pills {
			justify-content: center;
		}
		.team-film {
			width: min(92%, 38rem);
			min-height: clamp(12rem, 28svh, 18rem);
			justify-self: center;
			border-radius: 1.3rem;
			transform: translateY(calc((0.25 - var(--story-progress)) * 100vh));
		}
		.product-shell {
			grid-template-columns: 1fr;
			grid-template-rows: auto minmax(0, 1fr);
			align-content: center;
			gap: 0.75rem;
			box-sizing: border-box;
			width: 100%;
			padding: clamp(3rem, 7svh, 5rem) 1.125rem 1rem;
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
			display: none;
		}
		.product-demo {
			min-height: 0;
			height: 100%;
			transform: none;
		}
		.device-card {
			width: min(78vw, 32rem, 46svh, calc(100vw - 2.25rem));
			max-width: 100%;
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
		.product-dots {
			bottom: -0.35rem;
		}
		.faq-shell {
			grid-template-columns: 1fr;
			grid-template-rows: auto auto;
			align-content: center;
			gap: clamp(1.25rem, 3svh, 2.5rem);
			width: 100%;
		}
		.faq-copy {
			text-align: center;
			padding-inline: 1.2rem;
		}
		.faq-copy h2 {
			margin: 0.35rem 0;
			font-size: clamp(1.8rem, 7vw, 2.6rem);
		}
		.faq-copy p {
			margin: 0 auto;
			max-width: 40rem;
			font-size: 0.82rem;
			text-wrap: pretty;
		}
		.notebook {
			width: min(96%, 44rem);
			max-width: none;
			justify-self: center;
		}
		.faq-list {
			inset: 17% 12% 14% 18%;
		}
		.faq-list > strong {
			margin-bottom: 0.6rem;
			font-size: clamp(2.7rem, 8vw, 4rem);
		}
		.faq-item button {
			min-height: 3.15rem;
			font-size: 0.85rem;
		}
		.faq-item p {
			max-width: 94%;
			font-size: 0.8rem;
			text-wrap: pretty;
		}
		.join-shell {
			width: 100%;
		}
		.join-board {
			width: min(78svh, 88vw, 40rem);
			transform: translate(-6%, 2svh);
		}
		.join-board-content {
			inset: 19% 10% 18% 27%;
		}
		.join-board-content h2 {
			font-size: clamp(1.8rem, 6.5vw, 2.6rem);
		}
		.join-board-content p {
			font-size: clamp(0.76rem, 2.2vw, 0.92rem);
			text-wrap: pretty;
		}
		.join-board-content a {
			padding: 0.75rem 1.15rem;
		}
	}

	@media (max-width: 430px) {
		.prototype-story {
			min-height: 31rem;
		}
		.hero-caption span {
			font-size: 0.62rem;
		}
		.hero-caption h1 {
			font-size: clamp(1.55rem, 7vw, 2rem);
		}
		.gacha-machine {
			--gacha-width: min(96vw, 26rem);
			--capsule-size: clamp(4.25rem, 18vw, 5.5rem);
			--capsule-travel-x: 26vw;
			--capsule-travel-y: -2svh;
			--capsule-zoom: 1.8;
			aspect-ratio: 1179 / 1320;
			transform: translateY(calc(14svh + var(--story-progress) * -70vh));
		}
		.capsule {
			left: 22.6%;
			top: 80%;
		}
		.hero-caption {
			top: clamp(7rem, 18svh, 9rem);
			bottom: auto;
		}
		.scroll-hint,
		.story-count.hero-count {
			bottom: 3rem;
		}
		.about-shell {
			gap: 0.75rem;
			transform: translateY(6svh);
		}
		.about-copy h2 {
			font-size: 1.85rem;
		}
		.about-copy p {
			font-size: 0.78rem;
			line-height: 1.55;
		}
		.fact-pills {
			margin-top: 0.7rem;
		}
		.fact-pills span {
			padding: 0.35rem 0.6rem;
			font-size: 0.58rem;
		}
		.team-film {
			width: min(100%, 29rem);
			min-height: 9.5rem;
		}
		.product-shell {
			padding-top: calc(0.75rem + 9svh);
		}
		.product-copy h2 {
			font-size: 1.65rem;
		}
		.device-card {
			width: min(96vw, 25rem, 46svh, calc(100vw - 2.25rem));
		}
		.arrow.previous {
			left: 4%;
		}
		.arrow.next {
			right: 4%;
		}
		.faq-copy p {
			display: none;
		}
		.notebook {
			width: 125%;
		}
		.faq-shell {
			gap: 0.9rem;
			transform: translateY(2svh);
		}
		.faq-copy {
			transform: none;
		}
		.faq-list {
			inset: 16% 11% 7% 18%;
		}
		.faq-list > strong {
			font-size: clamp(2.6rem, 12vw, 3.4rem);
		}
		.faq-item button {
			min-height: 2.8rem;
			font-size: 0.8rem;
		}
		.faq-item p {
			font-size: 0.74rem;
		}
		.join-board {
			width: min(72vh, 100vw);
			transform: translate(-6%, 6svh);
		}
		.join-board-content {
			inset: 18.5% 9% 17% 27%;
		}
		.join-board-content .eyebrow {
			font-size: 0.62rem;
		}
		.join-board-content h2 {
			margin-block: 0.55rem 0.7rem;
			font-size: clamp(1.55rem, 7.2vw, 2rem);
		}
		.join-board-content p {
			font-size: clamp(0.7rem, 3vw, 0.82rem);
			line-height: 1.55;
		}
		.join-board-content a {
			margin-top: 0.85rem;
			padding: 0.68rem 1rem;
			font-size: 0.76rem;
		}
	}

	@media (max-width: 430px) and (max-height: 700px) {
		.device-card {
			width: min(82vw, 21rem, 43svh, calc(100vw - 2.25rem));
		}
		.gacha-machine {
			--gacha-width: min(90vw, 22rem);
			transform: translateY(calc(10svh + var(--story-progress) * -70vh));
		}
		.hero-caption {
			top: 4rem;
			bottom: auto;
		}
		.scroll-hint,
		.story-count.hero-count {
			bottom: 1.5rem;
		}
		.hero-caption span {
			font-size: 0.56rem;
		}
		.hero-caption h1 {
			font-size: 1.35rem;
		}
		.hero-caption p {
			display: none;
		}
		.about-shell {
			transform: translateY(2svh);
		}
		.team-film {
			min-height: 8.5rem;
		}
		.faq-shell {
			gap: 0.35rem;
			transform: translateY(1svh);
		}
		.faq-copy h2 {
			font-size: 1.55rem;
		}
		.notebook {
			width: 112%;
		}
		.faq-list {
			inset: 16% 10% 5% 18%;
		}
		.faq-list > strong {
			margin-bottom: 0.25rem;
			font-size: 2.35rem;
		}
		.faq-item button {
			min-height: 2.2rem;
			padding-block: 0.35rem;
			font-size: 0.72rem;
		}
		.faq-item p {
			margin-bottom: 0.35rem;
			font-size: 0.64rem;
			line-height: 1.4;
		}
		.join-board {
			width: min(76vh, 90vw);
			transform: translate(-6%, 4svh);
		}
		.join-board-content p {
			display: none;
		}
		.join-board-content h2 {
			margin-block: 0.45rem 0.55rem;
		}
		.join-board-content a {
			margin-top: 0.55rem;
			padding: 0.6rem 0.8rem;
			font-size: 0.68rem;
			white-space: nowrap;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.story-scene {
			transition: none;
		}
		.scroll-hint {
			animation: none;
		}
	}
</style>
