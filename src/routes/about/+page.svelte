<script lang="ts">
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { m } from '$lib/paraglide/messages';
	import { TEAM_FILM_ID, milestones, visionCards } from '$lib/content/about';
	import SiteFooter from '$lib/components/landing/SiteFooter.svelte';

	const title = $derived(`${m.menu_about()}｜NYCU LIFE`);
	const filmUrl = `https://www.youtube-nocookie.com/embed/${TEAM_FILM_ID}?rel=0&playsinline=1`;

	/* The milestone path draws itself once it scrolls into view; milestones follow it in. */
	let milestoneEl: HTMLElement | undefined = $state();
	let milestonesIn = $state(false);

	onMount(() => {
		if (!milestoneEl) return;
		if (typeof IntersectionObserver === 'undefined') {
			milestonesIn = true;
			return;
		}
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					milestonesIn = true;
					observer.disconnect();
				}
			},
			{ threshold: 0.25 }
		);
		observer.observe(milestoneEl);
		return () => observer.disconnect();
	});

	/* Desktop path: one S-curve per gap, milestones sit on its alternating crests (viewBox
	   1000 × 520). Positions are shared by the SVG and the absolutely placed list items. */
	const nodes = milestones.map((_, index) => ({
		x: 40 + (920 / (milestones.length - 1)) * index,
		y: index % 2 === 0 ? 350 : 170
	}));
	const pathD = nodes
		.map((node, index) => {
			if (index === 0) return `M${node.x},${node.y}`;
			const prev = nodes[index - 1];
			const mid = (prev.x + node.x) / 2;
			return `C${mid},${prev.y} ${mid},${node.y} ${node.x},${node.y}`;
		})
		.join(' ');
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={m.about_page_lede()} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={m.about_page_lede()} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={m.about_page_lede()} />
</svelte:head>

