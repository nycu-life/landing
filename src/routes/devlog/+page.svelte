<script lang="ts">
	import PageShell from '$lib/components/landing/PageShell.svelte';
	import DevlogCard from '$lib/components/landing/DevlogCard.svelte';
	import { reveal } from '$lib/components/landing/scroll';
	import { devLogEntries } from '$lib/content/landing';
</script>

<PageShell target="devlog" tint="magenta">
	<div class="devlog-stream">
		{#each devLogEntries as entry, i (entry.id)}
			<div class="reveal" use:reveal={{ delay: i * 70 }}>
				<DevlogCard {entry} />
			</div>
		{/each}
	</div>
</PageShell>

<style>
	.devlog-stream {
		display: grid;
		gap: clamp(0.9rem, 2.2vw, 1.25rem);
		max-width: 44rem;
	}
</style>
