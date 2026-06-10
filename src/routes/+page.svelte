<script lang="ts">
	import { onMount } from 'svelte';
	import { pageMeta } from '$lib/content/landing';
	import { vividOverride } from '$lib/stores/backdrop';
	import HomeHero from '$lib/components/landing/HomeHero.svelte';
	import StoryChapters from '$lib/components/landing/StoryChapters.svelte';

	// Mobile: the hero IS the page (app-style; destinations live behind the
	// burger). Desktop (≥64rem): the hero opens a storytelling scroll — the
	// chapters render below and the persistent WebGL backdrop crossfades to
	// the vivid palette once the hero scrolls away.
	let heroEl: HTMLElement;

	onMount(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				vividOverride.set(entry.intersectionRatio < 0.35);
			},
			{ threshold: [0, 0.35, 0.7, 1] }
		);
		observer.observe(heroEl);
		return () => {
			observer.disconnect();
			vividOverride.set(false);
		};
	});
</script>

<svelte:head>
	<title>{pageMeta.title()}</title>
	<meta name="description" content={pageMeta.description()} />
</svelte:head>

<div class="home-hero-slot" bind:this={heroEl}>
	<HomeHero />
</div>
<StoryChapters />

<style>
	.home-hero-slot {
		height: 100%;
	}
</style>
