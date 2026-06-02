<script lang="ts">
	// A rounded gradient tile holding a per-product glyph. Only the four real
	// products have artwork; everything here maps to a shipped/known product.
	let { kind, size = 56 }: { kind: 'bus' | 'coz' | 'activity' | 'map'; size?: number } = $props();

	const grad: Record<string, string> = {
		bus: 'linear-gradient(150deg, #2E8FE0, #1E5FB8)',
		coz: 'linear-gradient(150deg, #6D5CFF, #3C2E9E)',
		activity: 'linear-gradient(150deg, #FBBF24, #F97316)',
		map: 'linear-gradient(150deg, #38C6F4, #2E8FE0)'
	};
</script>

<div
	class="picon"
	style="width:{size}px;height:{size}px;border-radius:{size > 70 ? 22 : 15}px;background:{grad[
		kind
	]};"
>
	{#if kind === 'bus'}
		<svg
			width={size * 0.5}
			height={size * 0.5}
			viewBox="0 0 24 24"
			fill="none"
			stroke="#fff"
			stroke-width="1.8"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<path d="M4 17h16M4 7h16M5 5h14a1 1 0 0 1 1 1v13H4V6a1 1 0 0 1 1-1z" />
			<rect x="6" y="8" width="5" height="6" rx="0.5" />
			<rect x="13" y="8" width="5" height="6" rx="0.5" />
			<circle cx="8" cy="20" r="1.5" />
			<circle cx="16" cy="20" r="1.5" />
		</svg>
	{:else if kind === 'coz'}
		<span class="picon-coz" style="font-size:{size * 0.5}px;">Coz</span>
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
	.picon-coz {
		font-family: var(--font-hand);
		font-weight: 700;
		font-style: italic;
		color: #fff;
		line-height: 1;
		letter-spacing: -0.02em;
	}
</style>
