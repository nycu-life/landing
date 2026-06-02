<script lang="ts">
	import { base } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import { departmentOrder, membersInDepartment } from '$lib/content/team';
	import { deptLabel } from '$lib/content/departments';
	import Avatar from './Avatar.svelte';
	import Icon from './Icon.svelte';
</script>

<div class="bento">
	<p class="bento-intro">{m.about_teams_intro()}</p>
	{#each departmentOrder as dept (dept)}
		{@const people = membersInDepartment(dept)}
		{#if people.length > 0}
			<section class="bento-group">
				<header class="bento-group-head">
					<h3 class="bento-group-title">{deptLabel(dept)}</h3>
					<span class="bento-group-count">{m.team_count({ count: people.length })}</span>
				</header>
				<ul class="bento-grid">
					{#each people as { member, role } (member.slug)}
						<li>
							<a
								class="bento-card glass"
								style="border-radius:14px;"
								href="{base}/team/{member.slug}/"
							>
								<Avatar name={member.name} slug={member.slug} photo={member.photo} />
								<span class="bento-card-text">
									<span class="bento-card-name">{member.name}</span>
									{#if member.program || role}
										<span class="bento-card-sub">
											{[member.program, role].filter(Boolean).join(' · ')}
										</span>
									{/if}
								</span>
								<Icon name="arrow" class="bento-card-arrow h-4 w-4" />
							</a>
						</li>
					{/each}
				</ul>
			</section>
		{/if}
	{/each}
</div>

<style>
	.bento {
		display: grid;
		gap: 1.25rem;
	}
	.bento-intro {
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.65;
		color: var(--ink-soft);
	}
	.bento-group-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.75rem;
		margin-bottom: 0.7rem;
	}
	.bento-group-title {
		margin: 0;
		font-size: 1.05rem;
		font-weight: 700;
		letter-spacing: -0.01em;
		color: var(--ink);
	}
	.bento-group-count {
		font-family: var(--font-display);
		font-size: 0.7rem;
		letter-spacing: 0.1em;
		color: var(--muted);
	}
	.bento-grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.6rem;
	}
	.bento-card {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.7rem 0.85rem;
		color: var(--ink);
		transition:
			transform 0.15s var(--ease-out),
			border-color 0.2s ease;
	}
	.bento-card:hover {
		transform: translateY(-2px);
		border-color: color-mix(in srgb, var(--brand) 50%, var(--line));
	}
	.bento-card-text {
		display: grid;
		gap: 0.1rem;
		flex: 1;
		min-width: 0;
	}
	.bento-card-name {
		font-size: 0.98rem;
		font-weight: 600;
	}
	.bento-card-sub {
		font-size: 0.76rem;
		color: var(--muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	:global(.bento-card-arrow) {
		color: var(--muted);
		flex-shrink: 0;
	}

	@media (min-width: 560px) {
		.bento-grid {
			grid-template-columns: 1fr 1fr;
		}
	}
	@media (min-width: 960px) {
		.bento-grid {
			grid-template-columns: 1fr 1fr 1fr;
		}
	}
</style>
