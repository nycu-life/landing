<script lang="ts">
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { JOIN_FORM_URL, products } from '$lib/content/landing';
	import { m } from '$lib/paraglide/messages';

	const faqs = [
		{
			question: m.story_faq_q1,
			answer: m.story_faq_a1
		},
		{
			question: m.story_faq_q2,
			answer: m.story_faq_a2
		},
		{
			question: m.story_faq_q3,
			answer: m.story_faq_a3
		}
	];
	const storySteps = [
		{ id: 'hero', progress: 0, duration: 0 },
		{ id: 'about', progress: 0.39, duration: 2600 },
		{ id: 'course', progress: 0.65, duration: 1250 },
		{ id: 'bus', progress: 0.8, duration: 1100 },
		{ id: 'activity', progress: 0.87, duration: 950 },
		{ id: 'faq', progress: 0.935, duration: 1050 },
		{ id: 'join', progress: 0.99, duration: 1050 }
	] as const;
	const lastStepIndex = storySteps.length - 1;
	const wheelThreshold = 32;
	const touchThreshold = 28;

	let storyEl: HTMLElement;
	let progress = $state(0);
	let stepIndex = $state(0);
	let isAnimating = $state(false);
	let phoneSlide = $state(0);
	let phoneAnimating = $state(false);
	let storyReady = $state(false);
	let activeFaq = $state(0);
	let reducedMotion = $state(false);
	let animationFrame = 0;
	let phoneAnimationFrame = 0;
	let queuedDirection = 0;

	type StoryBootstrap = {
		consume: () => number;
		cleanup: () => void;
	};

	const clamp = (value: number) => Math.min(1, Math.max(0, value));
	const easeInOutCubic = (value: number) =>
		value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
	const setProgress = (value: number) => {
		progress = clamp(value);
		storyEl?.style.setProperty('--story-progress', String(progress));
	};
	const setPhoneSlide = (value: number) => {
		phoneSlide = clamp(value / 3) * 3;
		storyEl?.style.setProperty('--phone-slide', String(phoneSlide));
	};
	const phoneSlideForStep = (index: number) => {
		if (index <= 1) return 0;
		if (index >= 5) return 3;
		return index - 1;
	};
	const playPhoneSlide = (nextIndex: number, immediate = false) => {
		const target = phoneSlideForStep(nextIndex);
		const shouldAnimate = nextIndex >= 2 && nextIndex <= 4 && target !== phoneSlide;
		if (!shouldAnimate || immediate || reducedMotion) {
			phoneAnimating = false;
			setPhoneSlide(target);
			return;
		}

		const from = phoneSlide;
		const startedAt = performance.now();
		const duration = 1050;
		phoneAnimating = true;
		const tick = (now: number) => {
			const elapsed = clamp((now - startedAt) / duration);
			setPhoneSlide(from + (target - from) * easeInOutCubic(elapsed));
			if (elapsed < 1) {
				phoneAnimationFrame = requestAnimationFrame(tick);
				return;
			}
			phoneAnimationFrame = 0;
			phoneAnimating = false;
		};
		phoneAnimationFrame = requestAnimationFrame(tick);
	};
	const goToStep = (nextIndex: number, immediate = false) => {
		if (
			isAnimating ||
			phoneAnimating ||
			nextIndex < 0 ||
			nextIndex > lastStepIndex ||
			nextIndex === stepIndex
		) {
			return false;
		}

		const fromIndex = stepIndex;
		const from = progress;
		const target = storySteps[nextIndex].progress;
		if (immediate || reducedMotion) {
			stepIndex = nextIndex;
			setProgress(target);
			playPhoneSlide(nextIndex, true);
			return true;
		}

		const duration =
			nextIndex > fromIndex ? storySteps[nextIndex].duration : storySteps[fromIndex].duration;
		const startedAt = performance.now();
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
			playPhoneSlide(nextIndex);
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
					storySteps.findIndex((step) => step.progress >= progress)
				);
				setProgress(storySteps[stepIndex].progress);
				playPhoneSlide(stepIndex, true);
			}
			if (reducedMotion && phoneAnimationFrame) {
				cancelAnimationFrame(phoneAnimationFrame);
				phoneAnimationFrame = 0;
				phoneAnimating = false;
				setPhoneSlide(phoneSlideForStep(stepIndex));
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
			if (isAnimating || phoneAnimating || wheelConsumed) {
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
			if (isAnimating || phoneAnimating || touchConsumed || Math.abs(distance) < touchThreshold)
				return;

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
			) {
				return;
			}

			let direction = 0;
			if (['ArrowDown', 'PageDown'].includes(event.key) || (event.key === ' ' && !event.shiftKey)) {
				direction = 1;
			} else if (
				['ArrowUp', 'PageUp'].includes(event.key) ||
				(event.key === ' ' && event.shiftKey)
			) {
				direction = -1;
			}
			if (!direction || (!isAnimating && isOutwardBoundary(direction))) return;

			event.preventDefault();
			if (!event.repeat && !isAnimating && !phoneAnimating) requestStep(direction);
		};
		const prepareFirstScene = async () => {
			const images = Array.from(storyEl.querySelectorAll<HTMLImageElement>('.gacha-machine img'));
			await Promise.allSettled(
				images.map(async (image) => {
					if (!image.complete) {
						await new Promise<void>((resolve) => {
							const settle = () => {
								image.removeEventListener('load', settle);
								image.removeEventListener('error', settle);
								resolve();
							};
							image.addEventListener('load', settle, { once: true });
							image.addEventListener('error', settle, { once: true });
							if (image.complete) resolve();
						});
					}
					if (image.naturalWidth > 0) await image.decode();
				})
			);
			if (disposed) return;
			storyReady = true;
			const direction = queuedDirection;
			queuedDirection = 0;
			if (direction && !reducedMotion && !isOutwardBoundary(direction)) {
				goToStep(stepIndex + direction);
			}
		};

		updateMotionPreference();
		setProgress(storySteps[stepIndex].progress);
		setPhoneSlide(phoneSlideForStep(stepIndex));
		queuedDirection = initialIntent;
		window.addEventListener('wheel', onWheel, { passive: false });
		window.addEventListener('touchstart', onTouchStart, { passive: true });
		window.addEventListener('touchmove', onTouchMove, { passive: false });
		window.addEventListener('touchend', onTouchEnd, { passive: true });
		window.addEventListener('touchcancel', onTouchEnd, { passive: true });
		window.addEventListener('keydown', onKeyDown);
		motionQuery.addEventListener('change', updateMotionPreference);
		void prepareFirstScene();
		return () => {
			disposed = true;
			window.removeEventListener('wheel', onWheel);
			window.removeEventListener('touchstart', onTouchStart);
			window.removeEventListener('touchmove', onTouchMove);
			window.removeEventListener('touchend', onTouchEnd);
			window.removeEventListener('touchcancel', onTouchEnd);
			window.removeEventListener('keydown', onKeyDown);
			motionQuery.removeEventListener('change', updateMotionPreference);
			if (wheelResetTimer) clearTimeout(wheelResetTimer);
			if (animationFrame) cancelAnimationFrame(animationFrame);
			if (phoneAnimationFrame) cancelAnimationFrame(phoneAnimationFrame);
		};
	});
