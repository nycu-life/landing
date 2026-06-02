<script lang="ts">
	import { comingSoon } from '$lib/content/landing';

	// Honest placeholder for sections that have no real content yet. Swap the
	// host (folder body / route body / product drawer) for a real component when
	// the data arrives — this carries no fabricated information.
	let {
		label = comingSoon.label(),
		body = comingSoon.body()
	}: { label?: string; body?: string } = $props();
</script>

<div class="coming-soon glass" style="border-radius:22px;">
	<span class="coming-soon-dot" aria-hidden="true"></span>
	<p class="coming-soon-label">{label}</p>
	<p class="coming-soon-body">{body}</p>
</div>

<style>
	.coming-soon {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 0.55rem;
		padding: clamp(2rem, 6vw, 3.5rem) clamp(1.25rem, 5vw, 2.5rem);
	}
	.coming-soon-dot {
		width: 0.6rem;
		height: 0.6rem;
		border-radius: 50%;
		background: var(--accent-grad);
		box-shadow: 0 0 12px var(--accent);
		margin-bottom: 0.4rem;
	}
	.coming-soon-label {
		margin: 0;
		font-family: var(--font-display);
		font-size: 0.72rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		font-weight: 700;
		color: var(--brand-ink);
	}
	.coming-soon-body {
		margin: 0;
		max-width: 28rem;
		font-size: 0.95rem;
		line-height: 1.7;
		color: var(--ink-soft);
	}
</style>
