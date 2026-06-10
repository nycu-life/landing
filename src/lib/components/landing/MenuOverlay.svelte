<script lang="ts">
	import { base } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import { menuItems, footerLinks } from '$lib/content/landing';
	import GlassIconBtn from '$lib/components/glass/GlassIconBtn.svelte';
	import BurgerIcon from '$lib/components/glass/BurgerIcon.svelte';
	import Icon from './Icon.svelte';
	import LocaleSwitch from './LocaleSwitch.svelte';

	// Full-screen liquid-glass menu — a high-transparency frosted panel that
	// "blooms" open (scale .9 → 1 while the backdrop blur ramps 0 → 32px),
	// rows rising in with a stagger. Ported from the 0610 prototype.
	let { open = false, onclose }: { open?: boolean; onclose?: () => void } = $props();

	// The page chrome behind goes inert while the menu is open (the burger
	// that opened it included) — move focus into the overlay so keyboard
	// users aren't dropped on <body>, and give it back on close.
	let closeWrap = $state<HTMLElement | null>(null);
	let lastFocused: HTMLElement | null = null;

	$effect(() => {
		if (open) {
			lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
			closeWrap?.querySelector('button')?.focus();
		} else if (lastFocused) {
			lastFocused.focus();
			lastFocused = null;
		}
	});
</script>

<svelte:window
	onkeydown={(e) => {
		if (open && e.key === 'Escape') onclose?.();
	}}
/>