<div class="about-page">
	<header class="page about-head about-section">
		<span class="about-eyebrow">{m.about_page_eyebrow()}</span>
		<h1 class="page-title">{m.about_page_title()}</h1>
		<p class="page-lede">{m.about_page_lede()}</p>
	</header>

	<section class="page about-section" aria-labelledby="vision-title">
		<span class="about-eyebrow">{m.about_vision_eyebrow()}</span>
		<h2 id="vision-title" class="section-title">{m.about_vision_title()}</h2>
		<ul class="vision-grid">
			{#each visionCards as card, index (card.id)}
				<li class="vision-card" data-vision={card.id}>
					<div class="vision-art" aria-hidden="true">
						{#if card.art}
							<img src="{base}{card.art}" alt="" />
						{:else}
							<span class="motif motif-{card.id}"><i></i><i></i><i></i></span>
						{/if}
					</div>
					<span class="vision-num">0{index + 1}</span>
					<h3>{card.title()}</h3>
					<p>{card.body()}</p>
				</li>
			{/each}
		</ul>
	</section>

	<section class="page about-section" aria-labelledby="film-title">
		<span class="about-eyebrow">{m.about_film_eyebrow()}</span>
		<h2 id="film-title" class="section-title">{m.about_film_title()}</h2>
		<div class="film-frame">
			<iframe
				src={filmUrl}
				title={m.story_about_film()}
				loading="lazy"
				allow="encrypted-media; picture-in-picture; web-share"
				referrerpolicy="strict-origin-when-cross-origin"
				allowfullscreen
			></iframe>
		</div>
	</section>

	<section
		bind:this={milestoneEl}
		id="milestones"
		class="page about-section milestones"
		class:drawn={milestonesIn}
		aria-labelledby="milestone-title"
	>
		<span class="about-eyebrow">{m.about_milestone_eyebrow()}</span>
		<h2 id="milestone-title" class="section-title">{m.about_milestone_title()}</h2>
		<p class="section-lede">{m.about_milestone_lede()}</p>
		<div class="milestone-track">
			<svg class="milestone-path" viewBox="0 0 1000 520" aria-hidden="true">
				<path class="path-base" d={pathD} pathLength="1" />
				<path class="path-draw" d={pathD} pathLength="1" />
			</svg>
			<ol class="milestone-list">
				{#each milestones as milestone, index (milestone.id)}
					<li
						class="milestone"
						class:upcoming={milestone.upcoming}
						class:above={index % 2 === 1}
						style:--x="{nodes[index].x / 10}%"
						style:--y="{(nodes[index].y / 520) * 100}%"
						style:--order={index}
					>
						<span class="milestone-dot" aria-hidden="true"></span>
						<div class="milestone-card">
							<span class="milestone-date">{milestone.date()}</span>
							<h3>{milestone.title()}</h3>
							<p>{milestone.body()}</p>
						</div>
					</li>
				{/each}
			</ol>
		</div>
		<p class="milestone-more">
			<a href="{base}/devlog/">{m.about_milestone_devlog_link()} →</a>
		</p>
	</section>

	<section class="page about-section about-wish" aria-labelledby="about-wish-title">
		<div class="wish-card">
			<img class="wish-art" src="{base}/story/designer/wishpool/machine.svg" alt="" />
			<div class="wish-copy">
				<h2 id="about-wish-title">{m.about_wish_title()}</h2>
				<p>{m.about_wish_lede()}</p>
				<a class="wish-link" href="{base}/wishpool/"
					>{m.wish_cta()} <span aria-hidden="true">→</span></a
				>
			</div>
		</div>
	</section>
</div>

<SiteFooter />

<style>
	/* #106: vision → film → milestone, each a snap point so the film "locks" under the
	   vision cards while scrolling. Proximity keeps free scrolling inside long sections. */
	:global(html:has(.about-page)) {
		scroll-snap-type: y proximity;
		scroll-padding-top: 4.75rem;
	}
	.about-page {
		position: relative;
		z-index: 1;
	}
	.about-section {
		scroll-snap-align: start;
		padding-block: clamp(2.5rem, 6vw, 4.5rem);
	}
	.about-head {
		display: grid;
		gap: 0.9rem;
		padding-bottom: 0;
	}
	.about-head .page-title {
		font-size: clamp(2.5rem, 6vw, 4.5rem);
		line-height: 1.08;
	}
	.about-eyebrow {
		color: var(--brand);
		font-size: 0.78rem;
		font-weight: 750;
		letter-spacing: 0.14em;
	}
	.section-title {
		margin: 0.6rem 0 0;
		color: var(--ink);
		font-size: clamp(1.75rem, 3.6vw, 2.75rem);
		font-weight: 700;
		line-height: 1.15;
		letter-spacing: -0.03em;
	}
	.section-lede {
		margin: 0.75rem 0 0;
		max-width: 38rem;
		color: var(--ink-soft);
		line-height: 1.7;
	}

	/* ── Vision ─────────────────────────────────────────────── */
	.vision-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: clamp(1rem, 2vw, 1.5rem);
		margin: clamp(1.5rem, 3vw, 2.25rem) 0 0;
		padding: 0;
		list-style: none;
	}
	.vision-card {
		position: relative;
		display: grid;
		align-content: start;
		gap: 0.5rem;
		padding: 1.25rem 1.25rem 1.6rem;
		border: 1px solid var(--line);
		border-radius: 1.25rem;
		background: var(--surface);
		box-shadow: 0 1px 2px rgba(15, 30, 60, 0.04);
		transition:
			transform 0.3s ease,
			box-shadow 0.3s ease,
			border-color 0.3s ease;
	}
	.vision-card:hover {
		transform: translateY(-6px);
		border-color: color-mix(in srgb, var(--brand) 40%, transparent);
		box-shadow: 0 22px 40px rgba(0, 69, 242, 0.12);
	}
	.vision-art {
		display: grid;
		place-items: center;
		aspect-ratio: 16 / 10;
		margin-bottom: 0.75rem;
		overflow: hidden;
		border-radius: 0.9rem;
		background:
			radial-gradient(circle at 78% 18%, rgba(76, 104, 255, 0.22), transparent 55%),
			color-mix(in srgb, var(--brand) 8%, var(--surface));
	}
	.vision-art img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.vision-num {
		color: var(--brand);
		font-size: 0.8rem;
		font-weight: 750;
		letter-spacing: 0.1em;
	}
	.vision-card h3 {
		margin: 0;
		color: var(--ink);
		font-size: 1.2rem;
		font-weight: 700;
	}
	.vision-card p {
		margin: 0;
		color: var(--ink-soft);
		line-height: 1.7;
	}
	/* Placeholder motifs until the designer's animations arrive: idle, and they come alive
	   on hover/focus. Integrate = pieces gathering, realtime = pulse, students = stacking. */
	.motif {
		position: relative;
		width: 6.5rem;
		height: 4.5rem;
	}
	.motif i {
		position: absolute;
		border-radius: 999px;
		background: var(--brand);
		transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	.motif-integrate i {
		width: 1.6rem;
		height: 1.6rem;
		top: calc(50% - 0.8rem);
		left: calc(50% - 0.8rem);
		opacity: 0.85;
	}
	.motif-integrate i:nth-child(1) {
		transform: translate(-2.2rem, -1rem);
		background: #2f60da;
	}
	.motif-integrate i:nth-child(2) {
		transform: translate(2.2rem, -1rem);
		background: #8fb0ff;
	}
	.motif-integrate i:nth-child(3) {
		transform: translate(0, 1.3rem);
		background: #ffc6be;
	}
	.vision-card:hover .motif-integrate i {
		transform: translate(0, 0) scale(1.15);
	}
	.motif-realtime i {
		inset: 0;
		margin: auto;
		width: 1.4rem;
		height: 1.4rem;
	}
	.motif-realtime i:nth-child(2),
	.motif-realtime i:nth-child(3) {
		background: transparent;
		border: 2px solid var(--brand);
		opacity: 0.6;
	}
	.motif-realtime i:nth-child(2) {
		transform: scale(1.8);
	}
	.motif-realtime i:nth-child(3) {
		transform: scale(2.7);
		opacity: 0.3;
	}
	.vision-card:hover .motif-realtime i:nth-child(2),
	.vision-card:hover .motif-realtime i:nth-child(3) {
		animation: motif-pulse 1.4s ease-out infinite;
	}
	.vision-card:hover .motif-realtime i:nth-child(3) {
		animation-delay: 0.5s;
	}
	@keyframes motif-pulse {
		from {
			transform: scale(1);
			opacity: 0.8;
		}
		to {
			transform: scale(3.2);
			opacity: 0;
		}
	}
	.motif-students i {
		left: calc(50% - 1.6rem);
		width: 3.2rem;
		height: 0.9rem;
		border-radius: 0.35rem;
	}
	.motif-students i:nth-child(1) {
		bottom: 0.4rem;
		background: #2f60da;
	}
	.motif-students i:nth-child(2) {
		bottom: 1.5rem;
		background: #8fb0ff;
		transform: translateX(0.9rem);
	}
	.motif-students i:nth-child(3) {
		bottom: 2.6rem;
		background: #ffc6be;
		transform: translateX(-0.9rem);
	}
	.vision-card:hover .motif-students i {
		transform: translateX(0);
	}

	/* ── Film ───────────────────────────────────────────────── */
	.film-frame {
		margin-top: clamp(1.5rem, 3vw, 2.25rem);
		aspect-ratio: 16 / 9;
		overflow: hidden;
		border-radius: 1.25rem;
		background: #0b1526;
		box-shadow: 0 28px 60px rgba(15, 30, 60, 0.18);
	}
	.film-frame iframe {
		display: block;
		width: 100%;
		height: 100%;
		border: 0;
	}

	/* ── Milestone ──────────────────────────────────────────── */
	.milestone-more {
		margin: clamp(1rem, 2.5vw, 1.75rem) 0 0;
		text-align: center;
		font-weight: 700;
	}
	.milestone-more a {
		color: var(--brand);
	}
	.milestone-more a:hover {
		text-decoration: underline;
	}
	.milestone-track {
		position: relative;
		margin-top: clamp(1.5rem, 3vw, 2rem);
		aspect-ratio: 1000 / 520;
	}
	.milestone-path {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: visible;
	}
	.milestone-path path {
		fill: none;
		stroke-linecap: round;
	}
	.path-base {
		stroke: var(--line);
		stroke-width: 2;
		stroke-dasharray: 0.004 0.01;
	}
	.path-draw {
		stroke: #8fb0ff;
		stroke-width: 12;
		stroke-dasharray: 1 1;
		stroke-dashoffset: 1;
		transition: stroke-dashoffset 2.4s cubic-bezier(0.45, 0, 0.25, 1);
	}
	.drawn .path-draw {
		stroke-dashoffset: 0;
	}
	.milestone-list {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.milestone {
		position: absolute;
		left: var(--x);
		top: var(--y);
		width: 0;
		height: 0;
		opacity: 0;
		transition:
			opacity 0.45s ease,
			transform 0.45s ease;
		transition-delay: calc(var(--order) * 0.55s + 0.1s);
		transform: translateY(0.6rem);
	}
	.drawn .milestone {
		opacity: 1;
		transform: none;
	}
	.milestone-dot {
		position: absolute;
		left: -0.75rem;
		top: -0.75rem;
		width: 1.5rem;
		height: 1.5rem;
		border: 4px solid var(--surface);
		border-radius: 50%;
		background: var(--brand);
		box-shadow: 0 0 0 2px var(--brand);
	}
	.upcoming .milestone-dot {
		background: var(--surface);
	}
	.milestone-card {
		position: absolute;
		left: 0;
		top: 1.6rem;
		width: clamp(10rem, 17vw, 14rem);
		transform: translateX(-50%);
		text-align: center;
	}
	.milestone.above .milestone-card {
		top: auto;
		bottom: 1.6rem;
	}
	.milestone:first-child .milestone-card {
		transform: translateX(-1.5rem);
		text-align: left;
	}
	.milestone:last-child .milestone-card {
		transform: translateX(calc(-100% + 1.5rem));
		text-align: right;
	}
	.milestone-date {
		color: var(--brand);
		font-size: 0.78rem;
		font-weight: 750;
		letter-spacing: 0.08em;
	}
	.milestone-card h3 {
		margin: 0.2rem 0 0.3rem;
		color: var(--ink);
		font-size: 1rem;
		font-weight: 700;
		line-height: 1.35;
	}
	.milestone-card p {
		margin: 0;
		color: var(--ink-soft);
		font-size: 0.85rem;
		line-height: 1.6;
	}
	.upcoming .milestone-card h3 {
		color: var(--ink-soft);
	}

	/* ── Wish Pool hand-off ─────────────────────────────────── */
	.wish-card {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
		align-items: center;
		gap: clamp(1rem, 4vw, 3rem);
		padding: clamp(1.5rem, 4vw, 3rem);
		overflow: hidden;
		border-radius: 1.5rem;
		background:
			radial-gradient(circle at 7% 18%, rgba(76, 104, 255, 0.14), transparent 22rem),
			radial-gradient(circle at 91% 88%, rgba(255, 198, 190, 0.2), transparent 24rem),
			var(--surface-2);
		border: 1px solid var(--line);
	}
	.wish-art {
		width: 100%;
		max-height: 18rem;
		object-fit: contain;
	}
	.wish-copy {
		display: grid;
		justify-items: start;
		gap: 0.85rem;
	}
	.wish-copy h2 {
		margin: 0;
		color: var(--ink);
		font-size: clamp(1.6rem, 3.2vw, 2.4rem);
		font-weight: 700;
		line-height: 1.2;
		letter-spacing: -0.03em;
	}
	.wish-copy p {
		margin: 0;
		color: var(--ink-soft);
		line-height: 1.7;
	}
	.wish-link {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		margin-top: 0.4rem;
		padding: 0.8rem 1.4rem;
		border-radius: 999px;
		background: var(--brand);
		color: #fff;
		font-weight: 700;
		transition: transform 0.2s ease;
	}
	.wish-link:hover {
		transform: translateY(-2px);
	}
	:global(:root[data-theme='dark']) .wish-link {
		color: #0b1526;
	}
	.wish-link:focus-visible {
		outline: 2px solid var(--brand);
		outline-offset: 3px;
	}

	/* ── Responsive ─────────────────────────────────────────── */
	@media (max-width: 960px) {
		.vision-grid {
			grid-template-columns: 1fr;
		}
		.vision-card {
			grid-template-columns: 9rem minmax(0, 1fr);
			column-gap: 1.1rem;
			align-items: center;
		}
		.vision-art {
			grid-row: span 3;
			margin: 0;
			aspect-ratio: 1;
		}
		.vision-num,
		.vision-card h3,
		.vision-card p {
			grid-column: 2;
		}
	}
	/* Below 820px the path becomes a vertical timeline drawn top to bottom. */
	@media (max-width: 820px) {
		.milestone-track {
			aspect-ratio: auto;
			padding-left: 2.25rem;
		}
		.milestone-path {
			display: none;
		}
		.milestone-track::before,
		.milestone-track::after {
			content: '';
			position: absolute;
			left: 0.55rem;
			top: 0.6rem;
			bottom: 0.6rem;
			width: 6px;
			border-radius: 6px;
		}
		.milestone-track::before {
			background: var(--line);
			width: 2px;
			left: 0.75rem;
		}
		.milestone-track::after {
			background: #8fb0ff;
			transform: scaleY(0);
			transform-origin: top;
			transition: transform 2.4s cubic-bezier(0.45, 0, 0.25, 1);
		}
		.drawn .milestone-track::after {
			transform: scaleY(1);
		}
		.milestone-list {
			display: grid;
			gap: 1.75rem;
		}
		.milestone {
			position: relative;
			left: auto;
			top: auto;
			width: auto;
			height: auto;
		}
		.milestone-dot {
			left: -2.25rem;
			top: 0.1rem;
		}
		.milestone-card,
		.milestone.above .milestone-card,
		.milestone:first-child .milestone-card,
		.milestone:last-child .milestone-card {
			position: static;
			width: auto;
			transform: none;
			text-align: left;
		}
		.wish-card {
			grid-template-columns: 1fr;
		}
		.wish-art {
			max-height: 12rem;
		}
	}
	@media (max-width: 520px) {
		.vision-card {
			grid-template-columns: 5.5rem minmax(0, 1fr);
			padding: 1rem;
		}
		.motif {
			transform: scale(0.7);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.vision-card,
		.motif i,
		.path-draw,
		.milestone,
		.milestone-track::after,
		.wish-link {
			transition: none !important;
			transition-delay: 0s !important;
			animation: none !important;
		}
		.path-draw {
			stroke-dashoffset: 0;
		}
		.milestone {
			opacity: 1;
			transform: none;
		}
		.milestone-track::after {
			transform: none !important;
		}
	}
</style>
