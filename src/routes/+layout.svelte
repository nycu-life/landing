<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	function getLocalizedPath(locale: (typeof locales)[number]) {
		const pathname = page.url.pathname;
		const routePath = base !== '' && pathname.startsWith(base) ? pathname.slice(base.length) || '/' : pathname;
		return `${base}${localizeHref(routePath, { locale })}`;
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}

<div style="display:none">
	{#each locales as locale}
		<a href={getLocalizedPath(locale)}>{locale}</a>
	{/each}
</div>
