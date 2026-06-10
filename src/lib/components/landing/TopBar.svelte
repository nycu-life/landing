<script lang="ts">
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import { m } from '$lib/paraglide/messages';
	import GlassIconBtn from '$lib/components/glass/GlassIconBtn.svelte';
	import BurgerIcon from '$lib/components/glass/BurgerIcon.svelte';

	// App chrome above the page stage: logo + burger on home, back arrow +
	// centred logo + burger on subpages. The burger only opens the menu —
	// the overlay carries its own close button (prototype behaviour).
	// `light` flips the chrome for the light hero surface; the desktop story
	// turns it off once the backdrop goes vivid, while staying in home mode.
	let {
		home = true,
		light = home,
		onmenu
	}: { home?: boolean; light?: boolean; onmenu?: () => void } = $props();
</script>

<header class="topbar" class:subpage={!home} class:on-light={light}>
	{#if home}
		<a class="topbar-brand" href="{base}/" aria-label={m.menu_home()}>
			<img
				src="{base}/brand/logo-horizontal-{light ? 'blue' : 'white'}.svg"
				alt="NYCU LIFE"
				class="topbar-logo"
			/>
		</a>
	{:else}
		<span in:fade={{ duration: 250 }}>
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
		</span>
		<a class="topbar-brand topbar-brand-center" href="{base}/" aria-label={m.menu_home()}>
			<img src="{base}/brand/logo-horizontal-white.svg" alt="NYCU LIFE" class="topbar-logo small" />
		</a>
	{/if}
	<GlassIconBtn label={m.menu_open()} onclick={onmenu}>
		<BurgerIcon open={false} />
	</GlassIconBtn>
</header>

<style>
	.topbar {
		flex: none;
		position: relative;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		width: 100%;
		max-width: var(--shell);
		margin-inline: auto;
		padding: calc(env(safe-area-inset-top, 0px) + 0.9rem) var(--gutter) 0.75rem;
		color: var(--ink);
	}
	/* Over the light home surface the chrome flips dark. */
	.topbar.on-light {
		color: #1a2350;
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
	}
	.topbar-brand-center {
		justify-self: center;
	}
	.topbar-logo {
		height: 1.85rem;
		width: auto;
		display: block;
	}
	.topbar-logo.small {
		height: 1.6rem;
	}
</style>
