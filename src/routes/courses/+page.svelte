<script lang="ts">
	import PageShell from '$lib/components/landing/PageShell.svelte';

	const semesters = [
		{
			label: '115 第一學期',
			courses: ['計算機程式設計', '資料結構']
		},
		{ label: '114 第二學期', courses: ['離散數學'] },
		{ label: '114 第一學期', courses: ['微積分（一）', '物理（一）'] },
		{ label: '113 第二學期', courses: ['網路程式設計'] }
	];
</script>

<PageShell target="courses" tint="blue">
	<section class="course-hero">
		<p class="course-kicker">沿著學期時間軸，找回每一門課的資訊與經驗。</p>
		<span>COURSE ARCHIVE · 2023—2026</span>
	</section>

	<section class="timeline" aria-label="課程時間軸">
		{#each semesters as semester (semester.label)}
			<div class="semester">
				<span class="timeline-dot" aria-hidden="true"></span>
				<h2>{semester.label}</h2>
				<div class="course-list">
					{#each semester.courses as course, courseIndex (course)}
						<article class="course-card">
							<div class="course-cover">
								<span class="diamond" aria-hidden="true"></span>
								<span>COURSE {String(courseIndex + 1).padStart(2, '0')}</span>
							</div>
							<div class="course-body">
								<p>必修 · 3 學分</p>
								<h3>{course}</h3>
								<span>授課教師 · 課程評價 · 歷屆資訊</span>
								<a href="https://coz.nycu.one" target="_blank" rel="noreferrer">查看課程 ↗</a>
							</div>
						</article>
					{/each}
				</div>
			</div>
		{/each}
	</section>
</PageShell>

<style>
	.course-hero {
		margin: 0 calc(var(--gutter) * -1) 3.25rem;
		padding: 3.25rem var(--gutter) 3.75rem;
		text-align: center;
		background: linear-gradient(135deg, var(--course-start), var(--course-end));
		color: #fff;
	}
	.course-kicker {
		margin: 0;
		font-size: 1rem;
		line-height: 1.6;
	}
	.course-hero > span {
		display: block;
		margin-top: 0.6rem;
		font-family: var(--font-display);
		font-size: 0.58rem;
		letter-spacing: 0.18em;
		opacity: 0.8;
	}
	.timeline {
		position: relative;
		max-width: 47rem;
		margin-inline: auto;
		padding-left: 3.2rem;
	}
	.timeline::before {
		content: '';
		position: absolute;
		left: 0.75rem;
		top: 0;
		bottom: 0;
		width: 1px;
		background: var(--line-strong);
	}
	.semester {
		position: relative;
		margin-bottom: 2.2rem;
	}
	.timeline-dot {
		position: absolute;
		left: -2.75rem;
		top: 0.35rem;
		width: 1.25rem;
		height: 1.25rem;
		border: 1px solid var(--lime-ink);
		border-radius: 50%;
		background: var(--lime);
	}
	.semester h2 {
		margin: 0 0 0.7rem;
		font-size: 1.15rem;
		font-weight: 500;
		letter-spacing: -0.02em;
	}
	.course-list {
		display: grid;
		gap: 1rem;
	}
	.course-card {
		display: grid;
		grid-template-columns: 8rem 1fr;
		min-height: 6.3rem;
		overflow: hidden;
		border: 1px solid var(--line);
		border-radius: 0.65rem;
		background: var(--surface);
		box-shadow: var(--shadow);
	}
	.course-cover {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.6rem;
		background: var(--surface-3);
		color: var(--ink-soft);
		font-family: var(--font-display);
		font-size: 0.48rem;
		letter-spacing: 0.16em;
	}
	.diamond {
		width: 0.8rem;
		height: 0.8rem;
		border: 2px solid var(--brand);
		transform: rotate(45deg);
	}
	.course-body {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		padding: 0.85rem 1rem;
	}
	.course-body p,
	.course-body h3,
	.course-body span {
		margin: 0;
	}
	.course-body p {
		font-size: 0.65rem;
		color: var(--ink-soft);
	}
	.course-body h3 {
		margin-top: 0.35rem;
		font-size: 0.95rem;
		font-weight: 500;
	}
	.course-body span {
		margin-top: 0.3rem;
		font-size: 0.62rem;
		color: var(--muted);
	}
	.course-body a {
		margin-top: auto;
		font-size: 0.65rem;
		font-weight: 600;
		color: var(--brand-ink);
	}
	@media (max-width: 560px) {
		.course-card {
			grid-template-columns: 6rem 1fr;
		}
		.timeline {
			padding-left: 2.25rem;
		}
		.timeline::before {
			left: 0.45rem;
		}
		.timeline-dot {
			left: -2.42rem;
		}
	}
</style>
