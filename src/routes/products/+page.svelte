<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { products, type Product } from '$lib/content/landing';
	import ProductTile from '$lib/components/landing/ProductTile.svelte';
	import ProductDrawer from '$lib/components/landing/ProductDrawer.svelte';
	import { centerFocus } from '$lib/components/landing/centerFocus';

	let active = $state<Product | null>(null);
</script>

<svelte:head>
	<title>{m.menu_products()}｜NYCU LIFE</title>
	<meta name="description" content={m.menu_products_desc()} />
</svelte:head>

<div class="page">
	<header class="page-head">
		<h1 class="page-title">{m.page_products_lead()}<span>{m.page_products_accent()}</span></h1>
		<p class="page-lede">{m.products_page_lede()}</p>
	</header>

	<div class="product-grid" use:centerFocus>
		{#each products as product (product.id)}
			<ProductTile {product} onopen={() => (active = product)} />
		{/each}
	</div>
</div>

<ProductDrawer product={active} onclose={() => (active = null)} />

<style>
	/* The accent half stays white in this page's design (no gradient). */
	.page-title span {
		color: var(--ink);
		font-weight: 600;
	}
	.product-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
		padding-top: 4px;
	}
	/* Phone design is a strict 2-up; let the tiles wrap naturally when wider. */
	@media (min-width: 640px) {
		.product-grid {
			grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
		}
	}
</style>