<div class="menu" class:open inert={!open} aria-hidden={!open}>
	<!-- Ambient dim behind the glass (no blur — the panel does the blurring) -->
	<div class="menu-dim"></div>

	<!-- Liquid glass panel — blooms open; sheen + edge refraction highlight -->
	<div class="menu-panel">
		<div class="menu-sheen"></div>
	</div>

	<!-- Top bar — white logo + morphing close button -->
	<div class="menu-top">
		<a class="menu-logo" href="{base}/" aria-label={m.menu_home()}>
			<img src="{base}/brand/logo-horizontal-white.svg" alt="NYCU LIFE" />
		</a>
		<span bind:this={closeWrap}>
			<GlassIconBtn label={m.menu_close()} onclick={onclose}>
				<BurgerIcon open={true} />
			</GlassIconBtn>
		</span>
	</div>

	<nav class="menu-body" aria-label={m.menu_label()}>
		<div class="menu-eyebrow"><span>{m.menu_label()}</span></div>

		<ul class="menu-list">
			{#each menuItems as item, i (item.target)}
				<li style="--row-delay:{0.32 + i * 0.05}s">
					<a class="menu-row" href="{base}{item.path}">
						<span class="menu-row-line"></span>
						<span class="menu-row-label">{item.label()}</span>
						<span class="menu-row-arrow" aria-hidden="true">&gt;</span>
					</a>
				</li>
			{/each}
		</ul>

		<div class="menu-foot">
			<div class="menu-foot-row">
				<div class="menu-foot-contact">
					<div class="menu-foot-label">{m.menu_contact_label()}</div>
					<a
						class="menu-foot-handle"
						href="https://instagram.com/nycu.life"
						target="_blank"
						rel="noreferrer">@nycu.life</a
					>
				</div>
				<div class="menu-foot-end">
					<LocaleSwitch tone="menu" />
					<div class="menu-foot-socials">
						{#each footerLinks as link (link.href)}
							<a href={link.href} target="_blank" rel="noreferrer" aria-label={link.label()}>
								<Icon name={link.icon} class="h-[18px] w-[18px]" />
							</a>
						{/each}
					</div>
				</div>
			</div>
			<div class="menu-foot-rights">{m.footer_rights()}</div>
		</div>
	</nav>
</div>

<style>
	.menu {
		position: fixed;
		inset: 0;
		z-index: 80;
		pointer-events: none;
		font-family: var(--font-sans);
	}
	.menu.open {
		pointer-events: auto;
	}

	/* ── ambient dim ── */
	.menu-dim {
		position: absolute;
		inset: 0;
		background: rgba(8, 12, 40, 0);
		opacity: 0;
		transition:
			background 0.55s var(--ease-glass),
			opacity 0.4s var(--ease-glass);
	}
	.menu.open .menu-dim {
		background: rgba(8, 12, 40, 0.18);
		opacity: 1;
	}

	/* ── blooming glass panel ── */
	.menu-panel {
		position: absolute;
		inset: 0;
		overflow: hidden;
		border-radius: 40px;
		border-left: 1px solid rgba(255, 255, 255, 0.2);
		background: rgba(15, 23, 42, 0.35);
		backdrop-filter: blur(0px);
		-webkit-backdrop-filter: blur(0px);
		box-shadow: -24px 0 70px rgba(0, 0, 0, 0.4);
		transform-origin: center center;
		transform: scale(0.9);
		opacity: 0;
		transition:
			transform 0.55s var(--ease-glass),
			opacity 0.45s var(--ease-glass),
			backdrop-filter 0.55s var(--ease-glass),
			border-radius 0.55s var(--ease-glass);
	}
	.menu.open .menu-panel {
		border-radius: 0;
		backdrop-filter: blur(32px) saturate(200%);
		-webkit-backdrop-filter: blur(32px) saturate(200%);
		transform: scale(1);
		opacity: 1;
	}
	.menu-sheen {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background:
			linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0px, transparent 2px),
			radial-gradient(120% 70% at 50% 0%, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
			radial-gradient(90% 60% at 88% 108%, rgba(80, 110, 230, 0.2) 0%, transparent 55%);
	}

	/* ── top bar ── */
	.menu-top {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		max-width: var(--shell);
		margin-inline: auto;
		padding: calc(env(safe-area-inset-top, 0px) + 0.9rem) var(--gutter) 0.75rem;
		color: #fff;
		opacity: 0;
		transition: opacity 0.3s ease 0.15s;
	}
	.menu.open .menu-top {
		opacity: 1;
	}
	.menu-logo img {
		height: 1.85rem;
		width: auto;
		display: block;
	}

	/* ── body ── */
	.menu-body {
		position: absolute;
		inset: 0;
		z-index: 2;
		display: flex;
		flex-direction: column;
		padding: calc(env(safe-area-inset-top, 0px) + 7.4rem) var(--gutter) 2.6rem;
		max-width: var(--shell);
		margin-inline: auto;
		overflow: auto;
	}

	.menu-eyebrow {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		font-size: 0.69rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.5);
		font-weight: 600;
		margin-bottom: 1.1rem;
		opacity: 0;
		transform: translateY(10px);
		transition:
			opacity 0.4s ease 0.2s,
			transform 0.4s ease 0.2s;
	}
	.menu.open .menu-eyebrow {
		opacity: 1;
		transform: none;
	}

	.menu-list {
		list-style: none;
		margin: 0;
		padding: 0;
		flex: 1;
	}
	.menu-row {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		width: 100%;
		margin: 2px 0;
		padding: 1rem 0.9rem;
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0);
		background: rgba(255, 255, 255, 0);
		color: #fff;
		cursor: pointer;
		opacity: 0;
		transform: translateY(28px);
		transition:
			background 0.35s var(--ease-glass),
			border-color 0.35s var(--ease-glass),
			box-shadow 0.35s var(--ease-glass);
	}
	.menu.open .menu-row {
		opacity: 1;
		transform: translateY(0);
		transition:
			background 0.35s var(--ease-glass),
			border-color 0.35s var(--ease-glass),
			box-shadow 0.35s var(--ease-glass),
			opacity 0.55s var(--ease-glass) var(--row-delay),
			transform 0.55s var(--ease-glass) var(--row-delay);
	}
	.menu-row:hover,
	.menu-row:active {
		background: rgba(255, 255, 255, 0.06);
		border-color: rgba(255, 255, 255, 0.2);
		box-shadow:
			0 8px 20px rgba(0, 0, 0, 0.1),
			inset 0 1px 1px rgba(255, 255, 255, 0.1);
	}
	/* accent line — slides in on hover/tap */
	.menu-row-line {
		width: 0;
		height: 2px;
		flex-shrink: 0;
		border-radius: 2px;
		background: linear-gradient(90deg, #6d9bff, #4d7fff);
		margin-right: -0.9rem;
		opacity: 0;
		transition:
			width 0.35s var(--ease-app),
			margin-right 0.35s var(--ease-app),
			opacity 0.3s ease;
	}
	.menu-row:hover .menu-row-line,
	.menu-row:active .menu-row-line {
		width: 22px;
		margin-right: 0;
		opacity: 1;
		box-shadow: 0 0 10px rgba(109, 155, 255, 0.8);
	}
	.menu-row-label {
		flex: 1;
		font-family: var(--font-cjk);
		font-size: clamp(1.75rem, 5.5vw, 2.6rem);
		font-weight: 400;
		line-height: 1;
		letter-spacing: -0.03em;
		transition:
			color 0.3s ease,
			transform 0.35s var(--ease-glass);
	}
	.menu-row:hover .menu-row-label,
	.menu-row:active .menu-row-label {
		color: #9fc0ff;
		transform: translateX(4px);
		animation: nlBreath 1.8s ease-in-out infinite;
	}
	.menu-row-arrow {
		font-size: 1.25rem;
		font-weight: 300;
		line-height: 1;
		opacity: 0.7;
		transition:
			opacity 0.3s ease,
			color 0.3s ease,
			text-shadow 0.3s ease,
			transform 0.35s var(--ease-glass);
	}
	.menu-row:hover .menu-row-arrow,
	.menu-row:active .menu-row-arrow {
		opacity: 1;
		color: #9fc0ff;
		text-shadow: 0 0 10px rgba(159, 192, 255, 0.6);
		transform: translateX(6px);
	}

	/* ── footer ── */
	.menu-foot {
		padding-top: 1.25rem;
		margin-top: 0.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.18);
		color: rgba(255, 255, 255, 0.78);
		opacity: 0;
		transform: translateY(10px);
		transition:
			opacity 0.4s ease 0.55s,
			transform 0.4s ease 0.55s;
	}
	.menu.open .menu-foot {
		opacity: 1;
		transform: none;
	}
	.menu-foot-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: 1rem;
	}
	.menu-foot-label {
		font-size: 0.62rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		opacity: 0.6;
		margin-bottom: 0.35rem;
	}
	.menu-foot-handle {
		font-size: 0.95rem;
		font-weight: 600;
	}
	.menu-foot-handle:hover {
		color: #6d9bff;
		text-shadow: 0 0 12px rgba(109, 155, 255, 0.7);
	}
	.menu-foot-end {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	.menu-foot-socials {
		display: flex;
		gap: 0.9rem;
	}
	.menu-foot-socials a {
		color: rgba(255, 255, 255, 0.78);
		transition:
			color 0.25s ease,
			filter 0.25s ease;
	}
	.menu-foot-socials a:hover {
		color: #6d9bff;
		filter: drop-shadow(0 0 8px rgba(109, 155, 255, 0.7));
	}
	.menu-foot-rights {
		margin-top: 1rem;
		font-size: 0.62rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.34);
		font-weight: 600;
	}

	@media (prefers-reduced-motion: reduce) {
		.menu-panel,
		.menu.open .menu-panel {
			transition: opacity 0.2s ease;
			transform: none;
			border-radius: 0;
		}
		.menu.open .menu-row,
		.menu.open .menu-eyebrow,
		.menu.open .menu-foot {
			transition: none;
			opacity: 1;
			transform: none;
		}
		.menu-row:hover .menu-row-label {
			animation: none;
		}
	}
</style>
