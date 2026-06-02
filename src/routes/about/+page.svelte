<script lang="ts">
	import PageShell from '$lib/components/landing/PageShell.svelte';
	import FolderStack from '$lib/components/landing/FolderStack.svelte';
	import TeamBento from '$lib/components/landing/TeamBento.svelte';
	import ContactBody from '$lib/components/landing/ContactBody.svelte';
	import ComingSoon from '$lib/components/landing/ComingSoon.svelte';
	import { aboutFolders } from '$lib/content/about';
</script>

<PageShell target="about" tint="blue">
	<FolderStack folders={aboutFolders}>
		{#snippet body(folder)}
			{#if folder.state === 'soon'}
				<ComingSoon />
			{:else if folder.id === 'teams'}
				<TeamBento />
			{:else if folder.id === 'contact'}
				<ContactBody />
			{/if}
		{/snippet}
	</FolderStack>
</PageShell>
