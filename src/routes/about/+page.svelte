<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { menuItems } from '$lib/content/landing';
	import { aboutFolders, aboutLede } from '$lib/content/about';
	import FolderStack from '$lib/components/landing/FolderStack.svelte';
	import TimelineBody from '$lib/components/landing/TimelineBody.svelte';
	import TeamBento from '$lib/components/landing/TeamBento.svelte';
	import FaqBody from '$lib/components/landing/FaqBody.svelte';
	import ContactBody from '$lib/components/landing/ContactBody.svelte';

	const meta = menuItems.find((i) => i.target === 'about')!;
</script>

<svelte:head>
	<title>{meta.label()}｜NYCU LIFE</title>
	<meta name="description" content={meta.desc()} />
</svelte:head>

<div class="page">
	<header class="page-head">
		<h1 class="page-title">{m.page_about_lead()}<span>{m.page_about_accent()}</span></h1>
		{#each aboutLede as line, i (i)}
			<p class="page-lede">{line()}</p>
		{/each}
	</header>

	<div class="folder-wrap">
		<FolderStack folders={aboutFolders}>
			{#snippet body(folder)}
				{#if folder.id === 'timeline'}
					<TimelineBody />
				{:else if folder.id === 'teams'}
					<TeamBento />
				{:else if folder.id === 'faq'}
					<FaqBody />
				{:else if folder.id === 'contact'}
					<ContactBody />
				{/if}
			{/snippet}
		</FolderStack>
	</div>
</div>

<style>
	.page-title span {
		color: #fff;
	}
	/* Keep the stack at a comfortable reading width on wide viewports. */
	.folder-wrap {
		max-width: 46rem;
	}
</style>
