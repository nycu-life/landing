<script lang="ts">
	import { useSiteMessages } from '$lib/site/view';
	const m = useSiteMessages();
	import WishPool from '$lib/components/landing/WishPool.svelte';
	import SiteFooter from '$lib/components/landing/SiteFooter.svelte';
</script>

<svelte:head>
	<title>{m.footer_wishlist()}｜NYCU LIFE</title>
	<meta name="description" content={m.wish_lede()} />
	<meta property="og:title" content={`${m.footer_wishlist()}｜NYCU LIFE`} />
	<meta property="og:description" content={m.wish_lede()} />
	<meta name="twitter:title" content={`${m.footer_wishlist()}｜NYCU LIFE`} />
	<meta name="twitter:description" content={m.wish_lede()} />
</svelte:head>

<div id="wishes" class="page wish-page">
	<header class="page-head">
		<span class="wish-eyebrow">{m.eyebrow_wishpool()}</span>
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
	/* Phones: a compact one-line headline so the board starts sooner. */
	@media (max-width: 620px) {
		.wish-page {
			padding-top: 1.25rem;
		}
		.page-head {
			gap: 0.45rem;
			margin-bottom: 1.25rem;
		}
		.page-title {
			max-width: none;
			font-size: clamp(1.6rem, 7.4vw, 2.1rem);
			line-height: 1.2;
		}
		.page-lede {
			font-size: 0.95rem;
		}
	}
</style>
