<script lang="ts">
	import About from '$lib/components/landing/About.svelte';
	import Footer from '$lib/components/landing/Footer.svelte';
	import Hero from '$lib/components/landing/Hero.svelte';
	import SectionNav from '$lib/components/landing/SectionNav.svelte';
	import Services from '$lib/components/landing/Services.svelte';
	import Team from '$lib/components/landing/Team.svelte';
	import { brand, navItems, pageMeta } from '$lib/content/landing';
	import * as m from '$lib/paraglide/messages';
</script>

<svelte:head>
	<title>{pageMeta.title()}</title>
	<meta name="description" content={pageMeta.description()} />
</svelte:head>

<div class="editorial-root">
	<header class="site-header">
		<a class="site-header-brand" href="#top">
			<span class="site-header-mark">{brand.name()}</span>
			<span class="site-header-tagline">{brand.tagline()}</span>
		</a>
		<SectionNav items={navItems} label={m.nav_aria()} />
	</header>

	<main>
		<Hero />
		<Services />
		<Team />
		<About />
	</main>

	<Footer />
</div>
