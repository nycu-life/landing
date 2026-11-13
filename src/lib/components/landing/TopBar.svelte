<script lang="ts">
	import { base } from '$app/paths';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { Moon, Sun } from '@lucide/svelte';
	import { useSiteMessages, useSiteView } from '$lib/site/view';
	const m = useSiteMessages();
	const siteView = useSiteView();
	const site = $derived(siteView());
	import BurgerIcon from '$lib/components/glass/BurgerIcon.svelte';
	import LocaleSwitch from './LocaleSwitch.svelte';

	let {
		darkMode = false,
		ontoggletheme
	}: {
		darkMode?: boolean;
		ontoggletheme?: () => void;
	} = $props();

	let menuOpen = $state(false);
	let menuButton: HTMLButtonElement | undefined = $state();

	const logoSrc = $derived(
		`${base}/brand/${darkMode ? 'logo-horizontal-white.svg' : 'logo-horizontal-blue.svg'}`
	);
	const pathname = $derived(page.url.pathname);
	const isActive = (prefix: string) => pathname.startsWith(`${base}${prefix}`);

	/* #105 navigation order. Home chapters stay in-page anchors; the rest are their own pages.
	   The Wish Pool keeps the sticker slot until the comics corner (#107) has episodes. */
	const links = $derived(site.navigation);
	/** "Dev log (中文)" → label plus a small language badge. */
	const splitLabel = (label: string) => {
		const match = /^(.*?)\s*\((中文|ZH)\)$/.exec(label);
		return match ? { text: match[1], badge: match[2] } : { text: label, badge: '' };
	};

	afterNavigate(() => {
		menuOpen = false;
	});

	const onKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape' && menuOpen) {
			menuOpen = false;
			menuButton?.focus();
		}
	};
</script>

<svelte:window onkeydown={onKeydown} />

