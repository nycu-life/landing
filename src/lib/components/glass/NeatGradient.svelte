<script lang="ts">
	import { onMount } from 'svelte';
	import { prefersReducedMotion } from '$lib/components/landing/scroll';
	import type { NeatConfig, NeatGradient as NeatGradientInstance } from '@firecms/neat';

	// Animated WebGL fluid-gradient surface (@firecms/neat). The lib's render
	// loop runs every animation frame regardless of speed, so "paused" here
	// really tears the instance down (the canvas keeps its last presented
	// frame as a static backdrop) and re-creates it when shown again.
	let {
		config,
		paused = false,
		fallback = '#E5EBFA',
		scrim
	}: {
		config: NeatConfig;
		/** Stop rendering (after the crossfade) while keeping the last frame. */
		paused?: boolean;
		/** Flat colour painted behind the canvas until WebGL is ready. */
		fallback?: string;
		/** Optional CSS background layered above the canvas for legibility. */
		scrim?: string;
	} = $props();

	let canvas: HTMLCanvasElement;
	let grad: NeatGradientInstance | null = null;
	let killTimer: ReturnType<typeof setTimeout> | undefined;
	let disposed = false;

	async function init() {
		if (grad || disposed || !canvas) return;
		try {
			const { NeatGradient } = await import('@firecms/neat');
			if (grad || disposed || !canvas) return;
			grad = new NeatGradient({ ref: canvas, ...config });
			grad.speed = config.speed ?? 1;
			// Reduced motion: paint a couple of frames, then freeze for good.
			if (prefersReducedMotion()) {
				clearTimeout(killTimer);
				killTimer = setTimeout(teardown, 600);
			}
		} catch (e) {
			console.warn('NeatGradient failed to load', e);
		}
	}

	function teardown() {
		grad?.destroy();
		grad = null;
	}

	onMount(() => {
		disposed = false;
		// GPU context loss would otherwise leave a permanently dead backdrop.
		const onLost = (e: Event) => {
			e.preventDefault();
			teardown();
		};
		const onRestored = () => {
			if (!paused) void init();
		};
		canvas.addEventListener('webglcontextlost', onLost);
		canvas.addEventListener('webglcontextrestored', onRestored);
		return () => {
			disposed = true;
			clearTimeout(killTimer);
			canvas.removeEventListener('webglcontextlost', onLost);
			canvas.removeEventListener('webglcontextrestored', onRestored);
			teardown();
		};
	});

	$effect(() => {
		if (disposed) return;
		clearTimeout(killTimer);
		if (paused) {
			// Let the 600ms crossfade finish on live frames, then stop the loop.
			killTimer = setTimeout(teardown, 800);
		} else {
			void init();
		}
	});
</script>

<div class="neat" style:background={fallback}>
	<canvas bind:this={canvas}></canvas>
	{#if scrim}
		<div class="neat-scrim" style:background={scrim}></div>
	{/if}
</div>

<style>
	.neat {
		position: absolute;
		inset: 0;
		overflow: hidden;
		z-index: 0;
	}
	.neat canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		display: block;
	}
	/* The lib injects an attribution link next to the canvas — the design
	   prototype strips it; hiding via CSS survives re-injection. */
	.neat :global(a) {
		display: none !important;
	}
	.neat-scrim {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
</style>
