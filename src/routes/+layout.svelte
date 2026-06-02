<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { afterNavigate, onNavigate } from '$app/navigation';
	import TopBar from '$lib/components/landing/TopBar.svelte';
	import MenuOverlay from '$lib/components/landing/MenuOverlay.svelte';

	let { children } = $props();

	let menuOpen = $state(false);

	// Close the menu after any navigation (links inside it trigger nav).
	afterNavigate(() => {
		menuOpen = false;
	});

	// Cross-fade between routes via the View Transitions API. Skipped when the
	// browser lacks support or the user prefers reduced motion.
	onNavigate((navigation) => {
		if (typeof document === 'undefined' || !document.startViewTransition) return;
		if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
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
