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

<Aurora {tint} />

<div class="page">
	<header class="page-head">
		<Eyebrow left="{item.num} · {item.latin()}" right="NYCU LIFE" />
		<h1 class="page-title">{item.label()}</h1>
		<p class="page-lede">{item.desc()}</p>
	</header>

	{@render children?.()}
</div>
