<script lang="ts">
	import { onMount } from 'svelte';
	import { m } from '$lib/paraglide/messages';
	import { prefersReducedMotion } from './scroll';
	import FoxMark from '$lib/components/glass/FoxMark.svelte';

	// Home hero over the light WebGL palette: dark display headline, white
	// accent line, and the decorative orbital wheel teaser pinned half
	// off-screen at the bottom (ported from the prototype's OrbitTeaser).
	type TileKind = 'coz' | 'bus' | 'life' | 'blank';
	const tiles: TileKind[] = ['coz', 'bus', 'life', 'blank', 'life', 'blank', 'life', 'blank'];

	// Static ring positions (SSR / reduced-motion fallback): the same circle as
	// the dashed orbit path (viewBox 400, centre 200,200, r 196) scaled to the
	// 460px ring; tile i sits at path progress i/n − 0.25 (12 o'clock, clockwise).
	const TILE = 72;
	const positions = tiles.map((_, i) => {
		const a = (i / tiles.length - 0.25) * Math.PI * 2;
		return {
			x: 230 + 225.4 * Math.cos(a) - TILE / 2,
			y: 230 + 225.4 * Math.sin(a) - TILE / 2
		};
	});

	let ringEl: HTMLDivElement;
	let pathEl: SVGPathElement;

	onMount(() => {
		// Decorative motion only — under reduced motion the static ring stands.
		if (prefersReducedMotion()) return;

		let disposed = false;
		let idle: { kill: () => void } | undefined;
		let drag: { kill: () => void } | undefined;

		(async () => {
			const [{ gsap }, { Draggable }, { MotionPathPlugin }, { InertiaPlugin }] = await Promise.all([
				import('gsap'),
				import('gsap/Draggable'),
				import('gsap/MotionPathPlugin'),
				import('gsap/InertiaPlugin')
			]);
			if (disposed || !ringEl || !pathEl) return;
			gsap.registerPlugin(Draggable, MotionPathPlugin, InertiaPlugin);

			// Items placed along the SVG circle path, exactly like the prototype.
			const boxes = gsap.utils.toArray<HTMLElement>(ringEl.querySelectorAll('.orbit-box'));
			gsap.set(boxes, {
				motionPath: {
					path: pathEl,
					align: pathEl,
					alignOrigin: [0.5, 0.5],
					start: -0.25,
					end: (i: number) => i / boxes.length - 0.25,
					autoRotate: false
				}
			});

			// Gentle idle spin until the user grabs the wheel.
			idle = gsap.to(ringEl, { rotation: '+=360', duration: 90, ease: 'none', repeat: -1 });

			drag = Draggable.create(ringEl, {
				type: 'rotation',
				inertia: true,
				snap: (v: number) => gsap.utils.snap(360 / boxes.length, v),
				onPress: () => idle?.kill()
			})[0];
		})();

		return () => {
			disposed = true;
			idle?.kill();
			drag?.kill();
		};
	});
</script>

