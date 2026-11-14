<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { APP_STORE_URL, GOOGLE_PLAY_URL } from '$lib/content/landing';
	import { useSiteMessages } from '$lib/site/view';
	const m = useSiteMessages();

	onMount(() => {
		// iPadOS desktop mode shares the Mac user agent, but supports multitouch.
		if (/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1) {
			location.replace(APP_STORE_URL);
		}
	});
</script>

<svelte:head>
	<title>{m.install_title()} · NYCU LIFE</title>
	<meta name="description" content={m.install_description()} />
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="install-page" aria-labelledby="install-title">
	<div class="install-card">
		<img class="app-icon" src="{base}/apple-touch-icon.png" alt="" />
		<p class="eyebrow">NYCU LIFE</p>
		<h1 id="install-title">{m.install_title()}</h1>
		<p class="description">{m.install_description()}</p>
		<div class="stores">
			<a
				href={GOOGLE_PLAY_URL}
				data-analytics-event="app_download_click"
				data-analytics-source="install"
				data-analytics-platform="android"
			>
				<span class="platform">Android</span>
				<strong>Google Play <span aria-hidden="true">↗</span></strong>
			</a>
			<a
				href={APP_STORE_URL}
				data-analytics-event="app_download_click"
				data-analytics-source="install"
				data-analytics-platform="ios"
			>
				<span class="platform">iPhone / iPad</span>
				<strong>App Store <span aria-hidden="true">↗</span></strong>
			</a>
		</div>
		<a class="home-link" href="{base}/">{m.install_home()}</a>
	</div>
</section>

<style>
	.install-page {
		display: grid;
		place-items: center;
		min-height: 100svh;
		padding: 8rem 1.25rem 4rem;
		background: radial-gradient(ellipse at 50% 20%, var(--brand-soft), transparent 65%);
	}
	.install-card {
		width: min(100%, 42rem);
		padding: clamp(1.5rem, 5vw, 4rem);
		border: 1px solid var(--line);
		border-radius: 2rem;
		background: var(--surface);
		text-align: center;
		color: var(--ink);
	}
	.app-icon {
		width: 5rem;
		height: 5rem;
		border-radius: 1.2rem;
		margin: 0 auto 1.5rem;
	}
	.eyebrow {
		color: var(--brand);
		font-weight: 700;
		letter-spacing: 0.14em;
		font-size: 0.8rem;
	}
	h1 {
		margin: 0.75rem 0;
		font-size: clamp(2rem, 5vw, 3rem);
		line-height: 1.2;
	}
	.description {
		color: var(--ink-soft);
		line-height: 1.8;
		margin: 0 auto;
		max-width: 30rem;
	}
	.stores {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
		margin: 2rem 0;
	}
	.stores a {
		display: grid;
		gap: 0.5rem;
		padding: 1.25rem;
		border: 1px solid var(--line-strong);
		border-radius: 1rem;
		color: var(--ink);
		background: var(--surface-2);
		text-decoration: none;
		text-align: left;
	}
	.stores a:hover {
		border-color: var(--brand);
	}
	.platform {
		font-size: 0.8rem;
		color: var(--ink-soft);
	}
	strong {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		font-size: 1.05rem;
	}
	.home-link {
		color: var(--brand);
		font-size: 0.9rem;
	}
	a:focus-visible {
		outline: 3px solid var(--brand);
		outline-offset: 4px;
	}
	@media (max-width: 480px) {
		.stores {
			grid-template-columns: 1fr;
		}
	}
</style>
