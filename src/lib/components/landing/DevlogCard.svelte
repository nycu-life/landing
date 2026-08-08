<script lang="ts">
	import { productStatusLabel, type DevLogEntry } from '$lib/content/landing';

	let { entry }: { entry: DevLogEntry } = $props();

	const statusLabel = $derived(entry.status === 'done' ? null : productStatusLabel[entry.status]());

	// Abstract cover gradient by status (no fabricated photos).
	const cover: Record<string, string> = {
		done: 'linear-gradient(135deg, #1399e1 0%, #64c5f3 100%)',
		soon: 'linear-gradient(135deg, #7a4bd0 0%, #fbbf24 120%)',
		dev: 'linear-gradient(135deg, #2e2a6e 0%, #8b6bff 100%)'
	};
</script>

<article class="devcard glass glass-strong devcard-{entry.status}" style="border-radius:20px;">
	<div class="devcard-cover" style="background:{cover[entry.status]}">
		<span class="devcard-sheen" aria-hidden="true"></span>
		<span class="devcard-chip">{entry.date()}</span>
	</div>
	<div class="devcard-body">
		<div class="devcard-meta">
			{#if statusLabel}
				<span class="devcard-status">{statusLabel}</span>
			{:else}
				<span class="devcard-status devcard-status-done">已上線</span>
			{/if}
		</div>
		<h3 class="devcard-title">{entry.title()}</h3>
		<p class="devcard-text">{entry.body()}</p>
	</div>
</article>

<style>
	.devcard {
		overflow: hidden;
		position: relative;
	}
	.devcard-cover {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 7;
		overflow: hidden;
	}
	.devcard-sheen {
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, transparent 46%);
	}
	.devcard-chip {
		position: absolute;
		left: 0.85rem;
		bottom: 0.85rem;
		padding: 0.25rem 0.7rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.88);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.18);
		font-family: var(--font-display);
		font-size: 0.66rem;
		letter-spacing: 0.08em;
		font-weight: 600;
		color: var(--brand);
	}
	.devcard-body {
		padding: clamp(1rem, 3vw, 1.4rem);
	}
	.devcard-meta {
		margin-bottom: 0.5rem;
	}
	.devcard-status {
		display: inline-block;
		padding: 0.15rem 0.6rem;
		border-radius: 999px;
		font-size: 0.66rem;
		font-weight: 700;
		letter-spacing: 0.02em;
		border: 1px solid var(--line);
		color: var(--ink-soft);
	}
	.devcard-status-done {
		color: var(--ok);
		background: var(--ok-soft);
		border-color: color-mix(in srgb, var(--ok) 40%, transparent);
	}
	.devcard-soon .devcard-status {
		color: var(--amber-ink);
		background: var(--amber-soft);
		border-color: color-mix(in srgb, var(--amber) 40%, transparent);
	}
	.devcard-dev .devcard-status {
		color: var(--brand-ink);
		background: var(--brand-soft);
		border-color: color-mix(in srgb, var(--brand) 40%, transparent);
	}
	.devcard-title {
		margin: 0 0 0.45rem;
		font-size: 1.2rem;
		font-weight: 800;
		letter-spacing: -0.02em;
		line-height: 1.3;
		color: var(--ink);
	}
	.devcard-text {
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.65;
		color: var(--ink-soft);
	}
</style>
