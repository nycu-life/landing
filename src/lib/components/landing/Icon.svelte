<script lang="ts">
	import {
		ArrowRight,
		BookOpen,
		Building2,
		Check,
		Code,
		Github,
		Globe,
		Instagram,
		Link2,
		Linkedin,
		Mail,
		MapPin,
		Palette,
		Route,
		Scale,
		Sparkles,
		Users,
		Youtube
	} from '@lucide/svelte';
	import type { IconName } from '$lib/content/landing';

	let { name, class: className = 'h-5 w-5' } = $props<{
		name: IconName;
		class?: string;
	}>();
</script>

{#if name === 'spark'}
	<Sparkles class={className} aria-hidden="true" strokeWidth={1.8} />
{:else if name === 'arrow'}
	<ArrowRight class={className} aria-hidden="true" strokeWidth={1.8} />
{:else if name === 'check'}
	<Check class={className} aria-hidden="true" strokeWidth={2.2} />
{:else if name === 'route'}
	<Route class={className} aria-hidden="true" strokeWidth={1.8} />
{:else if name === 'book'}
	<BookOpen class={className} aria-hidden="true" strokeWidth={1.8} />
{:else if name === 'pin'}
	<MapPin class={className} aria-hidden="true" strokeWidth={1.8} />
{:else if name === 'globe'}
	<Globe class={className} aria-hidden="true" strokeWidth={1.8} />
{:else if name === 'instagram'}
	<Instagram class={className} aria-hidden="true" strokeWidth={1.8} />
{:else if name === 'youtube'}
	<Youtube class={className} aria-hidden="true" strokeWidth={1.8} />
{:else if name === 'github'}
	<Github class={className} aria-hidden="true" strokeWidth={1.8} />
{:else if name === 'linkedin'}
	<Linkedin class={className} aria-hidden="true" strokeWidth={1.8} />
{:else if name === 'mail'}
	<Mail class={className} aria-hidden="true" strokeWidth={1.8} />
{:else if name === 'link'}
	<Link2 class={className} aria-hidden="true" strokeWidth={1.8} />
{:else if name === 'code'}
	<Code class={className} aria-hidden="true" strokeWidth={1.8} />
{:else if name === 'palette'}
	<Palette class={className} aria-hidden="true" strokeWidth={1.8} />
{:else if name === 'building'}
	<Building2 class={className} aria-hidden="true" strokeWidth={1.8} />
{:else if name === 'scale'}
	<Scale class={className} aria-hidden="true" strokeWidth={1.8} />
{:else if name === 'users'}
	<Users class={className} aria-hidden="true" strokeWidth={1.8} />
{/if}
