<script lang="ts">
	import { base } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import { brand } from '$lib/content/landing';
	import FoxMark from '$lib/components/glass/FoxMark.svelte';
	import GlassIconBtn from '$lib/components/glass/GlassIconBtn.svelte';
	import BurgerIcon from '$lib/components/glass/BurgerIcon.svelte';

	let { menuOpen = false, ontoggle }: { menuOpen?: boolean; ontoggle?: () => void } = $props();
</script>

<header class="topbar">
	<a class="topbar-brand" href="{base}/" aria-label={m.menu_home()}>
		<FoxMark size={32} />
		<span class="topbar-wordmark">{brand.name()}</span>
	</a>
	<GlassIconBtn label={menuOpen ? m.menu_close() : m.menu_open()} onclick={ontoggle}>
		<BurgerIcon open={menuOpen} />
	</GlassIconBtn>
</header>

<style>
	.topbar {
		position: sticky;
		top: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		width: 100%;
		max-width: var(--shell);
		margin-inline: auto;
		padding: 0.85rem var(--gutter);
	}
	.topbar-brand {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		color: var(--ink);
	}
	.topbar-wordmark {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 1.05rem;
		letter-spacing: 0.01em;
	}
</style>
