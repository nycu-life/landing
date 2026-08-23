<script lang="ts">
	import { base } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
</script>

<section class="hero" aria-labelledby="story-title">
	<div class="hero-glow hero-glow-left"></div>
	<div class="hero-glow hero-glow-right"></div>

	<div class="hero-inner">
		<div class="hero-copy">
			<span class="eyebrow">NYCU LIFE</span>
			<h1 id="story-title">
				<span class="sr-only">NYCU LIFE — </span>{m.story_hero_title_1()}<br /><em
					>{m.story_hero_title_2()}</em
				>
			</h1>
			<p>{m.story_hero_lede()}</p>
			<div class="hero-actions">
				<a class="primary-action" href="#products">{m.nav_products()}</a>
				<a class="text-action" href="#about">{m.menu_about()} <span aria-hidden="true">↓</span></a>
			</div>
		</div>

		<div class="hero-art" role="img" aria-label={m.story_gacha_alt()}>
			<div class="machine-stack">
				<img src="{base}/story/designer/gacha-machine.svg" alt="" />
				<img src="{base}/story/designer/gacha-glass.svg" alt="" />
				<img src="{base}/story/designer/bottom-ball.svg" alt="" />
				<img src="{base}/story/designer/error-ball.svg" alt="" />
				<img src="{base}/story/designer/bus-ball.svg" alt="" />
				<img src="{base}/story/designer/mail-ball.svg" alt="" />
				<img src="{base}/story/designer/graduation-ball.svg" alt="" />
				<img src="{base}/story/designer/nycu-life.svg" alt="" />
				<img src="{base}/story/designer/gacha-hole.svg" alt="" />
				<img class="knob" src="{base}/story/designer/knob.svg" alt="" />
			</div>
		</div>
	</div>

	<a class="scroll-cue" href="#products">
		<span>{m.story_scroll_cue()}</span>
		<i aria-hidden="true"></i>
	</a>
</section>

