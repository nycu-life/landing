<script lang="ts">
	import { joinSection, teamMembers, teamSection } from '$lib/content/landing';
	import Icon from './Icon.svelte';
	import { reveal } from './scroll';

	/** First grapheme of a name, used for the photo fallback avatar. */
	const initial = (name: string) => [...name][0]?.toUpperCase() ?? '·';
</script>

<section id="team" class="section section-team">
	<header class="section-head reveal" use:reveal>
		<div class="section-head-marker">
			<span class="section-index">{teamSection.index()}</span>
			<span class="section-eyebrow">{teamSection.eyebrow()}</span>
		</div>
		<h2 class="section-title">{teamSection.title()}</h2>
		<p class="section-lede">{teamSection.lede()}</p>
	</header>

	<div class="team-grid">
		{#each teamMembers as member, index (member.id)}
			<article class="team-card reveal" use:reveal={{ delay: index * 90 }}>
				<div class="team-photo">
					{#if member.photo}
						<img src={member.photo} alt={member.name()} loading="lazy" />
					{:else}
						<span class="team-photo-fallback" aria-hidden="true">{initial(member.name())}</span>
					{/if}
				</div>

				<div class="team-info">
					<h3 class="team-name">{member.name()}</h3>
					<p class="team-role">
						<span class="team-role-label">{teamSection.roleLabel()}</span>
						<span>{member.group()}</span>
					</p>
					<p class="team-intro">{member.intro()}</p>

					{#if member.linkedin}
						<a class="team-linkedin" href={member.linkedin} target="_blank" rel="noreferrer">
							<Icon name="linkedin" class="h-4 w-4" />
							<span>{teamSection.linkedinLabel()}</span>
						</a>
					{/if}
				</div>
			</article>
		{/each}
	</div>

	<div id="join" class="join-panel reveal" use:reveal>
		<div class="join-copy">
			<h3 class="join-title">{joinSection.title()}</h3>
			<p class="join-lede">{joinSection.lede()}</p>
		</div>
		<a
			class="landing-button landing-button-primary"
			href={joinSection.cta.href}
			target="_blank"
			rel="noreferrer"
		>
			<Icon name="branch" class="h-4 w-4" />
			<span>{joinSection.cta.label()}</span>
		</a>
	</div>
</section>
