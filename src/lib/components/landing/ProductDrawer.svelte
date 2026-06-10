<script lang="ts">
	// Product detail dialog, ported from the prototype's ProductDrawer: a blurred
	// full-screen backdrop with a centered floating glass card that springs in
	// (scale .92 / +12px → rest) and fades back out. Uses the prototype's
	// render-delay pattern so both directions animate.
	import { m } from '$lib/paraglide/messages';
	import { productsSection, type Product } from '$lib/content/landing';
	import { portal } from './portal';
	import ProductIcon from './ProductIcon.svelte';
	import StatusPill from './StatusPill.svelte';

	let { product, onclose }: { product: Product | null; onclose: () => void } = $props();

	// `shown` keeps the last product alive while the close animation plays.
	let shown = $state<Product | null>(null);
	let render = $state(false);
	let open = $state(false);
	let closeBtn = $state<HTMLButtonElement | null>(null);

	$effect(() => {
		if (product) {
			shown = product;
			render = true;
			// Double rAF: let the closed state paint first so the open transition runs.
			let raf2 = 0;
			const raf1 = requestAnimationFrame(() => {
				raf2 = requestAnimationFrame(() => {
					open = true;
					closeBtn?.focus();
				});
			});
			return () => {
				cancelAnimationFrame(raf1);
				cancelAnimationFrame(raf2);
			};
		}
		open = false;
		const t = setTimeout(() => {
			render = false;
			shown = null;
		}, 450);
		return () => clearTimeout(t);
	});

	function onBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) onclose();
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (open && e.key === 'Escape') onclose();
	}}
/>

