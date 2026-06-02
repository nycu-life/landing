<script lang="ts">
	import { base } from '$app/paths';
	import { appHero, menuItems, pageMeta } from '$lib/content/landing';
	import Aurora from '$lib/components/glass/Aurora.svelte';
	import Eyebrow from '$lib/components/glass/Eyebrow.svelte';
	import Icon from '$lib/components/landing/Icon.svelte';
	import { reveal } from '$lib/components/landing/scroll';
</script>

<svelte:head>
	<title>{pageMeta.title()}</title>
	<meta name="description" content={pageMeta.description()} />
</svelte:head>

<Aurora tint="violet" />

<div class="page home">
	<section class="home-hero">
		<Eyebrow left={appHero.kickerLeft()} right={appHero.kickerRight()} />
		<h1 class="home-title">
			<span class="home-title-line">{appHero.line1()}</span>
			<span class="home-title-accent grad-text">{appHero.accent()}</span>
			<span class="home-title-line">{appHero.line3()}</span>
		</h1>
		<p class="home-lede">{appHero.lede()}</p>
	</section>

	<nav class="home-grid" aria-label={appHero.kickerLeft()}>
		{#each menuItems as item, i (item.target)}
			<a
				class="home-card glass glass-strong reveal"
				style="border-radius:24px;"
				href="{base}{item.path}"
				use:reveal={{ delay: i * 70 }}
			>
				<span class="home-card-num">{item.num}</span>
				<span class="home-card-body">
					<span class="home-card-label">{item.label()}</span>
					<span class="home-card-latin">{item.latin()}</span>
					<span class="home-card-desc">{item.desc()}</span>
				</span>
				<span class="home-card-arrow"><Icon name="arrow" class="h-5 w-5" /></span>
			</a>
		{/each}
	</nav>
</div>

<style>
	.home {
		display: flex;
		flex-direction: column;
		gap: clamp(2.5rem, 6vw, 4.5rem);
	}

	.home-hero {
		display: grid;
		gap: 1.1rem;
		max-width: 56rem;
		padding-top: clamp(1rem, 5vw, 3rem);
	}
	.home-title {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: clamp(2.8rem, 11vw, 6rem);
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
		margin: 0.4rem 0 0;
		max-width: 32rem;
		font-size: clamp(1.02rem, 1.7vw, 1.2rem);
		line-height: 1.7;
		color: var(--ink-soft);
	}

	.home-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: clamp(0.85rem, 2vw, 1.1rem);
	}

	.home-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: clamp(1.25rem, 3vw, 1.6rem);
		color: var(--ink);
		transition:
			transform 0.18s var(--ease-out),
			box-shadow 0.25s ease,
			border-color 0.25s ease;
	}
	.home-card:hover {
		transform: translateY(-3px);
		border-color: color-mix(in srgb, var(--brand) 45%, var(--line));
		box-shadow: var(--glow), var(--shadow);
	}
	.home-card-num {
		font-family: var(--font-display);
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		color: var(--brand-ink);
		align-self: flex-start;
	}
	.home-card-body {
		display: grid;
		gap: 0.3rem;
		flex: 1;
		min-width: 0;
	}
	.home-card-label {
		font-size: 1.25rem;
		font-weight: 700;
		letter-spacing: -0.02em;
	}
	.home-card-latin {
		font-family: var(--font-display);
		font-size: 0.66rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.home-card-desc {
		margin-top: 0.15rem;
		font-size: 0.92rem;
		line-height: 1.55;
		color: var(--ink-soft);
	}
	.home-card-arrow {
		color: var(--muted);
		flex-shrink: 0;
		align-self: center;
		transition: transform 0.2s var(--ease-out);
	}
	.home-card:hover .home-card-arrow {
		transform: translateX(3px);
		color: var(--brand-ink);
	}

	@media (min-width: 640px) {
		.home-grid {
			grid-template-columns: 1fr 1fr;
		}
	}
	@media (min-width: 1024px) {
		.home-grid {
			grid-template-columns: repeat(4, 1fr);
		}
		.home-card {
			flex-direction: column;
			align-items: flex-start;
			min-height: 15rem;
		}
		.home-card-arrow {
			align-self: flex-end;
			margin-top: auto;
		}
	}
</style>
