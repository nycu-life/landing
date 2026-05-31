<script lang="ts">
	import { coursePoints, courseSection } from '$lib/content/landing';
	import Frame from './Frame.svelte';
	import Icon from './Icon.svelte';
	import { reveal } from './scroll';
</script>

<section id="courses" class="section section-courses">
	<div class="course-grid">
		<div class="course-copy">
			<header class="section-head reveal" use:reveal>
				<p class="section-eyebrow">{courseSection.eyebrow()}</p>
				<h2 class="section-title">{courseSection.title()}</h2>
				<p class="section-lede">{courseSection.lede()}</p>
			</header>

			<ul class="course-points">
				{#each coursePoints as point, index (point.title)}
					<li class="course-point reveal" use:reveal={{ delay: index * 80 }}>
						<span class="course-point-bullet" aria-hidden="true">
							<Icon name="check" class="h-3.5 w-3.5" />
						</span>
						<div>
							<p class="course-point-title">{point.title()}</p>
							<p class="course-point-body">{point.body()}</p>
						</div>
					</li>
				{/each}
			</ul>

			<a
				class="landing-button landing-button-primary course-cta reveal"
				use:reveal={{ delay: 260 }}
				href={courseSection.cta.href}
				target="_blank"
				rel="noreferrer"
			>
				<Icon name="book" class="h-4 w-4" />
				<span>{courseSection.cta.label()}</span>
			</a>
		</div>

		<div class="course-visual reveal" use:reveal={{ delay: 120 }}>
			<Frame src={courseSection.image.src} alt={courseSection.title()} frame="browser" />
			<p class="hero-image-caption">{courseSection.image.caption()}</p>
		</div>
	</div>
</section>
