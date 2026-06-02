<script lang="ts">
	// Two-line burger that morphs into a close (×) when `open`.
	let { open = false }: { open?: boolean } = $props();
</script>

<svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
	<line
		class="line line-top"
		class:open
		x1="5"
		y1="10"
		x2="23"
		y2="10"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
	/>
	<line
		class="line line-bottom"
		class:open
		x1="5"
		y1="18"
		x2="23"
		y2="18"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
	/>
</svg>

<style>
	.line {
		transition: transform 0.45s cubic-bezier(0.65, 0.05, 0.36, 1);
	}
	.line-top {
		transform-origin: 14px 10px;
	}
	.line-bottom {
		transform-origin: 14px 18px;
	}
	.line-top.open {
		transform: translateY(4px) rotate(45deg);
	}
	.line-bottom.open {
		transform: translateY(-4px) rotate(-45deg);
	}
</style>
