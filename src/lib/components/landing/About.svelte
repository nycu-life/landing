<script lang="ts">
	import { aboutSection, aboutValues } from '$lib/content/landing';
	import Icon from './Icon.svelte';
	import { reveal } from './scroll';
</script>

<section id="about" class="section section-about">
	<header class="section-head reveal" use:reveal>
		<div class="section-head-marker">
			<span class="section-index">{aboutSection.index()}</span>
			<span class="section-eyebrow">{aboutSection.eyebrow()}</span>
		</div>
		<h2 class="section-title">{aboutSection.title()}</h2>
	</header>

	<p class="about-statement reveal" use:reveal={{ delay: 80 }}>{aboutSection.statement()}</p>

	<div class="about-values">
		{#each aboutValues as value, index (value.title)}
			<article class="about-value reveal" use:reveal={{ delay: index * 90 }}>
				<div class="about-value-icon">
					<Icon name={value.icon} class="h-5 w-5" />
				</div>
				<h3 class="about-value-title">{value.title()}</h3>
				<p class="about-value-body">{value.body()}</p>
			</article>
		{/each}
	</div>
</section>
