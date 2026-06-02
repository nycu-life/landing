<script lang="ts">
	import { onMount } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import FoxMark from '$lib/components/glass/FoxMark.svelte';

	// Decorative rotating product wheel — the home hero centerpiece. Auto-spins
	// and can be dragged. Tiles ride the ring (slightly tilted, like the design).
	type Tile = { kind: 'coz' | 'bus' | 'life' | 'blank'; active?: boolean };
	const tiles: Tile[] = [
		{ kind: 'coz' },
		{ kind: 'blank' },
		{ kind: 'bus' },
		{ kind: 'blank' },
		{ kind: 'life', active: true },
		{ kind: 'blank' },
		{ kind: 'life' },
		{ kind: 'blank' }
	];
	const R = 165;

	let rotation = $state(0);
	let dragging = false;
	let lastAngle = 0;
	let wheelEl: HTMLDivElement;

	function pointAngle(e: PointerEvent): number {
		const r = wheelEl.getBoundingClientRect();
		return (
			(Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) /
			Math.PI
		);
	}
	function onDown(e: PointerEvent) {
		dragging = true;
		lastAngle = pointAngle(e);
		wheelEl.setPointerCapture?.(e.pointerId);
	}
	function onMove(e: PointerEvent) {
		if (!dragging) return;
		const a = pointAngle(e);
		rotation += a - lastAngle;
		lastAngle = a;
	}
	function onUp() {
		dragging = false;
	}

	onMount(() => {
		let raf = 0;
		const tick = () => {
			if (!dragging && !prefersReducedMotion.current) rotation += 0.06;
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	});
</script>

<div
	class="orbit"
	bind:this={wheelEl}
	onpointerdown={onDown}
	onpointermove={onMove}
	onpointerup={onUp}
	onpointerleave={onUp}
	role="presentation"
>
	<div class="orbit-ring" style="transform: rotate({rotation}deg)">
		{#each tiles as tile, i (i)}
			{@const a = (i / tiles.length) * Math.PI * 2 - Math.PI / 2}
			<div
				class="orbit-pos"
				style="transform: translate({Math.cos(a) * R}px, {Math.sin(a) * R}px) translate(-50%, -50%)"
			>
				<div class="orbit-tile" class:active={tile.active} class:blank={tile.kind === 'blank'}>
					{#if tile.kind === 'coz'}
						<span class="orbit-coz">Coz</span>
					{:else if tile.kind === 'bus'}
						<span class="orbit-bus">BUS</span>
					{:else if tile.kind === 'life'}
						<FoxMark size={tile.active ? 52 : 40} />
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.orbit {
		position: relative;
		width: 100%;
		height: 100%;
		touch-action: none;
		cursor: grab;
	}
	.orbit:active {
		cursor: grabbing;
	}
	.orbit-ring {
		position: absolute;
		left: 50%;
		bottom: -150px;
		width: 460px;
		height: 460px;
		margin-left: -230px;
		border-radius: 50%;
		border: 1px dashed var(--line-strong);
	}
	.orbit-pos {
		position: absolute;
		left: 50%;
		top: 50%;
	}
	.orbit-tile {
		width: 72px;
		height: 72px;
		border-radius: 22px;
		background: var(--glass);
		backdrop-filter: var(--blur);
		-webkit-backdrop-filter: var(--blur);
		border: 1px solid var(--line);
		box-shadow:
			var(--shadow),
			inset 0 1px 0 rgba(255, 255, 255, 0.16);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--ink);
	}
	.orbit-tile.active {
		width: 92px;
		height: 92px;
		background: var(--glass-strong);
		box-shadow:
			var(--glow),
			var(--shadow),
			inset 0 1px 0 rgba(255, 255, 255, 0.16);
	}
	.orbit-coz {
		font-family: var(--font-hand);
		font-style: italic;
		font-weight: 700;
		font-size: 1.5rem;
		background: var(--accent-grad);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		color: transparent;
	}
	.orbit-bus {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.82rem;
		letter-spacing: 0.16em;
	}

	@media (min-width: 768px) {
		.orbit-ring {
			width: 560px;
			height: 560px;
			margin-left: -280px;
			bottom: -180px;
		}
	}
</style>
