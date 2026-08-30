<script lang="ts">
	import { base } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import PrototypeStory from '$lib/components/landing/PrototypeStory.svelte';
	import SiteFooter from '$lib/components/landing/SiteFooter.svelte';
</script>

<svelte:head>
	<title>{m.meta_title()}</title>
	<meta name="description" content={m.meta_description()} />
</svelte:head>

<div class="prototype-home">
	<PrototypeStory />

	<section id="wishes" class="wish-invite" aria-labelledby="wish-invite-title">
		<h2 id="wish-invite-title">{m.wish_title()}</h2>
		<p class="wish-invite-lede">{m.wish_lede()}</p>
		<a class="landing-button landing-button-primary" href="{base}/wishpool/"
			>{m.wish_cta()} <span aria-hidden="true">→</span></a
		>
	</section>

	<SiteFooter />
</div>

<style>
	.prototype-home {
		position: relative;
		z-index: 1;
		background: #fff;
	}
	/* Sixth landing page: a short invitation that hands off to /wishpool/. */
	.wish-invite {
		display: grid;
		justify-items: center;
		gap: 1.1rem;
		scroll-margin-top: 5.5rem;
		padding: clamp(4rem, 9vw, 7rem) var(--gutter);
		background: var(--section-alt);
		color: var(--ink);
		text-align: center;
	}
	.wish-invite h2 {
		margin: 0;
		font-size: clamp(1.9rem, 4.5vw, 3rem);
		line-height: 1.15;
		letter-spacing: -0.04em;
	}
	.wish-invite-lede {
		margin: 0;
		max-width: 34rem;
		color: var(--ink-soft);
		line-height: 1.8;
	}
	.wish-invite a {
		margin-top: 0.5rem;
	}
</style>
