<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { AboutFolder } from '$lib/content/about';

	let { folders, body }: { folders: AboutFolder[]; body: Snippet<[AboutFolder]> } = $props();

	// Single-open accordion: clicking the open folder closes it again.
	let activeIdx = $state<number | null>(null);
	const toggle = (i: number) => (activeIdx = activeIdx === i ? null : i);
</script>

<div class="folder-stack">
	{#each folders as folder, i (folder.id)}
		<section
			class="folder"
			class:open={activeIdx === i}
			class:dimmed={activeIdx !== null && activeIdx !== i}
			style="--accent:{folder.accent}; --accent-glow:{folder.accent}55; z-index:{activeIdx === i
				? 50
				: i + 1};"
		>
			<!-- accent glow wash at the tab -->
			<span class="folder-glow" aria-hidden="true"></span>

			<!-- Tab — always visible -->
			<button class="folder-tab" aria-expanded={activeIdx === i} onclick={() => toggle(i)}>
				<span class="folder-tab-text">
					<span class="folder-meta">
						<span class="folder-num">{folder.num}</span>
						<span class="folder-latin">{folder.latin()}</span>
					</span>
					<span class="folder-title">{folder.title()}</span>
				</span>
				<!-- Frameless light-shadow chevron -->
				<span class="folder-chevron" aria-hidden="true">
					<span class="folder-chevron-glyph">
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
							<path d="M6 9l6 6 6-6" />
						</svg>
					</span>
				</span>
			</button>

			<!-- Body — collapses -->
			<div class="folder-body">
				<div class="folder-body-inner">
					{@render body(folder)}
				</div>
			</div>
		</section>
	{/each}
</div>

<style>
	.folder-stack {
		padding: 6px 0;
	}

	.folder {
		position: relative;
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(24px) saturate(140%);
		-webkit-backdrop-filter: blur(24px) saturate(140%);
		color: var(--ink);
		/* only a thin top rim-light — no side/bottom borders, so overlaps read
		   as a hairline of light */
		border: none;
		border-top: 1px solid var(--rim);
		border-radius: 16px;
		transform: scale(1);
		transform-origin: center top;
		box-shadow: var(--shadow);
		overflow: hidden;
		transition:
			opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
			transform 0.5s var(--ease-glass),
			backdrop-filter 0.3s cubic-bezier(0.4, 0, 0.2, 1),
			margin-top 0.55s var(--ease-glass),
			margin-bottom 0.55s var(--ease-glass),
			box-shadow 0.45s var(--ease-glass),
			background 0.45s ease;
	}
	.folder:not(:first-child) {
		margin-top: -14px;
	}
	.folder.open {
		background: rgba(255, 255, 255, 0.08);
		backdrop-filter: blur(28px) saturate(150%);
		-webkit-backdrop-filter: blur(28px) saturate(150%);
		margin-bottom: 16px;
		transform: scale(1.02);
		box-shadow: var(--shadow-float);
	}
	.folder.dimmed {
		opacity: 0.45;
		backdrop-filter: blur(24px) saturate(120%);
		-webkit-backdrop-filter: blur(24px) saturate(120%);
	}

	.folder-glow {
		position: absolute;
		top: -40px;
		left: -20px;
		width: 220px;
		height: 120px;
		background: radial-gradient(circle at 30% 50%, var(--accent-glow) 0%, transparent 70%);
		filter: blur(8px);
		pointer-events: none;
	}

	.folder-tab {
		position: relative;
		width: 100%;
		padding: 20px 22px;
		background: transparent;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		text-align: left;
		color: inherit;
	}
	.folder-tab-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.folder-meta {
		display: flex;
		align-items: baseline;
		gap: 10px;
	}
	.folder-num {
		font-size: 11px;
		opacity: 0.7;
		letter-spacing: 0.16em;
		font-weight: 600;
		color: var(--accent);
	}
	.folder-latin {
		font-size: 10px;
		opacity: 0.5;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		font-weight: 600;
		color: #fff;
	}
	.folder-title {
		font-size: 28px;
		font-weight: 700;
		letter-spacing: -0.01em;
		line-height: 1.1;
		color: #fff;
		font-family: var(--font-cjk);
	}

	.folder-chevron {
		width: 38px;
		height: 38px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.4s var(--ease-app);
	}
	.folder.open .folder-chevron {
		transform: rotate(180deg);
	}
	.folder-chevron-glyph {
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0.6;
		color: #fff;
		filter: drop-shadow(0 1px 3px rgba(8, 12, 28, 0.45))
			drop-shadow(0 0 6px rgba(255, 255, 255, 0.25));
		transition: opacity 0.3s ease;
	}
	.folder.open .folder-chevron-glyph {
		opacity: 0.95;
	}
	.folder:not(.open) .folder-tab:hover .folder-chevron-glyph {
		opacity: 0.9;
		animation: nlChevBounce 1.1s ease-in-out infinite;
	}

	.folder-body {
		max-height: 0;
		opacity: 0;
		transform: translateY(-6px);
		overflow: hidden;
		transition:
			max-height 0.6s var(--ease-glass),
			opacity 0.45s var(--ease-glass) 0.12s,
			transform 0.5s var(--ease-glass) 0.1s;
	}
	.folder.open .folder-body {
		max-height: 6000px;
		opacity: 1;
		transform: translateY(0);
	}
	.folder-body-inner {
		padding: 4px 22px 24px;
	}

	@media (prefers-reduced-motion: reduce) {
		.folder,
		.folder-chevron,
		.folder-chevron-glyph,
		.folder-body {
			transition: none;
		}
		.folder:not(.open) .folder-tab:hover .folder-chevron-glyph {
			animation: none;
		}
	}
</style>
