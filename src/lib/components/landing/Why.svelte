<script lang="ts">
	import { painPoints, whySection } from '$lib/content/landing';
	import Icon from './Icon.svelte';
	import { reveal } from './scroll';
</script>

<section id="why" class="section section-why">
	<header class="section-head reveal" use:reveal>
		<p class="section-eyebrow">{whySection.eyebrow()}</p>
		<h2 class="section-title">{whySection.title()}</h2>
		<p class="section-lede">{whySection.lede()}</p>
	</header>

	<div class="why-grid">
		{#each painPoints as point, index (point.id)}
			<article class="why-card reveal" use:reveal={{ delay: index * 80 }}>
				<div class="why-card-icon">
					<Icon name={point.icon} class="h-5 w-5" />
				</div>
				<div class="why-row">
					<p class="why-label why-label-pain">{whySection.painLabel()}</p>
					<p class="why-pain">{point.pain()}</p>
				</div>
				<div class="why-row">
					<p class="why-label why-label-answer">{whySection.answerLabel()}</p>
					<p class="why-answer">{point.answer()}</p>
				</div>
			</article>
		{/each}
	</div>
</section>
