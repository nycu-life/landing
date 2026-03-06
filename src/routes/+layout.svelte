<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { baseLocale, deLocalizeHref, locales } from '$lib/paraglide/runtime';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	function normalizeRoutePath(path: string) {
		if (path === '/') return '/';
		return path.endsWith('/') ? path : `${path}/`;
	}

	function getLocalizedPath(locale: (typeof locales)[number]) {
		const pathname = page.url.pathname;
		const routePath =
			base !== '' && pathname.startsWith(base) ? pathname.slice(base.length) || '/' : pathname;
		const canonicalPath = normalizeRoutePath(deLocalizeHref(routePath));
		const localizedPath =
			locale === baseLocale
				? canonicalPath
				: `/${locale}${canonicalPath === '/' ? '/' : canonicalPath}`;

		return `${base}${localizedPath}`;
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}

<div style="display:none">
	{#each locales as locale}
		<a href={getLocalizedPath(locale)}>{locale}</a>
	{/each}
</div>
