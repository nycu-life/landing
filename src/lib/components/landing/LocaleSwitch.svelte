<script lang="ts">
	import { getLocale, setLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';

	let { tone = 'glass' }: { tone?: 'glass' | 'menu' } = $props();

	const current = getLocale();
	const options = [
		{ code: 'zh-tw' as const, short: m.nav_locale_zh() },
		{ code: 'en' as const, short: m.nav_locale_en() }
	];
</script>

<div class="locale" class:menu={tone === 'menu'} role="group" aria-label={m.nav_locale()}>
	{#each options as option (option.code)}
		<button
			type="button"
			class="locale-btn"
			class:active={option.code === current}
			aria-pressed={option.code === current}
			onclick={() => setLocale(option.code)}
		>
			{option.short}
		</button>
	{/each}
</div>

<style>
	.locale {
		display: inline-flex;
		gap: 0.15rem;
		padding: 0.2rem;
		border-radius: 999px;
		border: 1px solid var(--line);
		background: var(--glass);
		backdrop-filter: var(--blur-soft);
		-webkit-backdrop-filter: var(--blur-soft);
	}
	.locale.menu {
		border-color: rgba(255, 255, 255, 0.22);
		background: rgba(255, 255, 255, 0.08);
	}
	.locale-btn {
		min-width: 2rem;
		border-radius: 999px;
		padding: 0.3rem 0.6rem;
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--muted);
		cursor: pointer;
		transition:
			background-color 0.2s ease,
			color 0.2s ease;
	}
	.locale.menu .locale-btn {
		color: rgba(255, 255, 255, 0.7);
	}
	.locale-btn.active {
		background: var(--accent-grad);
		color: #0c1230;
	}
</style>
