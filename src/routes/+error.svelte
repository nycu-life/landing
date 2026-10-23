<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages';
	import SiteFooter from '$lib/components/landing/SiteFooter.svelte';
</script>

<!-- nginx serves this shell (`404.html`) for unknown and withdrawn URLs with a real
     404/410 status, so it must never be indexed or claim a canonical URL. -->
<svelte:head>
	<title>{m.not_found_title()}｜NYCU LIFE</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="page">
	<header class="page-head">
		<span class="not-found-code">{page.status}</span>
		<h1 class="page-title">{m.not_found_title()}</h1>
		<p class="page-lede">{m.not_found_lede()}</p>
		<p class="not-found-actions">
			<a href="{base}/">{m.menu_home()}</a>
			<a href="{base}/#products">{m.nav_products()}</a>
			<a href="{base}/wishpool/">{m.footer_wishlist()}</a>
		</p>
	</header>
</div>

<SiteFooter />

<style>
	.not-found-code {
		color: var(--brand);
		font-size: 0.78rem;
		font-weight: 750;
		letter-spacing: 0.11em;
	}
	.not-found-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem 1.4rem;
		margin: 0.4rem 0 0;
		font-weight: 650;
	}
	.not-found-actions a {
		color: var(--brand-ink);
	}
</style>
