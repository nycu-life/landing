<script lang="ts">
	import { base } from '$app/paths';
	import * as m from '$lib/paraglide/messages';
	import { joinSection, teamSection } from '$lib/content/landing';
	import { departmentOrder, membersByDepartment, type DepartmentId } from '$lib/content/team';
	import Avatar from './Avatar.svelte';
	import Icon from './Icon.svelte';
	import { reveal } from './scroll';

	const deptLabel = (id: DepartmentId): string => {
		switch (id) {
			case 'engineering':
				return m.dept_engineering();
			case 'design':
				return m.dept_design();
			case 'marketing':
				return m.dept_marketing();
			case 'admin':
				return m.dept_admin();
			case 'legal':
				return m.dept_legal();
		}
	};
</script>

<section id="team" class="section section-team">
	<header class="section-head reveal" use:reveal>
		<p class="section-eyebrow">{teamSection.eyebrow()}</p>
		<h2 class="section-title">{teamSection.title()}</h2>
		<p class="section-lede">{teamSection.lede()}</p>
	</header>

	<div class="team-departments">
		{#each departmentOrder as id, index (id)}
			{@const people = membersByDepartment(id)}
			<section class="team-dept reveal" use:reveal={{ delay: index * 60 }}>
				<header class="team-dept-head">
					<h3 class="team-dept-title">{deptLabel(id)}</h3>
					<span class="team-dept-count">{people.length || ''}</span>
				</header>

				{#if people.length > 0}
					<ul class="team-grid">
						{#each people as member (member.slug)}
							<li>
								<a class="team-card team-card-link" href="{base}/team/{member.slug}">
									<Avatar name={member.name} slug={member.slug} photo={member.photo} />
									<div class="team-info">
										<p class="team-name">
											{member.name}<span class="team-program">{member.program}</span>
										</p>
										<p class="team-role">
											<span class="team-role-label">{teamSection.roleLabel()}</span>
											<span>{member.role}</span>
										</p>
									</div>
									<Icon name="arrow" class="team-card-arrow h-4 w-4" />
								</a>
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

<style>
	.team-card-link {
		text-decoration: none;
		color: inherit;
		cursor: pointer;
		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease,
			border-color 0.15s ease;
	}
	.team-card-link:hover {
		transform: translateY(-2px);
		border-color: var(--brand);
		box-shadow: 0 14px 30px -22px color-mix(in srgb, var(--brand) 70%, transparent);
	}
	.team-program {
		margin-left: 0.4rem;
		font-size: 0.78rem;
		font-weight: 500;
		color: var(--muted);
	}
	:global(.team-card-arrow) {
		margin-left: auto;
		color: var(--muted);
		flex-shrink: 0;
	}
</style>
