<script lang="ts">
	import type { NavItem } from '$lib/content/landing';
	import { getLocale, setLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';

	let { items, label } = $props<{ items: NavItem[]; label: string }>();

	const current = getLocale();

	const localeOptions = [
		{ code: 'zh-tw' as const, short: m.nav_locale_zh() },
		{ code: 'en' as const, short: m.nav_locale_en() }
	];
</script>

<nav aria-label={label} class="site-nav">
	<ul class="site-nav-links">
		{#each items as item (item.id)}
			<li>
				<a href={`#${item.id}`}>{item.label()}</a>
			</li>
		{/each}
	</ul>

	<div class="site-nav-locale" role="group" aria-label={m.nav_locale()}>
		{#each localeOptions as option (option.code)}
			<button
				type="button"
				class="site-nav-locale-btn"
				class:site-nav-locale-active={option.code === current}
				aria-pressed={option.code === current}
				onclick={() => setLocale(option.code)}
			>
				{option.short}
			</button>
		{/each}
	</div>
</nav>
