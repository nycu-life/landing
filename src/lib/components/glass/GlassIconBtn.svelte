<script lang="ts">
	import type { Snippet } from 'svelte';

	// Round glass pill button used for the burger, close, and back affordances.
	let {
		onclick,
		label,
		size = 44,
		light = false,
		class: className = '',
		children,
		...rest
	}: {
		onclick?: (e: MouseEvent) => void;
		label: string;
		size?: number;
		light?: boolean;
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	} = $props();
</script>

<button
	type="button"
	class="glass-icon-btn glass glass-strong {className}"
	class:light
	{onclick}
	aria-label={label}
	style="width:{size}px;height:{size}px;border-radius:{size / 2}px;"
	{...rest}
>
	{@render children?.()}
</button>

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
	.glass-icon-btn.light {
		color: #1a2350;
		background: rgba(255, 255, 255, 0.72);
		border-color: rgba(20, 30, 60, 0.08);
		box-shadow:
			0 6px 16px rgba(20, 30, 60, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.6);
	}
	.glass-icon-btn.light:hover {
		background: rgba(255, 255, 255, 0.92);
	}
</style>