<section class="home-hero">
	<div class="page hero-copy">
		<h1 class="hero-title">
			<span>{m.app_hero_line1()}</span>
			<span class="hero-accent">{m.app_hero_accent()}</span>
			<span>{m.app_hero_line3()}</span>
		</h1>
		<p class="hero-lede">{m.app_hero_lede()}</p>
	</div>

	<!-- Orbital wheel (decorative) -->
	<div class="orbit-wrap" aria-hidden="true">
		<div class="orbit-ring" bind:this={ringEl}>
			<svg viewBox="0 0 400 400" class="orbit-svg">
				<path
					bind:this={pathEl}
					fill="none"
					stroke="rgba(47,96,218,0.20)"
					stroke-width="1.5"
					stroke-dasharray="2 7"
					d="M396,200 C396,308.24781 308.24781,396 200,396 91.75219,396 4,308.24781 4,200 4,91.75219 91.75219,4 200,4 308.24781,4 396,91.75219 396,200 z"
				/>
			</svg>
			{#each tiles as kind, i (i)}
				<div class="orbit-box" style="left:{positions[i].x}px; top:{positions[i].y}px">
					<div class="orbit-tile" class:blank={kind === 'blank'}>
						{#if kind === 'coz'}
							<span class="orbit-coz grad-text">Coz</span>
						{:else if kind === 'bus'}
							<span class="orbit-bus">BUS</span>
						{:else if kind === 'life'}
							<FoxMark size={43} />
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Footer cue — floating glass hint pill -->
	<div class="hint-row">
		<div class="hint-pill">
			<span>{m.home_drag_hint()}</span>
			<span class="nl-rotate hint-glyph">↻</span>
		</div>
	</div>
</section>

<style>
	.home-hero {
		position: relative;
		height: 100%;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		color: var(--ink-on-light);
	}

	/* ---- headline + lede (dark ink on the light palette) ------------------- */

	.hero-title {
		margin: 1.375rem 0 0;
		display: grid;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: clamp(2.25rem, 10vw, 3rem);
		line-height: 0.92;
		letter-spacing: -0.04em;
		color: var(--ink-on-light);
	}
	.hero-accent {
		color: #ffffff;
		font-style: italic;
		font-weight: 500;
		line-height: 1.2;
		text-shadow:
			0 2px 16px rgba(0, 40, 140, 0.45),
			0 1px 2px rgba(0, 30, 110, 0.55);
	}
	.hero-lede {
		margin: 1.125rem 0 0;
		max-width: 280px;
		font-size: 0.875rem;
		line-height: 1.6;
		font-weight: 400;
		color: var(--ink-on-light-soft);
	}

	/* ---- orbital wheel teaser (half off-screen, drag-rotates) -------------- */

	.orbit-wrap {
		position: absolute;
		left: 50%;
		bottom: -168px;
		transform: translateX(-50%);
		width: 460px;
		height: 460px;
		z-index: 1;
	}
	.orbit-ring {
		position: relative;
		width: 460px;
		height: 460px;
		cursor: grab;
		touch-action: none;
	}
	.orbit-ring:active {
		cursor: grabbing;
	}
	.orbit-svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: visible;
	}
	.orbit-box {
		position: absolute;
	}
	.orbit-tile {
		width: 72px;
		height: 72px;
		border-radius: 22px;
		background: #ffffff;
		border: 1px solid rgba(20, 30, 60, 0.05);
		box-shadow: 0 6px 16px rgba(20, 30, 60, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--ink-on-light);
		transition: all 0.4s ease;
	}
	.orbit-tile.blank {
		background: rgba(255, 255, 255, 0.55);
	}
	.orbit-coz {
		font-family: serif;
		font-style: italic;
		font-weight: 800;
		font-size: 22px;
		letter-spacing: -0.02em;
	}
	.orbit-bus {
		font-weight: 800;
		font-size: 13px;
		letter-spacing: 0.16em;
		color: #2f60da;
	}

	/* ---- floating glass hint pill ------------------------------------------ */

	.hint-row {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 44px;
		display: flex;
		justify-content: center;
		z-index: 2;
		pointer-events: none;
	}
	.hint-pill {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 7px 16px;
		border-radius: 9999px;
		background: rgba(255, 255, 255, 0.45);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.6);
		box-shadow: 0 6px 16px rgba(20, 30, 60, 0.08);
		font-size: 11px;
		letter-spacing: 0.18em;
		font-weight: 500;
		color: var(--ink-on-light-faint);
	}
	.hint-glyph {
		font-size: 12px;
	}

	/* ---- desktop story hero (≥64rem): same composition, cinema scale -------- */

	@media (min-width: 64rem) {
		.hero-title {
			margin-top: clamp(2rem, 9vh, 5rem);
			font-size: clamp(3rem, 6.5vw, 5.5rem);
		}
		.hero-lede {
			max-width: 430px;
			font-size: 1.02rem;
		}
		.orbit-wrap {
			left: 64%;
			bottom: -240px;
			transform: translateX(-50%) scale(1.5);
			transform-origin: center;
		}
		.hint-row {
			bottom: 56px;
		}
	}
</style>
