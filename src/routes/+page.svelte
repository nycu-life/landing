<script lang="ts">
	import CourseZone from '$lib/components/landing/CourseZone.svelte';
	import DevLog from '$lib/components/landing/DevLog.svelte';
	import Footer from '$lib/components/landing/Footer.svelte';
	import Hero from '$lib/components/landing/Hero.svelte';
	import Products from '$lib/components/landing/Products.svelte';
	import SectionNav from '$lib/components/landing/SectionNav.svelte';
	import Team from '$lib/components/landing/Team.svelte';
	import Why from '$lib/components/landing/Why.svelte';
	import { brand, navItems, pageMeta } from '$lib/content/landing';
	import { m } from '$lib/paraglide/messages';
</script>

<svelte:head>
	<title>{pageMeta.title()}</title>
	<meta name="description" content={pageMeta.description()} />
</svelte:head>

<div class="landing-root">
	<header class="site-header">
		<a class="site-header-brand" href="#top">
			<span class="site-header-mark">{brand.name()}</span>
			<span class="site-header-tagline">{brand.tagline()}</span>
		</a>
		<SectionNav items={navItems} label={m.nav_aria()} />
	</header>

	<main>
		<Hero />
		<Why />
		<Products />
		<CourseZone />
		<DevLog />
		<Team />
	</main>

	<Footer />
</div>
