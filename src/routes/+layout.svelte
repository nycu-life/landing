<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { afterNavigate, onNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import TopBar from '$lib/components/landing/TopBar.svelte';
	import { initAnalytics, trackCampaignVisit, trackPageView } from '$lib/analytics';
	import { dismissBootSplash } from '$lib/boot-splash';

	let { children } = $props();

	let darkMode = $state(false);

	onMount(() => {
		try {
			darkMode = localStorage.getItem('nycu-life-theme') === 'dark';
		} catch {
			// Private browsing can disable localStorage; the in-memory toggle still works.
		}
		// The home story dismisses the boot splash once its art is ready; everything else
		// (subpages, or a stalled asset) falls through to these.
		if (!document.querySelector('.scroll-story')) dismissBootSplash();
		const splashTimeout = setTimeout(dismissBootSplash, 4000);
		return () => clearTimeout(splashTimeout);
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

	afterNavigate(() => {
		initAnalytics();
		trackPageView();
		trackCampaignVisit();
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
	<TopBar {darkMode} ontoggletheme={() => (darkMode = !darkMode)} />
	<main class="app-main">
		{@render children()}
	</main>
</div>
