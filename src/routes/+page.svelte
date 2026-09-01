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
		<div class="wish-shell">
			<div class="wish-copy">
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
			</div>
			<div class="wish-art" aria-hidden="true">
				<img class="wish-machine" src="{base}/story/designer/wishpool/machine.svg" alt="" />
				<img class="wish-sticker" src="{base}/story/designer/wishpool/sticker.svg" alt="" />
				<img class="wish-hand" src="{base}/story/designer/wishpool/hand-ball.svg" alt="" />
			</div>
		</div>
	</section>

	<SiteFooter />
</div>

<style>
	.prototype-home {
		position: relative;
		z-index: 1;
		background: #fff;
	}
	/* Sixth landing page: the designer's full-viewport Wish Pool entrance. The three SVGs
	   share the supplied composition, while the hand keeps its own editable canvas. */
	.wish-invite {
		position: relative;
		scroll-margin-top: 5.5rem;
		overflow: hidden;
		background:
			radial-gradient(circle at 7% 18%, rgba(76, 104, 255, 0.11), transparent 27rem),
			radial-gradient(circle at 91% 88%, rgba(255, 198, 190, 0.14), transparent 31rem), #fff;
		color: var(--ink);
	}
	.wish-shell {
		position: relative;
		display: grid;
		align-items: center;
		width: min(72rem, calc(100% - 2 * var(--gutter)));
		min-height: max(calc(100dvh - 4.75rem), 42rem);
		margin: 0 auto;
	}
	.wish-copy {
		position: relative;
		z-index: 4;
		display: grid;
		justify-items: start;
		gap: 1.1rem;
		width: min(32rem, 43%);
	}
	.wish-invite h2 {
		margin: 0.75rem 0 0;
		font-size: clamp(2rem, 4vw, 3.8rem);
		font-weight: 650;
		line-height: 1.13;
		letter-spacing: -0.04em;
	}
	.wish-invite-lede {
		margin: 0;
		max-width: 31rem;
		color: var(--ink-soft);
		font-size: 1rem;
		line-height: 1.75;
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
	.wish-art,
	.wish-art > img {
		position: absolute;
		pointer-events: none;
	}
	.wish-art > img {
		max-width: none;
	}
	.wish-art {
		z-index: 1;
		left: 50%;
		top: 50%;
		width: min(72rem, 100%);
		aspect-ratio: 1366 / 768;
		transform: translate(-50%, -50%);
	}
	.wish-machine,
	.wish-sticker {
		z-index: 1;
		inset: 0;
		width: 100%;
		height: auto;
	}
	.wish-sticker {
		z-index: 3;
	}
	.wish-hand {
		z-index: 2;
		top: -22%;
		right: -2%;
		width: 48%;
		height: auto;
		transform-origin: 90% 14%;
		animation: wish-hand-bob 3.2s ease-in-out infinite;
	}
	@keyframes wish-hand-bob {
		0%,
		100% {
			transform: translate(0, 0) rotate(0);
		}
		42%,
		58% {
			transform: translate(-1.8%, 3.8%) rotate(-1.4deg);
		}
		72% {
			transform: translate(-0.4%, 1%) rotate(0.4deg);
		}
	}
	:global(:root[data-theme='dark']) .wish-invite {
		background:
			radial-gradient(circle at 7% 18%, rgba(76, 104, 255, 0.26), transparent 27rem),
			radial-gradient(circle at 91% 88%, rgba(211, 111, 123, 0.16), transparent 31rem), #13213a;
		color: #edf4ff;
	}
	:global(:root[data-theme='dark']) .wish-invite-lede {
		color: #c8d4e5;
	}
	@media (max-width: 900px) {
		.wish-shell {
			align-items: start;
			min-height: max(calc(100dvh - 4.75rem), 44rem);
			padding-top: clamp(3rem, 8svh, 5rem);
		}
		.wish-copy {
			width: min(31rem, 72vw);
		}
		.wish-cta {
			margin-top: 0.25rem;
			width: 8.25rem;
			font-size: 0.88rem;
		}
		.wish-art {
			left: 50%;
			top: auto;
			bottom: -4%;
			width: min(54rem, 115vw);
			transform: translateX(-55%);
		}
		.wish-hand {
			top: -18%;
			right: -9%;
			width: 50%;
		}
	}
	@media (max-width: 520px) {
		.wish-shell {
			min-height: max(calc(100dvh - 12rem), 36rem);
			padding-top: clamp(2.5rem, 7svh, 4rem);
		}
		.wish-copy {
			justify-items: center;
			width: 100%;
			text-align: center;
		}
		.wish-invite h2 {
			font-size: clamp(1.9rem, 7vw, 2.7rem);
		}
		.wish-invite-lede {
			max-width: 21rem;
			font-size: 0.9rem;
		}
		.wish-art {
			bottom: 2%;
			width: min(40rem, 142vw);
			transform: translateX(-65%);
		}
		.wish-hand {
			top: -19%;
			right: -11%;
			width: 50%;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.wish-cta,
		.wish-hand {
			transition: none;
			animation: none;
		}
	}
</style>
