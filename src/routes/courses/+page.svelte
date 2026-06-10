<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { menuItems } from '$lib/content/landing';
	import { archivedCourses, coursesTabs, upcomingCourses } from '$lib/content/courses';
	import { centerFocus } from '$lib/components/landing/centerFocus';
	import CourseCard from '$lib/components/landing/CourseCard.svelte';

	const meta = menuItems.find((i) => i.target === 'courses')!;

	let tab = $state<'upcoming' | 'archive'>('upcoming');
</script>

<svelte:head>
	<title>{meta.label()}｜NYCU LIFE</title>
	<meta name="description" content={meta.desc()} />
</svelte:head>

<div class="courses">
	<header class="courses-head">
		<h1 class="page-title">{m.page_courses_lead()}<span>{m.page_courses_accent()}</span></h1>
	</header>

	<div class="courses-tabs">
		<div class="glass-switch-container" role="tablist" aria-label={coursesTabs.label()}>
			<!-- sliding glass crystal — the only selected-state cue -->
			<div
				class="glass-switch-slider"
				style:left={tab === 'archive' ? '50%' : '4px'}
				aria-hidden="true"
			></div>
			<button
				type="button"
				role="tab"
				id="courses-tab-upcoming"
				aria-selected={tab === 'upcoming'}
				aria-controls="courses-pane-upcoming"
				class="glass-switch-tab"
				class:active={tab === 'upcoming'}
				onclick={() => (tab = 'upcoming')}
			>
				{coursesTabs.upcoming()}
			</button>
			<button
				type="button"
				role="tab"
				id="courses-tab-archive"
				aria-selected={tab === 'archive'}
				aria-controls="courses-pane-archive"
				class="glass-switch-tab"
				class:active={tab === 'archive'}
				onclick={() => (tab = 'archive')}
			>
				{coursesTabs.archive()}
			</button>
		</div>
	</div>

	<!-- Tab body — the two panes slide horizontally and scroll internally. -->
	<div class="courses-body">
		<div class="courses-track" class:shifted={tab === 'archive'}>
			<div
				class="pane"
				role="tabpanel"
				id="courses-pane-upcoming"
				aria-labelledby="courses-tab-upcoming"
				inert={tab !== 'upcoming'}
				use:centerFocus
			>
				{#each upcomingCourses as course (course.id)}
					<CourseCard {course} />
				{/each}
			</div>
			<div
				class="pane"
				role="tabpanel"
				id="courses-pane-archive"
				aria-labelledby="courses-tab-archive"
				inert={tab !== 'archive'}
				use:centerFocus
			>
				{#each archivedCourses as course (course.id)}
					<CourseCard {course} archived />
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	/* Full-height app pane: the document never scrolls — each tab pane does. */
	.courses {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	/* Phone-first column; at desktop the whole pane reads as a centered app
	   column (a dedicated storytelling layout comes later). */
	.courses-head,
	.courses-tabs {
		width: 100%;
		max-width: calc(30rem + 2 * var(--gutter));
		margin-inline: auto;
	}
	.courses-head {
		padding: 6px var(--gutter) 18px;
	}
	.courses-tabs {
		padding: 0 var(--gutter) 14px;
	}
	.glass-switch-tab {
		font-size: 14px;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.courses-body {
		position: relative;
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}
	.courses-track {
		position: absolute;
		inset: 0;
		display: flex;
		width: 200%;
		transform: translateX(0);
		transition: transform 0.45s var(--ease-app);
	}
	.courses-track.shifted {
		transform: translateX(-50%);
	}

	.pane {
		width: 50%;
		height: 100%;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		overscroll-behavior: contain;
		padding: 4px var(--gutter) 60px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 14px;
	}
	.pane > :global(.nl-flow) {
		width: 100%;
		max-width: 30rem;
		flex-shrink: 0;
	}
</style>
