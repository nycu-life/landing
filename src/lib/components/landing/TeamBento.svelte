<script lang="ts">
	import { base } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import { departmentOrder, membersInDepartment, type DepartmentId } from '$lib/content/team';
	import { deptLabel } from '$lib/content/departments';
	import Avatar from './Avatar.svelte';

	// Per-department glyph + accent + Latin label (matches the prototype bento).
	const deptMeta: Record<DepartmentId, { icon: string; accent: string; latin: string }> = {
		engineering: { icon: 'code', accent: '#A3E052', latin: 'ENGINEERING' },
		design: { icon: 'palette', accent: '#FFD93D', latin: 'DESIGN' },
		admin: { icon: 'building', accent: '#FFB4A2', latin: 'OPERATIONS' },
		legal: { icon: 'scale', accent: '#A5D8FF', latin: 'LEGAL' },
		marketing: { icon: 'sparkles', accent: '#DCD4FF', latin: 'MARKETING' }
	};

	const subLabel = (role?: string, program?: string) => role ?? program;
</script>

{#snippet deptIcon(name: string)}
	<svg
		width="18"
		height="18"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="1.8"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		{#if name === 'code'}
			<path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
		{:else if name === 'palette'}
			<circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
			<circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
			<circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
			<circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
			<path
				d="M12 2a10 10 0 0 0 0 20 2 2 0 0 0 2-2v-1a2 2 0 0 1 2-2h1a4 4 0 0 0 4-4 10 10 0 0 0-9-9z"
			/>
		{:else if name === 'building'}
			<rect x="3" y="2" width="18" height="20" rx="1" />
			<path
				d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"
			/>
		{:else if name === 'scale'}
			<path d="M16 16l3-8 3 8M2 16l3-8 3 8M7 21h10M12 3v18M3 7h2.43M18.57 7H21" />
		{:else}
			<path
				d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"
			/>
		{/if}
	</svg>
{/snippet}

<div class="bento">
	{#each departmentOrder as dept (dept)}
		{@const people = membersInDepartment(dept)}
		{@const meta = deptMeta[dept]}
		{#if people.length > 0}
			{@const lead = people.find((p) => p.role) ?? people[0]}
			{@const rest = people.filter((p) => p !== lead)}
			<section class="bento-group" style="--accent:{meta.accent}">
				<!-- group header -->
				<header class="bento-head">
					<span class="bento-ico">{@render deptIcon(meta.icon)}</span>
					<span class="bento-titles">
						<span class="bento-name">{deptLabel(dept)}</span>
						<span class="bento-latin">{meta.latin}</span>
					</span>
					<span class="bento-count">{m.about_members_count({ count: people.length })}</span>
				</header>

				<!-- bento mini-grid: lead + members -->
				<div class="bento-grid">
					<a class="bento-lead" href="{base}/team/{lead.member.slug}/">
						<Avatar name={lead.member.name} slug={lead.member.slug} photo={lead.member.photo} />
						<span class="bento-lead-body">
							{#if subLabel(lead.role, lead.member.program)}
								<span class="bento-role">{subLabel(lead.role, lead.member.program)}</span>
							{/if}
							<span class="bento-lead-name">{lead.member.name}</span>
							{#if lead.member.intro}
								<span class="bento-quote">「{lead.member.intro}」</span>
							{/if}
						</span>
					</a>

					{#each rest as { member, role } (member.slug)}
						<a class="bento-tile" href="{base}/team/{member.slug}/">
							<span class="bento-tile-name">{member.name}</span>
							{#if subLabel(role, member.program)}
								<span class="bento-tile-sub">{subLabel(role, member.program)}</span>
							{/if}
						</a>
					{/each}

					<!-- filler to keep the bento rhythm when the grid would be lopsided -->
					{#if rest.length % 2 === 1}
						<div class="bento-filler">{m.about_bento_recruiting()}</div>
					{/if}
				</div>
			</section>
		{/if}
	{/each}
</div>

<style>
	.bento {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-top: 6px;
	}
	.bento-group {
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 18px;
		padding: 14px;
	}
	.bento-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		margin-bottom: 12px;
	}
	.bento-ico {
		width: 36px;
		height: 36px;
		border-radius: 10px;
		background: var(--accent);
		color: #0a0a12;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.bento-titles {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
	}
	.bento-name {
		font-size: 16px;
		font-weight: 700;
		letter-spacing: -0.01em;
	}
	.bento-latin {
		font-size: 9px;
		opacity: 0.55;
		letter-spacing: 0.16em;
		font-weight: 600;
		text-transform: uppercase;
	}
	.bento-count {
		font-size: 11px;
		opacity: 0.6;
		letter-spacing: 0.06em;
	}

	.bento-grid {
		display: grid;
		grid-template-columns: 1.2fr 1fr;
		gap: 8px;
	}
	.bento-lead {
		grid-row: span 2;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 14px;
		padding: 12px;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 10px;
		min-height: 130px;
		color: inherit;
		transition: background 0.25s ease;
	}
	.bento-lead:hover {
		background: rgba(255, 255, 255, 0.14);
	}
	.bento-lead-body {
		display: flex;
		flex-direction: column;
	}
	.bento-role {
		font-size: 9px;
		opacity: 0.6;
		letter-spacing: 0.14em;
		font-weight: 600;
		text-transform: uppercase;
		margin-bottom: 2px;
	}
	.bento-lead-name {
		font-size: 15px;
		font-weight: 700;
		margin-bottom: 4px;
	}
	.bento-quote {
		font-size: 11px;
		opacity: 0.78;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.bento-tile {
		background: rgba(255, 255, 255, 0.06);
		border-radius: 14px;
		padding: 10px;
		display: flex;
		flex-direction: column;
		gap: 2px;
		justify-content: center;
		min-height: 61px;
		min-width: 0;
		color: inherit;
		transition: background 0.25s ease;
	}
	.bento-tile:hover {
		background: rgba(255, 255, 255, 0.1);
	}
	.bento-tile-name {
		font-size: 12px;
		font-weight: 700;
	}
	.bento-tile-sub {
		font-size: 10px;
		opacity: 0.7;
		line-height: 1.35;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.bento-filler {
		background: rgba(255, 255, 255, 0.04);
		border: 1px dashed rgba(255, 255, 255, 0.18);
		border-radius: 14px;
		padding: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: rgba(255, 255, 255, 0.5);
		font-size: 10px;
		letter-spacing: 0.1em;
		min-height: 61px;
	}

	@media (prefers-reduced-motion: reduce) {
		.bento-lead,
		.bento-tile {
			transition: none;
		}
	}
</style>