</script>

<section
	bind:this={storyEl}
	class="scroll-story"
	aria-label={m.story_region_label()}
	data-story-step={stepIndex}
	data-story-step-name={storySteps[stepIndex].id}
	data-story-animating={isAnimating}
	data-phone-animating={phoneAnimating}
	data-phone-slide={phoneSlide.toFixed(3)}
	data-story-ready={storyReady ? 'true' : 'false'}
	data-reduced-motion={reducedMotion ? 'true' : 'false'}
>
	<div class="story-stage">
		<div class="story-progress" style:transform={`scaleX(${progress})`}></div>
		<div class="story-aurora story-aurora-left"></div>
		<div class="story-aurora story-aurora-right"></div>

		<section class="story-scene gacha-scene" aria-labelledby="story-title">
			<div class="story-hero-copy">
				<span>{m.story_hero_eyebrow()}</span>
				<h1 id="story-title">
					<span class="sr-only">NYCU LIFE — </span>{m.story_hero_title_1()}<br /><em
						>{m.story_hero_title_2()}</em
					>
				</h1>
				<p>{m.story_hero_lede()}</p>
			</div>
			<div class="gacha-machine" role="img" aria-label={m.story_gacha_alt()}>
				<img class="machine-base" src="{base}/story/designer/gacha-machine.svg" alt="" />
				<img class="machine-glass" src="{base}/story/designer/gacha-glass.svg" alt="" />
				<img src="{base}/story/designer/bottom-ball.svg" alt="" />
				<img src="{base}/story/designer/error-ball.svg" alt="" />
				<img src="{base}/story/designer/bus-ball.svg" alt="" />
				<img src="{base}/story/designer/mail-ball.svg" alt="" />
				<img src="{base}/story/designer/graduation-ball.svg" alt="" />
				<img src="{base}/story/designer/debug.svg" alt="" />
				<img src="{base}/story/designer/problems.svg" alt="" />
				<img src="{base}/story/designer/nycu-life.svg" alt="" />
				<img src="{base}/story/designer/gacha-hole.svg" alt="" />
				<img class="machine-knob" src="{base}/story/designer/knob.svg" alt="" />
			</div>
			<div class="capsule" aria-hidden="true">
				<span class="capsule-half capsule-top">NYCU</span>
				<span class="capsule-half capsule-bottom">LIFE</span>
			</div>
		</section>

		<section
			class="story-scene about-story"
			class:scene-active={reducedMotion || (progress >= 0.29 && progress <= 0.5)}
			aria-label={m.story_about_label()}
			aria-hidden={!reducedMotion && (progress < 0.29 || progress > 0.5)}
		>
			<article class="team-film">
				<div><span aria-hidden="true">▶</span><small>{m.story_about_film()}</small></div>
				<p>{m.story_about_quote()}</p>
			</article>
			<article class="about-card">
				<span>{m.story_about_eyebrow()}</span>
				<h2>{m.story_about_title_1()}<br />{m.story_about_title_2()}</h2>
				<p>{m.story_about_body()}</p>
				<a href="{base}/about/">{m.story_about_cta()}</a>
			</article>
		</section>

		<section
			class="story-scene product-story"
			class:scene-active={reducedMotion || (progress >= 0.465 && progress <= 0.915)}
			aria-label={m.story_products_label()}
			aria-hidden={!reducedMotion && (progress < 0.465 || progress > 0.915)}
		>
			<article class="product-copy product-course">
				<span>{m.story_product_1()}</span>
				<h2>{m.story_course_title()}</h2>
				<p>{products[1].summary()}</p>
				<div>
					<a href={products[1].href}>{m.story_course_cta()}</a><a
						class="ghost"
						href="{base}/products/">{m.story_product_detail()}</a
					>
				</div>
			</article>
			<article class="product-copy product-bus">
				<span>{m.story_product_2()}</span>
				<h2>{m.story_bus_title()}</h2>
				<p>{products[0].summary()}</p>
				<div>
					<a href={products[0].href}>{m.story_bus_cta()}</a><a class="ghost" href="{base}/products/"
						>{m.story_product_detail()}</a
					>
				</div>
			</article>
			<article class="product-copy product-activity">
				<span>{m.story_product_3()}</span>
				<h2>{m.story_activity_title()}</h2>
				<p>{products[2].summary()}</p>
				<div>
					<a href="{base}/products/">{m.story_activity_cta()}</a><a
						class="ghost"
						href="{base}/products/">{m.story_product_detail()}</a
					>
				</div>
			</article>
			<div class="phone-rig">
				<img src="{base}/story/phone-transparent.png" alt={m.story_phone_alt()} />
				<div class="phone-screen" aria-hidden="true">
					<div class="phone-track">
						<div class="phone-home">
							<strong>NYCU<br />LIFE</strong><small>{m.story_phone_tagline()}</small>
						</div>
						<div class="phone-app course-app">
							<b>{m.story_schedule_title()}</b><span>{m.story_schedule_credits()}</span><i
								>{m.story_course_data_structures()}<br /><small>09:00–10:50</small></i
							><i>{m.story_course_interaction_design()}<br /><small>13:20–15:10</small></i>
						</div>
						<div class="phone-app bus-app">
							<b>BUS</b>
							<h3>{m.story_bus_route()}</h3>
							<p>{m.story_bus_eta()}</p>
						</div>
						<div class="phone-app activity-app">
							<b>{m.story_activity_screen_title()}</b>
							<div class="activity-ticket">
								<span>24 AUG</span>
								<strong>{m.story_activity_screen_item()}</strong>
								<small>18:30 · Campus</small>
							</div>
						</div>
					</div>
				</div>
				<span class="swipe-indicator" class:phone-swiping={phoneAnimating} aria-hidden="true"
					>↑</span
				>
			</div>
		</section>

		<section
			class="story-scene faq-story"
			class:scene-active={reducedMotion || (progress >= 0.885 && progress <= 0.975)}
			aria-label={m.story_faq_label()}
			aria-hidden={!reducedMotion && (progress < 0.885 || progress > 0.975)}
		>
			<article class="faq-copy">
				<span>{m.story_faq_eyebrow()}</span>
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
		</section>

		<section
			class="story-scene join-story"
			class:scene-active={reducedMotion || progress >= 0.955}
			aria-label={m.story_join_label()}
			aria-hidden={!reducedMotion && progress < 0.955}
		>
			<div class="join-folder">
				<img src="{base}/story/designer/join-board.svg" alt={m.story_join_alt()} />
				<article>
					<span>{m.story_join_eyebrow()}</span>
					<h2>{m.story_join_title_1()}<br />{m.story_join_title_2()}</h2>
					<p>{m.story_join_body()}</p>
					<a
						href={JOIN_FORM_URL}
						target="_blank"
						rel="noreferrer"
						data-analytics-event="join_form_click"
						data-analytics-source="legacy_story">{m.story_join_cta()}</a
					>
				</article>
			</div>
		</section>

		<div class="scroll-cue" aria-hidden="true">{m.story_scroll_cue()} <i></i></div>
		<span class="story-percent" aria-hidden="true">{stepIndex + 1} / {storySteps.length}</span>
	</div>
