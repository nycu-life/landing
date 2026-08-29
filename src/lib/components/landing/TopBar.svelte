<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages';
	import LocaleSwitch from './LocaleSwitch.svelte';

	let {
		darkMode = false,
		ontoggletheme
	}: {
		darkMode?: boolean;
		ontoggletheme?: () => void;
	} = $props();

	const themeLabel = () => (darkMode ? '切換至淺色模式' : '切換至深色模式');
	const logoSrc = $derived(
		`${base}/brand/${darkMode ? 'logo-horizontal-white.svg' : 'logo-horizontal-blue.svg'}`
	);
	const wishPoolActive = $derived(page.url.pathname.startsWith(`${base}/wishpool`));
</script>

<header class="topbar">
	<a class="topbar-brand" href="{base}/" aria-label={m.menu_home()}>
		<img src={logoSrc} alt="NYCU LIFE" />
	</a>
	<nav class="topbar-nav" aria-label={m.nav_aria()}>
		<a href="{base}/#about">{m.menu_about()}</a>
		<a href="{base}/#products">{m.nav_products()}</a>
		<a href="{base}/#faq">{m.nav_faq()}</a>
		<a href="{base}/#join">{m.nav_join()}</a>
		<a href="{base}/wishpool/" aria-current={wishPoolActive ? 'page' : undefined}
			>{m.footer_wishlist()}</a
		>
	</nav>
	<div class="topbar-actions">
		<a
			class="mobile-wish-link"
			href="{base}/wishpool/"
			aria-label={m.footer_wishlist()}
			aria-current={wishPoolActive ? 'page' : undefined}
		>
			<span aria-hidden="true">✦</span>
			<span class="mobile-wish-label">{m.footer_wishlist()}</span>
		</a>
		<LocaleSwitch />
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
	</div>
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
		/* Full-bleed bar (no seam against the page background); content stays centred in --shell. */
		padding: max(0.8rem, env(safe-area-inset-top))
			max(var(--gutter), calc((100% - var(--shell)) / 2)) 0.8rem;
		min-height: 4.75rem;
		/* Opaque on purpose: a translucent bar picks up whatever scrolls beneath it and the
		   colour visibly shifts across its width. */
		background: var(--surface);
		border-bottom: 1px solid var(--line);
	}
	.topbar-brand {
		display: inline-flex;
		align-items: center;
		color: var(--ink);
	}
	.topbar-brand img {
		width: clamp(8rem, 14vw, 10.5rem);
		height: auto;
		display: block;
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
	.mobile-wish-link {
		display: none;
		align-items: center;
		justify-content: center;
		gap: 0.3rem;
		min-height: 2.5rem;
		border: 1px solid var(--brand);
		border-radius: 999px;
		padding: 0.45rem 0.75rem;
		background: var(--brand);
		color: #fff;
		font-size: 0.78rem;
		font-weight: 700;
		white-space: nowrap;
	}
	.mobile-wish-link:hover {
		filter: brightness(1.06);
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
	@media (max-width: 900px) {
		.topbar-nav {
			display: none;
		}
		.mobile-wish-link {
			display: inline-flex;
		}
	}
	@media (max-width: 680px) {
		.topbar-actions {
			gap: 0.45rem;
		}
	}
	@media (max-width: 420px) {
		.topbar {
			gap: 0.5rem;
		}
		.topbar-brand img {
			width: 8rem;
		}
	}
	@media (max-width: 360px) {
		.topbar {
			gap: 0.35rem;
		}
		.topbar-brand img {
			width: 6.75rem;
		}
		.topbar-actions {
			gap: 0.25rem;
		}
		.mobile-wish-link {
			width: 2.5rem;
			padding: 0;
		}
		.mobile-wish-label {
			display: none;
		}
	}
</style>
