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
		<span class="wish-eyebrow">WISH POOL&nbsp;&nbsp;·&nbsp;&nbsp;PRODUCT 06</span>
		<h1 class="page-title">{m.wish_title()}</h1>
		<p class="page-lede">{m.wish_lede()}</p>
	</header>
	<WishPool />
</div>

<SiteFooter />

<style>
	/* Keep the whole wish experience as one centred reading column on wide screens. */
	.wish-page {
		max-width: var(--shell);
		overflow: hidden;
		background:
			radial-gradient(circle at 4% 7%, rgba(95, 111, 255, 0.09), transparent 16rem),
			radial-gradient(circle at 97% 82%, rgba(255, 190, 180, 0.11), transparent 20rem);
	}
	:global(:root[data-theme='dark']) .wish-page {
		/* Avoid a hard rectangular seam where the centred page surface meets the dark body. */
		background: transparent;
	}
	.page-head {
		max-width: 42rem;
	}
	.wish-eyebrow {
		color: var(--brand);
		font-size: 0.78rem;
		font-weight: 750;
		letter-spacing: 0.11em;
	}
	.page-title {
		max-width: 13ch;
		font-size: clamp(2.5rem, 6vw, 4.5rem);
		line-height: 1.08;
		text-wrap: balance;
	}
	@media (max-width: 620px) {
		.wish-page {
			padding-top: 2rem;
		}
		.page-head {
			gap: 0.7rem;
			margin-bottom: 1.75rem;
		}
		.page-title {
			font-size: clamp(2.2rem, 11vw, 3.15rem);
		}
	}
</style>
