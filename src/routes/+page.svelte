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
		<!-- Designer's 去許願 blob button: stacked faces, live label for i18n. The hover
		     face carries a sparkle beyond the blob, so it renders oversized, anchored to the
		     blob's shared bottom-left corner. -->
		<a class="wish-cta" href="{base}/wishpool/">
			<img class="wish-face wish-face-default" src="{base}/ui/wish-default.svg" alt="" />
			<img class="wish-face wish-face-hover" src="{base}/ui/wish-hover.svg" alt="" />
			<span class="wish-cta-label">{m.wish_cta()} <span aria-hidden="true">→</span></span>
		</a>
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
	.wish-cta {
		position: relative;
		display: inline-grid;
		place-items: center;
		margin-top: 0.5rem;
		width: 12rem;
		aspect-ratio: 360.24 / 136.87;
		color: #fff;
		font-size: 1.05rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		transition: transform 0.2s ease;
	}
	.wish-cta:hover {
		transform: translateY(-2px);
		color: #172235;
	}
	.wish-face {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: contain;
		opacity: 0;
		pointer-events: none;
	}
	.wish-face-default {
		opacity: 1;
	}
	/* Hover blob + sparkle bounds vs the default blob: 105.6% × 115.4%, bottom-left aligned. */
	.wish-face-hover {
		inset: auto auto 0 0;
		width: 105.6%;
		height: 115.4%;
	}
	.wish-cta:hover .wish-face-default {
		opacity: 0;
	}
	.wish-cta:hover .wish-face-hover {
		opacity: 1;
	}
	.wish-cta-label {
		position: relative;
		transform: translateY(-4%);
	}
</style>
