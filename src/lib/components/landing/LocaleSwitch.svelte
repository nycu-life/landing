<script lang="ts">
	import { base } from '$app/paths';
	import { getTextDirection } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import { localeState } from '$lib/i18n.svelte';

	let current = $derived(localeState.current);
	let hovered: 'zh-tw' | 'en' | null = $state(null);

	/* The designer's paired speech bubbles (static/ui/locale-*.svg): the active language fills
	   blue; hovering the other language previews it in light blue. All four faces stay mounted
	   so swaps never flicker. */
	let face = $derived(
		hovered === 'zh-tw' && current !== 'zh-tw'
			? 'locale-zh-hover'
			: hovered === 'en' && current !== 'en'
				? 'locale-en-hover'
				: current === 'zh-tw'
					? 'locale-zh'
					: 'locale-en'
	);
	const faces = ['locale-zh', 'locale-zh-hover', 'locale-en', 'locale-en-hover'] as const;
	const options = [
		{ code: 'zh-tw' as const, short: m.nav_locale_zh },
		{ code: 'en' as const, short: m.nav_locale_en }
	];

	$effect(() => {
		if (typeof document === 'undefined') return;
		document.documentElement.lang = current;
		document.documentElement.dir = getTextDirection(current);
	});
</script>

<div class="locale" role="group" aria-label={m.nav_locale()}>
	{#each faces as name (name)}
		<img class="locale-face" class:active={face === name} src="{base}/ui/{name}.svg" alt="" />
	{/each}
	{#each options as option (option.code)}
		<button
			type="button"
			class="locale-hit"
			class:hit-zh={option.code === 'zh-tw'}
			class:hit-en={option.code === 'en'}
			aria-pressed={option.code === current}
			onclick={() => {
				localeState.set(option.code);
			}}
			onmouseenter={() => (hovered = option.code)}
			onmouseleave={() => (hovered = null)}
			onfocus={() => (hovered = option.code)}
			onblur={() => (hovered = null)}
		>
			<span class="sr-only">{option.short()}</span>
		</button>
	{/each}
</div>

<style>
	.locale {
		position: relative;
		width: 4.6rem;
		height: 2.75rem;
		flex: 0 0 auto;
	}
	.locale-face {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: contain;
		opacity: 0;
		pointer-events: none;
	}
	.locale-face.active {
		opacity: 1;
	}
	.locale-hit {
		position: absolute;
		top: 0;
		height: 100%;
		padding: 0;
		border: 0;
		background: none;
		cursor: pointer;
	}
	.locale-hit.hit-zh {
		left: 0;
		width: 52%;
	}
	.locale-hit.hit-en {
		right: 0;
		width: 48%;
	}
	.locale-hit:focus-visible {
		outline: 2px solid #36f;
		outline-offset: 2px;
		border-radius: 999px;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		border: 0;
		clip-path: inset(50%);
		overflow: hidden;
		white-space: nowrap;
	}
</style>
