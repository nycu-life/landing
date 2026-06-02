<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { footerLinks, joinSection } from '$lib/content/landing';
	import Icon from './Icon.svelte';
</script>

<div class="contact">
	<p class="contact-intro">{m.about_contact_intro()}</p>

	<ul class="contact-list">
		{#each footerLinks as link (link.href)}
			<li>
				<a
					class="contact-row glass"
					style="border-radius:14px;"
					href={link.href}
					target="_blank"
					rel="noreferrer"
				>
					<span class="contact-icon"><Icon name={link.icon} class="h-[18px] w-[18px]" /></span>
					<span class="contact-label">{link.label()}</span>
					<Icon name="arrow" class="contact-arrow h-4 w-4" />
				</a>
			</li>
		{/each}
	</ul>

	<a class="contact-cta" href={joinSection.cta.href} target="_blank" rel="noreferrer">
		<span class="contact-cta-text">
			<span class="contact-cta-title">{joinSection.title()}</span>
			<span class="contact-cta-lede">{joinSection.lede()}</span>
		</span>
		<span class="contact-cta-arrow"><Icon name="arrow" class="h-5 w-5" /></span>
	</a>
</div>

<style>
	.contact {
		display: grid;
		gap: 1rem;
	}
	.contact-intro {
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.65;
		color: var(--ink-soft);
	}
	.contact-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.55rem;
	}
	.contact-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.8rem 0.95rem;
		color: var(--ink);
		transition:
			transform 0.15s var(--ease-out),
			border-color 0.2s ease;
	}
	.contact-row:hover {
		transform: translateY(-2px);
		border-color: color-mix(in srgb, var(--brand) 50%, var(--line));
	}
	.contact-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 12px;
		background: var(--glass-strong);
		border: 1px solid var(--line);
		color: var(--brand-ink);
		flex-shrink: 0;
	}
	.contact-label {
		flex: 1;
		font-weight: 600;
	}
	:global(.contact-arrow) {
		color: var(--muted);
		flex-shrink: 0;
	}
	.contact-cta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-top: 0.25rem;
		padding: 1.1rem 1.25rem;
		border-radius: 18px;
		background: var(--accent-grad);
		color: #07091a;
		box-shadow: 0 12px 30px -10px rgba(124, 92, 255, 0.55);
		transition: transform 0.18s var(--ease-out);
	}
	.contact-cta:hover {
		transform: translateY(-2px);
	}
	.contact-cta-text {
		display: grid;
		gap: 0.2rem;
	}
	.contact-cta-title {
		font-size: 1.15rem;
		font-weight: 800;
		letter-spacing: -0.02em;
	}
	.contact-cta-lede {
		font-size: 0.85rem;
		line-height: 1.5;
		opacity: 0.8;
	}
	.contact-cta-arrow {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.75rem;
		height: 2.75rem;
		border-radius: 50%;
		background: rgba(7, 9, 26, 0.2);
		flex-shrink: 0;
	}
</style>
