<script lang="ts">
	import { base } from '$app/paths';

	// A rounded gradient tile holding a per-product glyph. Only the four real
	// products have artwork; everything here maps to a shipped/known product.
	let {
		kind,
		size = 56,
		variant = 'solid'
	}: {
		kind: 'bus' | 'coz' | 'activity' | 'map';
		size?: number;
		variant?: 'solid' | 'soft';
	} = $props();

	const grad: Record<string, string> = {
		bus: 'linear-gradient(150deg, #2E8FE0, #1E5FB8)',
		coz: 'linear-gradient(150deg, #6D5CFF, #3C2E9E)',
		activity: 'linear-gradient(150deg, #FBBF24, #F97316)',
		map: 'linear-gradient(150deg, #38C6F4, #2E8FE0)'
	};
	const softGrad: Record<string, string> = {
		bus: 'linear-gradient(150deg, #dfe9ff, #edf3ff)',
		coz: 'linear-gradient(150deg, #e5f2d7, #f2f8e8)',
		activity: 'linear-gradient(150deg, #faedc7, #fff6df)',
		map: 'linear-gradient(150deg, #e1e9fc, #f0f4ff)'
	};
</script>

<div
	class="picon"
	class:soft={variant === 'soft'}
	style="width:{size}px;height:{size}px;border-radius:{size > 70
		? 22
		: 15}px;background:{variant === 'soft' ? softGrad[kind] : grad[kind]};"
>
	{#if kind === 'bus'}
		<img
			class="product-mark"
			class:soft-mark={variant === 'soft'}
			src="{base}/brand/logo-bus.svg"
			alt=""
		/>
	{:else if kind === 'coz'}
		<span class="picon-coz" class:soft-text={variant === 'soft'} style="font-size:{size * 0.5}px;"
			>Coz</span
		>
	{:else if kind === 'activity'}
		<svg
			width={size * 0.52}
			height={size * 0.52}
			viewBox="0 0 24 24"
			fill="none"
			stroke="#fff"
			stroke-width="1.8"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<path
				d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4z"
			/>
			<path d="M9 6v12" stroke-dasharray="1.5 2.5" />
		</svg>
	{:else if kind === 'map'}
		<svg
			width={size * 0.55}
			height={size * 0.55}
			viewBox="0 0 24 24"
			fill="none"
			stroke="#fff"
			stroke-width="1.8"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<path d="M20 10c0 6-8 11-8 11s-8-5-8-11a8 8 0 0 1 16 0z" />
			<circle cx="12" cy="10" r="3" />
		</svg>
	{/if}
</div>

<style>
	.picon {
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		box-shadow:
			0 8px 20px rgba(2, 5, 20, 0.45),
			inset 0 0 0 1px rgba(255, 255, 255, 0.12);
		flex-shrink: 0;
	}
	.product-mark {
		width: 62%;
		height: 62%;
		object-fit: contain;
		filter: brightness(0) invert(1);
	}
	.soft-mark {
		filter: none;
	}
	.picon-coz {
		font-family: var(--font-hand);
		font-weight: 700;
		font-style: italic;
		color: #fff;
		line-height: 1;
		letter-spacing: -0.02em;
	}
	.soft-text {
		color: #4f39bb;
	}
</style>
