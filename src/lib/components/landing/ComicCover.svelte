<script lang="ts">
	import { padEpisode, type ComicImage } from '$lib/comics';

	let {
		number,
		cover,
		eager = false
	}: { number: number; cover: ComicImage | null; eager?: boolean } = $props();
</script>

<!-- 1:1 episode cover. Without a Ghost feature image it renders the design's CSS placeholder. -->
<div class="comic-cover" class:is-placeholder={!cover}>
	{#if cover}
		<img
			src={cover.src}
			alt={cover.alt}
			width={cover.width ?? 1080}
			height={cover.height ?? 1080}
			loading={eager ? 'eager' : 'lazy'}
			decoding="async"
		/>
	{:else}
		<span class="cover-orb" aria-hidden="true"></span>
		<span class="cover-dot" aria-hidden="true"></span>
		<span class="cover-mark" aria-hidden="true">EP.{padEpisode(number)}</span>
	{/if}
</div>

<style>
	.comic-cover {
		--cover-bg: #e3ebff;
		--cover-orb: #ccdbff;
		--cover-dot: #4d7fff;
		--cover-ink: var(--brand);
		position: relative;
		width: 100%;
		aspect-ratio: 1 / 1;
		overflow: hidden;
		border-radius: 1rem;
		background: var(--cover-bg);
		container-type: inline-size;
	}
	:global(:root[data-theme='dark']) .comic-cover {
		--cover-bg: #1a2a45;
		--cover-orb: #233a63;
		--cover-dot: #5f8cff;
	}
	.comic-cover img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.cover-orb {
		position: absolute;
		top: -18%;
		right: -18%;
		width: 70%;
		height: 70%;
		border-radius: 50%;
		background: var(--cover-orb);
	}
	.cover-dot {
		position: absolute;
		bottom: 12%;
		left: 10%;
		width: 16%;
		height: 16%;
		border-radius: 50%;
		background: var(--cover-dot);
	}
	.cover-mark {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		font-family: var(--font-display);
		font-size: clamp(1.75rem, 16cqi, 7rem);
		font-weight: 700;
		line-height: 1;
		letter-spacing: -0.01em;
		color: var(--cover-ink);
	}
</style>
