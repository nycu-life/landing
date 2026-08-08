<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { AboutFolder } from '$lib/content/about';

	let { folders, body }: { folders: AboutFolder[]; body: Snippet<[AboutFolder]> } = $props();

	let openIdx = $state<number | null>(null);
	const toggle = (i: number) => (openIdx = openIdx === i ? null : i);
</script>

<div class="folder-stack">
	{#each folders as folder, i (folder.id)}
		<section
			class="folder"
			class:open={openIdx === i}
			class:last={i === folders.length - 1}
			style="--accent:{folder.accent}; z-index:{openIdx === i ? 50 : i + 1};"
		>
			<span class="folder-glow" aria-hidden="true"></span>
			<button class="folder-tab" aria-expanded={openIdx === i} onclick={() => toggle(i)}>
				<span class="folder-tab-text">
					<span class="folder-meta">
						<span class="folder-num">{folder.num}</span>
						<span class="folder-latin">{folder.latin()}</span>
					</span>
					<span class="folder-title">{folder.title()}</span>
				</span>
				<span class="folder-chevron" class:open={openIdx === i} aria-hidden="true">
					<svg
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M6 9l6 6 6-6" />
					</svg>
				</span>
			</button>
			<div class="folder-body" class:open={openIdx === i}>
				<div class="folder-body-inner">
					{@render body(folder)}
				</div>
			</div>
		</section>
	{/each}
</div>

<style>
	.folder-stack {
		display: block;
	}
	.folder {
		position: relative;
		background: rgba(255, 255, 255, 0.92);
		backdrop-filter: var(--blur);
		-webkit-backdrop-filter: var(--blur);
		border: 1px solid var(--line);
		border-bottom: none;
		border-radius: 22px 22px 0 0;
		box-shadow: var(--shadow);
		overflow: hidden;
	}
	.folder:not(:first-child) {
		margin-top: -16px;
	}
	.folder.last {
		border-bottom: 1px solid var(--line);
		border-radius: 22px;
	}
	.folder-glow {
		position: absolute;
		top: -40px;
		left: -20px;
		width: 220px;
		height: 120px;
		background: radial-gradient(circle at 30% 50%, var(--accent) 0%, transparent 70%);
		opacity: 0.33;
		filter: blur(8px);
		pointer-events: none;
	}
	.folder-tab {
		position: relative;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: clamp(1.1rem, 3vw, 1.4rem) clamp(1.25rem, 3.5vw, 1.6rem);
		background: transparent;
		text-align: left;
		cursor: pointer;
		color: var(--ink);
	}
	.folder-tab-text {
		display: grid;
		gap: 0.2rem;
	}
	.folder-meta {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
	}
	.folder-num {
		font-family: var(--font-display);
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		color: var(--accent);
	}
	.folder-latin {
		font-family: var(--font-display);
		font-size: 0.6rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.folder-title {
		font-size: clamp(1.4rem, 4vw, 1.85rem);
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1.1;
	}
	.folder-chevron {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 38px;
		height: 38px;
		border-radius: 50%;
		border: 1px solid var(--line);
		background: var(--surface-2);
		color: var(--ink);
		flex-shrink: 0;
		transition:
			transform 0.35s ease,
			background 0.35s ease,
			color 0.35s ease;
	}
	.folder-chevron.open {
		transform: rotate(180deg);
		background: var(--brand);
		color: #fff;
	}
	.folder-body {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows 0.55s var(--ease-app);
	}
	.folder-body.open {
		grid-template-rows: 1fr;
	}
	.folder-body-inner {
		min-height: 0;
		overflow: hidden;
	}
	.folder-body.open .folder-body-inner {
		padding: 0 clamp(1.25rem, 3.5vw, 1.6rem) clamp(1.5rem, 4vw, 2rem);
	}

	@media (prefers-reduced-motion: reduce) {
		.folder-body {
			transition: none;
		}
		.folder-chevron {
			transition: none;
		}
	}
</style>
