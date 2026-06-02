<script lang="ts">
	import { appHero, pageMeta } from '$lib/content/landing';
	import Aurora from '$lib/components/glass/Aurora.svelte';
	import Eyebrow from '$lib/components/glass/Eyebrow.svelte';
	import OrbitWheel from '$lib/components/landing/OrbitWheel.svelte';
</script>

<svelte:head>
	<title>{pageMeta.title()}</title>
	<meta name="description" content={pageMeta.description()} />
</svelte:head>

<Aurora tint="violet" />

<div class="page home">
	<section class="home-hero">
		<Eyebrow left={appHero.kickerLeft()} right="{appHero.kickerRight()} ——" />
		<h1 class="home-title">
			<span class="home-title-line">{appHero.line1()}</span>
			<span class="home-title-accent grad-text">{appHero.accent()}</span>
			<span class="home-title-line">{appHero.line3()}</span>
		</h1>
		<p class="home-lede">{appHero.lede()}</p>
	</section>

	<div class="home-wheel">
		<OrbitWheel />
	</div>

	<div class="home-cues">
		<span>DRAG THE WHEEL ↻</span>
		<span>4 / 8</span>
	</div>
</div>

<style>
	.home {
		display: flex;
		flex-direction: column;
		min-height: calc(100svh - 5rem);
		padding-bottom: 1.5rem;
	}

	.home-hero {
		display: grid;
		gap: 1.1rem;
		max-width: 40rem;
		padding-top: clamp(0.5rem, 3vw, 1.5rem);
	}
	.home-title {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: clamp(2.7rem, 12vw, 5.5rem);
		line-height: 0.92;
		letter-spacing: -0.045em;
		color: var(--ink);
		display: grid;
	}
	.home-title-accent {
		font-style: italic;
		font-weight: 500;
	}
	.home-lede {
		margin: 0.3rem 0 0;
		max-width: 30rem;
		font-size: clamp(1rem, 1.6vw, 1.18rem);
		line-height: 1.7;
		color: var(--ink-soft);
	}

	.home-wheel {
		position: relative;
		flex: 1;
		min-height: 300px;
		overflow: hidden;
	}

	.home-cues {
		display: flex;
		justify-content: space-between;
		font-family: var(--font-display);
		font-size: 0.66rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--muted);
		font-weight: 600;
	}

	@media (min-width: 768px) {
		.home-hero {
			max-width: 48rem;
		}
	}
</style>
