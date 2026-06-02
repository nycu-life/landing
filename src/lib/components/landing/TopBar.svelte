<script lang="ts">
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { m } from '$lib/paraglide/messages';
	import { brand } from '$lib/content/landing';
	import FoxMark from '$lib/components/glass/FoxMark.svelte';
	import GlassIconBtn from '$lib/components/glass/GlassIconBtn.svelte';
	import BurgerIcon from '$lib/components/glass/BurgerIcon.svelte';

	let {
		menuOpen = false,
		home = true,
		ontoggle
	}: { menuOpen?: boolean; home?: boolean; ontoggle?: () => void } = $props();
</script>

<header class="topbar" class:subpage={!home}>
	{#if home}
		<a class="topbar-brand" href="{base}/" aria-label={m.menu_home()}>
			<FoxMark size={32} />
			<span class="topbar-wordmark">{brand.name()}</span>
		</a>
	{:else}
		<GlassIconBtn label={m.team_back()} onclick={() => goto(`${base}/`)}>
			<svg
				width="22"
				height="22"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M19 12H5M12 19l-7-7 7-7" />
			</svg>
		</GlassIconBtn>
		<a class="topbar-brand topbar-brand-center" href="{base}/" aria-label={m.menu_home()}>
			<FoxMark size={28} />
			<span class="topbar-wordmark">{brand.name()}</span>
		</a>
	{/if}
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
	/* Subpages: back (start) · wordmark (centre) · burger (end). */
	.topbar.subpage {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
	}
	.topbar-brand {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		color: var(--ink);
	}
	.topbar-brand-center {
		justify-self: center;
	}
	.topbar-wordmark {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 1.05rem;
		letter-spacing: 0.01em;
	}
	.topbar.subpage .topbar-wordmark {
		font-size: 0.98rem;
	}
</style>