</section>

<style>
	.scroll-story {
		--story-progress: 0;
		--phone-slide: 0;
		position: relative;
		height: calc(100svh - 4.75rem);
		background: var(--base);
		color: var(--ink);
	}
	.story-stage {
		position: relative;
		height: 100%;
		min-height: min(38rem, calc(100svh - 4.75rem));
		overflow: hidden;
		background: radial-gradient(
			circle at 50% 42%,
			var(--surface) 0 30%,
			var(--hero-start) 68%,
			var(--hero-end) 100%
		);
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
	.story-progress {
		position: absolute;
		z-index: 30;
		inset: 0 0 auto;
		height: 3px;
		background: var(--brand);
		transform-origin: left;
	}
	.story-scene {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
	.story-scene.scene-active :is(a, button) {
		pointer-events: auto;
	}
	.story-aurora {
		position: absolute;
		border-radius: 50%;
		filter: blur(50px);
		opacity: 0.35;
	}
	.story-aurora-left {
		width: 42vw;
		height: 42vw;
		left: -18vw;
		top: 20vh;
		background: var(--accent-2);
	}
	.story-aurora-right {
		width: 30vw;
		height: 30vw;
		right: -10vw;
		bottom: -8vw;
		background: #f0a491;
	}
	.story-hero-copy {
		position: absolute;
		z-index: 4;
		left: clamp(4rem, 7vw, 9rem);
		top: clamp(8rem, 15vh, 11rem);
		width: min(46vw, 47rem);
		transform: translateY(calc(clamp(0, calc((var(--story-progress) - 0.08) * 12.5), 1) * -64vh));
		opacity: clamp(0, calc((0.17 - var(--story-progress)) * 20), 1);
	}
	.story-hero-copy > span,
	.about-card > span,
	.product-copy > span,
	.faq-copy > span,
	.join-folder article > span {
		display: block;
		margin-bottom: 1rem;
		color: var(--brand);
		font: 700 0.72rem var(--font-display);
		letter-spacing: 0.2em;
	}
	.story-hero-copy h1 {
		margin: 0;
		font: 700 clamp(3.5rem, 5.9vw, 7rem)/1.01 var(--font-display);
		letter-spacing: -0.055em;
	}
	.story-hero-copy h1 em {
		color: var(--hero-accent);
		font-style: normal;
	}
	.story-hero-copy p,
	.about-card p,
	.product-copy p,
	.faq-copy p,
	.join-folder p {
		max-width: 35rem;
		color: var(--ink-soft);
		line-height: 1.75;
	}
	.story-hero-copy p {
		font-size: clamp(1rem, 1.05vw, 1.2rem);
	}
	.gacha-machine {
		position: absolute;
		z-index: 2;
		width: min(55vw, 62rem);
		height: 94%;
		right: -1vw;
		top: 1%;
		transform: translateY(calc(clamp(0, calc((var(--story-progress) - 0.08) * 12.5), 1) * -64vh));
		opacity: clamp(0, calc((0.195 - var(--story-progress)) * 40), 1);
	}
	.gacha-machine img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: contain;
		object-position: 50% 100%;
		filter: drop-shadow(0 1.5rem 2.25rem rgba(26, 55, 103, 0.16));
	}
	.gacha-machine img:not(.machine-base, .machine-glass) {
		transform: translateY(calc(clamp(0, calc((var(--story-progress) - 0.08) * 12), 1) * -2.5vh));
	}
	.gacha-machine .machine-knob {
		transform: rotate(calc(clamp(0, calc((var(--story-progress) - 0.02) * 7.143), 1) * 270deg));
	}
	.capsule {
		position: absolute;
		z-index: 8;
		left: calc(50% - 5.3rem);
		top: 12vh;
		width: 10.6rem;
		height: 10.6rem;
		opacity: clamp(
			0,
			calc((var(--story-progress) - 0.01) * 50),
			calc((0.39 - var(--story-progress)) * 33.333)
		);
		transform: translateY(calc(clamp(0, calc((var(--story-progress) - 0.03) * 5.882), 1) * 44vh))
			rotate(calc(clamp(0, calc((var(--story-progress) - 0.03) * 5.882), 1) * 210deg));
	}
	.capsule-half {
		position: absolute;
		left: 0;
		width: 100%;
		height: 50%;
		display: grid;
		place-items: center;
		border: 3px solid var(--brand);
		font: 700 0.85rem var(--font-display);
		letter-spacing: 0.16em;
		background: var(--surface);
	}
	.capsule-top {
		top: 0;
		border-radius: 7rem 7rem 0.25rem 0.25rem;
		background: var(--brand);
		color: white;
		transform: translateY(calc(clamp(0, calc((var(--story-progress) - 0.14) * 4.545), 1) * -20vh))
			rotate(calc(clamp(0, calc((var(--story-progress) - 0.14) * 4.545), 1) * -22deg));
		transform-origin: bottom right;
	}
	.capsule-bottom {
		bottom: 0;
		border-radius: 0.25rem 0.25rem 7rem 7rem;
		transform: translateY(calc(clamp(0, calc((var(--story-progress) - 0.14) * 4.545), 1) * 20vh))
			rotate(calc(clamp(0, calc((var(--story-progress) - 0.14) * 4.545), 1) * 18deg));
		transform-origin: top left;
	}
	.about-story {
		z-index: 3;
		opacity: clamp(
			0,
			calc((var(--story-progress) - 0.35) * 25),
			calc((0.49 - var(--story-progress)) * 30)
		);
		transform: scale(calc(0.96 + clamp(0, calc((var(--story-progress) - 0.35) * 25), 1) * 0.04));
	}
	.team-film,
	.about-card {
		position: absolute;
		top: 24vh;
		width: 38vw;
		min-height: 49vh;
		border: 1px solid var(--line);
		border-radius: 1.8rem;
		background: color-mix(in srgb, var(--surface) 92%, transparent);
		box-shadow: var(--shadow);
		padding: 1.4rem;
	}
	.team-film {
		left: 7vw;
		transform: translateX(
			calc((1 - clamp(0, calc((var(--story-progress) - 0.35) * 25), 1)) * -12vw)
		);
	}
	.about-card {
		right: 7vw;
		padding: 3rem;
		transform: translateX(
			calc((1 - clamp(0, calc((var(--story-progress) - 0.35) * 25), 1)) * 12vw)
		);
	}
	.team-film > div {
		height: 31vh;
		border-radius: 1.25rem;
		background: linear-gradient(145deg, var(--story-start), var(--story-end));
		display: grid;
		place-items: center;
		color: white;
		position: relative;
		overflow: hidden;
	}
	.team-film > div:before {
		content: '';
		position: absolute;
		width: 16rem;
		height: 16rem;
		border: 3.5rem solid rgba(255, 255, 255, 0.08);
		border-radius: 50%;
	}
	.team-film div > span {
		z-index: 1;
		display: grid;
		place-items: center;
		width: 4.2rem;
		height: 4.2rem;
		border: 1px solid white;
		border-radius: 50%;
		padding-left: 0.2rem;
	}
	.team-film small {
		position: absolute;
		left: 1.2rem;
		bottom: 1rem;
		letter-spacing: 0.13em;
	}
	.team-film > p {
		margin: 1.1rem 0.6rem 0;
		font-weight: 700;
	}
	.about-card h2,
	.product-copy h2,
	.faq-copy h2,
	.join-folder h2 {
		margin: 0;
		font: 700 clamp(2rem, 3.4vw, 3.65rem)/1.12 var(--font-display);
		letter-spacing: -0.045em;
	}
	.about-card a {
		display: inline-block;
		margin-top: 1rem;
		padding-bottom: 0.4rem;
		border-bottom: 1px solid currentColor;
		font-weight: 700;
	}
	.product-story {
		opacity: clamp(
			0,
			calc((var(--story-progress) - 0.47) * 30),
			calc((0.915 - var(--story-progress)) * 50)
		);
	}
	.phone-rig {
		--phone-scale-change: 0.34;
		position: absolute;
		z-index: 6;
		left: 50%;
		top: auto;
		bottom: 0;
		width: min(41vw, 34rem);
		aspect-ratio: 781/984;
		transform: translateX(-50%)
			translateX(
				calc(
					clamp(0, calc((var(--story-progress) - 0.5) * 10), 1) * 24vw -
						clamp(0, calc((var(--story-progress) - 0.72) * 12), 1) * 48vw +
						clamp(0, calc((var(--story-progress) - 0.805) * 16), 1) * 48vw
				)
			)
			scale(
				calc(
					1.06 - clamp(0, calc((var(--story-progress) - 0.47) * 11), 1) * var(--phone-scale-change)
				)
			);
		transform-origin: 52% 100%;
	}
	.phone-rig > img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: contain;
		z-index: 5;
	}
	.phone-screen {
		position: absolute;
		z-index: 7;
		left: 39%;
		top: 12.6%;
		width: 45.7%;
		height: 71.4%;
		border-radius: 11%/5%;
		overflow: hidden;
		background: var(--surface);
	}
	.phone-track {
		height: 400%;
		transform: translateY(calc(var(--phone-slide) * -25%));
	}
	.phone-home,
	.phone-app {
		height: 25%;
		position: relative;
		padding: 12% 9%;
	}
	.phone-home {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		gap: 0.65rem;
		color: var(--brand);
		text-align: center;
	}
	.phone-home strong {
		font: 800 1rem/1 var(--font-display);
	}
	.phone-home small {
		font-size: 0.35rem;
		letter-spacing: 0.1em;
	}
	.phone-app {
		background: var(--surface-2);
		font-size: 0.45rem;
	}
	.course-app > span {
		float: right;
		color: var(--brand);
	}
	.course-app i {
		position: absolute;
		border-radius: 0.4rem;
		padding: 0.55rem;
		font-style: normal;
		font-weight: 700;
		background: var(--hero-start);
	}
	.course-app i:nth-of-type(1) {
		left: 10%;
		top: 49%;
	}
	.course-app i:nth-of-type(2) {
		right: 10%;
		top: 55%;
		background: #f2d7d1;
	}
	.bus-app {
		padding-top: 35%;
		background: linear-gradient(var(--hero-start), var(--surface));
	}
	.bus-app > b {
		display: inline-block;
		padding: 0.35rem 0.5rem;
		border-radius: 0.35rem;
		background: var(--brand);
		color: white;
	}
	.bus-app h3 {
		font-size: 0.7rem;
		margin: 0.8rem 0 0.3rem;
	}
	.bus-app p {
		font-size: 0.42rem;
	}
	.activity-app {
		background: linear-gradient(160deg, #e8edff, var(--surface));
	}
	.activity-app > b {
		display: block;
		margin-bottom: 1.2rem;
		font-size: 0.62rem;
	}
	.activity-ticket {
		display: grid;
		gap: 0.35rem;
		padding: 0.8rem 0.65rem;
		border-radius: 0.65rem;
		background: var(--surface);
		box-shadow: 0 0.35rem 1rem rgba(31, 55, 78, 0.12);
	}
	.activity-ticket span,
	.activity-ticket small {
		font-size: 0.35rem;
		color: var(--ink-soft);
	}
	.swipe-indicator {
		position: absolute;
		z-index: 9;
		left: 59%;
		top: 46%;
		display: grid;
		place-items: center;
		width: 2rem;
		height: 3.6rem;
		border: 1px solid rgba(255, 255, 255, 0.7);
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.38);
		color: var(--brand);
		box-shadow: 0 0.4rem 1rem rgba(31, 55, 78, 0.12);
		opacity: 0;
		transform: translateY(1rem);
	}
	.swipe-indicator.phone-swiping {
		opacity: 1;
		animation: phone-swipe 1.05s ease-in-out both;
	}
	.product-copy {
		position: absolute;
		z-index: 4;
		left: 7vw;
		top: 31vh;
		width: 34vw;
		opacity: 0;
	}
	.product-course {
		opacity: clamp(
			0,
			calc((var(--story-progress) - 0.57) * 20),
			calc((0.74 - var(--story-progress)) * 18)
		);
		transform: translateX(calc((0.6 - var(--story-progress)) * -40vw));
	}
	.product-bus {
		right: 7vw;
		left: auto;
		opacity: clamp(
			0,
			calc((var(--story-progress) - 0.72) * 20),
			calc((0.84 - var(--story-progress)) * 36)
		);
		transform: translateX(calc((0.77 - var(--story-progress)) * 40vw));
	}
	.product-activity {
		opacity: clamp(
			0,
			calc((var(--story-progress) - 0.81) * 32),
			calc((0.91 - var(--story-progress)) * 50)
		);
		transform: translateX(calc((0.83 - var(--story-progress)) * -40vw));
	}
	.product-copy > div {
		display: flex;
		gap: 0.65rem;
		margin-top: 1.6rem;
	}
	.product-copy a,
	.join-folder a {
		display: inline-flex;
		border-radius: 999px;
		background: var(--brand);
		color: white;
		padding: 0.8rem 1.2rem;
		font-weight: 700;
	}
	.product-copy a.ghost {
		background: transparent;
		color: var(--brand);
		border: 1px solid var(--line-strong);
	}
	.faq-story {
		opacity: clamp(
			0,
			calc((var(--story-progress) - 0.895) * 45),
			calc((0.97 - var(--story-progress)) * 50)
		);
	}
	.faq-copy {
		position: absolute;
		left: clamp(4rem, 7vw, 9rem);
		top: 25%;
		width: min(32vw, 36rem);
	}
	.faq-copy h2 {
		font-size: clamp(3rem, 4vw, 5rem);
	}
	.faq-copy p {
		font-size: clamp(1rem, 1vw, 1.15rem);
	}
	.notebook {
		--notebook-y: -50%;
		--notebook-ink: #172235;
		--notebook-muted: #66758a;
		--notebook-line: rgba(57, 83, 125, 0.16);
		position: absolute;
		right: clamp(2rem, 4vw, 6rem);
		top: 50%;
		width: min(57vw, 105svh, 62rem);
		aspect-ratio: 1120 / 880;
		transform: translateX(calc(clamp(0, calc((0.915 - var(--story-progress)) * 33.333), 1) * 110vw))
			translateY(var(--notebook-y))
			rotate(calc(clamp(0, calc((0.915 - var(--story-progress)) * 33.333), 1) * 12deg));
		filter: drop-shadow(0 1.5rem 2rem rgba(24, 55, 98, 0.16));
	}
	.notebook > img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.faq-list {
		position: absolute;
		left: 23%;
		right: 14%;
		top: 11%;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		color: var(--notebook-ink);
	}
	.faq-list > strong {
		margin-bottom: 0.1rem;
		font: 700 clamp(3rem, 4.2vw, 5rem)/0.92 var(--font-display);
		letter-spacing: -0.06em;
	}
	.faq-item {
		border-bottom: 1px solid var(--notebook-line);
	}
	.faq-item button {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		width: 100%;
		border: 0;
		background: transparent;
		padding: clamp(0.55rem, 0.8vh, 0.8rem) 0;
		color: var(--notebook-ink);
		text-align: left;
		font-size: clamp(0.95rem, 1.05vw, 1.15rem);
		font-weight: 700;
		cursor: pointer;
	}
	.faq-item p {
		margin: 0 0 0.65rem;
		color: var(--notebook-muted);
		font-size: clamp(0.78rem, 0.85vw, 0.95rem);
		line-height: 1.6;
	}
	.join-story {
		opacity: clamp(0, calc((var(--story-progress) - 0.955) * 35), 1);
		background: var(--section-alt);
	}
	.join-folder {
		--join-paper-ink: #172235;
		--join-paper-muted: #66758a;
		--join-paper-brand: #325ee8;
		position: absolute;
		left: 50%;
		top: 50%;
		width: min(48vw, 78svh, 43rem);
		aspect-ratio: 1;
		transform: translate(
				-50%,
				calc(-50% + (1 - clamp(0, calc((var(--story-progress) - 0.955) * 50), 1)) * 55vh)
			)
			scale(calc(0.94 + clamp(0, calc((var(--story-progress) - 0.955) * 50), 1) * 0.06));
		filter: drop-shadow(0 2rem 3.5rem rgba(25, 54, 100, 0.16));
	}
	.join-folder > img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.join-folder article {
		position: absolute;
		z-index: 2;
		left: 31%;
		right: 14%;
		top: 18%;
		color: var(--join-paper-ink);
		text-align: center;
	}
	.join-folder article > span {
		color: var(--join-paper-brand);
	}
	.join-folder h2 {
		font-size: clamp(2.3rem, 3vw, 3.25rem);
	}
	.join-folder p {
		max-width: 22rem;
		margin-inline: auto;
		color: var(--join-paper-muted);
		font-size: clamp(0.95rem, 1vw, 1.08rem);
	}
	.join-folder a {
		margin-top: 0.8rem;
		background: #d8705d;
	}
	.scroll-cue {
		position: absolute;
		z-index: 25;
		left: 50%;
		bottom: 1.4rem;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: 0.8rem;
		color: var(--muted);
		font-size: 0.58rem;
		letter-spacing: 0.18em;
		opacity: clamp(0, calc(0.14 - var(--story-progress) * 3), 1);
	}
	.scroll-cue i {
		width: 1px;
		height: 1.8rem;
		background: currentColor;
		animation: story-scroll 1.5s infinite;
	}
	.story-percent {
		position: absolute;
		z-index: 25;
		right: 1.3rem;
		bottom: 1.2rem;
		color: var(--muted);
		font-variant-numeric: tabular-nums;
		font-size: 0.72rem;
	}
	@keyframes story-scroll {
		0% {
			transform: scaleY(0.2);
			transform-origin: top;
		}
		50% {
			transform: scaleY(1);
			transform-origin: top;
		}
		51% {
			transform-origin: bottom;
		}
		100% {
			transform: scaleY(0.2);
			transform-origin: bottom;
		}
	}
	@keyframes phone-swipe {
		0% {
			opacity: 0;
			transform: translateY(1.25rem);
		}
		18%,
		72% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			transform: translateY(-1.25rem);
		}
	}
	/*
	 * 1440p displays need their own composition. The regular desktop caps are
	 * intentionally conservative for laptops, but they leave the designer art
	 * looking like small stickers in a 2560×1440 canvas. Scale the main visual
	 * anchors with both viewport axes so they grow on large screens without
	 * overflowing shorter ultrawide displays.
	 */
	@media (min-width: 1800px) and (min-height: 1000px) {
		.story-hero-copy {
			left: clamp(7rem, 5.5vw, 11rem);
			top: 12.5%;
			width: min(48vw, 62rem);
		}
		.story-hero-copy h1 {
			font-size: clamp(7rem, 5.65vw, 9rem);
		}
		.story-hero-copy > span,
		.faq-copy > span,
		.join-folder article > span {
			font-size: 0.82rem;
		}
		.story-hero-copy p {
			font-size: clamp(1.2rem, 1vw, 1.45rem);
		}
		.gacha-machine {
			width: min(58vw, 96svh, 82rem);
			height: 96%;
			right: -1.5vw;
			top: 0;
		}
		.phone-rig {
			--phone-scale-change: 0.18;
			width: min(46vw, 80svh, 52rem);
		}
		.faq-copy {
			left: clamp(7rem, 5.5vw, 11rem);
			top: 22%;
			width: min(36vw, 46rem);
		}
		.faq-copy h2 {
			font-size: clamp(5rem, 4.1vw, 6.5rem);
		}
		.faq-copy p {
			font-size: clamp(1.15rem, 0.95vw, 1.35rem);
		}
		.notebook {
			right: 2.5vw;
			width: min(58vw, 112svh, 82rem);
		}
		.faq-list > strong {
			font-size: clamp(5rem, 4.4vw, 6.25rem);
		}
		.faq-item button {
			font-size: clamp(1.15rem, 1vw, 1.4rem);
		}
		.faq-item p {
			font-size: clamp(0.95rem, 0.82vw, 1.15rem);
		}
		.join-folder {
			width: min(46vw, 86svh, 60rem);
		}
		.join-folder h2 {
			font-size: clamp(3.5rem, 3vw, 4.5rem);
		}
		.join-folder p {
			max-width: 30rem;
			font-size: clamp(1.12rem, 0.95vw, 1.3rem);
		}
		.join-folder a {
			padding: 0.95rem 1.45rem;
			font-size: 1.08rem;
		}
	}
	@media (max-width: 900px) {
		.story-stage {
			min-height: 0;
		}
		.story-hero-copy {
			left: 6vw;
			top: clamp(2.5rem, 8svh, 5.5rem);
			width: 88vw;
			text-align: center;
		}
		.story-hero-copy h1 {
			font-size: clamp(2.15rem, 8.8vw, 3.4rem);
			line-height: 1.02;
		}
		.story-hero-copy p {
			margin-inline: auto;
		}
		.gacha-machine {
			width: min(110vw, 50rem);
			right: -5vw;
			top: auto;
			bottom: 18%;
			height: 52%;
		}
		.capsule {
			width: clamp(6.5rem, 22vw, 9rem);
			height: clamp(6.5rem, 22vw, 9rem);
			left: 50%;
			top: 15%;
			margin-left: clamp(-4.5rem, -11vw, -3.25rem);
		}
		.about-story {
			display: grid;
			align-content: center;
			gap: clamp(0.55rem, 2svh, 1.2rem);
			padding: clamp(0.75rem, 3vw, 1.75rem) 7vw;
		}
		.team-film,
		.about-card {
			position: relative;
			inset: auto;
			width: 100%;
			min-height: 0;
		}
		.about-card {
			padding: clamp(1.1rem, 4vw, 2rem);
		}
		.team-film > div {
			height: clamp(8.5rem, 25svh, 17rem);
		}
		.about-card h2,
		.product-copy h2,
		.faq-copy h2,
		.join-folder h2 {
			font-size: clamp(1.45rem, 6.5vw, 1.9rem);
		}
		.about-card p,
		.product-copy p,
		.faq-copy p,
		.join-folder p {
			font-size: clamp(0.74rem, 2.4vw, 0.9rem);
			line-height: 1.55;
		}
		.phone-rig {
			--phone-copy-lift: clamp(2svh, calc((53rem - 100svh) * 1.2), 12svh);
			left: calc(50% - min(12vw, 3.85rem));
			width: min(105vw, 36rem);
			top: 36%;
			bottom: auto;
			transform: translate(-50%, calc(-50% - var(--phone-copy-lift)))
				scale(calc(0.98 - clamp(0, calc((var(--story-progress) - 0.47) * 11), 1) * 0.08));
		}
		.product-copy,
		.product-bus,
		.product-activity {
			left: 6vw;
			right: auto;
			top: auto;
			bottom: clamp(5rem, 10svh, 8rem);
			width: 88vw;
			text-align: center;
			transform: none;
		}
		.product-copy h2,
		.product-copy p {
			margin-inline: auto;
		}
		.product-copy > div {
			justify-content: center;
			margin-top: clamp(0.8rem, 2svh, 1.3rem);
		}
		.product-copy a {
			padding: 0.7rem 1rem;
			font-size: clamp(0.78rem, 2.6vw, 0.92rem);
		}
		.faq-copy {
			left: 6vw;
			top: clamp(1.5rem, 7%, 4rem);
			width: 88vw;
			text-align: center;
		}
		.faq-copy h2 {
			margin-bottom: clamp(1rem, 2.8svh, 1.6rem);
		}
		.faq-copy p {
			margin: 0 auto;
			max-width: 34rem;
		}
		.notebook {
			--notebook-y: 0%;
			left: 50%;
			right: auto;
			top: auto;
			bottom: 24%;
			width: min(122vw, 102svh, 42rem);
			transform: translateX(
					calc(-50% + clamp(0, calc((0.915 - var(--story-progress)) * 33.333), 1) * 110vw)
				)
				rotate(calc(clamp(0, calc((0.915 - var(--story-progress)) * 33.333), 1) * 12deg));
		}
		.faq-list {
			top: 10%;
			gap: 0.25rem;
		}
		.faq-list > strong {
			font-size: clamp(3.25rem, 13vw, 4.25rem);
		}
		.faq-item button {
			padding: 0.5rem 0;
			font-size: clamp(1rem, 3.8vw, 1.2rem);
		}
		.faq-item p {
			font-size: clamp(0.82rem, 3vw, 1rem);
			margin-bottom: 0.45rem;
		}
		.join-folder {
			left: calc(50% - min(6vw, 2.5rem));
			width: min(112vw, 84svh, 39rem);
		}
		.join-folder article {
			left: 29%;
			right: 17%;
			top: 18%;
		}
		.join-folder h2 {
			font-size: clamp(1.45rem, 6vw, 2rem);
			margin-bottom: clamp(0.9rem, 2.4svh, 1.35rem);
		}
		.join-folder p {
			margin: 0 auto;
		}
		.story-percent {
			right: 0.7rem;
		}
	}
	@media (min-width: 601px) and (max-width: 900px) {
		.notebook {
			bottom: 14%;
			width: min(118vw, 102svh, 50rem);
		}
		.join-folder {
			width: min(78vw, 76svh, 40rem);
		}
	}
	@media (min-width: 901px) and (max-width: 1200px) and (orientation: portrait) {
		.phone-rig {
			left: calc(50% - min(8vw, 4.75rem));
			width: min(78vw, 56svh, 44rem);
			top: 40%;
			bottom: auto;
			transform: translate(-50%, calc(-50% - 6svh))
				scale(calc(0.98 - clamp(0, calc((var(--story-progress) - 0.47) * 11), 1) * 0.08));
		}
		.product-copy,
		.product-bus,
		.product-activity {
			left: 6vw;
			right: auto;
			top: auto;
			bottom: clamp(4rem, 7svh, 7rem);
			width: 88vw;
			text-align: center;
			transform: none;
		}
		.product-copy h2,
		.product-copy p {
			margin-inline: auto;
		}
		.product-copy > div {
			justify-content: center;
		}
	}
	@media (max-width: 900px) and (max-height: 680px) {
		.story-hero-copy {
			top: 2.5rem;
		}
		.story-hero-copy h1 {
			font-size: clamp(2rem, 8.3vw, 2.75rem);
		}
		.story-hero-copy > span,
		.about-card > span,
		.product-copy > span,
		.faq-copy > span,
		.join-folder article > span {
			margin-bottom: 0.55rem;
		}
		.about-story {
			gap: 0.45rem;
			padding-block: 0.55rem;
		}
		.team-film,
		.about-card {
			border-radius: 1.2rem;
			padding: 0.85rem;
		}
		.team-film > div {
			height: 21svh;
		}
		.team-film > p {
			margin-top: 0.65rem;
			font-size: 0.74rem;
		}
		.about-card h2,
		.product-copy h2,
		.faq-copy h2,
		.join-folder h2 {
			font-size: clamp(1.3rem, 6.2vw, 1.65rem);
		}
		.about-card p,
		.product-copy p,
		.faq-copy p,
		.join-folder p {
			font-size: 0.72rem;
			line-height: 1.4;
		}
		.about-card a {
			margin-top: 0.35rem;
		}
		.phone-rig {
			width: min(100vw, 30rem);
			top: 34%;
		}
		.product-copy,
		.product-bus,
		.product-activity {
			bottom: clamp(2.5rem, 7svh, 4rem);
		}
		.product-copy > div {
			margin-top: 0.55rem;
		}
		.product-copy a {
			padding: 0.55rem 0.8rem;
		}
		.faq-copy {
			top: 1rem;
		}
		.notebook {
			bottom: 4%;
			width: min(130vw, 98svh, 38rem);
		}
		.join-folder {
			width: min(84vw, 80svh, 32rem);
		}
		.join-folder a {
			margin-top: 0.35rem;
			padding: 0.65rem 0.9rem;
		}
	}
	.scroll-story[data-reduced-motion='true'] {
		height: auto;
		overflow: clip;
	}
	.scroll-story[data-reduced-motion='true'] .scroll-cue i {
		animation: none;
	}
	.scroll-story[data-reduced-motion='true'] .story-stage {
		position: relative;
		top: 0;
		height: auto;
		overflow: visible;
	}
	.scroll-story[data-reduced-motion='true'] .story-scene {
		position: relative;
		min-height: 100vh;
		opacity: 1 !important;
		transform: none !important;
	}
	.scroll-story[data-reduced-motion='true']
		:is(
			.story-hero-copy,
			.gacha-machine,
			.capsule,
			.team-film,
			.about-card,
			.phone-rig,
			.product-copy,
			.faq-copy,
			.notebook,
			.join-folder
		) {
		transform: none !important;
		opacity: 1 !important;
	}
	.scroll-story[data-reduced-motion='true'] .gacha-scene {
		min-height: 115vh;
	}
	.scroll-story[data-reduced-motion='true'] .capsule {
		display: none;
	}
	.scroll-story[data-reduced-motion='true'] .about-story {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		padding: 7rem 7vw;
	}
	.scroll-story[data-reduced-motion='true'] .about-story :is(.team-film, .about-card) {
		position: relative;
		inset: auto;
		width: auto;
	}
	.scroll-story[data-reduced-motion='true'] .product-story {
		display: grid;
		gap: 2rem;
		min-height: auto;
		padding: 7rem 7vw;
	}
	.scroll-story[data-reduced-motion='true'] .phone-rig {
		position: relative;
		inset: auto;
		order: -1;
		width: min(90vw, 34rem);
		margin: 0 auto;
	}
	.scroll-story[data-reduced-motion='true']
		:is(.product-copy, .product-course, .product-bus, .product-activity) {
		position: relative;
		inset: auto;
		width: auto;
	}
	.scroll-story[data-reduced-motion='true'] :is(.swipe-indicator, .story-progress, .story-percent) {
		display: none;
	}
	.scroll-story[data-reduced-motion='true'] .faq-story {
		display: grid;
		gap: 2rem;
		min-height: auto;
		padding: 7rem 7vw;
	}
	.scroll-story[data-reduced-motion='true'] :is(.faq-copy, .notebook) {
		position: relative;
		inset: auto;
		width: min(100%, 48rem);
		margin-inline: auto;
	}
	.scroll-story[data-reduced-motion='true'] .join-story {
		min-height: auto;
		padding-block: 4rem;
	}
	.scroll-story[data-reduced-motion='true'] .join-folder {
		position: relative;
		inset: auto;
		margin-inline: auto;
	}
	.scroll-story[data-reduced-motion='true'] .scroll-cue {
		display: none;
	}
	@media (max-width: 900px) {
		.scroll-story[data-reduced-motion='true'] .about-story {
			grid-template-columns: 1fr;
			padding: 3rem 8vw;
		}
		.scroll-story[data-reduced-motion='true'] .gacha-scene {
			min-height: 100svh;
		}
		.scroll-story[data-reduced-motion='true'] .faq-story {
			padding: 3rem 4vw;
		}
		.scroll-story[data-reduced-motion='true'] .join-folder {
			height: 48rem;
		}
	}
</style>
