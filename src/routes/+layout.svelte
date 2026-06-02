<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { afterNavigate } from '$app/navigation';
	import TopBar from '$lib/components/landing/TopBar.svelte';
	import MenuOverlay from '$lib/components/landing/MenuOverlay.svelte';

	let { children } = $props();

	let menuOpen = $state(false);

	// Close the menu after any navigation (links inside it trigger nav).
	afterNavigate(() => {
		menuOpen = false;
	});

	// Lock background scroll while the full-screen menu is open.
	$effect(() => {
		if (typeof document === 'undefined') return;
		document.body.classList.toggle('menu-locked', menuOpen);
		return () => document.body.classList.remove('menu-locked');
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="app-shell">
	<TopBar {menuOpen} ontoggle={() => (menuOpen = !menuOpen)} />
	<main class="app-main">
		{@render children()}
	</main>
	<MenuOverlay open={menuOpen} onnavigate={() => (menuOpen = false)} />
</div>