<style>
	.hero {
		position: relative;
		isolation: isolate;
		overflow: hidden;
		min-height: min(48rem, calc(100svh - 4.75rem));
		background:
			linear-gradient(115deg, color-mix(in srgb, var(--surface) 92%, transparent), transparent 58%),
			radial-gradient(
				circle at 68% 38%,
				var(--surface) 0 22%,
				var(--hero-start) 62%,
				var(--hero-end)
			);
		color: var(--ink);
	}

	.hero-inner {
		position: relative;
		z-index: 2;
		display: grid;
		grid-template-columns: minmax(18rem, 0.82fr) minmax(28rem, 1.18fr);
		align-items: center;
		width: min(82rem, 100%);
		min-height: inherit;
		margin-inline: auto;
		padding: 4.5rem var(--gutter) 5.5rem;
	}

	.hero-copy {
		position: relative;
		z-index: 3;
		max-width: 34rem;
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

	.eyebrow {
		display: inline-flex;
		align-items: center;
		gap: 0.65rem;
		color: var(--brand);
		font: 700 0.76rem/1 var(--font-display);
		letter-spacing: 0.2em;
	}

	.eyebrow::before {
		content: '';
		width: 2rem;
		height: 2px;
		background: currentColor;
	}

	h1 {
		margin: 1.25rem 0 1.35rem;
		font: 700 clamp(3.25rem, 6vw, 5.6rem)/0.98 var(--font-display);
		letter-spacing: -0.06em;
	}

	h1 em {
		color: var(--hero-accent);
		font-style: normal;
	}

	.hero-copy p {
		max-width: 28rem;
		margin: 0;
		color: var(--ink-soft);
		font-size: clamp(1rem, 1.4vw, 1.15rem);
		line-height: 1.75;
	}

	.hero-actions {
		display: flex;
		align-items: center;
		gap: 1.2rem;
		margin-top: 2.1rem;
	}

	.hero-actions a {
		font-weight: 700;
	}

	.primary-action {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 3.1rem;
		padding-inline: 1.45rem;
		border-radius: 999px;
		background: var(--brand);
		color: white;
		box-shadow: 0 0.9rem 2rem color-mix(in srgb, var(--brand) 24%, transparent);
	}

	.primary-action:hover {
		transform: translateY(-2px);
	}

	.text-action {
		color: var(--ink);
	}

	.text-action:hover {
		color: var(--brand);
	}

	.hero-art {
		position: relative;
		align-self: stretch;
		min-width: 0;
	}

	.machine-stack {
		position: absolute;
		inset: 1rem -7rem 0 -4rem;
		filter: drop-shadow(0 2.2rem 3rem rgba(26, 55, 103, 0.13));
		animation: settle 700ms cubic-bezier(0.2, 0.75, 0.3, 1) both;
	}

	.machine-stack img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.machine-stack .knob {
		transform-origin: 65% 68%;
		animation: turn 900ms 450ms cubic-bezier(0.2, 0.75, 0.3, 1) both;
	}

	.hero-glow {
		position: absolute;
		z-index: 0;
		border-radius: 999px;
		filter: blur(80px);
		opacity: 0.32;
	}

	.hero-glow-left {
		width: 28rem;
		height: 28rem;
		left: -16rem;
		top: 2rem;
		background: var(--brand);
	}

	.hero-glow-right {
		width: 30rem;
		height: 30rem;
		right: -10rem;
		bottom: -10rem;
		background: var(--hero-accent);
	}

	.scroll-cue {
		position: absolute;
		z-index: 4;
		left: 50%;
		bottom: 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.45rem;
		color: var(--ink-soft);
		font: 700 0.65rem var(--font-display);
		letter-spacing: 0.15em;
		text-transform: uppercase;
		transform: translateX(-50%);
	}

	.scroll-cue i {
		width: 1px;
		height: 1.5rem;
		background: currentColor;
		transform-origin: top;
		animation: pulse 1.8s ease-in-out infinite;
	}

	@keyframes settle {
		from {
			opacity: 0;
			transform: translateY(1.5rem) scale(0.98);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}

	@keyframes turn {
		from {
			transform: rotate(-24deg);
		}
		to {
			transform: rotate(0deg);
		}
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.35;
			transform: scaleY(0.45);
		}
		50% {
			opacity: 1;
			transform: scaleY(1);
		}
	}

	@media (max-width: 900px) {
		.hero {
			min-height: auto;
		}

		.hero-inner {
			grid-template-columns: 1fr;
			min-height: 44rem;
			padding-top: 3.5rem;
			padding-bottom: 1.5rem;
			text-align: center;
		}

		.hero-copy {
			justify-self: center;
		}

		.eyebrow,
		.hero-actions {
			justify-content: center;
		}

		.hero-copy p {
			margin-inline: auto;
		}

		.hero-art {
			width: min(44rem, 112vw);
			height: 25rem;
			justify-self: center;
		}

		.machine-stack {
			inset: -4rem -3rem -1rem;
		}

		.scroll-cue {
			display: none;
		}
	}

	@media (max-width: 560px) {
		.hero-inner {
			min-height: 39rem;
			padding-top: 2.75rem;
			padding-inline: 1.25rem;
		}

		.hero-copy {
			width: 100%;
			min-width: 0;
		}

		h1 {
			font-size: clamp(2.25rem, 10.5vw, 3rem);
			letter-spacing: -0.045em;
			overflow-wrap: anywhere;
		}

		.hero-copy p {
			font-size: 0.95rem;
		}

		.hero-actions {
			flex-wrap: wrap;
		}

		.hero-art {
			width: 100vw;
			height: 20rem;
		}

		.machine-stack {
			inset: -3rem -5.5rem -1rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.machine-stack,
		.machine-stack .knob,
		.scroll-cue i {
			animation: none;
		}
	}
</style>
