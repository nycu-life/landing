<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { tick } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { browser } from '$app/environment';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import { pageIn, pageOut } from '$lib/transitions';
	import { vividOverride } from '$lib/stores/backdrop';
	import PageBackdrop from '$lib/components/glass/PageBackdrop.svelte';
	import TopBar from '$lib/components/landing/TopBar.svelte';
	import MenuOverlay from '$lib/components/landing/MenuOverlay.svelte';

	let { children } = $props();

	let menuOpen = $state(false);

	// Home shows the light NEAT palette + blue logo; subpages flip to the vivid
	// content palette with a back arrow and white logo.
	const isHome = $derived(
		page.url.pathname === `${base}/` || page.url.pathname === base || page.url.pathname === '/'
	);

	// Scrolling lives in the per-route .page-layer (destroyed by {#key}), so
	// the browser's own scroll restoration never sees it — save each layer's
	// offset before navigating away and restore it on back/forward. Layers are
	// looked up by data-path because two coexist mid-transition.
	const scrollMemory = new SvelteMap<string, number>();
	const layerFor = (path: string) =>
		document.querySelector<HTMLElement>(`.page-layer[data-path="${CSS.escape(path)}"]`);

	beforeNavigate((nav) => {
		const from = nav.from?.url.pathname;
		if (!browser || !from) return;
		scrollMemory.set(from, layerFor(from)?.scrollTop ?? 0);
	});

	afterNavigate(async (nav) => {
		// Close the menu after any navigation (links inside it trigger nav).
		menuOpen = false;
		if (nav.type !== 'popstate') return;
		const path = page.url.pathname;
		const top = scrollMemory.get(path);
		if (!top) return;
		await tick();
		layerFor(path)?.scrollTo({ top, behavior: 'instant' });
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="app-viewport">
	<!-- Persistent WebGL backdrop — never remounts across navigation. The
	     desktop story flips it to the vivid palette once the hero scrolls by. -->
	<PageBackdrop isHome={isHome && !$vividOverride} />

	<!-- Content group: recedes into glass depth while the menu is open. -->
	<div class="app-recede" class:receded={menuOpen} inert={menuOpen}>
		<TopBar home={isHome} light={isHome && !$vividOverride} onmenu={() => (menuOpen = true)} />
		<div class="page-stage">
			{#key page.url.pathname}
				<div class="page-layer" data-path={page.url.pathname} in:pageIn|global out:pageOut|global>
					{@render children()}
				</div>
			{/key}
		</div>
	</div>

	<MenuOverlay open={menuOpen} onclose={() => (menuOpen = false)} />
</div>
