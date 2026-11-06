<script lang="ts">
	import { base } from '$app/paths';
	import { useSiteMessages } from '$lib/site/view';
	const m = useSiteMessages();
	import { formatPublished } from '$lib/comics-labels';
	import SiteFooter from '$lib/components/landing/SiteFooter.svelte';

	let { data } = $props();

	const post = $derived(data.post);
	const pageTitle = $derived(`${post.title}｜${m.devlog_page_title()}｜NYCU LIFE`);
	const description = $derived(post.excerpt ?? m.devlog_page_lede());
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={description} />
	<meta property="og:type" content="article" />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={description} />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={description} />
	<meta property="article:published_time" content={post.publishedAt} />
</svelte:head>

<div class="page article-page">
	<a class="back-link" href="{base}/devlog/">
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path
				d="M15 18l-6-6 6-6"
				stroke="currentColor"
				stroke-width="2.2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
		{m.devlog_back()}
	</a>

	<article lang="zh-Hant-TW">
		<header class="article-head">
			<p class="article-meta">
				<time datetime={post.publishedAt}>{formatPublished(post.publishedAt)}</time>
				{#if post.readingTime}
					<span aria-hidden="true">·</span>
					<span>{m.devlog_reading_time({ minutes: post.readingTime })}</span>
				{/if}
			</p>
			<h1 class="article-title">{post.title}</h1>
			{#if post.excerpt}<p class="article-lede">{post.excerpt}</p>{/if}
			{#if post.tags.length}
				<p class="article-tags">
					{#each post.tags as tag (tag.slug)}
						<span class="article-tag">{tag.name}</span>
					{/each}
				</p>
			{/if}
		</header>

		{#if post.cover}
			<img class="article-cover" src={post.cover.src} alt={post.cover.alt} decoding="async" />
		{/if}

		<!-- Editor-controlled Ghost post HTML (trusted; see src/lib/server/ghost.ts). -->
		<div class="prose">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html post.html}
		</div>
	</article>

	<nav class="post-nav" aria-label={m.devlog_post_nav_aria()}>
		{#if data.newer}
			<a class="post-nav-link" href="{base}/devlog/{data.newer.slug}/" rel="prev">
				<span class="post-nav-dir">← {m.devlog_newer()}</span>
				<span class="post-nav-title">{data.newer.title}</span>
			</a>
		{:else}
			<span class="post-nav-spacer"></span>
		{/if}
		{#if data.older}
			<a class="post-nav-link older" href="{base}/devlog/{data.older.slug}/" rel="next">
				<span class="post-nav-dir">{m.devlog_older()} →</span>
				<span class="post-nav-title">{data.older.title}</span>
			</a>
		{:else}
			<span class="post-nav-spacer"></span>
		{/if}
	</nav>
	<p class="post-nav-all">
		<a href="{base}/devlog/">{m.devlog_back()}</a>
	</p>
</div>

<SiteFooter />

<style>
	.article-page {
		max-width: calc(46rem + 2 * var(--gutter));
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
	.article-head {
		display: grid;
		gap: 0.75rem;
		margin: 0.75rem 0 clamp(1.5rem, 4vw, 2.25rem);
	}
	.article-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin: 0;
		color: var(--brand);
		font-size: 0.9rem;
		font-weight: 700;
	}
	.article-title {
		margin: 0;
		color: var(--ink);
		font-size: clamp(1.9rem, 5vw, 2.75rem);
		font-weight: 800;
		line-height: 1.22;
		letter-spacing: -0.015em;
		text-wrap: balance;
		overflow-wrap: anywhere;
	}
	.article-lede {
		margin: 0;
		color: var(--ink-soft);
		font-size: 1.1rem;
		line-height: 1.75;
	}
	.article-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin: 0;
	}
	.article-tag {
		padding: 0.2rem 0.65rem;
		border-radius: 999px;
		background: var(--brand-soft);
		color: var(--brand);
		font-size: 0.8rem;
		font-weight: 700;
	}
	.article-cover {
		display: block;
		width: 100%;
		height: auto;
		margin-bottom: clamp(1.75rem, 4vw, 2.5rem);
		border-radius: 1.25rem;
		background: var(--surface-3);
	}

	/* Ghost post HTML (Koenig cards included), tuned for long-form reading. */
	.prose {
		color: var(--ink);
		font-size: 1.07rem;
		line-height: 1.9;
		overflow-wrap: anywhere;
	}
	.prose :global(*) {
		max-width: 100%;
	}
	.prose :global(> * + *) {
		margin-top: 1.15em;
	}
	.prose :global(p),
	.prose :global(ul),
	.prose :global(ol),
	.prose :global(figure),
	.prose :global(blockquote),
	.prose :global(pre),
	.prose :global(h2),
	.prose :global(h3),
	.prose :global(h4) {
		margin-bottom: 0;
	}
	.prose :global(h2),
	.prose :global(h3),
	.prose :global(h4) {
		margin-top: 1.9em;
		color: var(--ink);
		line-height: 1.4;
	}
	.prose :global(h2) {
		font-size: 1.5rem;
	}
	.prose :global(h3) {
		font-size: 1.22rem;
	}
	.prose :global(a) {
		color: var(--brand);
		text-decoration: underline;
		text-underline-offset: 0.18em;
	}
	.prose :global(ul),
	.prose :global(ol) {
		padding-left: 1.4em;
	}
	.prose :global(li + li) {
		margin-top: 0.35em;
	}
	.prose :global(blockquote) {
		margin-inline: 0;
		padding: 0.25em 0 0.25em 1.1em;
		border-left: 3px solid var(--brand);
		color: var(--ink-soft);
	}
	.prose :global(code) {
		padding: 0.12em 0.4em;
		border-radius: 0.35rem;
		background: var(--surface-3);
		font-size: 0.9em;
	}
	.prose :global(pre) {
		overflow-x: auto;
		padding: 1rem 1.15rem;
		border-radius: 0.9rem;
		background: var(--surface-3);
		line-height: 1.6;
	}
	.prose :global(pre code) {
		padding: 0;
		background: none;
	}
	.prose :global(figure) {
		margin-inline: 0;
	}
	.prose :global(img) {
		display: block;
		width: 100%;
		height: auto;
		border-radius: 0.9rem;
		background: var(--surface-3);
	}
	.prose :global(figcaption) {
		margin-top: 0.5rem;
		color: var(--ink-soft);
		font-size: 0.875rem;
		text-align: center;
	}
	.prose :global(hr) {
		width: 100%;
		border: 0;
		border-top: 1px solid var(--line);
	}
	.prose :global(.kg-gallery-container),
	.prose :global(.kg-gallery-row) {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.prose :global(.kg-callout-card) {
		display: flex;
		gap: 0.75rem;
		padding: 1rem 1.15rem;
		border-radius: 0.9rem;
		background: var(--brand-soft);
	}
	.prose :global(.kg-bookmark-card a) {
		display: block;
		padding: 1rem;
		border: 1px solid var(--line-strong);
		border-radius: 0.9rem;
		text-decoration: none;
	}
	.prose :global(.kg-bookmark-thumbnail),
	.prose :global(.kg-bookmark-icon) {
		display: none;
	}
	.prose :global(table) {
		display: block;
		overflow-x: auto;
		border-collapse: collapse;
	}
	.prose :global(th),
	.prose :global(td) {
		padding: 0.45rem 0.75rem;
		border: 1px solid var(--line);
	}

	.post-nav {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
		margin-top: clamp(2.5rem, 6vw, 4rem);
		padding-top: 1.5rem;
		border-top: 1px solid var(--line);
	}
	.post-nav-link {
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
	.post-nav-link:hover {
		border-color: var(--brand);
		background: var(--brand-soft);
	}
	.post-nav-link:focus-visible {
		outline: 3px solid var(--brand);
		outline-offset: 2px;
	}
	.post-nav-link.older {
		grid-column: 2;
		text-align: right;
	}
	.post-nav-dir {
		color: var(--brand);
		font-size: 0.85rem;
		font-weight: 700;
	}
	.post-nav-title {
		color: var(--ink);
		font-weight: 700;
		line-height: 1.4;
		overflow-wrap: anywhere;
	}
	.post-nav-all {
		margin: 1.5rem 0 0;
		text-align: center;
		font-weight: 650;
	}
	.post-nav-all a {
		color: var(--brand-ink);
	}
	@media (max-width: 560px) {
		.post-nav {
			grid-template-columns: minmax(0, 1fr);
		}
		.post-nav-link.older {
			grid-column: 1;
		}
		.post-nav-spacer {
			display: none;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.post-nav-link {
			transition: none;
		}
	}
</style>
