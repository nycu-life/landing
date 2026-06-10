<script lang="ts">
	import { base } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import {
		whySection,
		painPoints,
		productsSection,
		products,
		devLogSection,
		devLogEntries,
		joinSection,
		footerLinks,
		footer
	} from '$lib/content/landing';
	import { aboutLede } from '$lib/content/about';
	import { upcomingCourses } from '$lib/content/courses';
	import { reveal } from './scroll';
	import Icon from './Icon.svelte';
	import StatusPill from './StatusPill.svelte';
	import ProductIcon from './ProductIcon.svelte';
	import TimelineBody from './TimelineBody.svelte';
	import TeamBento from './TeamBento.svelte';
	import FaqBody from './FaqBody.svelte';
	import CourseCard from './CourseCard.svelte';
	import DevlogCard from './DevlogCard.svelte';

	// Desktop-only storytelling chapters (≥ 64rem): the four destinations
	// retold as one continuous scroll. Mobile keeps the app-style routes.
	let expandedLog = $state<string | null>(null);
</script>

<div class="story" id="story">
	<!-- ── Chapter 01 · 痛點 → 解法 ─────────────────────────────────── -->
	<section class="chapter">
		<header class="reveal chapter-head" use:reveal>
			<span class="chapter-num" aria-hidden="true">01</span>
			<p class="chapter-eyebrow">{whySection.eyebrow()}</p>
			<h2 class="chapter-title">{whySection.title()}</h2>
			<p class="chapter-lede">{whySection.lede()}</p>
		</header>
		<div class="pain-grid">
			{#each painPoints as point, i (point.id)}
				<article
					class="reveal pain-card glass"
					class:offset={i % 2 === 1}
					use:reveal={{ delay: i * 90 }}
				>
					<div class="pain-icon">
						<Icon name={point.icon} class="h-[20px] w-[20px]" />
					</div>
					<p class="pain-label">{whySection.painLabel()}</p>
					<p class="pain-quote">「{point.pain()}」</p>
					<p class="pain-label answer">{whySection.answerLabel()}</p>
					<p class="pain-answer">{point.answer()}</p>
				</article>
			{/each}
		</div>
	</section>

	<!-- ── Chapter 02 · 所有產品 ────────────────────────────────────── -->
	<section class="chapter">
		<header class="reveal chapter-head" use:reveal>
			<span class="chapter-num" aria-hidden="true">02</span>
			<p class="chapter-eyebrow">{productsSection.eyebrow()}</p>
			<h2 class="chapter-title">{m.page_products_lead()}{m.page_products_accent()}</h2>
			<p class="chapter-lede">{productsSection.lede()}</p>
		</header>
		<div class="product-rows">
			{#each products as product, i (product.id)}
				<article class="reveal product-row" class:flip={i % 2 === 1} use:reveal>
					<div class="product-visual" class:tilt-l={i % 2 === 0} class:tilt-r={i % 2 === 1}>
						{#if product.screenshot}
							<img
								class="product-shot"
								src="{base}{product.screenshot.src}"
								alt={product.name()}
								loading="lazy"
							/>
						{:else}
							<div class="product-ghost">
								<ProductIcon kind={product.glyph} size={120} />
							</div>
						{/if}
					</div>
					<div class="product-copy">
						<div class="product-id">
							<ProductIcon kind={product.glyph} size={56} />
							<div>
								<h3 class="product-name">{product.name()}</h3>
								<p class="product-latin">{product.latin}</p>
							</div>
						</div>
						<StatusPill status={product.status} />
						<p class="product-summary">{product.summary()}</p>
						<ul class="product-features">
							{#each product.features as feature, fi (fi)}
								<li>
									<span class="feature-check">
										<svg
											width="12"
											height="12"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2.2"
											stroke-linecap="round"
											stroke-linejoin="round"
											aria-hidden="true"
										>
											<path d="M20 6 9 17l-5-5" />
										</svg>
									</span>
									<span>{feature()}</span>
								</li>
							{/each}
						</ul>
						{#if product.href}
							<a
								class="liquid-glass-btn product-visit"
								href={product.href}
								target="_blank"
								rel="noreferrer"
							>
								<span>{productsSection.visitLabel()}</span>
								<span class="visit-arrow" aria-hidden="true">
									<svg
										width="13"
										height="13"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="1.8"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<path d="M7 17 17 7M8 7h9v9" />
									</svg>
								</span>
							</a>
						{/if}
					</div>
				</article>
			{/each}
		</div>
	</section>

	<!-- ── Chapter 03 · 認識我們 ────────────────────────────────────── -->
	<section class="chapter">
		<header class="reveal chapter-head" use:reveal>
			<span class="chapter-num" aria-hidden="true">03</span>
			<p class="chapter-eyebrow">{m.menu_about_latin()}</p>
			<h2 class="chapter-title">{m.page_about_lead()}{m.page_about_accent()}</h2>
			<p class="chapter-lede">{aboutLede[0]()}</p>
		</header>
		<div class="about-grid">
			<div class="reveal about-timeline glass" use:reveal>
				<p class="panel-label">{m.about_folder_timeline_title()}</p>
				<TimelineBody />
			</div>
			<div class="reveal about-team" use:reveal={{ delay: 120 }}>
				<TeamBento />
			</div>
		</div>
	</section>

	<!-- ── Chapter 04 · 課程專區 ────────────────────────────────────── -->
	<section class="chapter">
		<header class="reveal chapter-head" use:reveal>
			<span class="chapter-num" aria-hidden="true">04</span>
			<p class="chapter-eyebrow">{m.menu_courses_latin()}</p>
			<h2 class="chapter-title">{m.page_courses_lead()}{m.page_courses_accent()}</h2>
			<p class="chapter-lede">{m.menu_courses_desc()}</p>
		</header>
		<div class="course-grid">
			{#each upcomingCourses as course, i (course.id)}
				<div class="reveal" use:reveal={{ delay: i * 90 }}>
					<CourseCard {course} />
				</div>
			{/each}
		</div>
		<div class="reveal course-more" use:reveal>
			<a class="liquid-glass-btn" href="{base}/courses/">
				<span>{m.courses_tab_archive()}</span>
				<span class="visit-arrow" aria-hidden="true">
					<svg
						width="13"
						height="13"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M5 12h14M13 5l7 7-7 7" />
					</svg>
				</span>
			</a>
		</div>
	</section>

	<!-- ── Chapter 05 · 開發日誌 ────────────────────────────────────── -->
	<section class="chapter">
		<header class="reveal chapter-head" use:reveal>
			<span class="chapter-num" aria-hidden="true">05</span>
			<p class="chapter-eyebrow">{devLogSection.eyebrow()}</p>
			<h2 class="chapter-title">{m.page_devlog_lead()}{m.page_devlog_accent()}</h2>
			<p class="chapter-lede">{devLogSection.lede()}</p>
		</header>
		<div class="log-grid">
			{#each devLogEntries as entry, i (entry.id)}
				<div
					class="log-item reveal"
					class:lean-l={i % 2 === 0}
					class:lean-r={i % 2 === 1}
					use:reveal={{ delay: (i % 2) * 110 }}
				>
					<DevlogCard
						{entry}
						index={i}
						expanded={expandedLog === entry.id}
						ontoggle={() => (expandedLog = expandedLog === entry.id ? null : entry.id)}
					/>
				</div>
			{/each}
		</div>
	</section>

	<!-- ── Finale · 加入我們 ────────────────────────────────────────── -->
	<section class="chapter finale">
		<div class="reveal finale-panel glass glass-float" use:reveal>
			<h2 class="finale-title">{joinSection.title()}</h2>
			<p class="finale-lede">{joinSection.lede()}</p>
			<a
				class="liquid-glass-btn finale-cta"
				href={joinSection.cta.href}
				target="_blank"
				rel="noreferrer"
			>
				<span>{joinSection.cta.label()}</span>
				<span class="visit-arrow" aria-hidden="true">
					<svg
						width="13"
						height="13"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M7 17 17 7M8 7h9v9" />
					</svg>
				</span>
			</a>
			<div class="finale-faq">
				<p class="panel-label">{m.about_folder_faq_title()}</p>
				<FaqBody />
			</div>
		</div>
		<footer class="reveal story-foot" use:reveal>
			<div class="story-foot-socials">
				{#each footerLinks as link (link.href)}
					<a href={link.href} target="_blank" rel="noreferrer" aria-label={link.label()}>
						<Icon name={link.icon} class="h-[18px] w-[18px]" />
					</a>
				{/each}
			</div>
			<p class="story-foot-rights">{footer.rights()}</p>
		</footer>
	</section>
</div>

<style>
	/* Desktop-only storytelling — hidden under the app-style mobile layout. */
	.story {
		display: none;
	}

	@media (min-width: 64rem) {
		.story {
			display: block;
			position: relative;
			z-index: 1;
			width: 100%;
			max-width: var(--shell);
			margin-inline: auto;
			padding-inline: var(--gutter);
			color: var(--ink);
		}

		.chapter {
			position: relative;
			padding-block: clamp(5rem, 10vh, 8rem) clamp(3rem, 6vh, 5rem);
		}

		/* ---- chapter header: ghost ordinal + eyebrow + display title -------- */
		.chapter-head {
			position: relative;
			max-width: 46rem;
			margin-bottom: 3.25rem;
		}
		.chapter-num {
			position: absolute;
			top: -4.5rem;
			left: -1.5rem;
			z-index: -1;
			font-family: var(--font-display);
			font-weight: 700;
			font-size: 11rem;
			line-height: 1;
			letter-spacing: -0.06em;
			color: rgba(255, 255, 255, 0.05);
			user-select: none;
		}
		.chapter-eyebrow {
			margin: 0 0 0.9rem;
			font-family: var(--font-display);
			font-size: 0.72rem;
			font-weight: 600;
			letter-spacing: 0.22em;
			text-transform: uppercase;
			color: var(--brand-ink);
		}
		.chapter-title {
			margin: 0;
			font-family: var(--font-cjk);
			font-size: clamp(2.4rem, 4vw, 3.4rem);
			font-weight: 600;
			line-height: 1.12;
			letter-spacing: -0.03em;
		}
		.chapter-lede {
			margin: 1.1rem 0 0;
			max-width: 36rem;
			font-size: 1rem;
			line-height: 1.75;
			color: var(--ink-soft);
		}

		.panel-label {
			margin: 0 0 1rem;
			font-family: var(--font-display);
			font-size: 0.66rem;
			font-weight: 600;
			letter-spacing: 0.2em;
			text-transform: uppercase;
			color: var(--muted);
		}

		/* ---- 01 · pain → answer --------------------------------------------- */
		.pain-grid {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 1.4rem 1.6rem;
		}
		.pain-card {
			border-radius: 16px;
			padding: 1.6rem 1.7rem 1.5rem;
		}
		.pain-card.offset {
			transform: translateY(1.75rem);
		}
		.pain-icon {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			width: 38px;
			height: 38px;
			border-radius: 12px;
			background: var(--brand-soft);
			color: var(--brand-ink);
			margin-bottom: 1.1rem;
		}
		.pain-label {
			margin: 0 0 0.3rem;
			font-family: var(--font-display);
			font-size: 0.62rem;
			font-weight: 600;
			letter-spacing: 0.2em;
			text-transform: uppercase;
			color: var(--muted);
		}
		.pain-label.answer {
			margin-top: 1rem;
			color: var(--brand-ink);
		}
		.pain-quote {
			margin: 0;
			font-size: 1.05rem;
			font-weight: 600;
			line-height: 1.5;
			color: var(--ink-soft);
		}
		.pain-answer {
			margin: 0;
			font-size: 0.92rem;
			line-height: 1.65;
			color: var(--ink);
		}

		/* ---- 02 · products ---------------------------------------------------- */
		.product-rows {
			display: flex;
			flex-direction: column;
			gap: 5rem;
		}
		.product-row {
			display: grid;
			grid-template-columns: 1.15fr 1fr;
			gap: 3.5rem;
			align-items: center;
		}
		.product-row.flip {
			grid-template-columns: 1fr 1.15fr;
		}
		.product-row.flip .product-visual {
			order: 2;
		}
		.product-visual {
			position: relative;
		}
		.tilt-l {
			transform: rotate(-1.2deg);
		}
		.tilt-r {
			transform: rotate(1.2deg);
		}
		.product-shot {
			width: 100%;
			border-radius: 16px;
			border-top: 1px solid var(--rim);
			box-shadow: var(--shadow-float);
		}
		.product-ghost {
			display: flex;
			align-items: center;
			justify-content: center;
			aspect-ratio: 16 / 10;
			border-radius: 16px;
			background: var(--glass-soft);
			backdrop-filter: var(--blur-soft);
			-webkit-backdrop-filter: var(--blur-soft);
			border-top: 1px solid var(--rim);
			box-shadow: var(--shadow);
		}
		.product-copy {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: 0.9rem;
		}
		.product-id {
			display: flex;
			align-items: center;
			gap: 1rem;
		}
		.product-name {
			margin: 0;
			font-size: 1.65rem;
			font-weight: 700;
			letter-spacing: -0.02em;
		}
		.product-latin {
			margin: 0.2rem 0 0;
			font-family: var(--font-display);
			font-size: 0.66rem;
			font-weight: 600;
			letter-spacing: 0.18em;
			text-transform: uppercase;
			color: var(--muted);
		}
		.product-summary {
			margin: 0;
			font-size: 0.98rem;
			line-height: 1.7;
			color: var(--ink-soft);
		}
		.product-features {
			list-style: none;
			margin: 0;
			padding: 0;
			display: flex;
			flex-direction: column;
			gap: 0.55rem;
		}
		.product-features li {
			display: flex;
			align-items: flex-start;
			gap: 0.55rem;
			font-size: 0.88rem;
			line-height: 1.5;
		}
		.feature-check {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			width: 20px;
			height: 20px;
			margin-top: 1px;
			border-radius: 6px;
			background: rgba(47, 96, 218, 0.22);
			color: var(--brand-ink);
			flex-shrink: 0;
		}
		.product-visit {
			gap: 0.6rem;
			padding: 0.6rem 1.2rem;
			font-size: 0.85rem;
			font-weight: 600;
		}
		.visit-arrow {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			width: 22px;
			height: 22px;
			border-radius: 50%;
			background: rgba(255, 255, 255, 0.18);
		}

		/* ---- 03 · about -------------------------------------------------------- */
		.about-grid {
			display: grid;
			grid-template-columns: 5fr 6fr;
			gap: 1.6rem;
			align-items: start;
		}
		.about-timeline {
			border-radius: 16px;
			padding: 1.6rem 1.7rem 1.7rem;
		}

		/* ---- 04 · courses ------------------------------------------------------ */
		.course-grid {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 1.4rem;
		}
		.course-more {
			display: flex;
			justify-content: flex-end;
			margin-top: 1.6rem;
		}
		.course-more .liquid-glass-btn {
			gap: 0.6rem;
			padding: 0.6rem 1.2rem;
			font-size: 0.85rem;
			font-weight: 600;
		}

		/* ---- 05 · devlog ------------------------------------------------------- */
		.log-grid {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 2rem 2.2rem;
			align-items: start;
		}
		.log-item {
			transition: transform 0.45s var(--ease-glass);
		}
		.log-item.lean-l {
			transform: rotate(-0.8deg);
		}
		.log-item.lean-r {
			transform: rotate(0.7deg) translateY(1.5rem);
		}
		.log-item.lean-l:hover {
			transform: rotate(0deg);
		}
		.log-item.lean-r:hover {
			transform: rotate(0deg) translateY(1.5rem);
		}

		/* ---- finale ------------------------------------------------------------ */
		.finale {
			padding-bottom: 4rem;
		}
		.finale-panel {
			border-radius: 20px;
			padding: clamp(2.5rem, 5vw, 4rem);
			max-width: 52rem;
			margin-inline: auto;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: 1.1rem;
		}
		.finale-title {
			margin: 0;
			font-family: var(--font-cjk);
			font-size: clamp(2.2rem, 3.6vw, 3rem);
			font-weight: 600;
			letter-spacing: -0.03em;
		}
		.finale-lede {
			margin: 0;
			max-width: 34rem;
			font-size: 1rem;
			line-height: 1.75;
			color: var(--ink-soft);
		}
		.finale-cta {
			gap: 0.6rem;
			padding: 0.75rem 1.5rem;
			font-size: 0.95rem;
			font-weight: 600;
		}
		.finale-faq {
			width: 100%;
			margin-top: 1.8rem;
			padding-top: 1.4rem;
			border-top: 1px solid var(--line);
		}
		.story-foot {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 1rem;
			max-width: 52rem;
			margin: 2.5rem auto 0;
			padding-bottom: 1rem;
		}
		.story-foot-socials {
			display: flex;
			gap: 1rem;
		}
		.story-foot-socials a {
			color: var(--ink-soft);
			transition:
				color 0.25s ease,
				filter 0.25s ease;
		}
		.story-foot-socials a:hover {
			color: var(--brand-ink);
			filter: drop-shadow(0 0 8px rgba(109, 155, 255, 0.7));
		}
		.story-foot-rights {
			margin: 0;
			font-family: var(--font-display);
			font-size: 0.62rem;
			font-weight: 600;
			letter-spacing: 0.14em;
			text-transform: uppercase;
			color: var(--muted);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.pain-card.offset,
		.log-item.lean-l,
		.log-item.lean-r,
		.tilt-l,
		.tilt-r {
			transform: none;
		}
	}
</style>