{#if render && shown}
	{@const p = shown}
	<!-- Portaled to <body>: the page layer animates transform/filter during
	     route transitions, which would otherwise clip this fixed overlay. -->
	<div use:portal>
		<div class="drawer-backdrop" class:open onclick={onclose} role="presentation"></div>
		<div class="drawer-wrap" class:open onclick={onBackdropClick} role="presentation">
			<div class="drawer-card" class:open role="dialog" aria-modal="true" aria-label={p.name()}>
				<button
					class="liquid-glass-btn-circle drawer-close"
					onclick={onclose}
					aria-label={m.menu_close()}
					bind:this={closeBtn}
				>
					<svg
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.7"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M18 6 6 18M6 6l12 12" />
					</svg>
				</button>

				<div class="drawer-body">
					<div class="drawer-head">
						<ProductIcon kind={p.glyph} size={88} />
						<div class="drawer-headtext">
							<h2 class="drawer-name">{p.name()}</h2>
							<p class="drawer-latin">{p.latin}</p>
							<span class="drawer-pill"><StatusPill status={p.status} /></span>
						</div>
					</div>

					<p class="drawer-tagline">{p.summary()}</p>

					<div class="drawer-features glass">
						<p class="drawer-features-label">{productsSection.featuresLabel()}</p>
						<ul>
							{#each p.features as feature, i (i)}
								<li>
									<span class="drawer-check">
										<svg
											width="12"
											height="12"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="1.7"
											stroke-linecap="round"
											stroke-linejoin="round"
											aria-hidden="true"
										>
											<path d="M20 6 9 17l-5-5" />
										</svg>
									</span>
									<span>{feature()}</span>
								</li>
							{/each}
						</ul>
					</div>
				</div>

				{#if p.href}
					<div class="drawer-foot">
						<a class="liquid-glass-btn drawer-visit" href={p.href} target="_blank" rel="noreferrer">
							<span class="visit-icon">
								<svg
									width="22"
									height="22"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.7"
									stroke-linecap="round"
									stroke-linejoin="round"
									aria-hidden="true"
								>
									<circle cx="12" cy="12" r="10" />
									<path d="M2 12h20" />
									<path
										d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
									/>
								</svg>
							</span>
							<span class="visit-text">
								<span class="visit-sub">{m.products_visit()}</span>
								<span class="visit-name">{p.name()}</span>
							</span>
							<span class="visit-arrow">
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.7"
									stroke-linecap="round"
									stroke-linejoin="round"
									aria-hidden="true"
								>
									<path d="M7 17 17 7M7 7h10v10" />
								</svg>
							</span>
						</a>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.drawer-backdrop {
		position: fixed;
		inset: 0;
		z-index: 120;
		background: rgba(2, 5, 20, 0.42);
		backdrop-filter: blur(24px) saturate(120%);
		-webkit-backdrop-filter: blur(24px) saturate(120%);
		opacity: 0;
		transition: opacity 0.4s ease;
		pointer-events: none;
	}
	.drawer-backdrop.open {
		opacity: 1;
		pointer-events: auto;
	}

	.drawer-wrap {
		position: fixed;
		inset: 0;
		z-index: 121;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: calc(var(--topbar-h) + 8px) 16px 24px;
		pointer-events: none;
	}
	.drawer-wrap.open {
		pointer-events: auto;
	}

	.drawer-card {
		position: relative;
		width: 100%;
		max-width: 340px;
		max-height: 100%;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		color: var(--ink);
		background: rgba(255, 255, 255, 0.07);
		backdrop-filter: blur(28px) saturate(160%);
		-webkit-backdrop-filter: blur(28px) saturate(160%);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 16px;
		box-shadow:
			inset 0 1px 1px rgba(255, 255, 255, 0.18),
			0 30px 60px -12px rgba(4, 7, 22, 0.65),
			0 12px 28px rgba(4, 7, 22, 0.45);
		transform: scale(0.92) translateY(12px);
		opacity: 0;
		transition:
			transform 0.42s var(--ease-spring),
			opacity 0.3s ease;
	}
	.drawer-card.open {
		transform: scale(1) translateY(0);
		opacity: 1;
	}

	.drawer-close {
		position: absolute;
		top: 14px;
		right: 14px;
		width: 36px;
		height: 36px;
		z-index: 2;
	}

	.drawer-body {
		flex: 1;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		padding: 26px 22px 24px;
	}

	.drawer-head {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 16px;
	}
	.drawer-headtext {
		flex: 1;
		min-width: 0;
	}
	.drawer-name {
		margin: 0;
		font-size: 26px;
		font-weight: 800;
		letter-spacing: -0.025em;
		line-height: 1.1;
	}
	.drawer-latin {
		margin: 4px 0 0;
		font-size: 13px;
		font-weight: 500;
		letter-spacing: 0.02em;
		color: var(--ink-soft);
	}
	.drawer-pill {
		display: inline-flex;
		margin-top: 10px;
	}

	.drawer-tagline {
		margin: 0 0 20px;
		font-size: 15px;
		font-weight: 600;
		letter-spacing: -0.005em;
		line-height: 1.4;
	}

	.drawer-features {
		border-radius: 16px;
		padding: 14px;
		margin-bottom: 18px;
	}
	.drawer-features-label {
		margin: 0 0 10px;
		font-family: var(--font-display);
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.drawer-features ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 8px;
	}
	.drawer-features li {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		font-size: 13px;
		line-height: 1.5;
		color: var(--ink);
	}
	.drawer-check {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
		border-radius: 6px;
		background: rgba(47, 96, 218, 0.18);
		color: var(--accent);
		flex-shrink: 0;
		margin-top: 1px;
	}

	.drawer-foot {
		padding: 14px 22px 18px;
		border-top: 1px solid var(--line);
		background: rgba(8, 11, 26, 0.55);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
	}
	.drawer-visit {
		width: 100%;
		padding: 12px 16px;
		border-radius: 14px;
		gap: 12px;
		justify-content: flex-start;
	}
	.visit-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		flex-shrink: 0;
	}
	.visit-text {
		flex: 1;
		min-width: 0;
		text-align: left;
	}
	.visit-sub {
		display: block;
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.06em;
		opacity: 0.7;
	}
	.visit-name {
		display: block;
		font-size: 15px;
		font-weight: 600;
		letter-spacing: -0.01em;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.visit-arrow {
		display: flex;
		opacity: 0.7;
	}

	@media (prefers-reduced-motion: reduce) {
		.drawer-backdrop,
		.drawer-card {
			transition: none;
		}
	}
</style>
