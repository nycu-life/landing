<script lang="ts">
	import { departments, joinSection, teamSection } from '$lib/content/landing';
	import Icon from './Icon.svelte';
	import { reveal } from './scroll';

	/** First grapheme of a name, used for the photo fallback avatar. */
	const initial = (name: string) => [...name][0]?.toUpperCase() ?? '·';
</script>

<section id="team" class="section section-team">
	<header class="section-head reveal" use:reveal>
		<p class="section-eyebrow">{teamSection.eyebrow()}</p>
		<h2 class="section-title">{teamSection.title()}</h2>
		<p class="section-lede">{teamSection.lede()}</p>
	</header>

	<div class="team-departments">
		{#each departments as dept, index (dept.id)}
			<section class="team-dept reveal" use:reveal={{ delay: index * 60 }}>
				<header class="team-dept-head">
					<h3 class="team-dept-title">{dept.label()}</h3>
					<span class="team-dept-count">{dept.members.length || ''}</span>
				</header>

				{#if dept.members.length > 0}
					<ul class="team-grid">
						{#each dept.members as member (member.id)}
							<li class="team-card">
								<div class="team-avatar">
									{#if member.photo}
										<img src={member.photo} alt={member.name()} loading="lazy" />
									{:else}
										<span class="team-avatar-fallback" aria-hidden="true"
											>{initial(member.name())}</span
										>
									{/if}
								</div>
								<div class="team-info">
									<p class="team-name">{member.name()}</p>
									<p class="team-role">
										<span class="team-role-label">{teamSection.roleLabel()}</span>
										<span>{member.role()}</span>
									</p>
									{#if member.linkedin}
										<a
											class="team-linkedin"
											href={member.linkedin}
											target="_blank"
											rel="noreferrer"
										>
											<Icon name="linkedin" class="h-4 w-4" />
											<span>{teamSection.linkedinLabel()}</span>
										</a>
									{/if}
								</div>
							</li>
						{/each}
					</ul>
				{:else}
					<div class="team-open">
						<p class="team-open-label">{teamSection.moreLabel()}</p>
						<p class="team-open-body">{teamSection.moreBody()}</p>
					</div>
				{/if}
			</section>
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
			<Icon name="instagram" class="h-4 w-4" />
			<span>{joinSection.cta.label()}</span>
		</a>
	</div>
</section>
