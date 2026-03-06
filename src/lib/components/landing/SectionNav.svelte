<script lang="ts">
	import type { NavItem } from '$lib/content/landing';
	import Icon from './Icon.svelte';

	let { items } = $props<{ items: NavItem[] }>();
</script>

<nav
	aria-label="Section navigation"
	class="grid grid-cols-2 gap-3 pb-1 md:flex md:flex-wrap md:overflow-visible"
>
	{#each items as item}
		<a
			href={`#${item.id}`}
			class="landing-chip min-h-12 justify-center text-xs font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] sm:text-sm md:min-h-0 md:shrink-0 md:justify-start"
		>
			<Icon name={item.icon} class="h-4 w-4" />
			<span>{item.label}</span>
		</a>
	{/each}
</nav>
