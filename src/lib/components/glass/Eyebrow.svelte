<script lang="ts">
	// Uppercase tracked label used at the top of every screen.
	let { left, right = '' }: { left: string; right?: string } = $props();
</script>

<div class="eyebrow">
	<span>{left}</span>
	{#if right}<span>{right}</span>{/if}
</div>

<style>
	.eyebrow {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		font-size: 0.69rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--muted);
		font-weight: 600;
	}
</style>
