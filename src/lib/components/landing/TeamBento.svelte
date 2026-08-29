<script lang="ts">
	import { base } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import { departmentOrder, membersInDepartment, type DepartmentId } from '$lib/content/team';
	import { deptLabel } from '$lib/content/departments';
	import { JOIN_FORM_URL, type IconName } from '$lib/content/landing';
	import Avatar from './Avatar.svelte';
	import Icon from './Icon.svelte';

	// Per-department glyph + accent + Latin label (matches the prototype bento).
	const deptMeta: Record<DepartmentId, { icon: IconName; accent: string; latin: string }> = {
		engineering: { icon: 'code', accent: '#5DFAB0', latin: 'ENGINEERING' },
		design: { icon: 'palette', accent: '#FFD93D', latin: 'DESIGN' },
		admin: { icon: 'building', accent: '#FFB4A2', latin: 'OPERATIONS' },
		legal: { icon: 'scale', accent: '#A5D8FF', latin: 'LEGAL' },
		marketing: { icon: 'spark', accent: '#B66BFF', latin: 'MARKETING' }
	};

	const sub = (program?: string, role?: string) => [program, role].filter(Boolean).join(' · ');
</script>

<div class="bento">
	<p class="bento-intro">{m.about_teams_intro()}</p>

	{#each departmentOrder as dept (dept)}
		{@const people = membersInDepartment(dept)}
		{@const meta = deptMeta[dept]}
		{#if people.length > 0}
			{@const lead = people[0]}
			<section class="bento-group glass" style="border-radius:18px;--accent:{meta.accent}">
				<header class="bento-head">
					<span class="bento-ico" style="background:{meta.accent}"
						><Icon name={meta.icon} class="h-[18px] w-[18px]" /></span
					>
					<span class="bento-titles">
						<span class="bento-name">{deptLabel(dept)}</span>
						<span class="bento-latin">{meta.latin}</span>
					</span>
					<span class="bento-count">{m.team_count({ count: people.length })}</span>
				</header>

				<div class="bento-grid">
					<a
						class="bento-lead glass-strong"
						style="border-radius:14px;"
						href="{base}/team/{lead.member.slug}/"
					>
						<Avatar
							name={lead.member.name}
							slug={lead.member.slug}
							photo={lead.member.photo}
							size="lg"
						/>
						<span class="bento-lead-body">
							{#if sub(lead.member.program, lead.role)}
								<span class="bento-role">{sub(lead.member.program, lead.role)}</span>
							{/if}
							<span class="bento-lead-name">{lead.member.name}</span>
							{#if lead.member.intro}
								<span class="bento-quote">{lead.member.intro}</span>
							{/if}
						</span>
					</a>

					{#each people.slice(1) as { member, role } (member.slug)}
						<a
							class="bento-tile glass"
							style="border-radius:14px;"
							href="{base}/team/{member.slug}/"
						>
							<Avatar name={member.name} slug={member.slug} photo={member.photo} />
							<span class="bento-tile-text">
								<span class="bento-tile-name">{member.name}</span>
								{#if sub(member.program, role)}
									<span class="bento-tile-sub">{sub(member.program, role)}</span>
								{/if}
							</span>
						</a>
					{/each}

					<a
						class="bento-join"
						href={JOIN_FORM_URL}
						target="_blank"
						rel="noreferrer"
						data-analytics-event="join_form_click"
						data-analytics-source="team_bento"
					>
						<span class="bento-join-plus">＋</span>
						<span>{m.join_cta()}</span>
					</a>
				</div>
			</section>
		{/if}
	{/each}
</div>

<style>
	.bento {
		display: grid;
		gap: 1rem;
	}
	.bento-intro {
		margin: 0 0 0.25rem;
		font-size: 0.95rem;
		line-height: 1.65;
		color: var(--ink-soft);
	}
	.bento-group {
		padding: 0.9rem;
	}
	.bento-head {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		margin-bottom: 0.85rem;
	}
	.bento-ico {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 10px;
		color: #0a0a12;
		flex-shrink: 0;
	}
	.bento-titles {
		display: grid;
		gap: 0.1rem;
		flex: 1;
		min-width: 0;
	}
	.bento-name {
		font-size: 1.02rem;
		font-weight: 700;
		letter-spacing: -0.01em;
	}
	.bento-latin {
		font-family: var(--font-display);
		font-size: 0.58rem;
		letter-spacing: 0.16em;
		color: var(--muted);
	}
	.bento-count {
		font-family: var(--font-display);
		font-size: 0.7rem;
		letter-spacing: 0.08em;
		color: var(--muted);
	}

	.bento-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-auto-rows: 1fr;
		gap: 0.5rem;
	}
	.bento-lead {
		grid-column: span 2;
		grid-row: span 2;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.9rem;
		color: var(--ink);
		min-height: 9.5rem;
		transition:
			transform 0.15s var(--ease-out),
			border-color 0.2s ease;
		border: 1px solid var(--line);
	}
	.bento-lead:hover {
		transform: translateY(-2px);
		border-color: color-mix(in srgb, var(--accent) 55%, var(--line));
	}
	.bento-lead-body {
		display: grid;
		gap: 0.2rem;
	}
	.bento-role {
		font-family: var(--font-display);
		font-size: 0.58rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.bento-lead-name {
		font-size: 1.05rem;
		font-weight: 700;
	}
	.bento-quote {
		margin-top: 0.15rem;
		font-size: 0.82rem;
		line-height: 1.45;
		color: var(--ink-soft);
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.bento-tile {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.55rem 0.6rem;
		color: var(--ink);
		min-width: 0;
		transition:
			transform 0.15s var(--ease-out),
			border-color 0.2s ease;
	}
	.bento-tile:hover {
		transform: translateY(-2px);
		border-color: color-mix(in srgb, var(--accent) 55%, var(--line));
	}
	.bento-tile-text {
		display: grid;
		gap: 0.05rem;
		min-width: 0;
	}
	.bento-tile-name {
		font-size: 0.85rem;
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.bento-tile-sub {
		font-size: 0.66rem;
		color: var(--muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.bento-join {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		padding: 0.6rem;
		border: 1px dashed var(--line-strong);
		border-radius: 14px;
		color: var(--muted);
		font-size: 0.72rem;
		letter-spacing: 0.04em;
		text-align: center;
		transition:
			color 0.2s ease,
			border-color 0.2s ease;
	}
	.bento-join:hover {
		color: var(--ink);
		border-color: var(--brand);
	}
	.bento-join-plus {
		font-size: 1.1rem;
		line-height: 1;
	}

	@media (min-width: 720px) {
		.bento-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}
</style>
