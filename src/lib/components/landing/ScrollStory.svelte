<script lang="ts">
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { INSTAGRAM_URL, products } from '$lib/content/landing';
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

	let storyEl: HTMLElement;
	let progress = $state(0);
	let activeFaq = $state(0);
	let reducedMotion = $state(false);

	const clamp = (value: number) => Math.min(1, Math.max(0, value));

	onMount(() => {
		let frame = 0;
		const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		const updateMotionPreference = () => (reducedMotion = motionQuery.matches);
		const update = () => {
			const rect = storyEl.getBoundingClientRect();
			progress = clamp(-rect.top / Math.max(storyEl.offsetHeight - window.innerHeight, 1));
			storyEl.style.setProperty('--story-progress', String(progress));
			frame = 0;
		};
		const requestUpdate = () => {
			if (!frame) frame = requestAnimationFrame(update);
		};
		updateMotionPreference();
		update();
		window.addEventListener('scroll', requestUpdate, { passive: true });
		window.addEventListener('resize', requestUpdate);
		motionQuery.addEventListener('change', updateMotionPreference);
		return () => {
			window.removeEventListener('scroll', requestUpdate);
			window.removeEventListener('resize', requestUpdate);
			motionQuery.removeEventListener('change', updateMotionPreference);
			if (frame) cancelAnimationFrame(frame);
		};
	});
</script>

<section bind:this={storyEl} class="scroll-story" aria-label={m.story_region_label()}>
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
			class:scene-active={reducedMotion || (progress >= 0.3 && progress <= 0.51)}
			aria-label={m.story_about_label()}
			aria-hidden={!reducedMotion && (progress < 0.3 || progress > 0.51)}
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
			class:scene-active={reducedMotion || (progress >= 0.43 && progress <= 0.9)}
			aria-label={m.story_products_label()}
			aria-hidden={!reducedMotion && (progress < 0.43 || progress > 0.9)}
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
				<img src="{base}/story/phone.png" alt={m.story_phone_alt()} />
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
				<span class="swipe-indicator" aria-hidden="true">↑</span>
			</div>
		</section>

		<section
			class="story-scene faq-story"
			class:scene-active={reducedMotion || (progress >= 0.86 && progress <= 0.96)}
			aria-label={m.story_faq_label()}
			aria-hidden={!reducedMotion && (progress < 0.86 || progress > 0.96)}
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
			class:scene-active={reducedMotion || progress >= 0.94}
			aria-label={m.story_join_label()}
			aria-hidden={!reducedMotion && progress < 0.94}
		>
			<div class="join-folder">
				<img src="{base}/story/designer/join-board.svg" alt={m.story_join_alt()} />
				<article>
					<span>{m.story_join_eyebrow()}</span>
					<h2>{m.story_join_title_1()}<br />{m.story_join_title_2()}</h2>
					<p>{m.story_join_body()}</p>
					<a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">{m.story_join_cta()}</a>
				</article>
			</div>
		</section>

		<div class="scroll-cue" aria-hidden="true">{m.story_scroll_cue()} <i></i></div>
		<a class="skip-story" href="#products">{m.story_skip()}</a>
		<span class="story-percent" aria-hidden="true">{Math.round(progress * 100)}%</span>
	</div>
</section>

