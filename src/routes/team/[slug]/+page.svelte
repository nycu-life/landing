<script lang="ts">
	import { base } from '$app/paths';
	import * as m from '$lib/paraglide/messages';
	import Avatar from '$lib/components/landing/Avatar.svelte';
	import Icon from '$lib/components/landing/Icon.svelte';
	import { departmentsOfMember, type SocialKind } from '$lib/content/team';
	import { deptLabel } from '$lib/content/departments';
	import type { IconName } from '$lib/content/landing';
	import { withBase } from '$lib/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const member = $derived(data.member);
	const memberDepts = $derived(departmentsOfMember(member.slug));
	const roleSummary = $derived(
		memberDepts
			.map((d) => d.role)
			.filter(Boolean)
			.join('、')
	);
	const metaDesc = $derived(
		[member.name, member.program, roleSummary].filter(Boolean).join(' · ') + ' — NYCU LIFE'
	);

	const socialMeta = $derived<Record<SocialKind, { icon: IconName; label: string }>>({
		github: { icon: 'github', label: 'GitHub' },
		linkedin: { icon: 'linkedin', label: 'LinkedIn' },
		website: { icon: 'globe', label: m.member_website() },
		instagram: { icon: 'instagram', label: 'Instagram' },
		threads: { icon: 'link', label: 'Threads' },
		x: { icon: 'link', label: 'X' },
		facebook: { icon: 'link', label: 'Facebook' },
		youtube: { icon: 'link', label: 'YouTube' },
		email: { icon: 'mail', label: 'Email' }
	});
</script>

<svelte:head>
	<title>{member.name}｜NYCU LIFE</title>
	<meta name="description" content={metaDesc} />
</svelte:head>

<main class="landing-root member-page">
	<a class="member-back" href="{base}/about/">
		<Icon name="arrow" class="member-back-icon h-4 w-4" />
		<span>{m.team_back()}</span>
	</a>

	<header class="member-hero">
		<Avatar name={member.name} slug={member.slug} photo={member.photo} size="lg" />
		<div class="member-id">
			<h1 class="member-name">{member.name}</h1>
			{#if member.program}
				<p class="member-meta">
					<span class="member-chip">{member.program}</span>
				</p>
			{/if}
			<ul class="member-roles">
				{#each memberDepts as d (d.department)}
					<li class="member-role-chip">
						<span class="member-role-dept">{deptLabel(d.department)}</span>
						{#if d.role}
							<span class="member-role-sep" aria-hidden="true">·</span>
							<span>{d.role}</span>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	</header>

	<section class="member-block">
		<h2 class="member-block-title">{m.member_about_title()}</h2>
		{#if member.intro}
			<p class="member-intro">{member.intro}</p>
		{:else}
			<p class="member-empty">{m.member_about_empty()}</p>
		{/if}
	</section>

	{#if member.gallery && member.gallery.length}
		<section class="member-block">
			<h2 class="member-block-title">{m.member_gallery_title()}</h2>
			<div class="member-gallery">
				{#each member.gallery as src (src)}
					<img class="member-gallery-img" src={withBase(src)} alt={member.name} loading="lazy" />
				{/each}
			</div>
		</section>
	{/if}

	{#if member.socials && member.socials.length}
		<section class="member-block">
			<h2 class="member-block-title">{m.member_links_title()}</h2>
			<ul class="member-links">
				{#each member.socials as s (s.kind + s.url)}
					{@const meta = socialMeta[s.kind]}
					<li>
						<a class="member-link" href={s.url} target="_blank" rel="noreferrer">
							<Icon name={meta.icon} class="h-4 w-4" />
							<span>{s.label ?? meta.label}</span>
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</main>

<style>
	.member-page {
		max-width: 52rem;
		margin: 0 auto;
		padding: clamp(1.5rem, 4vw, 3rem) clamp(1.25rem, 5vw, 2rem) 5rem;
	}
	.member-back {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		color: var(--muted);
		text-decoration: none;
		font-size: 0.9rem;
		font-weight: 600;
	}
	.member-back:hover {
		color: var(--brand);
	}
	:global(.member-back-icon) {
		transform: rotate(180deg);
	}
	.member-hero {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		margin: 1.75rem 0 2.5rem;
		flex-wrap: wrap;
	}
	.member-name {
		margin: 0;
		font-size: clamp(1.8rem, 3vw, 2.4rem);
		font-weight: 800;
		letter-spacing: -0.02em;
		color: var(--ink);
	}
	.member-meta {
		margin: 0.5rem 0 0;
	}
	.member-chip {
		display: inline-block;
		padding: 0.2rem 0.7rem;
		border-radius: 9999px;
		background: var(--brand-soft);
		color: var(--brand-ink);
		font-size: 0.8rem;
		font-weight: 700;
	}
	.member-roles {
		list-style: none;
		margin: 0.75rem 0 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.member-role-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.3rem 0.75rem;
		border: 1px solid var(--line);
		border-radius: 9999px;
		font-size: 0.9rem;
		color: var(--ink-soft);
	}
	.member-role-dept {
		font-weight: 700;
		color: var(--ink);
	}
	.member-role-sep {
		color: var(--line-strong);
	}
	.member-block {
		margin-top: 2.25rem;
		padding-top: 1.75rem;
		border-top: 1px solid var(--line);
	}
	.member-block-title {
		margin: 0 0 0.85rem;
		font-size: 0.82rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--brand);
	}
	.member-intro {
		margin: 0;
		color: var(--ink-soft);
		font-size: 1.05rem;
		line-height: 1.8;
		white-space: pre-line;
	}
	.member-empty {
		margin: 0;
		color: var(--muted);
		font-size: 0.95rem;
	}
	.member-gallery {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 0.75rem;
	}
	.member-gallery-img {
		width: 100%;
		aspect-ratio: 4 / 3;
		object-fit: cover;
		border-radius: 0.75rem;
		border: 1px solid var(--line);
	}
	.member-links {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
	}
	.member-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.55rem 0.95rem;
		border: 1px solid var(--line-strong);
		border-radius: 9999px;
		color: var(--ink);
		text-decoration: none;
		font-size: 0.9rem;
		font-weight: 600;
		transition:
			border-color 0.15s ease,
			color 0.15s ease;
	}
	.member-link:hover {
		border-color: var(--brand);
		color: var(--brand);
	}
</style>
