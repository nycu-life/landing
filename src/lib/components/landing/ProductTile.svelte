<script lang="ts">
	import { prefersReducedMotion } from './scroll';
	// Glass product tile, ported from the prototype's Sticker: squeezes for
	// 120ms on tap before opening, lifts + glows on hover, and carries the
	// travelling rim-light when centered (.nl-flow + data-flow-card).
	import type { Product } from '$lib/content/landing';
	import ProductIcon from './ProductIcon.svelte';
	import StatusPill from './StatusPill.svelte';

	let { product, onopen }: { product: Product; onopen: () => void } = $props();

	let pressed = $state(false);
	let pressTimer: ReturnType<typeof setTimeout> | undefined;

	function press() {
		if (prefersReducedMotion()) {
			onopen();
			return;
		}
		pressed = true;
		clearTimeout(pressTimer);
		pressTimer = setTimeout(() => {
			pressed = false;
			onopen();
		}, 120);
	}

	$effect(() => () => clearTimeout(pressTimer));
</script>

<button
	class="tile nl-flow glass"
	class:pressed
	data-flow-card
	onclick={press}
	aria-label={product.name()}
>
	<ProductIcon kind={product.glyph} size={54} />
	<span class="tile-text">
		<span class="tile-name">{product.name()}</span>
		<span class="tile-latin">{product.latin}</span>
	</span>
	<span class="tile-pill">
		<StatusPill status={product.status} />
	</span>
</button>

<style>
	.tile {
		border-radius: 16px;
		padding: 16px 14px 14px;
		min-height: 150px;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 10px;
		text-align: left;
		color: var(--ink);
		cursor: pointer;
		transform: scale(1.02);
		transform-origin: center top;
		transition:
			transform 0.2s cubic-bezier(0.5, 1.4, 0.5, 1),
			background 0.25s ease,
			box-shadow 0.25s ease;
	}
	.tile:hover {
		transform: translateY(-3px) scale(1.02);
		background: var(--glass-strong);
		box-shadow: var(--glow), var(--shadow-float);
	}
	.tile.pressed {
		transform: scale(0.97);
	}
	.tile-text {
		display: block;
	}
	.tile-name {
		display: block;
		font-size: 15px;
		font-weight: 700;
		letter-spacing: -0.01em;
	}
	.tile-latin {
		display: block;
		margin-top: 3px;
		font-size: 10px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.tile-pill {
		display: inline-flex;
		margin-top: auto;
		align-self: flex-start;
	}

	@media (prefers-reduced-motion: reduce) {
		.tile {
			transition: none;
		}
		.tile:hover,
		.tile.pressed {
			transform: scale(1.02);
		}
	}
</style>