<style>
	.scroll-story {
		--story-progress: 0;
		position: relative;
		height: 1050vh;
		background: var(--base);
		color: var(--ink);
	}
	.story-stage {
		position: sticky;
		top: 4.75rem;
		height: calc(100svh - 4.75rem);
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
		left: 7vw;
		top: 20vh;
		width: 42vw;
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
		font: 700 clamp(3rem, 5.4vw, 5.25rem)/1.04 var(--font-display);
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
	.gacha-machine {
		position: absolute;
		z-index: 2;
		width: min(48vw, 44rem);
		height: 88vh;
		right: 1vw;
		top: 1vh;
		transform: translateY(calc(clamp(0, calc((var(--story-progress) - 0.08) * 12.5), 1) * -64vh));
		opacity: clamp(0, calc((0.315 - var(--story-progress)) * 50), 1);
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
		transform: rotate(calc(clamp(0, calc((var(--story-progress) - 0.16) * 14.3), 1) * 270deg));
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
			calc((var(--story-progress) - 0.15) * 50),
			calc((0.315 - var(--story-progress)) * 50)
		);
		transform: translateY(calc(clamp(0, calc((var(--story-progress) - 0.16) * 14.3), 1) * 44vh))
			rotate(calc(clamp(0, calc((var(--story-progress) - 0.16) * 14.3), 1) * 210deg));
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
		transform: translateY(calc(clamp(0, calc((var(--story-progress) - 0.23) * 12.5), 1) * -20vh))
			rotate(calc(clamp(0, calc((var(--story-progress) - 0.23) * 12.5), 1) * -22deg));
		transform-origin: bottom right;
	}
	.capsule-bottom {
		bottom: 0;
		border-radius: 0.25rem 0.25rem 7rem 7rem;
		transform: translateY(calc(clamp(0, calc((var(--story-progress) - 0.23) * 12.5), 1) * 20vh))
			rotate(calc(clamp(0, calc((var(--story-progress) - 0.23) * 12.5), 1) * 18deg));
		transform-origin: top left;
	}
	.about-story {
		z-index: 3;
		opacity: clamp(
			0,
			calc((var(--story-progress) - 0.305) * 50),
			calc((0.5 - var(--story-progress)) * 24)
		);
		transform: scale(calc(0.88 + clamp(0, calc((var(--story-progress) - 0.305) * 18), 1) * 0.12));
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
		transform: translateX(calc((0.3 - var(--story-progress)) * -70vw));
	}
	.about-card {
		right: 7vw;
		padding: 3rem;
		transform: translateX(calc((0.3 - var(--story-progress)) * 70vw));
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
			calc((var(--story-progress) - 0.43) * 18),
			calc((0.895 - var(--story-progress)) * 40)
		);
	}
	.phone-rig {
		position: absolute;
		z-index: 6;
		left: 50%;
		top: 50%;
		width: min(41vw, 34rem);
		aspect-ratio: 781/984;
		transform: translate(-50%, -50%)
			translateX(
				calc(
					clamp(0, calc((var(--story-progress) - 0.5) * 10), 1) * 24vw -
						clamp(0, calc((var(--story-progress) - 0.72) * 12), 1) * 48vw +
						clamp(0, calc((var(--story-progress) - 0.805) * 16), 1) * 48vw
				)
			)
			scale(calc(1.8 - clamp(0, calc((var(--story-progress) - 0.43) * 13), 1) * 1.12));
		transform-origin: 52% 50%;
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
		transform: translateY(
			calc(
				clamp(0, calc((var(--story-progress) - 0.56) * 13), 1) * -25% -
					clamp(0, calc((var(--story-progress) - 0.72) * 15), 1) * 25% -
					clamp(0, calc((var(--story-progress) - 0.805) * 18), 1) * 25%
			)
		);
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
		opacity: clamp(
			0,
			calc((var(--story-progress) - 0.555) * 50),
			calc((0.845 - var(--story-progress)) * 30)
		);
		transform: translateY(
			calc(
				clamp(0, calc((var(--story-progress) - 0.56) * 16), 1) * -7vh +
					clamp(0, calc((var(--story-progress) - 0.7) * 18), 1) * 7vh -
					clamp(0, calc((var(--story-progress) - 0.805) * 20), 1) * 7vh
			)
		);
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
			calc((0.82 - var(--story-progress)) * 24)
		);
		transform: translateX(calc((0.77 - var(--story-progress)) * 40vw));
	}
	.product-activity {
		opacity: clamp(
			0,
			calc((var(--story-progress) - 0.805) * 28),
			calc((0.9 - var(--story-progress)) * 28)
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
			calc((var(--story-progress) - 0.865) * 30),
			calc((0.95 - var(--story-progress)) * 25)
		);
	}
	.faq-copy {
		position: absolute;
		left: 7vw;
		top: 27vh;
		width: 34vw;
	}
	.notebook {
		position: absolute;
		right: 5vw;
		top: 9vh;
		width: min(48vw, 41rem);
		height: 82vh;
		transform: translateX(calc((0.88 - var(--story-progress)) * 110vw))
			rotate(calc((0.88 - var(--story-progress)) * 20deg));
		filter: drop-shadow(0 1.5rem 2rem rgba(24, 55, 98, 0.16));
		overflow: hidden;
	}
	.notebook > img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		transform: scale(1.65);
		transform-origin: 56% 50%;
	}
	.faq-list {
		position: absolute;
		left: 23%;
		top: 18%;
		width: 57%;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}
	.faq-list > strong {
		font: 700 clamp(2.7rem, 5vw, 4.8rem) var(--font-display);
		letter-spacing: -0.06em;
	}
	.faq-item {
		border-bottom: 1px solid var(--line);
	}
	.faq-item button {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		width: 100%;
		border: 0;
		background: transparent;
		padding: 0.6rem 0;
		color: var(--ink);
		text-align: left;
		font-weight: 700;
		cursor: pointer;
	}
	.faq-item p {
		margin: 0 0 0.6rem;
		color: var(--ink-soft);
		font-size: 0.68rem;
		line-height: 1.55;
	}
	.join-story {
		opacity: clamp(0, calc((var(--story-progress) - 0.94) * 35), 1);
		background: var(--section-alt);
	}
	.join-folder {
		position: absolute;
		left: 50%;
		top: 3vh;
		width: min(62vw, 49rem);
		height: 94vh;
		transform: translate(
			-50%,
			calc((1 - clamp(0, calc((var(--story-progress) - 0.94) * 18), 1)) * -105vh)
		);
		filter: drop-shadow(0 2rem 3.5rem rgba(25, 54, 100, 0.16));
		overflow: hidden;
	}
	.join-folder > img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: contain;
		transform: translateX(25%) scale(3);
		transform-origin: 29% 47%;
	}
	.join-folder article {
		position: absolute;
		z-index: 2;
		left: 25%;
		right: 25%;
		top: 49%;
		text-align: center;
	}
	.join-folder h2 {
		font-size: clamp(2rem, 2.7vw, 2.8rem);
	}
	.join-folder p {
		margin-inline: auto;
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
	.skip-story {
		position: absolute;
		z-index: 25;
		right: 1.25rem;
		top: 1rem;
		padding: 0.55rem 0.85rem;
		border: 1px solid var(--line-strong);
		border-radius: 999px;
		background: color-mix(in srgb, var(--surface) 84%, transparent);
		color: var(--ink-soft);
		font-size: 0.72rem;
		font-weight: 700;
		backdrop-filter: blur(12px);
		opacity: clamp(0, calc((0.16 - var(--story-progress)) * 18), 1);
		pointer-events: auto;
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
	@media (max-width: 760px) {
		.scroll-story {
			height: 980vh;
		}
		.story-stage {
			min-height: min(34rem, calc(100svh - 4.75rem));
		}
		.story-hero-copy {
			left: 8vw;
			top: 10vh;
			width: 84vw;
			text-align: center;
		}
		.story-hero-copy h1 {
			font-size: clamp(2.55rem, 11vw, 3.4rem);
		}
		.gacha-machine {
			width: 110vw;
			right: -5vw;
			top: 55%;
			height: 55vw;
		}
		.capsule {
			width: 7rem;
			height: 7rem;
			left: calc(50% - 3.5rem);
		}
		.team-film,
		.about-card {
			width: 84vw;
			left: 8vw;
			right: auto;
			min-height: 0;
		}
		.team-film {
			top: 10vh;
		}
		.about-card {
			top: 57vh;
			padding: 1.6rem;
		}
		.team-film > div {
			height: 27vh;
		}
		.about-card h2,
		.product-copy h2,
		.faq-copy h2,
		.join-folder h2 {
			font-size: 1.8rem;
		}
		.about-card p,
		.product-copy p,
		.faq-copy p,
		.join-folder p {
			font-size: 0.82rem;
		}
		.phone-rig {
			width: 94vw;
			top: 35%;
			transform: translate(-50%, -50%)
				scale(calc(1.35 - clamp(0, calc((var(--story-progress) - 0.43) * 13), 1) * 0.52));
		}
		.product-copy,
		.product-bus,
		.product-activity {
			left: 8vw;
			right: auto;
			top: 59vh;
			width: 84vw;
			text-align: center;
		}
		.product-copy > div {
			justify-content: center;
		}
		.faq-copy {
			left: 8vw;
			top: 10vh;
			width: 84vw;
			text-align: center;
		}
		.notebook {
			right: 2vw;
			top: 37vh;
			width: 96vw;
			height: 61vh;
		}
		.faq-list {
			top: 18%;
			gap: 0.1rem;
		}
		.faq-list > strong {
			font-size: 2.5rem;
		}
		.faq-item button {
			padding: 0.35rem 0;
			font-size: 0.62rem;
		}
		.faq-item p {
			font-size: 0.52rem;
			margin-bottom: 0.3rem;
		}
		.join-folder {
			width: 108vw;
		}
		.join-folder article {
			left: 25%;
			right: 25%;
			top: 49%;
		}
		.join-folder h2 {
			font-size: 1.65rem;
		}
		.story-percent {
			right: 0.7rem;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.scroll-cue i {
			animation: none;
		}
		.scroll-story {
			height: auto;
			overflow: clip;
		}
		.story-stage {
			position: relative;
			top: 0;
			height: auto;
			overflow: visible;
		}
		.story-scene {
			position: relative;
			min-height: 100vh;
			opacity: 1 !important;
			transform: none !important;
		}
		.story-hero-copy,
		.gacha-machine,
		.capsule,
		.team-film,
		.about-card,
		.phone-rig,
		.product-copy,
		.faq-copy,
		.notebook,
		.join-folder {
			transform: none !important;
			opacity: 1 !important;
		}
		.gacha-scene {
			min-height: 115vh;
		}
		.capsule {
			display: none;
		}
		.about-story {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 2rem;
			padding: 7rem 7vw;
		}
		.about-story .team-film,
		.about-story .about-card {
			position: relative;
			inset: auto;
			width: auto;
		}
		.product-story {
			display: grid;
			gap: 2rem;
			min-height: auto;
			padding: 7rem 7vw;
		}
		.phone-rig {
			position: relative;
			inset: auto;
			order: -1;
			width: min(90vw, 34rem);
			margin: 0 auto;
		}
		.product-copy,
		.product-course,
		.product-bus,
		.product-activity {
			position: relative;
			inset: auto;
			width: auto;
		}
		.swipe-indicator,
		.story-progress,
		.story-percent,
		.skip-story {
			display: none;
		}
		.faq-story {
			display: grid;
			gap: 2rem;
			min-height: auto;
			padding: 7rem 7vw;
		}
		.faq-copy,
		.notebook {
			position: relative;
			inset: auto;
			width: min(100%, 48rem);
			margin-inline: auto;
		}
		.join-story {
			min-height: auto;
			padding-block: 4rem;
		}
		.join-folder {
			position: relative;
			inset: auto;
			margin-inline: auto;
		}
		.scroll-cue {
			display: none;
		}
	}
	@media (prefers-reduced-motion: reduce) and (max-width: 760px) {
		.about-story {
			grid-template-columns: 1fr;
			padding: 3rem 8vw;
		}
		.gacha-scene {
			min-height: 100svh;
		}
		.faq-story {
			padding: 3rem 4vw;
		}
		.join-folder {
			height: 48rem;
		}
	}
</style>
