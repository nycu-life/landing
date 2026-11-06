<script lang="ts">
	import SiteFooter from '$lib/components/landing/SiteFooter.svelte';
	let { data } = $props();
</script>

<svelte:head>
	<title>{data.content.title}｜NYCU LIFE</title>
	<meta name="description" content={data.content.excerpt} />
	<meta property="og:title" content={data.content.title} />
	<meta property="og:description" content={data.content.excerpt} />
</svelte:head>
<!-- eslint-disable svelte/no-at-html-tags -->
<article class="page cms-page">
	<h1 class="page-title">{data.content.title}</h1>
	<div class="prose max-w-none">{@html data.content.html}</div>
</article>
<!-- eslint-enable svelte/no-at-html-tags -->
<SiteFooter />

<style>
	.cms-page {
		padding-block: 8rem 5rem;
		max-width: 54rem;
		overflow-wrap: anywhere;
	}
	.cms-page :global(img),
	.cms-page :global(iframe),
	.cms-page :global(video) {
		max-width: 100%;
	}
</style>
