<script lang="ts">
	import { base } from '$app/paths';
	import { useSiteMessages } from '$lib/site/view';
	const m = useSiteMessages();
	import { padEpisode } from '$lib/comics';
	import { episodeLabel, episodeTitle, formatPublished } from '$lib/comics-labels';
	import ComicCover from '$lib/components/landing/ComicCover.svelte';
	import SiteFooter from '$lib/components/landing/SiteFooter.svelte';

	let { data } = $props();

	const episode = $derived(data.episode);
	const title = $derived(episodeTitle(episode.title));
	const label = $derived(episodeLabel(episode.number));
	const pageTitle = $derived(`${label}｜${title}｜${m.comics_title()}｜NYCU LIFE`);
	const description = $derived(episode.excerpt ?? m.comics_lede());
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={description} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={description} />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={description} />
	{#if data.source === 'placeholder'}
		<!-- Placeholder episodes exist only to preview the layout without Ghost. -->
		<meta name="robots" content="noindex" />
	{/if}
</svelte:head>

<div class="page reader-page">
	<a class="back-link" href="{base}/comics/">
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path
				d="M15 18l-6-6 6-6"
				stroke="currentColor"
				stroke-width="2.2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
		{m.comics_back()}
	</a>

	<header class="reader-head">
		<p class="reader-eyebrow">
			<span>{label}</span>
			<span aria-hidden="true">/</span>
			<span>EP.{padEpisode(episode.number)}</span>
			{#if episode.number === data.latestNumber}
				<span class="latest-badge">{m.comics_latest()}</span>
			{/if}
		</p>
		<h1 class="reader-title">{title}</h1>
		{#if episode.publishedAt}
			<p class="reader-date">
				<time datetime={episode.publishedAt}>
					{m.comics_published({ date: formatPublished(episode.publishedAt) })}
				</time>
			</p>
		{/if}
	</header>

	{#if episode.html !== null}
		<!-- Editor-controlled Ghost post HTML (trusted; see src/lib/server/ghost.ts). -->
		<article class="comic-panels" aria-label={`${label}｜${title}`}>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html episode.html}
		</article>
	{:else}
		<div class="comic-panels placeholder-panels">
			<ComicCover number={episode.number} cover={episode.cover} eager />
			<p class="placeholder-note">{m.comics_placeholder_body()}</p>
		</div>
	{/if}

	<nav class="ep-nav" aria-label={m.comics_episode_nav_aria()}>
		{#if data.prev}
			<a class="ep-nav-link prev" href="{base}/comics/{data.prev.slug}/" rel="prev">
				<span class="ep-nav-dir">← {m.comics_prev()}</span>
				<span class="ep-nav-label">{episodeLabel(data.prev.number)}</span>
				<span class="ep-nav-title">{episodeTitle(data.prev.title)}</span>
			</a>
		{:else}
			<span class="ep-nav-spacer"></span>
		{/if}
		{#if data.next}
			<a class="ep-nav-link next" href="{base}/comics/{data.next.slug}/" rel="next">
				<span class="ep-nav-dir">{m.comics_next()} →</span>
				<span class="ep-nav-label">{episodeLabel(data.next.number)}</span>
				<span class="ep-nav-title">{episodeTitle(data.next.title)}</span>
			</a>
		{:else}
			<span class="ep-nav-spacer"></span>
		{/if}
	</nav>
	<p class="ep-nav-all">
		<a href="{base}/comics/">{m.comics_back()}</a>
	</p>
</div>

<SiteFooter />

<style>
	.reader-page {
		max-width: calc(48rem + 2 * var(--gutter));
		background: transparent;
	}
	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		min-height: 2.75rem;
		color: var(--brand);
		font-size: 0.95rem;
		font-weight: 700;
		text-decoration: none;
	}
	.back-link:hover {
		text-decoration: underline;
	}
	.reader-head {
		display: grid;
		gap: 0.6rem;
		margin: 0.75rem 0 clamp(1.5rem, 4vw, 2.25rem);
	}
	.reader-eyebrow {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.25rem 0.5rem;
		margin: 0;
		color: var(--brand);
		font-family: var(--font-display);
		font-size: 0.9rem;
		font-weight: 700;
		letter-spacing: 0.04em;
	}
	.latest-badge {
		margin-left: 0.25rem;
		padding: 0.2rem 0.65rem;
		border-radius: 999px;
		background: var(--brand);
		color: #fff;
		font-family: var(--font-sans);
		font-size: 0.75rem;
		letter-spacing: 0;
	}
	:global(:root[data-theme='dark']) .latest-badge {
		color: #0b1220;
	}
	.reader-title {
		margin: 0;
		color: var(--ink);
		font-size: clamp(1.9rem, 5vw, 2.9rem);
		font-weight: 800;
		line-height: 1.18;
		letter-spacing: -0.02em;
		text-wrap: balance;
		overflow-wrap: anywhere;
	}
	.reader-date {
		margin: 0;
		color: var(--ink-soft);
		font-size: 0.95rem;
	}

	/* Ghost post HTML: panels stacked full-width, readable on a phone. */
	.comic-panels {
		display: grid;
		gap: clamp(0.75rem, 2vw, 1.25rem);
		color: var(--ink);
		font-size: 1.05rem;
		line-height: 1.8;
		overflow-wrap: anywhere;
	}
	.comic-panels :global(*) {
		max-width: 100%;
	}
	.comic-panels :global(p),
	.comic-panels :global(h2),
	.comic-panels :global(h3),
	.comic-panels :global(figure),
	.comic-panels :global(blockquote) {
		margin: 0;
	}
	.comic-panels :global(h2),
	.comic-panels :global(h3) {
		margin-top: 0.75rem;
		line-height: 1.35;
	}
	.comic-panels :global(a) {
		color: var(--brand);
	}
	.comic-panels :global(img) {
		display: block;
		width: 100%;
		height: auto;
		border-radius: 0.75rem;
		background: var(--surface-3);
	}
	.comic-panels :global(figcaption) {
		margin-top: 0.5rem;
		color: var(--ink-soft);
		font-size: 0.875rem;
		text-align: center;
	}
	.comic-panels :global(.kg-gallery-container),
	.comic-panels :global(.kg-gallery-row) {
		display: flex;
		flex-direction: column;
		gap: inherit;
	}
	.comic-panels :global(hr) {
		width: 100%;
		border: 0;
		border-top: 1px solid var(--line);
	}
	.placeholder-panels {
		justify-items: center;
	}
	.placeholder-panels :global(.comic-cover) {
		max-width: 32rem;
	}
	.placeholder-note {
		margin: 0;
		color: var(--ink-soft);
		text-align: center;
	}

	.ep-nav {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
		margin-top: clamp(2.5rem, 6vw, 4rem);
		padding-top: 1.5rem;
		border-top: 1px solid var(--line);
	}
	.ep-nav-link {
		display: grid;
		gap: 0.2rem;
		min-height: 2.75rem;
		padding: 0.9rem 1.1rem;
		border: 1.5px solid var(--line-strong);
		border-radius: 1rem;
		background: var(--surface);
		color: inherit;
		text-decoration: none;
		transition:
			border-color 0.18s ease,
			background-color 0.18s ease;
	}
	.ep-nav-link:hover {
		border-color: var(--brand);
		background: var(--brand-soft);
	}
	.ep-nav-link:focus-visible {
		outline: 3px solid var(--brand);
		outline-offset: 2px;
	}
	.ep-nav-link.next {
		grid-column: 2;
		text-align: right;
	}
	.ep-nav-dir {
		color: var(--brand);
		font-size: 0.85rem;
		font-weight: 700;
	}
	.ep-nav-label {
		color: var(--ink-soft);
		font-size: 0.85rem;
		font-weight: 600;
	}
	.ep-nav-title {
		color: var(--ink);
		font-weight: 700;
		line-height: 1.4;
		overflow-wrap: anywhere;
	}
	.ep-nav-all {
		margin: 1.5rem 0 0;
		text-align: center;
		font-weight: 650;
	}
	.ep-nav-all a {
		color: var(--brand-ink);
	}
	@media (max-width: 560px) {
		.ep-nav {
			grid-template-columns: minmax(0, 1fr);
		}
		.ep-nav-link.next {
			grid-column: 1;
		}
		.ep-nav-spacer {
			display: none;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.ep-nav-link {
			transition: none;
		}
	}
</style>
