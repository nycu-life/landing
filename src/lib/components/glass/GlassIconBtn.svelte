<script lang="ts">
	import type { Snippet } from 'svelte';

	// Round glass pill button used for the burger, close, and back affordances.
	let {
		onclick,
		label,
		size = 44,
		children,
		...rest
	}: {
		onclick?: (e: MouseEvent) => void;
		label: string;
		size?: number;
		children?: Snippet;
		[key: string]: unknown;
	} = $props();
</script>

<button
	type="button"
	class="glass-icon-btn liquid-glass-btn-circle"
	{onclick}
	aria-label={label}
	style="width:{size}px;height:{size}px;"
	{...rest}
>
	{@render children?.()}
</button>

<style>
	.glass-icon-btn {
		color: inherit;
	}
</style>
