<script lang="ts">
	import { getTextDirection } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import { localeState } from '$lib/i18n.svelte';

	let current = $derived(localeState.current);

	/* Plain segmented control (#105 retired the designer's speech-bubble sticker). */
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
	{#each options as option (option.code)}
		<button
			type="button"
			class="locale-option"
			aria-pressed={option.code === current}
			onclick={() => {
				localeState.set(option.code);
			}}
		>
			{option.short()}
		</button>
	{/each}
</div>

<style>
	.locale {
		display: inline-flex;
		align-items: center;
		flex: 0 0 auto;
		gap: 0.15rem;
		height: 2.5rem;
		padding: 0.2rem;
		border: 1px solid var(--line-strong);
		border-radius: 999px;
		background: var(--surface);
	}
	.locale-option {
		min-width: 2.35rem;
		height: 100%;
		padding: 0 0.7rem;
		border: 0;
		border-radius: 999px;
		background: transparent;
		color: var(--ink-soft);
		font: inherit;
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.02em;
		cursor: pointer;
		transition:
			background-color 0.2s ease,
			color 0.2s ease;
	}
	.locale-option:hover {
		color: var(--brand);
	}
	.locale-option[aria-pressed='true'] {
		background: var(--brand);
		color: #fff;
	}
	:global(:root[data-theme='dark']) .locale-option[aria-pressed='true'] {
		color: #0b1526;
	}
	.locale-option:focus-visible {
		outline: 2px solid var(--brand);
		outline-offset: 2px;
	}
	@media (prefers-reduced-motion: reduce) {
		.locale-option {
			transition: none;
		}
	}
</style>
