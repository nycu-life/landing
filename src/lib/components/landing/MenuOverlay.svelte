<script lang="ts">
	import { base } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import { menuItems, footerLinks } from '$lib/content/landing';
	import Icon from './Icon.svelte';
	import LocaleSwitch from './LocaleSwitch.svelte';

	let { open = false, onnavigate }: { open?: boolean; onnavigate?: () => void } = $props();
</script>

<div class="menu" class:open inert={!open} aria-hidden={!open}>
	<!-- clip-path reveal panel: gradient + drifting blobs -->
	<div class="menu-panel" class:open>
		<div class="menu-panel-fill"></div>
		<div class="nl-blob menu-blob-a"></div>
		<div class="nl-blob menu-blob-b"></div>
	</div>

	<nav class="menu-body" aria-label={m.menu_label()}>
		<div class="menu-eyebrow">
			<span>{m.menu_label()}</span>
			<span>{m.menu_eyebrow_right()}</span>
		</div>

		<ul class="menu-list">
			{#each menuItems as item, i (item.target)}
				<li style="--row-delay:{0.18 + i * 0.07}s">
					<a class="menu-row" href="{base}{item.path}" onclick={onnavigate}>
						<span class="menu-row-num">{item.num}</span>
						<span class="menu-row-label">{item.label()}</span>
						<span class="menu-row-end">
							<span class="menu-row-latin">{item.latin()}</span>
							<Icon name="arrow" class="h-[18px] w-[18px]" />
						</span>
					</a>
				</li>
			{/each}
		</ul>

		<div class="menu-foot">
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
	</nav>
</div>

<style>
	.menu {
		position: fixed;
		inset: 0;
		z-index: 80;
		pointer-events: none;
		font-family: var(--font-display);
	}
	.menu.open {
		pointer-events: auto;
	}

	.menu-panel {
		position: absolute;
		inset: 0;
		overflow: hidden;
		clip-path: circle(0% at calc(100% - 34px) 38px);
		transition: clip-path 0.7s cubic-bezier(0.77, 0, 0.18, 1);
	}
	.menu-panel.open {
		clip-path: circle(150% at calc(100% - 34px) 38px);
	}
	.menu-panel-fill {
		position: absolute;
		inset: 0;
		background: linear-gradient(160deg, rgba(54, 40, 112, 0.95) 0%, rgba(24, 28, 68, 0.97) 100%);
		backdrop-filter: blur(30px) saturate(170%);
		-webkit-backdrop-filter: blur(30px) saturate(170%);
	}
	.menu-blob-a {
		width: 440px;
		height: 440px;
		top: -12%;
		right: -18%;
		background: radial-gradient(circle at 50% 50%, rgba(150, 118, 255, 0.85) 0%, transparent 64%);
		animation-duration: 28s;
	}
	.menu-blob-b {
		width: 400px;
		height: 400px;
		bottom: -16%;
		left: -14%;
		background: radial-gradient(circle at 50% 50%, rgba(45, 220, 245, 0.62) 0%, transparent 66%);
		animation-duration: 34s;
		animation-delay: -10s;
	}

	.menu-body {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		padding: clamp(6rem, 14vh, 9rem) var(--gutter) 2.5rem;
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
		margin-bottom: 1.2rem;
		opacity: 0;
		transition: opacity 0.4s ease 0.2s;
	}
	.menu.open .menu-eyebrow {
		opacity: 1;
	}

	.menu-list {
		list-style: none;
		margin: 0;
		padding: 0;
		flex: 1;
	}
	.menu-list li {
		border-bottom: 1px solid rgba(255, 255, 255, 0.18);
	}

	.menu-row {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		padding: clamp(1rem, 2.4vw, 1.5rem) 0;
		color: #fff;
		opacity: 0;
		transform: translateY(28px);
	}
	.menu.open .menu-row {
		opacity: 1;
		transform: translateY(0);
		transition:
			opacity 0.55s cubic-bezier(0.2, 0.7, 0.3, 1) var(--row-delay),
			transform 0.55s cubic-bezier(0.2, 0.7, 0.3, 1) var(--row-delay);
	}
	.menu-row-num {
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		opacity: 0.5;
		width: 1.4rem;
	}
	.menu-row-label {
		flex: 1;
		font-family: var(--font-sans);
		font-size: clamp(1.9rem, 6vw, 3rem);
		font-weight: 500;
		line-height: 1;
		letter-spacing: -0.03em;
	}
	.menu-row-end {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.25rem;
	}
	.menu-row-latin {
		font-size: 0.62rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		opacity: 0.6;
		font-weight: 600;
	}
	.menu-row:hover {
		color: #fff;
	}
	.menu-row:hover .menu-row-label {
		opacity: 0.85;
	}

	.menu-foot {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: 1rem;
		padding-top: 1.25rem;
		margin-top: 0.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.18);
		color: rgba(255, 255, 255, 0.82);
		opacity: 0;
		transition: opacity 0.4s ease 0.55s;
	}
	.menu.open .menu-foot {
		opacity: 1;
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
		color: #fff;
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
		color: rgba(255, 255, 255, 0.82);
		transition: color 0.2s ease;
	}
	.menu-foot-socials a:hover {
		color: #fff;
	}

	@media (prefers-reduced-motion: reduce) {
		.menu-panel,
		.menu-panel.open {
			clip-path: none;
			transition: opacity 0.2s ease;
			opacity: 0;
		}
		.menu.open .menu-panel {
			opacity: 1;
		}
		.menu.open .menu-row,
		.menu.open .menu-eyebrow,
		.menu.open .menu-foot {
			transition: none;
			opacity: 1;
			transform: none;
		}
	}
</style>
