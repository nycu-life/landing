<script lang="ts">
	import type { Snippet } from 'svelte';
	import Aurora, { type AuroraTint } from '$lib/components/glass/Aurora.svelte';
	import Eyebrow from '$lib/components/glass/Eyebrow.svelte';
	import { menuItems, type MenuTarget } from '$lib/content/landing';

	// Shared scaffold for the four burger destinations: aurora backdrop, the
	// localised eyebrow / H1 / lede pulled from `menuItems`, and the page meta.
	let {
		target,
		tint = 'violet',
		children
	}: { target: MenuTarget; tint?: AuroraTint; children?: Snippet } = $props();

	const item = $derived(menuItems.find((i) => i.target === target)!);
</script>

<svelte:head>
	<title>{item.label()}｜NYCU LIFE</title>
	<meta name="description" content={item.desc()} />
</svelte:head>

<Aurora {tint} light />

<div class="page">
	<header class="page-head">
		<Eyebrow left="{item.num} · {item.latin()}" right={item.eyebrowRight} />
		<h1 class="page-title">
			{item.titleLead()}<span class="grad-text">{item.titleAccent()}</span>
		</h1>
		<p class="page-lede">{item.desc()}</p>
	</header>

	{@render children?.()}
</div>

<style>
	/* Destination headings stay solid in the prototype; colour belongs to the field, not the text. */
	.page-title :global(.grad-text) {
		font-style: normal;
		font-weight: 600;
		background: none;
		-webkit-text-fill-color: currentColor;
		color: var(--ink);
	}
	.page-title {
		font-family: var(--font-sans);
		font-weight: 500;
		letter-spacing: -0.03em;
	}
	.page-lede {
		max-width: 34rem;
		font-size: 0.95rem;
		color: var(--ink-soft);
	}
</style>
