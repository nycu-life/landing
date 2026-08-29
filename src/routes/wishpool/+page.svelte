<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import WishPool from '$lib/components/landing/WishPool.svelte';
	import SiteFooter from '$lib/components/landing/SiteFooter.svelte';
</script>

<svelte:head>
	<title>{m.footer_wishlist()}｜NYCU LIFE</title>
	<meta name="description" content={m.wish_lede()} />
</svelte:head>

<div id="wishes" class="page wish-page">
	<header class="page-head">
		<h1 class="page-title">{m.footer_wishlist()}</h1>
		<p class="page-lede">{m.wish_lede()}</p>
	</header>
	<WishPool />
</div>

<SiteFooter />

<style>
	/* Keep the whole wish experience as one centred reading column on wide screens. */
	.wish-page {
		max-width: 64rem;
	}
</style>
