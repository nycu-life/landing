<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { prefersReducedMotion } from 'svelte/motion';
	import { m } from '$lib/paraglide/messages';
	import {
		productStatusLabel,
		productsSection,
		comingSoon,
		type Product
	} from '$lib/content/landing';
	import Frame from './Frame.svelte';
	import Icon from './Icon.svelte';
	import ProductIcon from './ProductIcon.svelte';
	import GlassIconBtn from '$lib/components/glass/GlassIconBtn.svelte';

	let { product, onclose }: { product: Product | null; onclose: () => void } = $props();

	const flyX = $derived(prefersReducedMotion.current ? 0 : 420);
</script>

{#if product}
	{@const p = product}
	<div
		class="drawer-backdrop"
		transition:fade={{ duration: 250 }}
		onclick={onclose}
		role="presentation"
	></div>
	<aside class="drawer" transition:fly={{ x: flyX, duration: 380 }} aria-label={p.name()}>
		<div class="drawer-close">
			<GlassIconBtn label={m.menu_close()} onclick={onclose} size={36}>
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
				>
					<path d="M18 6 6 18M6 6l12 12" />
				</svg>
			</GlassIconBtn>
		</div>

		<div class="drawer-body">
			<p class="drawer-eyebrow">{p.latin}</p>

			<div class="drawer-head">
				<ProductIcon kind={p.glyph} size={72} />
				<div class="drawer-headtext">
					<h2 class="drawer-name">{p.name()}</h2>
					<span class="drawer-status drawer-status-{p.status}"
						>{productStatusLabel[p.status]()}</span
					>
				</div>
			</div>

			<p class="drawer-summary">{p.summary()}</p>

			{#if p.screenshot}
				<div class="drawer-shot">
					<Frame src={p.screenshot.src} alt={p.name()} frame={p.screenshot.frame} />
				</div>
			{/if}

			<div class="drawer-features glass" style="border-radius:16px;">
				<p class="drawer-features-label">{productsSection.featuresLabel()}</p>
				<ul>
					{#each p.features as feature, i (i)}
						<li>
							<span class="drawer-check"><Icon name="check" class="h-3 w-3" /></span>
							<span>{feature()}</span>
						</li>
					{/each}
				</ul>
			</div>
		</div>

		<div class="drawer-foot">
			{#if p.href}
				<a
					class="landing-button landing-button-primary drawer-cta"
					href={p.href}
					target="_blank"
					rel="noreferrer"
				>
					<span>{productsSection.visitLabel()}</span>
					<Icon name="arrow" class="h-4 w-4" />
				</a>
			{:else}
				<div class="drawer-note">
					<span class="drawer-status drawer-status-{p.status}"
						>{productStatusLabel[p.status]()}</span
					>
					<span>{comingSoon.body()}</span>
				</div>
			{/if}
		</div>
	</aside>
{/if}

<style>
	.drawer-backdrop {
		position: fixed;
		inset: 0;
		z-index: 120;
		background: rgba(2, 5, 20, 0.55);
		backdrop-filter: blur(2px);
		-webkit-backdrop-filter: blur(2px);
	}
	.drawer {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		z-index: 121;
		width: min(28rem, 92vw);
		display: flex;
		flex-direction: column;
		background: rgba(10, 13, 30, 0.86);
		backdrop-filter: blur(28px) saturate(160%);
		-webkit-backdrop-filter: blur(28px) saturate(160%);
		border-left: 1px solid var(--line-strong);
		box-shadow: -30px 0 60px rgba(2, 5, 20, 0.5);
	}
	.drawer-close {
		position: absolute;
		top: 1rem;
		right: 1rem;
		z-index: 2;
	}
	.drawer-body {
		flex: 1;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		padding: 4.25rem 1.5rem 1.5rem;
	}
	.drawer-eyebrow {
		margin: 0 0 0.6rem;
		font-family: var(--font-display);
		font-size: 0.66rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--muted);
		font-weight: 700;
	}
	.drawer-head {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}
	.drawer-name {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 800;
		letter-spacing: -0.025em;
		line-height: 1.15;
	}
	.drawer-status {
		display: inline-block;
		margin-top: 0.5rem;
		padding: 0.2rem 0.6rem;
		border-radius: 999px;
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.02em;
		border: 1px solid var(--line);
	}
	.drawer-status-live {
		color: var(--ok);
		background: var(--ok-soft);
		border-color: color-mix(in srgb, var(--ok) 40%, transparent);
	}
	.drawer-status-soon {
		color: var(--amber-ink);
		background: var(--amber-soft);
		border-color: color-mix(in srgb, var(--amber) 40%, transparent);
	}
	.drawer-status-dev {
		color: var(--muted);
		background: var(--glass-strong);
	}
	.drawer-summary {
		margin: 0 0 1.1rem;
		font-size: 0.98rem;
		line-height: 1.6;
		color: var(--ink-soft);
	}
	.drawer-shot {
		margin-bottom: 1.1rem;
	}
	.drawer-features {
		padding: 1rem;
	}
	.drawer-features-label {
		margin: 0 0 0.7rem;
		font-family: var(--font-display);
		font-size: 0.66rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--muted);
		font-weight: 700;
	}
	.drawer-features ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.6rem;
	}
	.drawer-features li {
		display: flex;
		align-items: flex-start;
		gap: 0.6rem;
		font-size: 0.92rem;
		line-height: 1.5;
		color: var(--ink);
	}
	.drawer-check {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		border-radius: 6px;
		background: var(--brand-soft);
		color: var(--brand);
		flex-shrink: 0;
		margin-top: 0.05rem;
	}
	.drawer-foot {
		padding: 1rem 1.5rem 1.5rem;
		border-top: 1px solid var(--line);
		background: rgba(8, 11, 26, 0.55);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
	}
	.drawer-cta {
		width: 100%;
		background: var(--accent-grad);
		border: none;
		color: #0c1230;
	}
	.drawer-cta:hover {
		filter: brightness(1.05);
		transform: translateY(-2px);
	}
	.drawer-note {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-size: 0.88rem;
		line-height: 1.55;
		color: var(--ink-soft);
	}
	.drawer-note .drawer-status {
		align-self: flex-start;
		margin-top: 0;
	}
</style>
