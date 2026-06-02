<script lang="ts">
	import { productStatusLabel, type DevLogEntry } from '$lib/content/landing';

	let { entry }: { entry: DevLogEntry } = $props();

	// 'done' reuses the live label styling; soon/dev map to their product labels.
	const statusLabel = $derived(entry.status === 'done' ? null : productStatusLabel[entry.status]());
</script>

<article class="devcard glass glass-strong devcard-{entry.status}" style="border-radius:20px;">
	<span class="devcard-accent" aria-hidden="true"></span>
	<div class="devcard-meta">
		<span class="devcard-date">{entry.date()}</span>
		{#if statusLabel}
			<span class="devcard-status">{statusLabel}</span>
		{/if}
	</div>
	<h3 class="devcard-title">{entry.title()}</h3>
	<p class="devcard-body">{entry.body()}</p>
</article>

<style>
	.devcard {
		position: relative;
		padding: clamp(1.1rem, 3vw, 1.5rem) clamp(1.2rem, 3vw, 1.6rem) clamp(1.1rem, 3vw, 1.5rem)
			clamp(1.4rem, 3.5vw, 1.9rem);
		overflow: hidden;
	}
	.devcard-accent {
		position: absolute;
		left: 0;
		top: 14px;
		bottom: 14px;
		width: 3px;
		border-radius: 3px;
	}
	.devcard-done .devcard-accent {
		background: var(--ok);
		box-shadow: 0 0 12px var(--ok);
	}
	.devcard-soon .devcard-accent {
		background: var(--amber);
		box-shadow: 0 0 12px var(--amber);
	}
	.devcard-dev .devcard-accent {
		background: var(--accent-grad);
	}
	.devcard-meta {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-bottom: 0.4rem;
	}
	.devcard-date {
		font-family: var(--font-display);
		font-size: 0.68rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		font-weight: 700;
		color: var(--muted);
	}
	.devcard-status {
		padding: 0.15rem 0.55rem;
		border-radius: 999px;
		font-size: 0.66rem;
		font-weight: 700;
		border: 1px solid var(--line);
		color: var(--ink-soft);
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
		font-size: 1.15rem;
		font-weight: 700;
		letter-spacing: -0.015em;
		line-height: 1.3;
		color: var(--ink);
	}
	.devcard-body {
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.65;
		color: var(--ink-soft);
	}
</style>
