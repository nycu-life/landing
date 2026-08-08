<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { afterNavigate, onNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import TopBar from '$lib/components/landing/TopBar.svelte';
	import MenuOverlay from '$lib/components/landing/MenuOverlay.svelte';

	let { children } = $props();

	let menuOpen = $state(false);
	let darkMode = $state(false);

	onMount(() => {
		try {
			darkMode = localStorage.getItem('nycu-life-theme') === 'dark';
		} catch {
			// Private browsing can disable localStorage; the in-memory toggle still works.
		}
	});

	$effect(() => {
		if (typeof document === 'undefined') return;
		document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
		document.documentElement.style.colorScheme = darkMode ? 'dark' : 'light';
		try {
			localStorage.setItem('nycu-life-theme', darkMode ? 'dark' : 'light');
		} catch {
			// Keep theme changes usable when persistence is unavailable.
		}
	});

	// Home shows the brand on the left; subpages show a back arrow + centred
	// wordmark (matching the prototype).
	const isHome = $derived(
		page.url.pathname === `${base}/` || page.url.pathname === base || page.url.pathname === '/'
	);

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

<!--
THESIS: NYCU LIFE should feel like a small, useful campus instrument, not a generic marketing page.
OWN-WORLD: guide-blue, pale hero canvas, white product cards, editorial section rhythm, and a restrained orbit.
STORY: students see the campus problem, browse the products, meet the team, learn together, and join the work.
FIRST VIEWPORT: wordmark, normal navigation, locale/theme controls, oversized three-line statement, and orbit illustration.
FORM: direct reproduction of the rendered supplied HTML prototype; no alternate app shell is the primary home experience.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->
<div class="app-shell">
	<TopBar
		{menuOpen}
		{darkMode}
		home={isHome}
		ontoggle={() => (menuOpen = !menuOpen)}
		ontoggletheme={() => (darkMode = !darkMode)}
	/>
	<main class="app-main">
		{@render children()}
	</main>
	<MenuOverlay open={menuOpen} onnavigate={() => (menuOpen = false)} />
</div>
