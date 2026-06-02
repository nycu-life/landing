<script lang="ts">
	import type { Snippet } from 'svelte';

	// A frosted-glass surface. Composes the .glass* utilities from layout.css.
	// `radius` is the one thing that varies enough to stay inline.
	let {
		strong = false,
		glow = false,
		solid = false,
		radius = 20,
		tag = 'div',
		class: className = '',
		style = '',
		children,
		...rest
	}: {
		strong?: boolean;
		glow?: boolean;
		solid?: boolean;
		radius?: number;
		tag?: 'div' | 'section' | 'article' | 'li';
		class?: string;
		style?: string;
		children?: Snippet;
		[key: string]: unknown;
	} = $props();
</script>

<svelte:element
	this={tag}
	class="glass {strong ? 'glass-strong' : ''} {solid ? 'glass-solid' : ''} {glow
		? 'glass-glow'
		: ''} {className}"
	style="border-radius:{radius}px;{style}"
	{...rest}
>
	{@render children?.()}
</svelte:element>
