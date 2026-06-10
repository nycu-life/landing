<script lang="ts">
	import DevlogCard from '$lib/components/landing/DevlogCard.svelte';
	import { centerFocus } from '$lib/components/landing/centerFocus';
	import { devLogEntries, menuItems } from '$lib/content/landing';
	import { m } from '$lib/paraglide/messages';

	// The diary opens one entry at a time (per the design's single `expanded` id).
	let expanded = $state<string | null>(null);

	const meta = menuItems.find((i) => i.target === 'devlog')!;
</script>

<svelte:head>
	<title>{meta.label()}｜NYCU LIFE</title>
	<meta name="description" content={meta.desc()} />
</svelte:head>

<div class="page devlog-page">
	<header class="page-head">
		<h1 class="page-title">{m.page_devlog_lead()}<span>{m.page_devlog_accent()}</span></h1>
		<p class="page-lede">{m.devlog_page_lede()}</p>
	</header>

	<div class="devlog-stream" use:centerFocus>
		{#each devLogEntries as entry, i (entry.id)}
			<DevlogCard
				{entry}
				index={i}
				expanded={expanded === entry.id}
				ontoggle={() => (expanded = expanded === entry.id ? null : entry.id)}
			/>
		{/each}

		<p class="devlog-end">{m.devlog_end_note()}</p>
	</div>
</div>

<style>
	/* The diary reads as a narrow centered column, phone-width-first. */
	.devlog-page {
		max-width: 32rem;
	}
	.devlog-stream {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}
	.devlog-end {
		margin: 16px 0 0;
		text-align: center;
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--muted);
	}
</style>
