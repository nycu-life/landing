<script lang="ts">
	import { base } from '$app/paths';
	import { useSiteMessages } from '$lib/site/view';
	const m = useSiteMessages();
	import { localeState } from '$lib/i18n.svelte';
	import { formatPublished } from '$lib/comics-labels';
	import SiteFooter from '$lib/components/landing/SiteFooter.svelte';

	let { data } = $props();

	const pageTitle = $derived(`${m.devlog_page_title()}｜NYCU LIFE`);
	const [latest, ...rest] = $derived(data.posts);
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={m.devlog_page_lede()} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={m.devlog_page_lede()} />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={m.devlog_page_lede()} />
	{#if data.source !== 'ghost'}
		<!-- Nothing published yet: keep the empty shell out of the index. -->
		<meta name="robots" content="noindex" />
	{/if}
</svelte:head>

{#snippet meta(post: (typeof data.posts)[number])}
	<span class="post-meta">
		<time datetime={post.publishedAt}>{formatPublished(post.publishedAt)}</time>
		{#if post.readingTime}
			<span aria-hidden="true">/</span>
			<span>{m.devlog_reading_time({ minutes: post.readingTime })}</span>
		{/if}
	</span>
{/snippet}

{#snippet tags(post: (typeof data.posts)[number])}
	{#if post.tags.length}
		<span class="post-tags">
			{#each post.tags as tag (tag.slug)}
				<span class="post-tag">{tag.name}</span>
			{/each}
		</span>
	{/if}
{/snippet}

<div class="page devlog-page">
	<header class="page-head devlog-head">
		<span class="devlog-eyebrow">NYCU LIFE&nbsp;/&nbsp;DEVLOG</span>
		<h1 class="page-title devlog-title">{m.devlog_page_title()}</h1>
		<p class="page-lede">{m.devlog_page_lede()}</p>
		{#if data.posts.length}
			<p class="devlog-count">
				{m.devlog_count({ count: data.posts.length })}
				{#if localeState.current !== 'zh-tw'}
					<span class="language-note">{m.devlog_language_note()}</span>
				{/if}
			</p>
		{/if}
	</header>

	{#if latest}
		<ul class="post-list" aria-label={m.devlog_list_aria()}>
			<li class="post-item post-item-latest">
				<a
					class="post-card post-card-latest"
					href="{base}/devlog/{latest.slug}/"
					aria-label={m.devlog_read_aria({ title: latest.title })}
				>
					<span class="post-cover" class:empty={!latest.cover}>
						{#if latest.cover}
							<img src={latest.cover.src} alt={latest.cover.alt} decoding="async" />
						{:else}
							<span class="post-cover-mark" aria-hidden="true">NYCU LIFE</span>
						{/if}
					</span>
					<span class="post-body">
						{@render meta(latest)}
						<span class="post-title">{latest.title}</span>
						{#if latest.excerpt}<span class="post-excerpt">{latest.excerpt}</span>{/if}
						{@render tags(latest)}
					</span>
				</a>
			</li>
			{#each rest as post (post.slug)}
				<li class="post-item">
					<a
						class="post-card"
						href="{base}/devlog/{post.slug}/"
						aria-label={m.devlog_read_aria({ title: post.title })}
					>
						<span class="post-cover" class:empty={!post.cover}>
							{#if post.cover}
								<img src={post.cover.src} alt={post.cover.alt} loading="lazy" decoding="async" />
							{:else}
								<span class="post-cover-mark" aria-hidden="true">NYCU LIFE</span>
							{/if}
						</span>
						<span class="post-body">
							{@render meta(post)}
							<span class="post-title">{post.title}</span>
							{#if post.excerpt}<span class="post-excerpt">{post.excerpt}</span>{/if}
							{@render tags(post)}
						</span>
					</a>
				</li>
			{/each}
		</ul>
	{:else}
		<section class="devlog-empty" aria-labelledby="devlog-empty-title">
			<h2 id="devlog-empty-title">{m.devlog_empty_title()}</h2>
			<p>{m.devlog_empty_body()}</p>
			<a class="devlog-empty-cta" href="{base}/about/#milestones">{m.devlog_empty_cta()} →</a>
		</section>
	{/if}
</div>

<SiteFooter />

<style>
	.devlog-page {
		background: transparent;
	}
	.devlog-head {
		max-width: 44rem;
		margin-bottom: clamp(1.75rem, 4vw, 3rem);
	}
	.devlog-eyebrow {
		color: var(--brand);
		font-family: var(--font-display);
		font-size: 0.82rem;
		font-weight: 600;
		letter-spacing: 0.2em;
	}
	.devlog-title {
		font-size: clamp(2.2rem, 5.5vw, 3.4rem);
		font-weight: 800;
		line-height: 1.12;
		letter-spacing: -0.02em;
	}
	.devlog-count {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 0.75rem;
		margin: 0;
		color: var(--ink-soft);
		font-family: var(--font-display);
		font-size: 0.95rem;
		font-variant-numeric: tabular-nums;
	}
	.language-note {
		font-family: var(--font-sans);
	}

	.post-list {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 2.25rem 1.5rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.post-item-latest {
		grid-column: 1 / -1;
	}
	.post-card {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		height: 100%;
		border-radius: 1.25rem;
		color: inherit;
		text-decoration: none;
	}
	.post-card-latest {
		display: grid;
		grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
		align-items: center;
		gap: clamp(1.25rem, 3vw, 2.5rem);
	}
	.post-card:focus-visible {
		outline: 3px solid var(--brand);
		outline-offset: 6px;
	}
	.post-cover {
		position: relative;
		display: block;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		border-radius: 1.25rem;
		background: var(--surface-3);
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}
	.post-cover.empty {
		display: grid;
		place-items: center;
		background:
			radial-gradient(circle at 78% 18%, rgba(255, 255, 255, 0.35), transparent 42%),
			linear-gradient(135deg, var(--brand), #4d7fff);
	}
	.post-cover img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.post-cover-mark {
		color: rgba(255, 255, 255, 0.9);
		font-family: var(--font-display);
		font-size: clamp(1rem, 2.5vw, 1.4rem);
		font-weight: 700;
		letter-spacing: 0.18em;
	}
	.post-card:hover .post-cover {
		transform: translateY(-4px);
		box-shadow: 0 16px 36px rgba(11, 31, 92, 0.18);
	}
	:global(:root[data-theme='dark']) .post-card:hover .post-cover {
		box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4);
	}
	.post-body {
		display: grid;
		gap: 0.5rem;
		padding: 0 0.125rem;
	}
	.post-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		color: var(--ink-soft);
		font-size: 0.85rem;
		font-weight: 600;
	}
	.post-title {
		color: var(--ink);
		font-size: 1.2rem;
		font-weight: 750;
		line-height: 1.4;
		overflow-wrap: anywhere;
		text-wrap: pretty;
	}
	.post-card:hover .post-title {
		color: var(--brand);
	}
	.post-card-latest .post-title {
		font-size: clamp(1.45rem, 3vw, 2rem);
		line-height: 1.3;
	}
	.post-excerpt {
		display: -webkit-box;
		overflow: hidden;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		color: var(--ink-soft);
		font-size: 0.95rem;
		line-height: 1.7;
	}
	.post-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-top: 0.15rem;
	}
	.post-tag {
		padding: 0.2rem 0.65rem;
		border-radius: 999px;
		background: var(--brand-soft);
		color: var(--brand);
		font-size: 0.78rem;
		font-weight: 700;
	}

	.devlog-empty {
		display: grid;
		justify-items: start;
		gap: 0.75rem;
		max-width: 40rem;
		padding: clamp(1.5rem, 4vw, 2.5rem);
		border: 1.5px dashed var(--line-strong);
		border-radius: 1.5rem;
		background: var(--surface);
	}
	.devlog-empty h2 {
		margin: 0;
		color: var(--ink);
		font-size: 1.35rem;
	}
	.devlog-empty p {
		margin: 0;
		color: var(--ink-soft);
		line-height: 1.7;
	}
	.devlog-empty-cta {
		color: var(--brand);
		font-weight: 700;
	}

	@media (max-width: 960px) {
		.post-list {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.post-card-latest {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	@media (max-width: 600px) {
		.post-list {
			grid-template-columns: minmax(0, 1fr);
			gap: 2rem;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.post-cover {
			transition: none;
		}
		.post-card:hover .post-cover {
			transform: none;
		}
	}
</style>
