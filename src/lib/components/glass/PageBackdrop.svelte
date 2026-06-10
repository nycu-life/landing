<script lang="ts">
	import NeatGradient from './NeatGradient.svelte';
	import { NEAT_HOME, NEAT_PAGES } from './neatPresets';

	// Persistent WebGL backdrop — two always-mounted gradient canvases (home
	// light palette + content vivid palette) that crossfade on navigation.
	// Lives behind the page layers and outside the menu-recede group, so
	// switching pages never reinitialises WebGL. Only the visible canvas
	// animates; the hidden one pauses but stays mounted.
	let { isHome = true }: { isHome?: boolean } = $props();
</script>

<div class="backdrop" aria-hidden="true">
	<div class="layer" class:visible={isHome}>
		<NeatGradient
			config={NEAT_HOME}
			paused={!isHome}
			fallback="#E5EBFA"
			scrim="linear-gradient(180deg, rgba(237,240,245,0.66) 0%, rgba(237,240,245,0.40) 42%, rgba(237,240,245,0.12) 68%, rgba(237,240,245,0.42) 100%)"
		/>
	</div>
	<div class="layer" class:visible={!isHome}>
		<NeatGradient
			config={NEAT_PAGES}
			paused={isHome}
			fallback="#2455A8"
			scrim="linear-gradient(180deg, rgba(12,28,72,0.34) 0%, rgba(12,28,72,0.20) 45%, rgba(12,28,72,0.42) 100%)"
		/>
		<!-- Wide viewports expose more of the palette's bright zones — deepen
		     the wash so glass text keeps contrast on desktop. -->
		<div class="desk-dim"></div>
	</div>
</div>

<style>
	.backdrop {
		position: absolute;
		inset: 0;
		z-index: 0;
	}
	.layer {
		position: absolute;
		inset: 0;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.6s var(--ease-out);
	}
	.layer.visible {
		opacity: 1;
	}
	.desk-dim {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
	@media (min-width: 64rem) {
		.desk-dim {
			background: rgba(10, 18, 48, 0.34);
		}
	}
</style>