<header class="topbar" class:menu-open={menuOpen}>
	<a class="topbar-brand" href="{base}/" aria-label={m.menu_home()}>
		<img src={logoSrc} alt="NYCU LIFE" />
	</a>
	<nav class="topbar-nav" aria-label={m.nav_aria()}>
		{#each links as link (link.href)}
			<a
				href={link.href.startsWith('/') ? `${base}${link.href}` : link.href}
				aria-current={link.page && isActive(link.page) ? 'page' : undefined}
				>{splitLabel(link.label()).text}{#if splitLabel(link.label()).badge}<span class="nav-lang"
						>{splitLabel(link.label()).badge}</span
					>{/if}</a
			>
		{/each}
	</nav>
	<div class="topbar-actions">
		<!-- Designer's blob sticker; the baked label is erased and replaced by live, translated text. -->
		<a
			class="sticker-link"
			href="{base}/wishpool/"
			aria-current={isActive('/wishpool') ? 'page' : undefined}
		>
			<span class="sticker-art" aria-hidden="true">
				<img class="sticker-face sticker-face-default" src="{base}/ui/wishpool-mobile.svg" alt="" />
				<img
					class="sticker-face sticker-face-hover"
					src="{base}/ui/wishpool-mobile-hover.svg"
					alt=""
				/>
			</span>
			<span class="sticker-erase" aria-hidden="true"></span>
			<span class="sticker-label">{m.nav_wishpool()} <span aria-hidden="true">✦</span></span>
		</a>
		<div class="topbar-controls">
			<LocaleSwitch />
			<button
				class="theme-toggle"
				type="button"
				aria-label={darkMode ? m.nav_theme_to_light() : m.nav_theme_to_dark()}
				aria-pressed={darkMode}
				onclick={ontoggletheme}
			>
				{#if darkMode}
					<Moon size={18} strokeWidth={2} aria-hidden="true" />
				{:else}
					<Sun size={18} strokeWidth={2} aria-hidden="true" />
				{/if}
			</button>
		</div>
		<button
			bind:this={menuButton}
			class="menu-toggle"
			type="button"
			aria-expanded={menuOpen}
			aria-controls="topbar-menu"
			aria-label={menuOpen ? m.menu_close() : m.menu_open()}
			onclick={() => (menuOpen = !menuOpen)}
		>
			<BurgerIcon open={menuOpen} />
		</button>
	</div>

	<div id="topbar-menu" class="topbar-menu" hidden={!menuOpen}>
		<nav aria-label={m.nav_aria()}>
			{#each links as link (link.href)}
				<a
					href={link.href.startsWith('/') ? `${base}${link.href}` : link.href}
					aria-current={link.page && isActive(link.page) ? 'page' : undefined}
					onclick={() => (menuOpen = false)}
					>{splitLabel(link.label()).text}{#if splitLabel(link.label()).badge}<span class="nav-lang"
							>{splitLabel(link.label()).badge}</span
						>{/if}</a
				>
			{/each}
			<a
				href="{base}/wishpool/"
				aria-current={isActive('/wishpool') ? 'page' : undefined}
				onclick={() => (menuOpen = false)}>{m.nav_wishpool()}</a
			>
		</nav>
		<div class="menu-controls">
			<LocaleSwitch />
			<button
				class="theme-toggle theme-toggle-wide"
				type="button"
				aria-pressed={darkMode}
				onclick={ontoggletheme}
			>
				{#if darkMode}
					<Moon size={18} strokeWidth={2} aria-hidden="true" />
				{:else}
					<Sun size={18} strokeWidth={2} aria-hidden="true" />
				{/if}
				<span>{darkMode ? m.nav_theme_to_light() : m.nav_theme_to_dark()}</span>
			</button>
		</div>
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
		flex: 0 0 auto;
		color: var(--ink);
	}
	.topbar-brand img {
		width: clamp(8rem, 12vw, 10.5rem);
		height: auto;
		display: block;
	}
	.topbar-nav {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: clamp(1rem, 2.2vw, 2rem);
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--ink);
		white-space: nowrap;
	}
	.topbar-nav a {
		position: relative;
		padding: 0.35rem 0;
	}
	.nav-lang {
		margin-left: 0.3rem;
		padding: 0.05rem 0.35rem;
		border: 1px solid currentColor;
		border-radius: 0.35rem;
		font-size: 0.68em;
		font-weight: 650;
		opacity: 0.75;
		vertical-align: 0.1em;
	}
	.topbar-nav a:hover,
	.topbar-nav a[aria-current='page'] {
		color: var(--brand);
	}
	.topbar-nav a[aria-current='page']::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: -0.1rem;
		height: 2px;
		border-radius: 2px;
		background: currentColor;
	}
	.topbar-actions,
	.topbar-controls {
		display: flex;
		align-items: center;
		gap: 0.55rem;
	}
	.sticker-link {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex: 0 0 auto;
		width: 7.3rem;
		height: 3rem;
		padding: 0;
		color: #fff;
		font-size: 0.8rem;
		font-weight: 700;
		white-space: nowrap;
	}
	.sticker-art,
	.sticker-face {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}
	.sticker-face {
		object-fit: fill;
		opacity: 0;
		pointer-events: none;
	}
	.sticker-face-default {
		opacity: 1;
	}
	.sticker-erase {
		position: absolute;
		z-index: 1;
		inset: 27% 14% 25% 23%;
		background: #33f;
		pointer-events: none;
	}
	.sticker-label {
		position: relative;
		z-index: 2;
	}
	.sticker-link:hover .sticker-face-default,
	.sticker-link:focus-visible .sticker-face-default,
	.sticker-link[aria-current='page'] .sticker-face-default {
		opacity: 0;
	}
	.sticker-link:hover .sticker-face-hover,
	.sticker-link:focus-visible .sticker-face-hover,
	.sticker-link[aria-current='page'] .sticker-face-hover {
		opacity: 1;
	}
	.sticker-link:hover .sticker-erase,
	.sticker-link:focus-visible .sticker-erase,
	.sticker-link[aria-current='page'] .sticker-erase {
		background: #ccf;
	}
	.sticker-link:hover .sticker-label,
	.sticker-link:focus-visible .sticker-label,
	.sticker-link[aria-current='page'] .sticker-label {
		color: #33f;
	}
	.sticker-link[aria-current='page'] .sticker-label {
		color: #1a1ab8;
	}
	.theme-toggle,
	.menu-toggle {
		display: inline-grid;
		place-items: center;
		flex: 0 0 auto;
		width: 2.5rem;
		height: 2.5rem;
		padding: 0;
		border: 1px solid var(--line-strong);
		border-radius: 999px;
		background: var(--surface);
		color: var(--ink);
		cursor: pointer;
		transition:
			color 0.2s ease,
			border-color 0.2s ease;
	}
	.theme-toggle:hover,
	.menu-toggle:hover {
		color: var(--brand);
		border-color: var(--brand);
	}
	.theme-toggle:focus-visible,
	.menu-toggle:focus-visible,
	.sticker-link:focus-visible,
	.topbar-nav a:focus-visible,
	.topbar-menu a:focus-visible {
		outline: 2px solid var(--brand);
		outline-offset: 3px;
		border-radius: 0.5rem;
	}
	.menu-toggle {
		display: none;
	}
	.topbar-menu {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		display: grid;
		gap: 1.25rem;
		padding: 0.75rem var(--gutter) 1.5rem;
		max-height: calc(100dvh - 4.75rem);
		overflow-y: auto;
		background: var(--surface);
		border-bottom: 1px solid var(--line);
		box-shadow: 0 18px 32px rgba(15, 30, 60, 0.12);
	}
	.topbar-menu[hidden] {
		display: none;
	}
	.topbar-menu nav {
		display: grid;
	}
	.topbar-menu nav a {
		padding: 0.85rem 0.25rem;
		border-bottom: 1px solid var(--line);
		color: var(--ink);
		font-size: 1.05rem;
		font-weight: 600;
	}
	.topbar-menu nav a[aria-current='page'] {
		color: var(--brand);
	}
	.menu-controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem;
	}
	.theme-toggle-wide {
		display: inline-flex;
		gap: 0.45rem;
		width: auto;
		padding: 0 1rem;
		font: inherit;
		font-size: 0.85rem;
		font-weight: 600;
	}

	/* Five text links + sticker + controls need ~1060px; below that the links and the
	   locale/theme controls move into the burger menu, the Wish Pool sticker stays visible. */
	@media (max-width: 1080px) {
		.topbar-nav,
		.topbar-controls {
			display: none;
		}
		.menu-toggle {
			display: inline-grid;
		}
	}
	@media (min-width: 1081px) {
		.topbar-menu {
			display: none;
		}
	}
	@media (max-width: 680px) {
		.topbar-actions {
			gap: 0.45rem;
		}
		.sticker-link {
			width: 5.9rem;
			height: 2.55rem;
			font-size: 0.72rem;
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
			width: 6.25rem;
		}
		.topbar-actions {
			gap: 0.25rem;
		}
		.sticker-link {
			width: 5.35rem;
			height: 2.35rem;
			font-size: 0.67rem;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.theme-toggle,
		.menu-toggle {
			transition: none;
		}
	}
</style>
