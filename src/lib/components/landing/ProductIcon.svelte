<script lang="ts">
	// Per-product glyph tile, ported from the prototype's StickerIcon: a rounded
	// flat-colour square whose artwork pops against the dark glass.
	let { kind, size = 56 }: { kind: 'bus' | 'coz' | 'activity' | 'map'; size?: number } = $props();
</script>

<div
	class="picon picon-{kind}"
	style="width:{size}px;height:{size}px;border-radius:{size >= 70 ? 22 : 15}px;"
>
	{#if kind === 'coz'}
		<span class="picon-wordmark" style="font-size:{size * 0.5}px;">Coz</span>
	{:else if kind === 'bus'}
		<svg
			width={size * 0.5}
			height={size * 0.5}
			viewBox="0 0 24 24"
			fill="none"
			stroke="#ffffff"
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
		<span class="picon-bus-label">BUS</span>
	{:else if kind === 'activity'}
		<svg
			width={size * 0.55}
			height={size * 0.62}
			viewBox="0 0 40 50"
			fill="none"
			aria-hidden="true"
		>
			<path
				d="M20 2 C30 2 36 10 36 19 C36 30 20 46 20 46 C20 46 4 30 4 19 C4 10 10 2 20 2 Z"
				fill="#FFF"
				stroke="#0A0A12"
				stroke-width="2"
				stroke-linejoin="round"
			/>
			<circle cx="20" cy="19" r="6" fill="#0A0A12" />
		</svg>
	{:else if kind === 'map'}
		<svg
			width={size * 0.58}
			height={size * 0.58}
			viewBox="0 0 50 50"
			fill="none"
			aria-hidden="true"
		>
			<path
				d="M6 12 L18 7 L32 12 L44 7 V38 L32 43 L18 38 L6 43 Z"
				fill="#FFF"
				stroke="#0A0A12"
				stroke-width="2"
				stroke-linejoin="round"
			/>
			<path d="M18 7 V38 M32 12 V43" stroke="#0A0A12" stroke-width="2" stroke-linejoin="round" />
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
			var(--shadow-card),
			inset 0 0 0 1px rgba(255, 255, 255, 0.12);
		box-sizing: border-box;
		flex-shrink: 0;
	}
	.picon-coz {
		background: linear-gradient(150deg, #4d7fff, #2f60da);
	}
	.picon-bus {
		background: linear-gradient(150deg, #2e8fe0, #1e5fb8);
		flex-direction: column;
		gap: 2px;
	}
	.picon-activity {
		background: #ff8c5a;
	}
	.picon-map {
		background: #a5d8ff;
	}
	.picon-wordmark {
		font-family: var(--font-display);
		font-weight: 700;
		font-style: italic;
		color: #fff;
		line-height: 1;
		letter-spacing: -0.02em;
	}
	.picon-bus-label {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 9px;
		color: #fff;
		letter-spacing: 0.18em;
	}
</style>
