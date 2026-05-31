<script lang="ts">
	import { devLogEntries, devLogSection } from '$lib/content/landing';
	import { reveal } from './scroll';
</script>

<section id="devlog" class="section section-devlog">
	<header class="section-head reveal" use:reveal>
		<p class="section-eyebrow">{devLogSection.eyebrow()}</p>
		<h2 class="section-title">{devLogSection.title()}</h2>
		<p class="section-lede">{devLogSection.lede()}</p>
	</header>

	<ol class="devlog-timeline">
		{#each devLogEntries as entry, index (entry.id)}
			<li class="devlog-entry reveal" use:reveal={{ delay: index * 70 }}>
				<span class="devlog-dot devlog-dot-{entry.status}" aria-hidden="true"></span>
				<div class="devlog-content">
					<p class="devlog-date">{entry.date()}</p>
					<h3 class="devlog-entry-title">{entry.title()}</h3>
					<p class="devlog-body">{entry.body()}</p>
				</div>
			</li>
		{/each}
	</ol>
</section>
