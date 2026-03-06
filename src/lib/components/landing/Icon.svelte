<script lang="ts">
	import {
		ArrowRight,
		BadgeCheck,
		BookOpen,
		GitBranch,
		Globe,
		LayoutGrid,
		Layers3,
		MapPin,
		Route,
		ShieldCheck,
		Sparkles,
		Users
	} from '@lucide/svelte';
	import type { IconName } from '$lib/content/landing';

	let { name, class: className = 'h-5 w-5' } = $props<{
		name: IconName;
		class?: string;
	}>();
</script>

{#if name === 'spark'}
	<Sparkles class={className} aria-hidden="true" strokeWidth={1.8} />
{:else if name === 'grid'}
	<LayoutGrid class={className} aria-hidden="true" strokeWidth={1.8} />
{:else if name === 'shield'}
	<ShieldCheck class={className} aria-hidden="true" strokeWidth={1.8} />
{:else if name === 'people'}
	<Users class={className} aria-hidden="true" strokeWidth={1.8} />
{:else if name === 'branch'}
	<GitBranch class={className} aria-hidden="true" strokeWidth={1.8} />
{:else if name === 'globe'}
	<Globe class={className} aria-hidden="true" strokeWidth={1.8} />
{:else if name === 'arrow'}
	<ArrowRight class={className} aria-hidden="true" strokeWidth={1.8} />
{:else if name === 'badge'}
	<BadgeCheck class={className} aria-hidden="true" strokeWidth={1.8} />
{:else if name === 'route'}
	<Route class={className} aria-hidden="true" strokeWidth={1.8} />
{:else if name === 'book'}
	<BookOpen class={className} aria-hidden="true" strokeWidth={1.8} />
{:else if name === 'pin'}
	<MapPin class={className} aria-hidden="true" strokeWidth={1.8} />
{:else if name === 'layers'}
	<Layers3 class={className} aria-hidden="true" strokeWidth={1.8} />
{/if}
