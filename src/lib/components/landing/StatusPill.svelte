<script lang="ts">
	// Frosted capsule with a pulsing status dot — shared by the product tiles
	// and the product drawer (identical treatment in the design).
	import { productStatusLabel, type ProductStatus } from '$lib/content/landing';

	let { status }: { status: ProductStatus } = $props();
</script>

<span class="pill pill-{status}">
	<span class="pill-dot nl-pulse"></span>
	<span class="pill-label">{productStatusLabel[status]()}</span>
</span>

<style>
	.pill {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 3px 9px 3px 7px;
		border-radius: 9999px;
		background: rgba(255, 255, 255, 0.04);
		backdrop-filter: blur(6px);
		-webkit-backdrop-filter: blur(6px);
		border: 1px solid var(--pill-border);
		box-shadow:
			0 0 10px var(--pill-glow),
			inset 0 1px 0 rgba(255, 255, 255, 0.08);
	}
	.pill-live {
		--pill-color: rgba(74, 222, 128, 0.9);
		--pill-border: rgba(74, 222, 128, 0.3);
		--pill-glow: rgba(74, 222, 128, 0.25);
	}
	.pill-soon {
		--pill-color: rgba(251, 146, 60, 0.9);
		--pill-border: rgba(251, 146, 60, 0.3);
		--pill-glow: rgba(251, 146, 60, 0.22);
	}
	.pill-dev {
		--pill-color: rgba(156, 163, 175, 0.7);
		--pill-border: rgba(156, 163, 175, 0.25);
		--pill-glow: rgba(156, 163, 175, 0);
	}
	.pill-dot {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: var(--pill-color);
		box-shadow: 0 0 6px var(--pill-color);
		flex-shrink: 0;
	}
	.pill-label {
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.08em;
		color: var(--pill-color);
	}
</style>
