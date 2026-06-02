<script lang="ts">
	import type { Snippet } from 'svelte';

	// Round glass pill button used for the burger, close, and back affordances.
	let {
		onclick,
		label,
		size = 44,
		href,
		children,
		...rest
	}: {
		onclick?: (e: MouseEvent) => void;
		label: string;
		size?: number;
		href?: string;
		children?: Snippet;
		[key: string]: unknown;
	} = $props();
</script>

{#if href}
	<a
		class="glass-icon-btn glass glass-strong"
		{href}
		aria-label={label}
		style="width:{size}px;height:{size}px;border-radius:{size / 2}px;"
		{...rest}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		type="button"
		class="glass-icon-btn glass glass-strong"
		{onclick}
		aria-label={label}
		style="width:{size}px;height:{size}px;border-radius:{size / 2}px;"
		{...rest}
	>
		{@render children?.()}
	</button>
{/if}

<style>
	.glass-icon-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		color: var(--ink);
		cursor: pointer;
		transition:
			background 0.25s ease,
			transform 0.25s ease,
			box-shadow 0.25s ease;
	}
	.glass-icon-btn:hover {
		transform: translateY(-1px);
		box-shadow: var(--glow), var(--shadow);
	}
</style>
