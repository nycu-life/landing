<script lang="ts">
	import { base } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import { episodeLabel, episodeTitle } from '$lib/comics-labels';
	import ComicCover from '$lib/components/landing/ComicCover.svelte';
	import SiteFooter from '$lib/components/landing/SiteFooter.svelte';

	let { data } = $props();

	// Prerendered oldest-first; the toggle only reorders on the client.
	let newestFirst = $state(false);
	const episodes = $derived(newestFirst ? [...data.episodes].reverse() : data.episodes);
	const latestNumber = $derived(data.episodes.at(-1)?.number);
	const orderLabel = $derived(newestFirst ? m.comics_sort_newest() : m.comics_sort_oldest());
	const pageTitle = $derived(`${m.comics_title()}｜NYCU LIFE`);
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={m.comics_lede()} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={m.comics_lede()} />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={m.comics_lede()} />
</svelte:head>

<div id="comics" class="page comics-page">
	<div class="comics-head">
		<header class="page-head">
			<span class="comics-eyebrow">NYCU LIFE&nbsp;·&nbsp;COMICS</span>
			<h1 class="page-title comics-title">{m.comics_title()}</h1>
			<p class="page-lede">{m.comics_lede()}</p>
		</header>
		<div class="comics-tools">
			<p class="comics-count">{m.comics_count({ count: data.episodes.length })}</p>
			<button
				type="button"
				class="sort-btn"
				aria-label={m.comics_sort_aria({ order: orderLabel })}
				aria-controls="comics-grid"
				onclick={() => (newestFirst = !newestFirst)}
			>
				<svg
					class:flipped={newestFirst}
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M3 8l4-4 4 4" />
					<path d="M7 4v16" />
					<path d="M11 12h4" />
					<path d="M11 16h7" />
					<path d="M11 20h10" />
				</svg>
				<span>{orderLabel}</span>
			</button>
		</div>
	</div>

	<ul id="comics-grid" class="ep-grid" aria-label={m.comics_list_aria()}>
		{#each episodes as episode (episode.slug)}
			{@const label = episodeLabel(episode.number)}
			{@const title = episodeTitle(episode.title)}
			<li>
				<a
					class="ep-card"
					href="{base}/comics/{episode.slug}/"
					aria-label={m.comics_read_aria({ label, title })}
				>
					<div class="ep-art">
						<ComicCover number={episode.number} cover={episode.cover} />
						{#if episode.number === latestNumber}
							<span class="latest-badge">{m.comics_latest()}</span>
						{/if}
					</div>
					<span class="ep-meta">
						<span class="ep-label">{label}</span>
						<span class="ep-title">{title}</span>
					</span>
				</a>
			</li>
		{/each}
	</ul>
</div>

<SiteFooter />

<style>
	.comics-page {
		background: transparent;
	}
	.comics-head {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1.25rem 1.5rem;
		margin-bottom: clamp(1.75rem, 4vw, 3rem);
	}
	.comics-head .page-head {
		max-width: 40rem;
		margin-bottom: 0;
	}
	.comics-eyebrow {
		color: var(--brand);
		font-family: var(--font-display);
		font-size: 0.82rem;
		font-weight: 600;
		letter-spacing: 0.2em;
	}
	.comics-title {
		font-size: clamp(2.2rem, 5.5vw, 3.4rem);
		font-weight: 800;
		line-height: 1.12;
		letter-spacing: -0.02em;
		text-wrap: balance;
	}
	.comics-tools {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 1rem;
	}
	.comics-count {
		margin: 0;
		color: var(--ink-soft);
		font-family: var(--font-display);
		font-size: 0.95rem;
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}
	.sort-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 2.75rem;
		padding: 0 1rem;
		border: 1.5px solid var(--line-strong);
		border-radius: 999px;
		background: var(--surface);
		color: var(--brand);
		font: inherit;
		font-size: 0.9rem;
		font-weight: 700;
		cursor: pointer;
		transition:
			background-color 0.18s ease,
			border-color 0.18s ease;
	}
	.sort-btn:hover {
		border-color: var(--brand);
		background: var(--brand-soft);
	}
	.sort-btn:focus-visible {
		outline: 3px solid var(--brand);
		outline-offset: 2px;
	}
	.sort-btn svg {
		flex: none;
		transition: transform 0.2s var(--ease-out);
	}
	.sort-btn svg.flipped {
		transform: scaleY(-1);
	}

	.ep-grid {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 2.5rem 1.5rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	@media (max-width: 960px) {
		.ep-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 560px) {
		.ep-grid {
			grid-template-columns: minmax(0, 1fr);
			gap: 2rem;
		}
	}
	.ep-card {
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
		border-radius: 1rem;
		color: inherit;
		text-decoration: none;
	}
	.ep-card:focus-visible {
		outline: 3px solid var(--brand);
		outline-offset: 6px;
	}
	.ep-art {
		position: relative;
		border-radius: 1rem;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}
	.ep-card:hover .ep-art {
		transform: translateY(-4px);
		box-shadow: 0 16px 36px rgba(11, 31, 92, 0.18);
	}
	:global(:root[data-theme='dark']) .ep-card:hover .ep-art {
		box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4);
	}
	.latest-badge {
		position: absolute;
		top: 0.75rem;
		left: 0.75rem;
		padding: 0.3rem 0.75rem;
		border-radius: 999px;
		background: var(--brand);
		color: #fff;
		font-size: 0.8rem;
		font-weight: 700;
		box-shadow: 0 4px 12px rgba(0, 69, 242, 0.3);
	}
	:global(:root[data-theme='dark']) .latest-badge {
		color: #0b1220;
	}
	.ep-meta {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0 0.125rem;
	}
	.ep-label {
		color: var(--brand);
		font-size: 0.875rem;
		font-weight: 700;
	}
	.ep-title {
		color: var(--ink);
		font-size: 1.125rem;
		font-weight: 700;
		line-height: 1.4;
		overflow-wrap: anywhere;
	}
	@media (prefers-reduced-motion: reduce) {
		.ep-art,
		.sort-btn svg {
			transition: none;
		}
		.ep-card:hover .ep-art {
			transform: none;
		}
	}
</style>
