<script lang="ts">
	import PageShell from '$lib/components/landing/PageShell.svelte';

	const stories = [
		{
			meta: '本月專題 · 8 MIN READ',
			title: '我們如何打造 NYCU LIFE',
			excerpt: '從一次校園觀察，到真正被學生使用的產品。'
		},
		{
			meta: '設計觀察 · 6 MIN READ',
			title: '從校園問題開始設計',
			excerpt: '不是增加更多功能，而是更靠近使用者。'
		}
	];
	const latest = [
		['產品與設計 · 2026.07.18', 'Syllabus Box 功能升級'],
		['產品與設計 · 2026.07.17', 'Shuttle Bus 新增路線'],
		['產品與設計 · 2026.07.16', '開發週記 #12'],
		['產品與設計 · 2026.07.15', '產品設計小記'],
		['團隊日常 · 2026.07.14', '團隊開發日常'],
		['產品與設計 · 2026.07.13', 'Bulletin Box 改版']
	];
</script>

<PageShell target="devlog" tint="blue">
	<section class="feature-grid" aria-label="Featured stories">
		{#each stories as story (story.title)}
			<article class="feature-card">
				<div class="cover">
					<span class="diamond" aria-hidden="true"></span><span>FEATURE STORY</span>
				</div>
				<p>{story.meta}</p>
				<h2>{story.title}</h2>
				<span>{story.excerpt}</span>
			</article>
		{/each}
	</section>

	<div class="pager" aria-label="故事頁數"><span></span><span></span><span></span></div>

	<section class="story-section" aria-labelledby="latest-title">
		<div class="section-rule"><span id="latest-title">最新文章</span></div>
		<div class="latest-grid">
			{#each latest as item, i (item[1])}
				<article class="latest-card">
					<div class="cover">
						<span class="story-number">STORY {String(i + 1).padStart(2, '0')}</span><span
							class="diamond"
							aria-hidden="true"
						></span>
					</div>
					<p>{item[0]}</p>
					<h3>{item[1]}</h3>
					<span>記錄這次迭代後的問題與選擇。</span>
					<a href="/devlog/">READ MORE ↗</a>
				</article>
			{/each}
		</div>
		<button class="more-button" type="button">載入更多文章</button>
	</section>

	<section class="popular" aria-labelledby="popular-title">
		<div class="section-rule"><span id="popular-title">熱門文章</span></div>
		<div class="popular-grid">
			{#each latest.slice(0, 3) as item, i (item[1])}
				<article>
					<div class="cover">
						<span>{String(i + 1).padStart(2, '0')}</span><span class="diamond" aria-hidden="true"
						></span><small>MOST READ</small>
					</div>
					<h3>{item[1]}</h3>
					<p>本月熱門閱讀 ↗</p>
				</article>
			{/each}
		</div>
	</section>
</PageShell>

<style>
	.feature-grid,
	.latest-grid,
	.popular-grid {
		display: grid;
		gap: 1rem;
	}
	.feature-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
	.feature-card,
	.latest-card,
	.popular article {
		min-width: 0;
	}
	.cover {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		background: linear-gradient(135deg, var(--course-start) 0%, var(--accent) 100%);
		color: rgba(255, 255, 255, 0.9);
		font-family: var(--font-display);
		font-size: 0.5rem;
		letter-spacing: 0.16em;
	}
	.cover::before,
	.cover::after {
		content: '';
		position: absolute;
		width: 140%;
		height: 1px;
		background: rgba(255, 255, 255, 0.45);
		transform: rotate(27deg);
	}
	.cover::after {
		transform: rotate(-27deg);
	}
	.diamond {
		position: relative;
		z-index: 1;
		width: 0.9rem;
		height: 0.9rem;
		border: 2px solid #fff;
		transform: rotate(45deg);
	}
	.feature-card .cover {
		aspect-ratio: 1.72 / 1;
		border-radius: 0.9rem;
	}
	.feature-card .cover span:last-child {
		position: absolute;
		bottom: 1rem;
	}
	.feature-card > p,
	.latest-card > p {
		margin: 1rem 0 0;
		font-family: var(--font-display);
		font-size: 0.68rem;
		letter-spacing: 0.12em;
		color: var(--brand-ink);
	}
	.feature-card h2 {
		margin: 0.7rem 0 0.35rem;
		font-size: clamp(1.45rem, 3vw, 2.1rem);
		font-weight: 500;
		letter-spacing: -0.035em;
	}
	.feature-card > span,
	.latest-card > span {
		font-size: 0.9rem;
		color: var(--ink-soft);
	}
	.pager {
		display: flex;
		justify-content: center;
		gap: 1.3rem;
		margin: 1.6rem 0 3.25rem;
	}
	.pager span {
		width: 0.45rem;
		height: 0.45rem;
		border-radius: 50%;
		background: var(--ink);
	}
	.section-rule {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
		font-size: 1rem;
		font-weight: 500;
	}
	.section-rule::before,
	.section-rule::after {
		content: '';
		height: 1px;
		flex: 1;
		background: var(--line-strong);
	}
	.latest-grid,
	.popular-grid {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}
	.latest-card .cover,
	.popular .cover {
		aspect-ratio: 1.42 / 1;
		border-radius: 0.65rem;
	}
	.latest-card .cover span:first-child,
	.popular .cover > span:first-child {
		position: absolute;
		z-index: 1;
		inset: 0.7rem auto auto 0.7rem;
		font-size: 0.5rem;
	}
	.latest-card .cover span:last-child,
	.popular .cover small {
		position: absolute;
		bottom: 0.7rem;
		z-index: 1;
		font-size: 0.45rem;
		letter-spacing: 0.15em;
	}
	.latest-card h3,
	.popular h3 {
		margin: 0.45rem 0 0;
		font-size: 1.05rem;
		font-weight: 500;
	}
	.latest-card > span {
		display: block;
		margin-top: 0.3rem;
		font-size: 0.75rem;
	}
	.latest-card a {
		display: inline-block;
		margin-top: 0.7rem;
		font-family: var(--font-display);
		font-size: 0.58rem;
		font-weight: 700;
		letter-spacing: 0.12em;
	}
	.more-button {
		display: block;
		margin: 2rem auto 0;
		padding: 0.75rem 1.3rem;
		border: 0;
		border-radius: 999px;
		background: var(--ink);
		color: #fff;
		cursor: pointer;
	}
	.popular {
		margin: 4rem calc(var(--gutter) * -1) calc(var(--gutter) * -1);
		padding: 2.5rem var(--gutter) 3.5rem;
		background: var(--popular-bg);
	}
	.popular .cover {
		border-radius: 0.65rem;
	}
	.popular h3 {
		font-size: 0.95rem;
	}
	.popular p {
		margin: 0.4rem 0 0;
		font-size: 0.7rem;
	}
	@media (max-width: 720px) {
		.feature-grid,
		.latest-grid,
		.popular-grid {
			grid-template-columns: 1fr;
		}
		.latest-grid,
		.popular-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 480px) {
		.latest-grid,
		.popular-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
