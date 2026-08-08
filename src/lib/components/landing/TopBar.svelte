<script lang="ts">
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { m } from '$lib/paraglide/messages';
	import GlassIconBtn from '$lib/components/glass/GlassIconBtn.svelte';
	import BurgerIcon from '$lib/components/glass/BurgerIcon.svelte';
	import LocaleSwitch from './LocaleSwitch.svelte';

	let {
		menuOpen = false,
		home = true,
		darkMode = false,
		ontoggle,
		ontoggletheme
	}: {
		menuOpen?: boolean;
		home?: boolean;
		darkMode?: boolean;
		ontoggle?: () => void;
		ontoggletheme?: () => void;
	} = $props();

	const themeLabel = () => (darkMode ? '切換至淺色模式' : '切換至深色模式');
	const logoSrc = $derived(`${base}/brand/${darkMode ? 'logo-white.svg' : 'logo.svg'}`);
</script>

<header class="topbar" class:subpage={!home} class:menu-open={menuOpen}>
	{#if home}
		<a class="topbar-brand" href="{base}/" aria-label={m.menu_home()}>
			<img src={logoSrc} alt="" />
			<span>NYCU LIFE</span>
		</a>
		<nav class="topbar-nav" aria-label="主要導覽">
			<a href="#products">所有產品</a>
			<a href="#about">認識我們</a>
			<a href="#courses">課程專區</a>
			<a href="#devlog">開發日誌</a>
			<a href="#join">加入我們</a>
		</nav>
		<div class="topbar-actions">
			<LocaleSwitch compact />
			<button
				class="theme-toggle"
				type="button"
				aria-label={themeLabel()}
				aria-pressed={darkMode}
				onclick={ontoggletheme}
			>
				{#if darkMode}
					<svg viewBox="0 0 24 24" aria-hidden="true"
						><path d="M20.6 15.4A8.5 8.5 0 0 1 8.6 3.4 8.5 8.5 0 1 0 20.6 15.4Z" /></svg
					>
				{:else}
					<svg viewBox="0 0 24 24" aria-hidden="true"
						><circle cx="12" cy="12" r="4" /><path
							d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"
						/></svg
					>
				{/if}
			</button>
			<GlassIconBtn
				class="mobile-menu-btn"
				light={!menuOpen}
				label={menuOpen ? m.menu_close() : m.menu_open()}
				onclick={ontoggle}
			>
				<BurgerIcon open={menuOpen} />
			</GlassIconBtn>
		</div>
	{:else}
		<GlassIconBtn light={!menuOpen} label={m.team_back()} onclick={() => goto(`${base}/`)}>
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
			<img src={logoSrc} alt="" />
			<span>NYCU LIFE</span>
		</a>
	{/if}
	{#if !home}
		<div class="subpage-actions">
			<button
				class="theme-toggle"
				type="button"
				aria-label={themeLabel()}
				aria-pressed={darkMode}
				onclick={ontoggletheme}
			>
				{#if darkMode}
					<svg viewBox="0 0 24 24" aria-hidden="true"
						><path d="M20.6 15.4A8.5 8.5 0 0 1 8.6 3.4 8.5 8.5 0 1 0 20.6 15.4Z" /></svg
					>
				{:else}
					<svg viewBox="0 0 24 24" aria-hidden="true"
						><circle cx="12" cy="12" r="4" /><path
							d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"
						/></svg
					>
				{/if}
			</button>
			<GlassIconBtn
				light={!menuOpen}
				label={menuOpen ? m.menu_close() : m.menu_open()}
				onclick={ontoggle}
			>
				<BurgerIcon open={menuOpen} />
			</GlassIconBtn>
		</div>
	{/if}
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
		padding: max(0.8rem, env(safe-area-inset-top)) var(--gutter) 0.8rem;
		min-height: 4.75rem;
		background: color-mix(in srgb, var(--surface) 78%, transparent);
		backdrop-filter: blur(18px) saturate(160%);
		-webkit-backdrop-filter: blur(18px) saturate(160%);
		border-bottom: 1px solid var(--line);
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
		color: var(--ink);
	}
	.topbar-brand img {
		width: 2.25rem;
		height: 2.25rem;
		display: block;
	}
	.topbar-brand span {
		font: 700 1.05rem var(--font-display);
		color: var(--brand);
		letter-spacing: -0.02em;
	}
	.topbar-brand-center {
		justify-self: center;
	}
	.topbar-nav {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: clamp(1rem, 2.8vw, 2.25rem);
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--ink);
	}
	.topbar-nav a:hover {
		color: var(--brand);
	}
	.topbar-actions {
		display: flex;
		align-items: center;
		gap: 0.55rem;
	}
	.theme-toggle {
		display: grid;
		place-items: center;
		width: 2.5rem;
		height: 2.5rem;
		border: 1px solid var(--line);
		border-radius: 50%;
		background: var(--surface);
		color: var(--ink);
		font-size: 1.25rem;
		cursor: pointer;
		flex: 0 0 auto;
	}
	.theme-toggle svg {
		width: 1.1rem;
		height: 1.1rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.8;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.theme-toggle:hover {
		color: var(--brand);
		border-color: var(--brand);
	}
	:global(.mobile-menu-btn) {
		display: none;
	}
	.subpage-actions {
		display: flex;
		align-items: center;
		gap: 0.55rem;
	}
	@media (max-width: 900px) {
		.topbar-nav {
			gap: 0.8rem;
			font-size: 0.78rem;
		}
	}
	@media (max-width: 680px) {
		.topbar-nav {
			display: none;
		}
		:global(.mobile-menu-btn) {
			display: inline-flex;
		}
	}
	@media (max-width: 420px) {
		.topbar {
			gap: 0.5rem;
		}
		.topbar-brand span {
			display: none;
		}
		.topbar-brand-center span {
			display: inline;
		}
	}
	.topbar.subpage .topbar-brand img {
		width: 1.8rem;
		height: 1.8rem;
	}
	.topbar.subpage .topbar-brand span {
		font-size: 0.95rem;
	}
</style>
