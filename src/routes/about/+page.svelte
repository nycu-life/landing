<script lang="ts">
	import PageShell from '$lib/components/landing/PageShell.svelte';
	import FolderStack from '$lib/components/landing/FolderStack.svelte';
	import TeamBento from '$lib/components/landing/TeamBento.svelte';
	import ContactBody from '$lib/components/landing/ContactBody.svelte';
	import ComingSoon from '$lib/components/landing/ComingSoon.svelte';
	import { aboutFolders } from '$lib/content/about';
</script>

<PageShell target="about" tint="blue">
	<section class="about-intro">
		<p class="about-kicker">02 — About us</p>
		<h2>認識我們</h2>
		<p>一群陽交大學生，把校園生活裡反覆出現的小麻煩，整理成大家用得到的產品。</p>
	</section>

	<section class="roles" aria-labelledby="roles-title">
		<div class="section-rule">
			<span id="roles-title">Open roles</span>
		</div>
		<div class="role-grid">
			{#each [{ title: '產品設計師', subtitle: '把複雜問題整理成直覺體驗' }, { title: '前端工程師', subtitle: '讓設計成為穩定好用的產品' }, { title: '後端工程師', subtitle: '打造可靠且可擴充的服務' }] as role, i (role.title)}
				<article class="role-card">
					<p class="role-number">OPEN ROLE · 0{i + 1}</p>
					<h3>{role.title}</h3>
					<p class="role-subtitle">{role.subtitle}</p>
					<ul>
						<li>喜歡理解真實問題</li>
						<li>願意主動溝通協作</li>
						<li>每週投入固定時間</li>
					</ul>
					<a href="https://instagram.com/nycu.life" target="_blank" rel="noreferrer">
						查看職缺與申請 ↗
					</a>
				</article>
			{/each}
		</div>
	</section>

	<section class="team-section" aria-labelledby="team-title">
		<div class="section-rule"><span id="team-title">The team</span></div>
		<FolderStack folders={aboutFolders}>
			{#snippet body(folder)}
				{#if folder.state === 'soon'}
					<ComingSoon />
				{:else if folder.id === 'teams'}
					<TeamBento />
				{:else if folder.id === 'contact'}
					<ContactBody />
				{/if}
			{/snippet}
		</FolderStack>
	</section>
</PageShell>

<style>
	.about-intro {
		max-width: 38rem;
		margin-bottom: 3.5rem;
	}
	.about-kicker,
	.role-number {
		margin: 0 0 0.7rem;
		font-family: var(--font-display);
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--brand-ink);
	}
	.about-intro h2 {
		margin: 0;
		font-size: clamp(2rem, 5vw, 2.7rem);
		font-weight: 500;
		letter-spacing: -0.03em;
	}
	.about-intro > p:last-child {
		margin: 1rem 0 0;
		font-size: 1rem;
		line-height: 1.7;
		color: var(--ink-soft);
	}
	.section-rule {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
		font-family: var(--font-display);
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.section-rule::before,
	.section-rule::after {
		content: '';
		height: 1px;
		flex: 1;
		background: var(--line-strong);
	}
	.role-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1.5rem;
	}
	.role-card {
		display: flex;
		min-height: 29rem;
		flex-direction: column;
		padding: clamp(1.5rem, 3vw, 2.4rem);
		border: 1px solid var(--line-strong);
		border-radius: 1.5rem;
		background: color-mix(in srgb, var(--surface) 92%, transparent);
		box-shadow: var(--shadow);
	}
	.role-card h3 {
		margin: 2rem 0 0.8rem;
		font-size: clamp(1.8rem, 3vw, 2.4rem);
		font-weight: 500;
		letter-spacing: -0.04em;
	}
	.role-subtitle {
		margin: 0;
		font-size: 1.1rem;
		line-height: 1.6;
		color: var(--ink-soft);
	}
	.role-card ul {
		margin: 1rem 0 2rem;
		padding: 0;
		list-style: none;
		font-size: 1rem;
		line-height: 2.1;
		color: var(--ink-soft);
	}
	.role-card a {
		margin-top: auto;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 4rem;
		border-radius: 0.9rem;
		background: var(--ink);
		color: #fff;
		font-size: 1.25rem;
		font-weight: 600;
	}
	.role-card a:hover {
		background: var(--brand);
	}
	.team-section {
		margin-top: 4.5rem;
	}
	@media (max-width: 800px) {
		.role-grid {
			grid-template-columns: 1fr;
		}
		.role-card {
			min-height: 0;
		}
	}
</style>
