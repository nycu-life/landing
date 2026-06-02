<script lang="ts">
	import PageShell from '$lib/components/landing/PageShell.svelte';
	import ProductIcon from '$lib/components/landing/ProductIcon.svelte';
	import ProductDrawer from '$lib/components/landing/ProductDrawer.svelte';
	import { reveal } from '$lib/components/landing/scroll';
	import { products, productStatusLabel, type Product } from '$lib/content/landing';

	let active = $state<Product | null>(null);
</script>

<PageShell target="products" tint="cyan">
	<ul class="product-grid">
		{#each products as product, i (product.id)}
			<li>
				<button
					class="ptile glass glass-strong reveal"
					style="border-radius:22px;"
					use:reveal={{ delay: i * 60 }}
					onclick={() => (active = product)}
				>
					<ProductIcon kind={product.glyph} size={56} />
					<span class="ptile-text">
						<span class="ptile-name">{product.name()}</span>
						<span class="ptile-latin">{product.latin}</span>
					</span>
					<span class="ptile-status">
						<span class="ptile-dot ptile-dot-{product.status}"></span>
						{productStatusLabel[product.status]()}
					</span>
				</button>
			</li>
		{/each}
	</ul>
</PageShell>

<ProductDrawer product={active} onclose={() => (active = null)} />

<style>
	.product-grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: 1fr;
		gap: clamp(0.85rem, 2vw, 1.1rem);
	}
	.ptile {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: clamp(1.1rem, 3vw, 1.5rem);
		color: var(--ink);
		text-align: left;
		cursor: pointer;
		transition:
			transform 0.18s var(--ease-out),
			box-shadow 0.25s ease,
			border-color 0.25s ease;
	}
	.ptile:hover {
		transform: translateY(-3px);
		border-color: color-mix(in srgb, var(--brand) 45%, var(--line));
		box-shadow: var(--glow), var(--shadow);
	}
	.ptile-text {
		display: grid;
		gap: 0.25rem;
		flex: 1;
		min-width: 0;
	}
	.ptile-name {
		font-size: 1.15rem;
		font-weight: 700;
		letter-spacing: -0.015em;
	}
	.ptile-latin {
		font-family: var(--font-display);
		font-size: 0.64rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.ptile-status {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--ink-soft);
		flex-shrink: 0;
	}
	.ptile-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
	}
	.ptile-dot-live {
		background: var(--ok);
		box-shadow: 0 0 8px var(--ok);
	}
	.ptile-dot-soon {
		background: var(--amber);
		box-shadow: 0 0 8px var(--amber);
	}
	.ptile-dot-dev {
		background: var(--muted);
	}

	@media (min-width: 700px) {
		.product-grid {
			grid-template-columns: 1fr 1fr;
		}
		.ptile {
			flex-direction: column;
			align-items: flex-start;
			min-height: 13rem;
		}
		.ptile-status {
			margin-top: auto;
		}
	}
</style>
