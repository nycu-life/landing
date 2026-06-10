<script lang="ts">
	import { courseCardLabels, coursesSignupHref, type Course } from '$lib/content/courses';

	let { course, archived = false }: { course: Course; archived?: boolean } = $props();
</script>

<article
	class="course-card nl-flow glass"
	class:glass-strong={!archived}
	class:archived
	data-flow-card
>
	<!-- tag + code -->
	<div class="card-tags">
		<span
			class="card-tag"
			style:background={archived ? 'rgba(255,255,255,0.08)' : `${course.accent}26`}
			style:border-color={archived ? 'var(--line)' : `${course.accent}44`}
			style:color={archived ? 'var(--muted)' : course.accent}
		>
			{course.tag()}
		</span>
		<span class="card-code">{course.code()}</span>
	</div>

	<h3 class="card-title">{course.title()}</h3>

	<!-- meta — date + location only -->
	<div class="card-meta">
		<div class="meta-row">
			<svg
				class="meta-icon"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.7"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<rect x="3" y="4" width="18" height="18" rx="2" />
				<path d="M16 2v4M8 2v4M3 10h18" />
			</svg>
			<span class="meta-date">{course.date()}</span>
		</div>
		<div class="meta-row">
			<svg
				class="meta-icon"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.7"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 0 1 16 0z" />
				<circle cx="12" cy="10" r="3" />
			</svg>
			<span class="meta-location">{course.location()}</span>
		</div>
	</div>

	<!-- CTA — bottom right -->
	<div class="card-cta">
		{#if archived}
			<button type="button" class="liquid-glass-btn cta-ended" disabled>
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.7"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M20 6 9 17l-5-5" />
				</svg>
				<span>{courseCardLabels.ended()}</span>
			</button>
		{:else}
			<a
				class="liquid-glass-btn cta-signup"
				href={coursesSignupHref}
				target="_blank"
				rel="noreferrer"
			>
				<span>{courseCardLabels.signup()}</span>
				<span class="cta-arrow" aria-hidden="true">
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.7"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M5 12h14M13 5l7 7-7 7" />
					</svg>
				</span>
			</a>
		{/if}
	</div>
</article>

<style>
	.course-card {
		--card-ink: var(--ink);
		--card-sub: var(--ink-soft);
		position: relative;
		overflow: hidden;
		flex-shrink: 0;
		border-radius: 16px;
		box-shadow: 0 12px 24px -12px rgba(8, 12, 28, 0.34);
		padding: 14px 14px 12px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		color: var(--card-ink);
	}
	/* Archived shelf: dimmed, neutral coloring regardless of course accent. */
	.course-card.archived {
		--card-ink: var(--ink-soft);
		--card-sub: var(--muted);
		opacity: 0.7;
	}

	.card-tags {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.card-tag {
		padding: 3px 9px;
		border-radius: 999px;
		border: 1px solid transparent;
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.06em;
	}
	.card-code {
		font-size: 9px;
		font-weight: 600;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--card-sub);
	}

	.card-title {
		margin: 0;
		font-size: 17px;
		font-weight: 800;
		letter-spacing: -0.015em;
		line-height: 1.2;
	}

	.card-meta {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin-top: 2px;
	}
	.meta-row {
		display: flex;
		align-items: center;
		gap: 7px;
		font-size: 12px;
		color: var(--card-sub);
	}
	.meta-icon {
		width: 13px;
		height: 13px;
		flex-shrink: 0;
	}
	.meta-date {
		color: var(--card-ink);
		font-weight: 600;
		letter-spacing: -0.005em;
	}
	.meta-location {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: var(--card-ink);
		font-weight: 500;
		letter-spacing: -0.005em;
	}

	.card-cta {
		display: flex;
		justify-content: flex-end;
		margin-top: 2px;
	}
	.cta-ended {
		padding: 7px 14px;
		gap: 5px;
		font-size: 12px;
		font-weight: 700;
		letter-spacing: -0.005em;
	}
	.cta-ended:disabled {
		cursor: not-allowed;
	}
	.cta-ended svg {
		width: 11px;
		height: 11px;
	}
	.cta-signup {
		padding: 7px 7px 7px 14px;
		gap: 8px;
		font-size: 12px;
		font-weight: 600;
		letter-spacing: -0.005em;
	}
	.cta-arrow {
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.18);
		color: #fff;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.cta-arrow svg {
		width: 12px;
		height: 12px;
	}
</style>
